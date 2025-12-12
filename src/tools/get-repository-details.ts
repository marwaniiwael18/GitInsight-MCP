/**
 * MCP Tool: get_repository_details
 * Gets detailed information about a specific repository
 */

import { githubClient } from '../github-client.js';
import { ToolResult, Repository } from '../types/index.js';
import { createErrorResponse, getErrorMessage } from '../utils.js';

export interface GetRepositoryDetailsArgs {
  repository_name: string;
  use_cache?: boolean;
  include_readme?: boolean;
}

export interface RepositoryDetailsResponse {
  repository: Repository;
  readme?: string;
}

/**
 * Gets detailed information about a specific repository
 */
export async function getRepositoryDetails(
  args: GetRepositoryDetailsArgs
): Promise<ToolResult<RepositoryDetailsResponse>> {
  try {
    const { repository_name, use_cache = true, include_readme = false } = args;
    
    if (!repository_name) {
      throw new Error('repository_name is required');
    }
    
    console.error('[Tool] get_repository_details called for:', repository_name);
    
    const repository = await githubClient.getRepositoryDetails(repository_name, use_cache);
    
    const response: RepositoryDetailsResponse = { repository };
    
    // Optionally include README
    if (include_readme) {
      console.error('[Tool] Fetching README for:', repository_name);
      response.readme = await githubClient.getRepositoryReadme(repository_name, use_cache);
    }
    
    console.error(`[Tool] Returning details for ${repository_name}`);
    
    return {
      success: true,
      data: response,
      cached: use_cache,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Tool] Error in get_repository_details:', getErrorMessage(error));
    return {
      success: false,
      error: createErrorResponse(
        'GET_REPOSITORY_DETAILS_ERROR',
        `Failed to get repository details: ${getErrorMessage(error)}`
      ),
      timestamp: new Date().toISOString()
    };
  }
}
