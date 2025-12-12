/**
 * MCP Tool: get_recent_commits
 * Fetches recent commits across all repositories or for a specific repo
 */

import { githubClient } from '../github-client.js';
import { ToolResult, CommitMetadata } from '../types/index.js';
import { createErrorResponse, getErrorMessage } from '../utils.js';

export interface GetRecentCommitsArgs {
  repository_name?: string;
  limit?: number;
  use_cache?: boolean;
}

/**
 * Fetches recent commits
 */
export async function getRecentCommits(
  args: GetRecentCommitsArgs = {}
): Promise<ToolResult<CommitMetadata[]>> {
  try {
    const { repository_name, limit = 50, use_cache = true } = args;
    
    console.error('[Tool] get_recent_commits called with:', args);
    
    const commits = await githubClient.getRecentCommits(repository_name, limit, use_cache);
    
    console.error(`[Tool] Returning ${commits.length} commits`);
    
    return {
      success: true,
      data: commits,
      cached: use_cache,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Tool] Error in get_recent_commits:', getErrorMessage(error));
    return {
      success: false,
      error: createErrorResponse(
        'GET_RECENT_COMMITS_ERROR',
        `Failed to get recent commits: ${getErrorMessage(error)}`
      ),
      timestamp: new Date().toISOString()
    };
  }
}
