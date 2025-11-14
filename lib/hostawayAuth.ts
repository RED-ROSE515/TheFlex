import axios from 'axios';

const BASE_URL = process.env.HOSTAWAY_BASE_URL || 'https://api.hostaway.com/v1';
const CLIENT_ID = process.env.HOSTAWAY_ACCOUNT_ID || '61148';
const CLIENT_SECRET = process.env.HOSTAWAY_API_KEY || 'f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152';

export interface AccessTokenResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

interface StoredToken {
  token_type: string;
  expires_in: number;
  access_token: string;
  expires_at: number; // Timestamp when token expires
}

// Server-side in-memory token cache (for API routes)
let serverTokenCache: StoredToken | null = null;

const TOKEN_STORAGE_KEY = 'hostaway_access_token';

/**
 * Get access token from Hostaway API
 */
async function fetchAccessToken(): Promise<AccessTokenResponse> {
  try {
    console.log('Attempting to fetch access token from:', `${BASE_URL}/accessTokens`);
    console.log('Using client_id:', CLIENT_ID);
    
    const response = await axios.post<AccessTokenResponse>(
      `${BASE_URL}/accessTokens`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'general',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('Access token fetched successfully');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching access token:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
}

/**
 * Store token in localStorage (client-side) or memory (server-side)
 */
function storeToken(tokenData: AccessTokenResponse): void {
  const expiresAt = Date.now() + (tokenData.expires_in * 1000);
  const storedToken: StoredToken = {
    ...tokenData,
    expires_at: expiresAt,
  };
  
  if (typeof window !== 'undefined') {
    // Client-side: use localStorage
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(storedToken));
  } else {
    // Server-side: use in-memory cache
    serverTokenCache = storedToken;
  }
}

/**
 * Get stored token from localStorage (client) or memory (server)
 */
function getStoredToken(): StoredToken | null {
  if (typeof window !== 'undefined') {
    // Client-side: get from localStorage
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  } else {
    // Server-side: get from memory cache
    return serverTokenCache;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: StoredToken): boolean {
  // Add 60 second buffer before expiration
  const bufferTime = 60 * 1000;
  return Date.now() >= (token.expires_at - bufferTime);
}

/**
 * Get valid access token, refreshing if necessary
 * Works on both server-side (API routes) and client-side
 */
export async function getAccessToken(): Promise<string> {
  try {
    // Check if we have a stored token
    const storedToken = getStoredToken();

    if (storedToken && !isTokenExpired(storedToken)) {
      // Token is still valid
      console.log('Using cached access token');
      return storedToken.access_token;
    }

    // Token expired or doesn't exist, fetch new one
    console.log('Fetching new Hostaway access token...');
    const tokenData = await fetchAccessToken();
    storeToken(tokenData);
    console.log('Access token stored successfully');

    return tokenData.access_token;
  } catch (error: any) {
    console.error('Failed to get access token:', error.message);
    throw new Error(`Failed to get access token: ${error.message}`);
  }
}

/**
 * Clear stored token (for logout or errors)
 */
export function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } else {
    serverTokenCache = null;
  }
}

