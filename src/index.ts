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
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
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
  getSkillsMatrix,
  generatePortfolioSummary,
} from './tools/index.js';

/**
 * MCP Server instance
 */
const server = new Server(
  {
    name: 'gitinsight-mcp',
    version: '1.0.0',
  },  resources: {},
      prompts: {},
    
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
  {
    name: 'get_skills_matrix',
    description:
      '🎯 RECRUITER TOOL: Generates a comprehensive skills matrix analyzing all repositories. ' +
      'Returns categorized technical skills (Programming Languages, DevOps, Cloud), proficiency levels, ' +
      'domain expertise (Web Dev, AI/ML, DevOps), and project counts. Perfect for HR screening and technical assessment.',
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
    name: 'generate_portfolio_summary',
    description:
      '📄 RECRUITER TOOL: Creates a recruiter-friendly portfolio summary with candidate profile, ' +
      'professional summary, key achievements, featured projects with highlights, technical proficiency breakdown, ' +
      'and GitHub metrics. Optimized for HR review and candidate evaluation.',
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
 * MCP Resources - Provide readable portfolio data
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  console.error('[MCP] Listing available resources');
  return {
    resources: [
      {
        uri: 'portfolio://profile',
        mimeType: 'application/json',
        name: 'Developer Profile',
        description: 'Complete developer profile with contact info and expertise areas'
      },
      {
        uri: 'portfolio://resume',
        mimeType: 'text/markdown',
        name: 'Professional Resume',
        description: 'Markdown-formatted resume/CV generated from GitHub data'
      },
      {
        uri: 'portfolio://skills',
        mimeType: 'application/json',
        name: 'Skills Matrix',
        description: 'Comprehensive technical skills assessment with proficiency levels'
      }
    ]
  };
});

/**
 * Handler for reading resources
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  console.error(`[MCP] Reading resource: ${uri}`);

  switch (uri) {
    case 'portfolio://profile':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({
              name: 'Wael Marwani',
              title: 'Full Stack Developer | DevOps Engineer | IT Engineer',
              location: 'Ariana, Tunisia',
              email: 'wael.marwani@esprit.tn',
              portfolio: 'https://marwaniwael.engineer',
              github: 'https://github.com/marwaniiwael18',
              specializations: [
                'DevOps & CI/CD',
                'Full Stack Web Development',
                'Cloud Infrastructure (AWS)',
                'Microservices Architecture',
                'AI Integration & MCP Servers'
              ],
              availability: 'Open to opportunities'
            }, null, 2)
          }
        ]
      };

    case 'portfolio://resume':
      const stats = await githubClient.getRepositoryStats();
      const resumeMarkdown = `# Wael Marwani
**Full Stack Developer | DevOps Engineer | IT Engineer**

📍 Ariana, Tunisia  
📧 wael.marwani@esprit.tn  
🌐 https://marwaniwael.engineer  
💼 https://github.com/marwaniiwael18

## Professional Summary
Innovative software engineer with ${stats.total_repositories} public repositories and ${stats.total_stars} GitHub stars. Specialized in modern web development, DevOps practices, and AI integration. Proven track record in building scalable applications using ${stats.languages.slice(0, 3).map(l => l.language).join(', ')}.

## Technical Skills
**Programming Languages:** ${stats.languages.slice(0, 6).map(l => l.language).join(', ')}

**DevOps & Tools:** Docker, Jenkins, CI/CD Pipelines, Git/GitHub

**Cloud & Infrastructure:** AWS, Microservices Architecture

**Specializations:**
- DevOps & Continuous Integration/Deployment
- Full Stack Web Development
- Cloud Infrastructure Management
- AI Integration & MCP Server Development

## GitHub Metrics
- 📦 **${stats.total_repositories}** Public Repositories
- ⭐ **${stats.total_stars}** Total Stars
- 🍴 **${stats.total_forks}** Total Forks
- 🔧 **${stats.languages.length}** Programming Languages

## Featured Projects
${stats.recently_updated.slice(0, 5).map(r => `
### ${r.name}
${r.description || 'Software development project'}  
**Tech:** ${r.language || 'Multiple'} | ⭐ ${r.stars} stars | 🍴 ${r.forks} forks  
🔗 ${r.url}
`).join('\n')}

## Education & Contact
📧 **Email:** wael.marwani@esprit.tn  
🌐 **Portfolio:** https://marwaniwael.engineer  
💼 **LinkedIn:** Available upon request  
🐙 **GitHub:** https://github.com/marwaniiwael18

---
*Resume generated from GitHub API data*`;

      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: resumeMarkdown
          }
        ]
      };

    case 'portfolio://skills':
      const skillsData = await getSkillsMatrix();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(skillsData.data, null, 2)
          }
        ]
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

/**
 * MCP Prompts - Pre-configured prompts for common use cases
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  console.error('[MCP] Listing available prompts');
  return {
    prompts: [
      {
        name: 'recruiter_evaluation',
        description: '🎯 HR Tool: Comprehensive candidate evaluation for recruiters',
        arguments: []
      },
      {
        name: 'technical_assessment',
        description: '🔧 Technical deep-dive for engineering managers',
        arguments: []
      },
      {
        name: 'portfolio_showcase',
        description: '💼 Generate an impressive portfolio presentation',
        arguments: []
      }
    ]
  };
});

/**
 * Handler for getting prompts
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name } = request.params;
  console.error(`[MCP] Getting prompt: ${name}`);

  switch (name) {
    case 'recruiter_evaluation':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please provide a comprehensive evaluation of Wael Marwani as a software engineering candidate. Include:

1. Use the 'generate_portfolio_summary' tool to get candidate overview
2. Use the 'get_skills_matrix' tool to assess technical proficiency
3. Use the 'get_repository_stats' tool for quantitative metrics
4. Use the 'get_contribution_activity' tool to evaluate engagement

Then provide:
- Overall technical assessment (1-10 rating)
- Key strengths for this role
- Notable projects and achievements
- Recommended interview focus areas
- Hiring recommendation (Strong Yes / Yes / Maybe / No)`
            }
          }
        ]
      };

    case 'technical_assessment':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Perform a detailed technical assessment of Wael Marwani's GitHub portfolio:

1. Use 'get_skills_matrix' to analyze technical capabilities
2. Use 'list_repositories' sorted by stars to find top projects
3. Use 'search_projects_by_tech' to explore DevOps projects
4. Use 'get_recent_commits' to check code activity

Provide:
- Code quality indicators
- Technology stack depth assessment
- DevOps/infrastructure expertise level
- Architectural patterns used
- Recommended technical interview questions`
            }
          }
        ]
      };

    case 'portfolio_showcase':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Create an impressive portfolio showcase for Wael Marwani:

1. Use 'generate_portfolio_summary' for professional overview
2. Read the 'portfolio://resume' resource for formatted CV
3. Use 'get_repository_stats' for impressive metrics
4. Highlight top 5 projects with descriptions

Format the output as a compelling narrative that would impress potential employers, focusing on:
- Unique value proposition
- Quantifiable achievements
- Technical breadth and depth
- Recent innovations (MCP server development)
- Why Wael would be a great hire`
            }
          }
        ]
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
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

      case 'get_skills_matrix': {
        const result = await getSkillsMatrix((args as { use_cache?: boolean }) || {});
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'generate_portfolio_summary': {
        const result = await generatePortfolioSummary((args as { use_cache?: boolean }) || {});
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
  console.error(`Resources: 3 (Profile, Resume, Skills)`);
  console.error(`Prompts: 3 (Recruiter, Technical, Portfolio)`);
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
