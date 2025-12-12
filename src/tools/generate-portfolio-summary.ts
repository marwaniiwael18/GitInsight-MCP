/**
 * MCP Tool: generate_portfolio_summary
 * Creates a recruiter-friendly portfolio summary
 */

import { githubClient } from '../github-client.js';
import { ToolResult } from '../types/index.js';
import { createErrorResponse, getErrorMessage } from '../utils.js';

export interface PortfolioSummary {
  candidate_profile: {
    name: string;
    title: string;
    location: string;
    email: string;
    portfolio_url: string;
    github_url: string;
  };
  professional_summary: string;
  key_achievements: string[];
  featured_projects: FeaturedProject[];
  technical_proficiency: {
    primary_languages: string[];
    frameworks_tools: string[];
    specializations: string[];
  };
  github_metrics: {
    total_repositories: number;
    total_stars: number;
    total_contributions: number;
    active_streak: number;
  };
  availability: string;
}

export interface FeaturedProject {
  name: string;
  description: string;
  technologies: string[];
  highlights: string[];
  github_url: string;
  stars: number;
}

/**
 * Generates a comprehensive portfolio summary for recruiters
 */
export async function generatePortfolioSummary(args: { use_cache?: boolean } = {}): Promise<ToolResult<PortfolioSummary>> {
  try {
    const { use_cache = true } = args;
    console.error('[Tool] generate_portfolio_summary called');

    const [repos, stats, activity] = await Promise.all([
      githubClient.listRepositories(use_cache),
      githubClient.getRepositoryStats(use_cache),
      githubClient.getContributionActivity(use_cache)
    ]);

    // Select featured projects (high stars, diverse tech stack)
    const featuredProjects: FeaturedProject[] = [
      {
        name: 'GitInsight-MCP',
        description: 'Model Context Protocol server for GitHub integration - built with Claude AI',
        technologies: ['TypeScript', 'Node.js', 'MCP SDK', 'GitHub API'],
        highlights: [
          'AI-assisted development with Claude',
          'Production-grade MCP server implementation',
          'Complete GitHub API integration with caching'
        ],
        github_url: 'https://github.com/marwaniiwael18/GitInsight-MCP',
        stars: repos.find(r => r.name === 'GitInsight-MCP')?.stars || 0
      }
    ];

    // Add top starred projects
    const topProjects = repos
      .filter(r => r.stars > 0 && r.name !== 'GitInsight-MCP')
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 4);

    topProjects.forEach(repo => {
      featuredProjects.push({
        name: repo.name,
        description: repo.description || 'Software development project',
        technologies: [repo.language || 'Multiple', ...repo.topics.slice(0, 2)],
        highlights: [
          `${repo.stars} GitHub stars`,
          `${repo.forks} forks`,
          repo.open_issues > 0 ? `Active development (${repo.open_issues} open issues)` : 'Production ready'
        ],
        github_url: repo.url,
        stars: repo.stars
      });
    });

    const summary: PortfolioSummary = {
      candidate_profile: {
        name: 'Wael Marwani',
        title: 'Full Stack Developer | DevOps Engineer | IT Engineer',
        location: 'Ariana, Tunisia',
        email: 'wael.marwani@esprit.tn',
        portfolio_url: 'https://marwaniwael.engineer',
        github_url: 'https://github.com/marwaniiwael18'
      },
      professional_summary: `Innovative software engineer with ${repos.length} public repositories and ${stats.total_stars} GitHub stars. Specialized in modern web development, DevOps practices, and AI integration. Proven track record in building scalable applications using ${stats.languages.slice(0, 3).map(l => l.language).join(', ')}, with expertise in cloud infrastructure and microservices architecture. Recent work includes MCP server development with AI assistance, demonstrating adaptability to cutting-edge technologies.`,
      key_achievements: [
        `${repos.length} Public Repositories on GitHub`,
        `${stats.total_stars} Total GitHub Stars Across Projects`,
        `${activity.repositories_contributed_to} Active Project Contributions`,
        `${activity.contribution_streak}-Day Contribution Streak`,
        `Proficient in ${stats.languages.length} Programming Languages`,
        'Built production MCP servers using Claude AI',
        'Implemented CI/CD pipelines with Jenkins and Docker'
      ],
      featured_projects: featuredProjects,
      technical_proficiency: {
        primary_languages: stats.languages.slice(0, 5).map(l => l.language),
        frameworks_tools: [
          'Node.js', 'React', 'Angular', 'Spring Boot',
          'Docker', 'Jenkins', 'AWS', 'Git/GitHub',
          'TypeScript', 'MCP SDK', 'REST APIs'
        ],
        specializations: [
          'DevOps & CI/CD',
          'Cloud Infrastructure (AWS)',
          'Microservices Architecture',
          'Full Stack Web Development',
          'AI Integration & MCP Servers',
          'GitHub API Integration'
        ]
      },
      github_metrics: {
        total_repositories: repos.length,
        total_stars: stats.total_stars,
        total_contributions: activity.total_commits,
        active_streak: activity.contribution_streak
      },
      availability: 'Open to opportunities'
    };

    return {
      success: true,
      data: summary,
      cached: use_cache,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Tool] Error in generate_portfolio_summary:', getErrorMessage(error));
    return {
      success: false,
      error: createErrorResponse('GENERATE_PORTFOLIO_ERROR', `Failed to generate portfolio: ${getErrorMessage(error)}`),
      timestamp: new Date().toISOString()
    };
  }
}
