// src/api/client.ts — Axios instance with interceptors and error handling
import axios from "axios";
import { supabase } from "../../utils/supabase/client";

// Base URL for all API calls
// Automatically construct the Supabase Functions URL
import { projectId, publicAnonKey } from "../../utils/supabase/info";

// Hardcoded fallback in case imports fail
const HARDCODED_PROJECT_ID = "njxtiaokvgoaxjcrnxzo";
const effectiveProjectId = projectId || HARDCODED_PROJECT_ID;

const SUPABASE_FUNCTIONS_URL = `https://${effectiveProjectId}.supabase.co/functions/v1/make-server-308644a4`;
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || SUPABASE_FUNCTIONS_URL;

console.log("[API Client] Base URL configured:", API_BASE_URL);
console.log("[API Client] Project ID:", effectiveProjectId);
console.log("[API Client] Using Supabase Functions:", SUPABASE_FUNCTIONS_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "apikey": publicAnonKey, // Required for Supabase Edge Functions
  },
  timeout: 30000, // 30 second timeout
});

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/api/availability',
  '/api/availability/check',
  '/api/packages',
  '/api/facilities',
  '/api/gallery',
  '/api/testimonials',
  '/api/events',
  '/health',
];

// Check if endpoint is public
const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some(endpoint => url?.startsWith(endpoint));
};

// Request interceptor - add auth tokens for protected endpoints only
api.interceptors.request.use(
  async (config) => {
    const requestUrl = config.url || '';
    
    // Only add auth token for protected endpoints
    if (!isPublicEndpoint(requestUrl)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    }

    // Build full URL for logging
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    
    // Add timestamp for debugging
    console.log(`[API] ${config.method?.toUpperCase()} ${fullUrl}`, {
      params: config.params,
      data: config.data,
      isPublic: isPublicEndpoint(requestUrl),
    });
    return config;
  },
  (error) => {
    console.error("[API] Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    // Build full URL for logging
    const fullUrl = `${response.config.baseURL || ''}${response.config.url || ''}`;
    
    // Log successful responses
    console.log(`[API] ✅ ${response.config.method?.toUpperCase()} ${fullUrl}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Build full URL for logging
      const fullUrl = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
      
      // Server responded with error status
      console.error(`[API] ❌ ${error.response.status}:`, {
        fullUrl,
        requestedUrl: error.config?.url,
        baseURL: error.config?.baseURL,
        error: error.response.data,
      });

      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          console.error("Unauthorized - redirect to login");
          // Could dispatch auth logout action here
          break;
        case 403:
          console.error("Forbidden - insufficient permissions");
          break;
        case 404:
          console.error("Not found - Make sure backend is using /api prefix");
          break;
        case 409:
          console.error("Conflict - resource already exists or booking conflict");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("API Error:", error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error("[API] ❌ No response received:", error.request);
    } else {
      // Error in request setup
      console.error("[API] ❌ Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to extract error message
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Helper function to check if response is successful
export const isSuccessResponse = (response: any): boolean => {
  return response?.data?.success === true || response?.status === 200;
};

// Helper function to normalize array responses to single object
// Backend sometimes returns [obj] instead of obj for create/update
export function normalizeResponse<T>(data: T | T[]): T {
  return Array.isArray(data) ? data[0] : data;
}

// Helper function to safely extract data from API response
// Handles both { success, data } and direct data responses
export function extractData<T>(response: any): T {
  // If response has success/data structure
  if (response?.data?.success && response?.data?.data !== undefined) {
    return normalizeResponse(response.data.data);
  }
  
  // If response.data is the actual data
  if (response?.data !== undefined) {
    return normalizeResponse(response.data);
  }
  
  // Fallback to response itself
  return normalizeResponse(response);
}

export default api;