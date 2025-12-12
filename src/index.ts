#!/usr/bin/env node

/**
 * GitInsight MCP Server
 * A Model Context Protocol server for GitHub profile integration
 * 
 * This server provides AI assistants with tools to query GitHub repositories,
 * analyze contribution patterns, and extract portfolio insights.
 * 
 * Author: Wael Marwani
 * GitHub: https://github.com/marwaniiwael18
 * Portfolio: https://marwaniwael.engineer
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { config } from './config.js';
import { githubClient } from './github-client.js';
import {
  listRepositories,
  ListRepositoriesArgs,
  getRepositoryDetails,
  GetRepositoryDetailsArgs,
  getRecentCommits,
  GetRecentCommitsArgs,
  getRepositoryStats,
  GetRepositoryStatsArgs,
  searchProjectsByTech,
  SearchProjectsByTechArgs,
  getContributionActivity,
  GetContributionActivityArgs,
} from './tools/index.js';

/**
 * MCP Server instance
 */
const server = new Server(
  {
    name: 'gitinsight-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Define available MCP tools
 * These tools will be exposed to AI assistants like Claude
 */
const TOOLS: Tool[] = [
  {
    name: 'list_repositories',
    description: 
      `Lists all public repositories for GitHub user: ${config.github_username}. ` +
      'Returns repository metadata including name, description, stars, forks, language, topics, and last update date. ' +
      'Supports sorting by stars, forks, updated date, or name. Optionally limit the number of results.',
    inputSchema: {
      type: 'object',
      properties: {
        use_cache: {
          type: 'boolean',
          description: 'Whether to use cached data (default: true)',
          default: true,
        },
        sort_by: {
          type: 'string',
          enum: ['stars', 'forks', 'updated', 'name'],
          description: 'Sort repositories by this field',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of repositories to return',
        },
      },
    },
  },
  {
    name: 'get_repository_details',
    description:
      'Gets detailed information about a specific repository including full metadata, topics, README content, ' +
      'open issues count, creation date, and homepage URL. Useful for deep-diving into a particular project.',
    inputSchema: {
      type: 'object',
      properties: {
        repository_name: {
          type: 'string',
          description: 'Name of the repository (e.g., "GitInsight-MCP")',
        },
        use_cache: {
          type: 'boolean',
          description: 'Whether to use cached data (default: true)',
          default: true,
        },
        include_readme: {
          type: 'boolean',
          description: 'Include README content in the response (default: false)',
          default: false,
        },
      },
      required: ['repository_name'],
    },
  },
  {
    name: 'get_recent_commits',
    description:
      'Fetches recent commits either for a specific repository or across all repositories. ' +
      'Returns commit SHA, message, author, date, and URL. Useful for tracking recent development activity.',
    inputSchema: {
      type: 'object',
      properties: {
        repository_name: {
          type: 'string',
          description: 'Optional: Name of specific repository. If omitted, fetches commits across all repos.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of commits to return (default: 50)',
          default: 50,
        },
        use_cache: {
          type: 'boolean',
          description: 'Whether to use cached data (default: true)',
          default: true,
        },
      },
    },
  },
  {
    name: 'get_repository_stats',
    description:
      'Calculates aggregate statistics across all repositories including: ' +
      'total repositories count, total stars, total forks, language breakdown with percentages, ' +
      'most starred/forked repositories, recently updated repos, and total open issues. ' +
      'Perfect for portfolio summaries and analytics.',
    inputSchema: {
      type: 'object',
      properties: {
        use_cache: {
          type: 'boolean',
          description: 'Whether to use cached data (default: true)',
          default: true,
        },
      },
    },
  },
  {
    name: 'search_projects_by_tech',
    description:
      'Searches and filters repositories by technology stack, programming language, topics, or minimum stars. ' +
      'Supports advanced filtering and sorting. Use this to find projects by category (e.g., "all Python projects", ' +
      '"DevOps projects", "AI/ML repositories").',
    inputSchema: {
      type: 'object',
      properties: {
        language: {
          type: 'string',
          description: 'Filter by programming language (e.g., "JavaScript", "Python", "Java")',
        },
        topic: {
          type: 'string',
          description: 'Filter by repository topic/tag (e.g., "devops", "machine-learning", "web")',
        },
        min_stars: {
          type: 'number',
          description: 'Minimum number of stars required',
        },
        sort_by: {
          type: 'string',
          enum: ['stars', 'forks', 'updated', 'created', 'name'],
          description: 'Sort results by this field',
        },
        order: {
          type: 'string',
          enum: ['asc', 'desc'],
          description: 'Sort order: ascending or descending (default: desc)',
          default: 'desc',
        },
        use_cache: {
          type: 'boolean',
          description: 'Whether to use cached data (default: true)',
          default: true,
        },
      },
    },
  },
  {
    name: 'get_contribution_activity',
    description:
      'Analyzes contribution activity and returns metrics including: ' +
      'total commits, repositories contributed to, most active day, and contribution streak. ' +
      'Useful for understanding development patterns and activity trends.',
    inputSchema: {
      type: 'object',
      properties: {
        use_cache: {
          type: 'boolean',
          description: 'Whether to use cached data (default: true)',
          default: true,
        },
      },
    },
  },
];

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[MCP] Listing available tools');
  return { tools: TOOLS };
});

/**
 * Handler for executing tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.error(`[MCP] Tool called: ${name}`, args);

  try {
    switch (name) {
      case 'list_repositories': {
        const result = await listRepositories((args as ListRepositoriesArgs) || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_repository_details': {
        const result = await getRepositoryDetails(args as unknown as GetRepositoryDetailsArgs);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_recent_commits': {
        const result = await getRecentCommits((args as GetRecentCommitsArgs) || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_repository_stats': {
        const result = await getRepositoryStats((args as GetRepositoryStatsArgs) || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'search_projects_by_tech': {
        const result = await searchProjectsByTech((args as SearchProjectsByTechArgs) || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_contribution_activity': {
        const result = await getContributionActivity((args as GetContributionActivityArgs) || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`[MCP] Error executing tool ${name}:`, error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: {
              error: 'TOOL_EXECUTION_ERROR',
              message: error instanceof Error ? error.message : String(error),
              timestamp: new Date().toISOString(),
            },
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the MCP server
 */
async function main() {
  console.error('='.repeat(60));
  console.error('GitInsight MCP Server - Starting...');
  console.error('='.repeat(60));
  console.error(`GitHub User: ${config.github_username}`);
  console.error(`Cache TTL: ${config.cache_ttl} seconds`);
  console.error(`Tools Available: ${TOOLS.length}`);
  console.error('='.repeat(60));

  // Verify GitHub connection
  try {
    const rateLimit = await githubClient.getRateLimit();
    console.error(`GitHub API Rate Limit: ${rateLimit.remaining}/${rateLimit.limit}`);
    console.error(`Rate limit resets at: ${new Date(rateLimit.reset * 1000).toISOString()}`);
  } catch (error) {
    console.error('Warning: Could not fetch GitHub rate limit:', error);
  }

  console.error('='.repeat(60));
  console.error('Server ready! Waiting for MCP client connections...');
  console.error('='.repeat(60));

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.error('\n[MCP] Shutting down server...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('\n[MCP] Shutting down server...');
  await server.close();
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Fatal error starting MCP server:', error);
  process.exit(1);
});
