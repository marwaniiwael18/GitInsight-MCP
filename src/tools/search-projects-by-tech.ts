/**
 * MCP Tool: search_projects_by_tech
 * Searches repositories by technology/language
 */

import { githubClient } from '../github-client.js';
import { ToolResult, RepositoryMetadata, SearchFilters } from '../types/index.js';
import { createErrorResponse, getErrorMessage } from '../utils.js';

export interface SearchProjectsByTechArgs {
  language?: string;
  topic?: string;
  min_stars?: number;
  sort_by?: 'stars' | 'forks' | 'updated' | 'created' | 'name';
  order?: 'asc' | 'desc';
  use_cache?: boolean;
}

/**
 * Searches projects by technology and filters
 */
export async function searchProjectsByTech(
  args: SearchProjectsByTechArgs
): Promise<ToolResult<RepositoryMetadata[]>> {
  try {
    const { use_cache = true, ...filters } = args;
    
    console.error('[Tool] search_projects_by_tech called with filters:', filters);
    
    const searchFilters: SearchFilters = filters;
    const repos = await githubClient.searchProjectsByTech(searchFilters, use_cache);
    
    console.error(`[Tool] Found ${repos.length} matching repositories`);
    
    return {
      success: true,
      data: repos,
      cached: use_cache,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Tool] Error in search_projects_by_tech:', getErrorMessage(error));
    return {
      success: false,
      error: createErrorResponse(
        'SEARCH_PROJECTS_ERROR',
        `Failed to search projects: ${getErrorMessage(error)}`
      ),
      timestamp: new Date().toISOString()
    };
  }
}
