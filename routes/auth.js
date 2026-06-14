const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const Analytics = require('../models/Analytics');
const { sendWelcomePush } = require('../services/campaignService');
const { authLimit, rewardLimit, guestLimit } = require('../middleware/rateLimit');
const Generation = require('../models/Generation');
const CreditTransaction = require('../models/CreditTransaction');
const creditLedger = require('../services/creditLedger');

const router = express.Router();

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      status: 'success',
      message,
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isPro: user.isPro,
          credits: user.credits,
          totalCredits: user.totalCredits,
          remainingTrialCredits: user.remainingTrialCredits,
          subscription: user.subscription,
          freeTrialExpiry: user.freeTrialExpiry,
          lastLogin: user.lastLogin
        },token
      }
    });
};

// @desc    Create guest session (try before login)
// @route   POST /api/auth/guest
// @access  Public (rate-limited)
router.post('/guest', guestLimit, async (req, res, next) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId || deviceId.length < 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid deviceId is required'
      });
    }

    // Check if guest already exists for this device
    let user = await User.findOne({ guestDeviceId: deviceId });

    if (user) {
      // Return existing guest session
      user.lastLogin = new Date();
      await user.save();

      await Analytics.trackEvent('guest_session_resumed', {
        deviceId: deviceId.slice(0, 8) + '...'
      }, user._id);

      return sendTokenResponse(user, 200, res, 'Guest session resumed');
    }

    // Create new guest user with 1 free credit
    const { nanoid } = await import('nanoid');
    const guestId = nanoid(8);
    
    user = await User.create({
      email: `guest_${guestId}@guest.local`,
      name: `Guest ${guestId.slice(0, 4)}`,
      isGuest: true,
      guestDeviceId: deviceId,
      credits: 0,
      freeTrialUsed: 0,
      freeTrialExpiry: null, // No trial for guests
      lastLogin: new Date(),
      isActive: true
    });

    const guestGrant = await creditLedger.creditUser({
      userId: user._id,
      amount: 1,
      kind: 'signup_bonus',
      source: 'guest_trial',
      reason: 'Guest session starter credit',
      description: 'Initial guest trial credit'
    });
    user = guestGrant.user;

    await Analytics.trackEvent('guest_session_created', {
      deviceId: deviceId.slice(0, 8) + '...',
      credits: 1
    }, user._id);

    sendTokenResponse(user, 201, res, 'Guest session created! Sign in to get 5 free credits.');
  } catch (error) {
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      const user = await User.findOne({ guestDeviceId: req.body.deviceId });
      if (user) {
        return sendTokenResponse(user, 200, res, 'Guest session resumed');
      }
    }
    next(error);
  }
});

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res, next) => {
  try {
    const { googleId, email, name, avatar, referralCode, guestToken } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide googleId, email, and name'
      });
    }

    // Check if there's a guest user to migrate
    let guestUser = null;
    if (guestToken) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(guestToken, process.env.JWT_SECRET);
        const potentialGuest = await User.findById(decoded.id);
        if (potentialGuest && potentialGuest.isGuest) {
          guestUser = potentialGuest;
        }
      } catch (err) {
        // Invalid guest token, ignore and continue
        console.log('Invalid guest token during Google login, ignoring');
      }
    }

    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (user) {
      // Update existing user
      user.googleId = googleId;
      user.name = name;
      user.avatar = avatar;
      user.isActive = true;
      user.isGuest = false; // Ensure not marked as guest
      user.lastLogin = new Date();
      await user.save();

      // Migrate guest generations if applicable
      if (guestUser && guestUser._id.toString() !== user._id.toString()) {
        await Generation.updateMany(
          { user: guestUser._id },
          { user: user._id }
        );
        // Transfer any remaining credits from guest
        if (guestUser.credits > 0) {
          const transferResult = await creditLedger.creditUser({
            userId: user._id,
            amount: guestUser.credits,
            kind: 'guest_credit_transfer',
            source: 'guest_migration',
            reason: 'Transferred remaining credits from guest session',
            reference: {
              relatedUser: guestUser._id
            }
          });
          user = transferResult.user;
        }
        // Delete the guest user
        await User.findByIdAndDelete(guestUser._id);
        await Analytics.trackEvent('guest_migrated', {
          guestId: guestUser._id,
          realUserId: user._id,
          generationsMigrated: true
        }, user._id);
      }

      // Track login
      await Analytics.trackEvent('user_signed_in', {
        method: 'google',
        returning_user: true
      }, user._id);

      sendTokenResponse(user, 200, res, 'Welcome back!');
    } else {
      // Create new user (migrate from guest if applicable)
      if (guestUser) {
        // Convert guest to real user
        guestUser.googleId = googleId;
        guestUser.email = email;
        guestUser.name = name;
        guestUser.avatar = avatar;
        guestUser.isGuest = false;
        guestUser.guestDeviceId = null;
        guestUser.lastLogin = new Date();
        guestUser.isActive = true;
        const guestCreditsBeforeConversion = guestUser.credits;
        await guestUser.save();
        user = guestUser;

        // Give them full signup credits (5) if they only had guest credits (1)
        if (guestCreditsBeforeConversion <= 1) {
          const signupBonus = Math.max(0, 5 - guestCreditsBeforeConversion);
          if (signupBonus > 0) {
            const signupBonusResult = await creditLedger.creditUser({
              userId: user._id,
              amount: signupBonus,
              kind: 'signup_bonus',
              source: 'guest_conversion',
              reason: 'Signup bonus after guest conversion',
              description: 'Topped up guest account to full signup credits'
            });
            user = signupBonusResult.user;
          }
        }

        await Analytics.trackEvent('guest_converted', {
          userId: user._id,
          method: 'google'
        }, user._id);
      } else {
        // Brand new user
        user = await User.create({
          googleId,
          email,
          name,
          avatar,
          credits: 0,
          lastLogin: new Date(),
          isActive: true
        });

        const signupBonusResult = await creditLedger.creditUser({
          userId: user._id,
          amount: 5,
          kind: 'signup_bonus',
          source: 'signup',
          reason: 'Initial signup credits',
          description: 'Welcome credit bundle for new account'
        });
        user = signupBonusResult.user;
      }


if (referralCode) {
        try {
          const referrer = await User.findOne({ referralCode });
          if (referrer && referrer.id !== user.id) {
            user.referredBy = referrer._id;
            await user.save();

            // Grant 5 credits to the referrer
            await creditLedger.creditUser({
              userId: referrer._id,
              amount: 5,
              kind: 'referral_reward',
              source: 'referral_signup',
              reason: `Referral reward for inviting ${user.email}`,
              reference: {
                relatedUser: user._id
              }
            });

            // Track events
            await Analytics.trackEvent('referral_success', {
              referrerId: referrer._id,
              newUserId: user._id,
              creditsAwarded: 5
            }, referrer._id);
            await Analytics.trackEvent('user_referred', {
              referrerId: referrer._id,
            }, user._id);
          }
        } catch (referralError) {
          // Fail silently, don't block signup
          console.error('Referral processing error:', referralError);
        }
      }


      // Track registration
      await Analytics.trackEvent('user_registered', {
        method: 'google',
        trial_credits: user.credits
      }, user._id);

      // Send welcome push notification (async, don't await)
      sendWelcomePush(user._id);

      sendTokenResponse(user, 201, res, 'Account created successfully!');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Calculate derived fields for mobile gating
    const now = new Date();
    const isTrialActive = user.freeTrialExpiry && new Date(user.freeTrialExpiry) > now;
    const isSubscriptionActive = user.subscription?.status === 'active';
    const canGenerate = user.credits > 0 || user.isPro || isSubscriptionActive;

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          isPro: user.isPro,
          credits: user.credits,
          totalCredits: user.totalCredits,
          remainingTrialCredits: user.remainingTrialCredits,
          subscription: user.subscription,
          freeTrialExpiry: user.freeTrialExpiry,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          // Additional fields for mobile gating
          referralCode: user.referralCode,
          isGuest: user.isGuest || false,
          isTrialActive,
          isSubscriptionActive,
          canGenerate,
          streak: user.streak || { currentStreak: 0, longestStreak: 0, lastActivityDate: null },
          rewardedAds: user.rewardedAds || { rewardsToday: 0, lastRewardDate: null },
          hasClaimedReviewReward: user.hasClaimedReviewReward || false
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, preferences } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (preferences) fieldsToUpdate.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});




