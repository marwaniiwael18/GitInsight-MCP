/**
 * MCP Tool: get_contribution_activity
 * Fetches user contribution activity and metrics
 */

import { githubClient } from '../github-client.js';
import { ToolResult, ContributionActivity } from '../types/index.js';
import { createErrorResponse, getErrorMessage } from '../utils.js';

export interface GetContributionActivityArgs {
  use_cache?: boolean;
}

/**
 * Fetches contribution activity metrics
 */
export async function getContributionActivity(
  args: GetContributionActivityArgs = {}
): Promise<ToolResult<ContributionActivity>> {
  try {
    const { use_cache = true } = args;
    
    console.error('[Tool] get_contribution_activity called');
    
    const activity = await githubClient.getContributionActivity(use_cache);
    
    console.error('[Tool] Contribution activity fetched successfully');
    
    return {
      success: true,
      data: activity,
      cached: use_cache,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Tool] Error in get_contribution_activity:', getErrorMessage(error));
    return {
      success: false,
      error: createErrorResponse(
        'GET_CONTRIBUTION_ACTIVITY_ERROR',
        `Failed to get contribution activity: ${getErrorMessage(error)}`
      ),
      timestamp: new Date().toISOString()
    };
  }
}
