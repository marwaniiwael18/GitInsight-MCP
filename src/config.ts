/**
 * Configuration module for GitInsight MCP Server
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';
import { ServerConfig } from './types/index.js';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates that required environment variables are present
 * @throws Error if required variables are missing
 */
function validateConfig(): void {
  const required = ['GITHUB_TOKEN', 'GITHUB_USERNAME'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please create a .env file based on .env.example'
    );
  }
}

/**
 * Loads and returns the server configuration
 * @returns ServerConfig object with all settings
 */
export function getConfig(): ServerConfig {
  validateConfig();
  
  return {
    github_token: process.env.GITHUB_TOKEN!,
    github_username: process.env.GITHUB_USERNAME!,
    cache_ttl: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),
    cache_check_period: parseInt(process.env.CACHE_CHECK_PERIOD_SECONDS || '600', 10),
    api_base_url: process.env.GITHUB_API_BASE_URL || 'https://api.github.com'
  };
}

/**
 * Export the configuration as a singleton
 */
export const config = getConfig();