// Get payments reward ads with daily cap
// Config: max 4 rewards per day (2 credits total)
const REWARD_AD_CONFIG = {
  creditsPerReward: 0.5,
  maxRewardsPerDay: 4,
  maxCreditsPerDay: 2
};

// Apply reward rate limit to prevent abuse
router.post('/reward_ad', protect, rewardLimit, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'No user found'
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Initialize rewardedAds if not exists
    if (!user.rewardedAds) {
      user.rewardedAds = { lastRewardDate: null, rewardsToday: 0 };
    }
    
    // Check if last reward was on a different day - reset counter
    const lastRewardDate = user.rewardedAds.lastRewardDate;
    if (!lastRewardDate || new Date(lastRewardDate) < today) {
      user.rewardedAds.rewardsToday = 0;
    }
    
    // Check daily cap
    if (user.rewardedAds.rewardsToday >= REWARD_AD_CONFIG.maxRewardsPerDay) {
      // Track denied event
      const Analytics = require('../models/Analytics');
      await Analytics.trackEvent('reward_ad_denied', {
        reason: 'daily_cap_reached',
        rewardsToday: user.rewardedAds.rewardsToday
      }, user._id);
      
      return res.status(429).json({
        status: 'error',
        message: 'Daily reward limit reached. Come back tomorrow!',
        data: {
          rewardsToday: user.rewardedAds.rewardsToday,
          maxRewardsPerDay: REWARD_AD_CONFIG.maxRewardsPerDay,
          remainingRewards: 0
        }
      });
    }
    
    user.rewardedAds.rewardsToday += 1;
    user.rewardedAds.lastRewardDate = now;
    await user.save();

    const rewardResult = await creditLedger.creditUser({
      userId: user._id,
      amount: REWARD_AD_CONFIG.creditsPerReward,
      kind: 'ad_reward',
      source: 'rewarded_ad',
      reason: 'Rewarded ad completed successfully',
      description: 'Native mobile rewarded ad credit'
    });
    
    // Track granted event
    const Analytics = require('../models/Analytics');
    await Analytics.trackEvent('reward_ad_granted', {
      creditsGranted: REWARD_AD_CONFIG.creditsPerReward,
      rewardsToday: user.rewardedAds.rewardsToday,
      totalCredits: rewardResult.user.credits
    }, user._id);

    res.status(200).json({
      status: 'success',
      message: `${REWARD_AD_CONFIG.creditsPerReward} Credit added successfully`,
      data: {
        user,
        rewardsToday: user.rewardedAds.rewardsToday,
        maxRewardsPerDay: REWARD_AD_CONFIG.maxRewardsPerDay,
        remainingRewards: REWARD_AD_CONFIG.maxRewardsPerDay - user.rewardedAds.rewardsToday,
        creditsPerReward: REWARD_AD_CONFIG.creditsPerReward
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get reward ad status (remaining rewards today)
// @route   GET /api/auth/reward_ad/status
// @access  Private
router.get('/reward_ad/status', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'No user found'
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if last reward was on a different day - rewards reset
    let rewardsToday = user.rewardedAds?.rewardsToday || 0;
    const lastRewardDate = user.rewardedAds?.lastRewardDate;
    
    if (!lastRewardDate || new Date(lastRewardDate) < today) {
      rewardsToday = 0;
    }

    res.status(200).json({
      status: 'success',
      data: {
        rewardsToday,
        maxRewardsPerDay: REWARD_AD_CONFIG.maxRewardsPerDay,
        remainingRewards: REWARD_AD_CONFIG.maxRewardsPerDay - rewardsToday,
        creditsPerReward: REWARD_AD_CONFIG.creditsPerReward,
        maxCreditsPerDay: REWARD_AD_CONFIG.maxCreditsPerDay
      }
    });
  } catch (error) {
    next(error);
  }
});


// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res, next) => {
  try {
    // Track logout
    await Analytics.trackEvent('user_signed_out', {}, req.user.id);

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
router.delete('/account', protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    // Track account deletion
    await Analytics.trackEvent('user_account_deleted', {}, req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});


router.get('/referral-info', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const referralCode = req.user.referralCode;

    // Calculate stats
    const referralCount = await User.countDocuments({ referredBy: userId, isActive: true });
    const earnedCredits = await CreditTransaction.aggregate([
      {
        $match: {
          user: req.user._id,
          kind: 'referral_reward'
        }
      },
      {
        $group: {
          _id: null,
          creditsEarned: { $sum: '$amount' }
        }
      }
    ]);
    const creditsEarned = earnedCredits[0]?.creditsEarned || 0;

    res.status(200).json({
      status: 'success',
      data: {
        referralCode,
        referralCount,
        creditsEarned
      }
    });
  } catch (error) {
    next(error);
  }
});



router.post('/update-device-token', protect, async (req, res, next) => {
  try {
    const { deviceToken } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.deviceToken = deviceToken;
         await user.save();
 

    res.status(200).json({
      status: 'success',
      message: 'Device token updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});




router.get('/account/delete', (req, res) => {
  res.status(200).json({
    status: 'info',
    message: 'To delete your account, you must log in to the app and use the "Delete Account" feature inside the settings or profile section. This ensures your identity is verified before permanent deletion.'
  });
});


// @desc    Delete user account
// @route   DELETE /api/auth/account/delete
// @access  Private
router.delete('/account/delete', protect, async (req, res, next) => {
  try {
    const user = req.user;
    
    // Deactivate user instead of hard deleting (better for data integrity)
    await User.findByIdAndUpdate(user.id, { isActive: false, deviceToken: null });

    // Track account deletion
    await Analytics.trackEvent('user_account_deleted', {}, user.id);

    // Clear the token cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      status: 'success',
      message: 'Account deactivated successfully. All associated data will be removed within 30 days.'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Claim Play Store review reward (one-time, 3 credits)
// @route   POST /api/auth/claim-review-reward
// @access  Private
router.post('/claim-review-reward', protect, rewardLimit, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // One-time only guard
    if (user.hasClaimedReviewReward) {
      return res.status(409).json({
        status: 'error',
        message: 'Review reward already claimed.',
        data: { alreadyClaimed: true }
      });
    }

    // Guest users cannot claim
    if (user.isGuest) {
      return res.status(403).json({
        status: 'error',
        message: 'Please sign in with Google to claim this reward.'
      });
    }

    const REVIEW_REWARD_CREDITS = 3;

    // Mark as claimed
    user.hasClaimedReviewReward = true;
    user.reviewRewardClaimedAt = new Date();
    await user.save();

    // Grant credits via ledger
    const rewardResult = await creditLedger.creditUser({
      userId: user._id,
      amount: REVIEW_REWARD_CREDITS,
      kind: 'review_reward',
      source: 'play_store_review',
      reason: 'Play Store review reward',
      description: 'One-time reward for rating the app on Play Store'
    });

    // Track analytics
    await Analytics.trackEvent('review_reward_claimed', {
      creditsGranted: REVIEW_REWARD_CREDITS,
      totalCredits: rewardResult.user.credits
    }, user._id);

    res.status(200).json({
      status: 'success',
      message: `${REVIEW_REWARD_CREDITS} credits added! Thank you for your review.`,
      data: {
        creditsAwarded: REVIEW_REWARD_CREDITS,
        newBalance: rewardResult.user.credits,
        hasClaimedReviewReward: true
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;