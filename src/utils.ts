/**
 * Utility functions for GitInsight MCP Server
 */

import { ErrorResponse } from './types/index.js';

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  details?: unknown
): ErrorResponse {
  return {
    error,
    message,
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * Safely extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Formats a date string to ISO format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toISOString();
}

/**
 * Calculates percentage with 2 decimal places
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
}

/**
 * Truncates a string to a maximum length
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Validates GitHub username format
 */
export function isValidGitHubUsername(username: string): boolean {
  // GitHub username rules: alphanumeric and hyphens, cannot start with hyphen
  const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  return regex.test(username) && username.length <= 39;
}

/**
 * Delays execution for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parses repository full name into owner and repo
 */
export function parseRepoFullName(fullName: string): { owner: string; repo: string } {
  const [owner, repo] = fullName.split('/');
  return { owner, repo };
}
