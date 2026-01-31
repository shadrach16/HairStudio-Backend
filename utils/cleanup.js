// utils/cleanup.js
// Scheduled cleanup jobs for operational hygiene

const fs = require('fs-extra');
const path = require('path');
const User = require('../models/User');
const Generation = require('../models/Generation');
const PushLog = require('../models/PushLog');

// Directories to clean
const TEMP_DIR = path.join(__dirname, '../assets/temp');
const RENDERS_DIR = path.join(__dirname, '../public/renders');

/**
 * Clean up old temporary files (older than 24 hours)
 */
async function cleanupTempFiles() {
  console.log('🧹 Starting temp file cleanup...');
  
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();
  let deleted = 0;

  try {
    await fs.ensureDir(TEMP_DIR);
    const files = await fs.readdir(TEMP_DIR);

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filePath);
        deleted++;
      }
    }

    console.log(`✅ Temp cleanup: deleted ${deleted} files`);
    return { success: true, deleted };
  } catch (error) {
    console.error('❌ Temp cleanup error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up old render files (older than 7 days)
 */
async function cleanupRenderFiles() {
  console.log('🧹 Starting render file cleanup...');
  
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = Date.now();
  let deleted = 0;

  try {
    await fs.ensureDir(RENDERS_DIR);
    const files = await fs.readdir(RENDERS_DIR);

    for (const file of files) {
      const filePath = path.join(RENDERS_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filePath);
        deleted++;
      }
    }

    console.log(`✅ Render cleanup: deleted ${deleted} files`);
    return { success: true, deleted };
  } catch (error) {
    console.error('❌ Render cleanup error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up invalid/stale device tokens
 * Called periodically or after push failures
 */
async function cleanupInvalidTokens() {
  console.log('🧹 Starting token cleanup...');

  try {
    // Find users with device tokens who haven't been active in 90 days
    const inactiveThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    
    const result = await User.updateMany(
      {
        deviceToken: { $exists: true, $ne: null },
        lastLogin: { $lt: inactiveThreshold }
      },
      {
        $unset: { deviceToken: 1, devicePlatform: 1 }
      }
    );

    console.log(`✅ Token cleanup: cleared ${result.modifiedCount} stale tokens`);
    return { success: true, cleared: result.modifiedCount };
  } catch (error) {
    console.error('❌ Token cleanup error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Clean up orphaned generations (stuck in processing for >1 hour)
 */
async function cleanupStuckGenerations() {
  console.log('🧹 Starting stuck generation cleanup...');

  try {
    const stuckThreshold = new Date(Date.now() - 60 * 60 * 1000); // 1 hour
    
    const result = await Generation.updateMany(
      {
        status: 'processing',
        createdAt: { $lt: stuckThreshold }
      },
      {
        status: 'failed',
        errorMessage: 'Timed out - generation took too long'
      }
    );

    console.log(`✅ Generation cleanup: marked ${result.modifiedCount} as failed`);
    return { success: true, cleaned: result.modifiedCount };
  } catch (error) {
    console.error('❌ Generation cleanup error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Run all cleanup jobs
 */
async function runAllCleanups() {
  console.log('🧹 Running all cleanup jobs...');
  
  const results = {
    temp: await cleanupTempFiles(),
    renders: await cleanupRenderFiles(),
    tokens: await cleanupInvalidTokens(),
    generations: await cleanupStuckGenerations()
  };

  console.log('✅ All cleanups complete:', results);
  return results;
}

/**
 * Start scheduled cleanup (runs every 6 hours)
 */
function startScheduledCleanup() {
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  
  // Run immediately on startup
  setTimeout(runAllCleanups, 60 * 1000); // Wait 1 minute after startup
  
  // Then run every 6 hours
  setInterval(runAllCleanups, SIX_HOURS);
  
  console.log('⏰ Scheduled cleanup jobs started (every 6 hours)');
}

module.exports = {
  cleanupTempFiles,
  cleanupRenderFiles,
  cleanupInvalidTokens,
  cleanupStuckGenerations,
  runAllCleanups,
  startScheduledCleanup
};
