/**
 * Storage Service
 * Handles localStorage caching for posts and sync state
 */

const CACHE_KEY = 'pinterest_posts_cache';
const LAST_SYNC_KEY = 'pinterest_last_sync';

/**
 * Get cached posts from localStorage
 */
export function getCachedPosts() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error reading cached posts:', error);
  }
  return null;
}

/**
 * Save posts to localStorage
 */
export function savePosts(posts) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving posts to cache:', error);
  }
}

/**
 * Get last sync timestamp
 */
export function getLastSync() {
  try {
    return localStorage.getItem(LAST_SYNC_KEY);
  } catch (error) {
    console.error('Error reading last sync:', error);
    return null;
  }
}

/**
 * Set last sync timestamp
 */
export function setLastSync(timestamp) {
  try {
    localStorage.setItem(LAST_SYNC_KEY, timestamp);
  } catch (error) {
    console.error('Error saving last sync:', error);
  }
}

/**
 * Clear all cached data
 */
export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(LAST_SYNC_KEY);
}

/**
 * Merge new posts with cached posts, avoiding duplicates
 * New posts are prepended to the array
 */
export function mergePosts(cachedPosts, newPosts) {
  if (!cachedPosts || cachedPosts.length === 0) {
    return newPosts;
  }

  if (!newPosts || newPosts.length === 0) {
    return cachedPosts;
  }

  // Create a Set of existing post IDs for quick lookup
  const existingIds = new Set(cachedPosts.map(post => post.id));

  // Filter out duplicates from new posts
  const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));

  // Prepend new posts to cached posts (newest first)
  return [...uniqueNewPosts, ...cachedPosts];
}

