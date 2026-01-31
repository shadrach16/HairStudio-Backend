// services/pushService.js
// Minimal FCM push sender with thin abstraction for provider swapping

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK (only once)
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return;
  
  try {
    const serviceAccountPath = path.join(__dirname, '../hair-studio-a9654-firebase-adminsdk-fbsvc-d632781b15.json');
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized for push notifications');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
  }
};

// Initialize on module load
initializeFirebase();

/**
 * Push Provider Interface (thin abstraction)
 * Allows swapping FCM for other providers later
 */
const PushProvider = {
  /**
   * Send push notification to a single device
   * @param {string} deviceToken - FCM device token
   * @param {Object} payload - { title, body, data }
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendToDevice(deviceToken, payload) {
    if (!deviceToken) {
      return { success: false, error: 'No device token provided' };
    }

    try {
      const message = {
        token: deviceToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'hairstudio_default',
            icon: 'ic_notification',
            color: '#F59E0B', // Amber-500
          }
        },
        apns: {
          headers: {
            'apns-priority': '10'
          },
          payload: {
            aps: {
              badge: 1,
              sound: 'default'
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log(`✅ Push sent: ${response}`);
      return { success: true, messageId: response };
    } catch (error) {
      console.error(`❌ Push failed: ${error.code} - ${error.message}`);
      
      // Handle invalid tokens gracefully
      if (error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        return { 
          success: false, 
          error: 'INVALID_TOKEN',
          shouldRemoveToken: true 
        };
      }
      
      return { success: false, error: error.message };
    }
  },

  /**
   * Send push to multiple devices (batch)
   * @param {string[]} deviceTokens - Array of FCM tokens
   * @param {Object} payload - { title, body, data }
   * @returns {Promise<{ successCount: number, failureCount: number, invalidTokens: string[] }>}
   */
  async sendToDevices(deviceTokens, payload) {
    if (!deviceTokens || deviceTokens.length === 0) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      android: {
        priority: 'high',
        notification: {
          channelId: 'hairstudio_default',
          icon: 'ic_notification',
          color: '#F59E0B',
        }
      },
      apns: {
        headers: { 'apns-priority': '10' },
        payload: { aps: { badge: 1, sound: 'default' } }
      }
    };

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: deviceTokens,
        ...message
      });

      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          if (code === 'messaging/invalid-registration-token' ||
              code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(deviceTokens[idx]);
          }
        }
      });

      console.log(`📬 Batch push: ${response.successCount} success, ${response.failureCount} failed`);
      
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens
      };
    } catch (error) {
      console.error('❌ Batch push failed:', error.message);
      return { successCount: 0, failureCount: deviceTokens.length, invalidTokens: [] };
    }
  }
};

module.exports = PushProvider;
