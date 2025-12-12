/**
 * MCP Tool: list_repositories
 * Fetches all public repositories with metadata
 */

import { githubClient } from '../github-client.js';
import { ToolResult, RepositoryMetadata } from '../types/index.js';
import { createErrorResponse, getErrorMessage } from '../utils.js';

export interface ListRepositoriesArgs {
  use_cache?: boolean;
  sort_by?: 'stars' | 'forks' | 'updated' | 'name';
  limit?: number;
}

/**
 * Lists all repositories for the authenticated user
 */
export async function listRepositories(args: ListRepositoriesArgs = {}): Promise<ToolResult<RepositoryMetadata[]>> {
  try {
    const { use_cache = true, sort_by, limit } = args;
    
    console.error('[Tool] list_repositories called with:', args);
    
    let repos = await githubClient.listRepositories(use_cache);
    
    // Apply sorting if specified
    if (sort_by) {
      repos = [...repos].sort((a, b) => {
        switch (sort_by) {
          case 'stars':
            return b.stars - a.stars;
          case 'forks':
            return b.forks - a.forks;
          case 'updated':
            return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    }
    
    // Apply limit if specified
    if (limit && limit > 0) {
      repos = repos.slice(0, limit);
    }
    
    console.error(`[Tool] Returning ${repos.length} repositories`);
    
    return {
      success: true,
      data: repos,
      cached: use_cache,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Tool] Error in list_repositories:', getErrorMessage(error));
    return {
      success: false,
      error: createErrorResponse(
        'LIST_REPOSITORIES_ERROR',
        `Failed to list repositories: ${getErrorMessage(error)}`
      ),
      timestamp: new Date().toISOString()
    };
  }
}
