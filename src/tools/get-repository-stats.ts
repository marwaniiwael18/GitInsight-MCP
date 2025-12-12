/**
 * MCP Tool: get_repository_stats
 * Calculates aggregate statistics across all repositories
 */

import { githubClient } from '../github-client.js';
import { ToolResult, RepositoryStats } from '../types/index.js';
import { createErrorResponse, getErrorMessage } from '../utils.js';

export interface GetRepositoryStatsArgs {
  use_cache?: boolean;
}

/**
 * Calculates repository statistics
 */
export async function getRepositoryStats(
  args: GetRepositoryStatsArgs = {}
): Promise<ToolResult<RepositoryStats>> {
  try {
    const { use_cache = true } = args;
    
    console.error('[Tool] get_repository_stats called');
    
    const stats = await githubClient.getRepositoryStats(use_cache);
    
    console.error('[Tool] Repository stats calculated successfully');
    
    return {
      success: true,
      data: stats,
      cached: use_cache,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Tool] Error in get_repository_stats:', getErrorMessage(error));
    return {
      success: false,
      error: createErrorResponse(
        'GET_REPOSITORY_STATS_ERROR',
        `Failed to get repository stats: ${getErrorMessage(error)}`
      ),
      timestamp: new Date().toISOString()
    };
  }
}
