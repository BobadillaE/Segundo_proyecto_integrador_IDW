/**
 * API Service Layer
 * Handles all API calls to the Python FastAPI backend
 */

// Use environment variable or default to localhost:8000 (FastAPI default port)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Get the current user ID from sessionStorage
 */
function getUserId() {
  return sessionStorage.getItem('userId') || 'anonymous';
}

/**
 * Make an API request with proper headers
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const userId = getUserId();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content (DELETE success)
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Get posts with pagination
 */
export async function getPosts(page = 1, limit = 50, minDate = null) {
  let endpoint = `/posts?page=${page}&limit=${limit}`;
  if (minDate) {
    endpoint += `&min_date=${encodeURIComponent(minDate)}`;
  }
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * Get a single post by ID
 */
export async function getPost(postId) {
  return apiRequest(`/posts/${postId}`, { method: 'GET' });
}

/**
 * Create a new post
 */
export async function createPost(postData) {
  return apiRequest('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

/**
 * Update a post (PATCH - partial update)
 */
export async function updatePost(postId, postData) {
  return apiRequest(`/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(postData),
  });
}

/**
 * Replace a post (PUT - full replacement)
 */
export async function replacePost(postId, postData) {
  return apiRequest(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
}

/**
 * Delete a post
 */
export async function deletePost(postId) {
  return apiRequest(`/posts/${postId}`, {
    method: 'DELETE',
  });
}

/**
 * Get discovery images from Unsplash
 */
export async function getDiscoverImages(count = 12) {
  const endpoint = `/discover?count=${count}`;
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * Health check
 */
export async function healthCheck() {
  return apiRequest('/health', { method: 'GET' });
}

