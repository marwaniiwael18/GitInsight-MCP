/**
 * GitHub API Client Wrapper for GitInsight MCP Server
 * Provides a high-level interface to GitHub API using Octokit
 * Includes caching, rate limit handling, and error management
 */

import { Octokit } from '@octokit/rest';
import { config } from './config.js';
import { cache } from './cache.js';
import {
  Repository,
  RepositoryMetadata,
  CommitMetadata,
  RepositoryStats,
  LanguageStats,
  ContributionActivity,
  SearchFilters
} from './types/index.js';
import { calculatePercentage, getErrorMessage } from './utils.js';

/**
 * GitHub API Client class
 * Wraps Octokit with caching and additional convenience methods
 */
export class GitHubClient {
  private octokit: Octokit;
  private username: string;

  constructor() {
    // Initialize Octokit with authentication
    this.octokit = new Octokit({
      auth: config.github_token,
      baseUrl: config.api_base_url,
      userAgent: 'GitInsight-MCP/1.0.0',
      log: {
        debug: () => {},
        info: () => {},
        warn: console.warn,
        error: console.error
      }
    });

    this.username = config.github_username;
    console.error(`[GitHub] Client initialized for user: ${this.username}`);
  }

  /**
   * Fetches all repositories for the authenticated user
   * Uses caching to avoid repeated API calls
   */
  async listRepositories(useCache = true): Promise<RepositoryMetadata[]> {
    const cacheKey = `repos:${this.username}:all`;
    
    // Check cache first
    if (useCache) {
      const cached = cache.get<RepositoryMetadata[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      console.error(`[GitHub] Fetching repositories for ${this.username}...`);
      
      // Fetch all repositories (paginated)
      const repositories: Repository[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await this.octokit.repos.listForUser({
          username: this.username,
          per_page: 100,
          page,
          sort: 'updated',
          direction: 'desc'
        });

        repositories.push(...response.data as Repository[]);
        hasMore = response.data.length === 100;
        page++;
      }

      console.error(`[GitHub] Fetched ${repositories.length} repositories`);

      // Transform to metadata format
      const metadata: RepositoryMetadata[] = repositories.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics || [],
        last_updated: repo.updated_at,
        created_at: repo.created_at,
        open_issues: repo.open_issues_count,
        homepage: repo.homepage
      }));

      // Cache the result
      cache.set(cacheKey, metadata);

      return metadata;
    } catch (error) {
      console.error('[GitHub] Error fetching repositories:', getErrorMessage(error));
      throw this.handleApiError(error);
    }
  }

  /**
   * Gets detailed information about a specific repository
   */
  async getRepositoryDetails(repoName: string, useCache = true): Promise<Repository> {
    const cacheKey = `repo:${this.username}:${repoName}`;
    
    if (useCache) {
      const cached = cache.get<Repository>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      console.error(`[GitHub] Fetching details for ${this.username}/${repoName}...`);
      
      const response = await this.octokit.repos.get({
        owner: this.username,
        repo: repoName
      });

      const repo = response.data as Repository;
      
      // Fetch topics separately (they might not be in the main response)
      try {
        const topicsResponse = await this.octokit.repos.getAllTopics({
          owner: this.username,
          repo: repoName
        });
        repo.topics = topicsResponse.data.names;
      } catch {
        repo.topics = [];
      }

      cache.set(cacheKey, repo);
      return repo;
    } catch (error) {
      console.error('[GitHub] Error fetching repository details:', getErrorMessage(error));
      throw this.handleApiError(error);
    }
  }

  /**
   * Fetches README content for a repository
   */
  async getRepositoryReadme(repoName: string, useCache = true): Promise<string> {
    const cacheKey = `readme:${this.username}:${repoName}`;
    
    if (useCache) {
      const cached = cache.get<string>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      console.error(`[GitHub] Fetching README for ${this.username}/${repoName}...`);
      
      const response = await this.octokit.repos.getReadme({
        owner: this.username,
        repo: repoName
      });

      // Decode base64 content
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      
      cache.set(cacheKey, content);
      return content;
    } catch (error) {
      console.error('[GitHub] Error fetching README:', getErrorMessage(error));
      // Return empty string if README doesn't exist
      return '';
    }
  }

  /**
   * Fetches recent commits across all repositories or for a specific repo
   */
  async getRecentCommits(repoName?: string, limit = 50, useCache = true): Promise<CommitMetadata[]> {
    const cacheKey = repoName 
      ? `commits:${this.username}:${repoName}:${limit}`
      : `commits:${this.username}:all:${limit}`;
    
    if (useCache) {
      const cached = cache.get<CommitMetadata[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      let commits: CommitMetadata[] = [];

      if (repoName) {
        // Fetch commits for specific repository
        console.error(`[GitHub] Fetching commits for ${this.username}/${repoName}...`);
        
        const response = await this.octokit.repos.listCommits({
          owner: this.username,
          repo: repoName,
          per_page: limit,
          author: this.username
        });

        commits = response.data.map(commit => ({
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author?.name || 'Unknown',
          date: commit.commit.author?.date || '',
          url: commit.html_url,
          repository: repoName
        }));
      } else {
        // Fetch commits across all repositories
        console.error(`[GitHub] Fetching recent commits across all repositories...`);
        
        const repos = await this.listRepositories(useCache);
        const commitPromises = repos.slice(0, 10).map(async (repo) => {
          try {
            const response = await this.octokit.repos.listCommits({
              owner: this.username,
              repo: repo.name,
              per_page: 5,
              author: this.username
            });

            return response.data.map(commit => ({
              sha: commit.sha,
              message: commit.commit.message,
              author: commit.commit.author?.name || 'Unknown',
              date: commit.commit.author?.date || '',
              url: commit.html_url,
              repository: repo.name
            }));
          } catch {
            return [];
          }
        });

        const allCommits = await Promise.all(commitPromises);
        commits = allCommits
          .flat()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      }

      cache.set(cacheKey, commits);
      return commits;
    } catch (error) {
      console.error('[GitHub] Error fetching commits:', getErrorMessage(error));
      throw this.handleApiError(error);
    }
  }

  /**
   * Calculates aggregate statistics across all repositories
   */
  async getRepositoryStats(useCache = true): Promise<RepositoryStats> {
    const cacheKey = `stats:${this.username}`;
    
    if (useCache) {
      const cached = cache.get<RepositoryStats>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      console.error(`[GitHub] Calculating repository statistics...`);
      
      const repos = await this.listRepositories(useCache);

      // Calculate language statistics
      const languageMap = new Map<string, string[]>();
      repos.forEach(repo => {
        if (repo.language) {
          const existing = languageMap.get(repo.language) || [];
          existing.push(repo.name);
          languageMap.set(repo.language, existing);
        }
      });

      const languages: LanguageStats[] = Array.from(languageMap.entries()).map(([language, repoNames]) => ({
        language,
        count: repoNames.length,
        repositories: repoNames,
        percentage: calculatePercentage(repoNames.length, repos.length)
      })).sort((a, b) => b.count - a.count);

      // Find most starred and forked
      const mostStarred = repos.reduce((max, repo) => 
        repo.stars > (max?.stars || 0) ? repo : max, repos[0] || null
      );

      const mostForked = repos.reduce((max, repo) => 
        repo.forks > (max?.forks || 0) ? repo : max, repos[0] || null
      );

      // Recently updated repos (top 5)
      const recentlyUpdated = [...repos]
        .sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())
        .slice(0, 5);

      const stats: RepositoryStats = {
        total_repositories: repos.length,
        total_stars: repos.reduce((sum, repo) => sum + repo.stars, 0),
        total_forks: repos.reduce((sum, repo) => sum + repo.forks, 0),
        total_size_kb: 0, // Size would need additional API calls per repo
        languages,
        most_starred_repo: mostStarred,
        most_forked_repo: mostForked,
        recently_updated: recentlyUpdated,
        total_open_issues: repos.reduce((sum, repo) => sum + repo.open_issues, 0)
      };

      cache.set(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('[GitHub] Error calculating stats:', getErrorMessage(error));
      throw this.handleApiError(error);
    }
  }

  /**
   * Searches repositories by technology/language with optional filters
   */
  async searchProjectsByTech(filters: SearchFilters, useCache = true): Promise<RepositoryMetadata[]> {
    const cacheKey = `search:${this.username}:${JSON.stringify(filters)}`;
    
    if (useCache) {
      const cached = cache.get<RepositoryMetadata[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      console.error(`[GitHub] Searching repositories with filters:`, filters);
      
      let repos = await this.listRepositories(useCache);

      // Apply filters
      if (filters.language) {
        repos = repos.filter(repo => 
          repo.language?.toLowerCase() === filters.language?.toLowerCase()
        );
      }

      if (filters.topic) {
        repos = repos.filter(repo => 
          repo.topics.some(topic => 
            topic.toLowerCase().includes(filters.topic!.toLowerCase())
          )
        );
      }

      if (filters.min_stars !== undefined) {
        repos = repos.filter(repo => repo.stars >= filters.min_stars!);
      }

      // Sort results
      if (filters.sort_by) {
        const sortField = filters.sort_by;
        const order = filters.order || 'desc';
        
        repos.sort((a, b) => {
          let aVal: number | string = 0;
          let bVal: number | string = 0;

          switch (sortField) {
            case 'stars':
              aVal = a.stars;
              bVal = b.stars;
              break;
            case 'forks':
              aVal = a.forks;
              bVal = b.forks;
              break;
            case 'updated':
              aVal = new Date(a.last_updated).getTime();
              bVal = new Date(b.last_updated).getTime();
              break;
            case 'created':
              aVal = new Date(a.created_at).getTime();
              bVal = new Date(b.created_at).getTime();
              break;
            case 'name':
              aVal = a.name.toLowerCase();
              bVal = b.name.toLowerCase();
              break;
          }

          if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }

      cache.set(cacheKey, repos);
      return repos;
    } catch (error) {
      console.error('[GitHub] Error searching repositories:', getErrorMessage(error));
      throw this.handleApiError(error);
    }
  }

  /**
   * Fetches user contribution activity metrics
   */
  async getContributionActivity(useCache = true): Promise<ContributionActivity> {
    const cacheKey = `activity:${this.username}`;
    
    if (useCache) {
      const cached = cache.get<ContributionActivity>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      console.error(`[GitHub] Fetching contribution activity for ${this.username}...`);
      
      // Get recent commits to estimate activity
      const commits = await this.getRecentCommits(undefined, 100, useCache);
      
      // Calculate activity metrics
      const activity: ContributionActivity = {
        total_commits: commits.length,
        total_prs: 0, // Would require additional API calls
        total_issues: 0, // Would require additional API calls
        total_reviews: 0, // Would require additional API calls
        repositories_contributed_to: new Set(commits.map(c => c.repository)).size,
        most_active_day: this.findMostActiveDay(commits),
        contribution_streak: this.calculateStreak(commits)
      };

      cache.set(cacheKey, activity);
      return activity;
    } catch (error) {
      console.error('[GitHub] Error fetching activity:', getErrorMessage(error));
      throw this.handleApiError(error);
    }
  }

  /**
   * Gets current rate limit status
   */
  async getRateLimit() {
    try {
      const response = await this.octokit.rateLimit.get();
      return response.data.rate;
    } catch (error) {
      console.error('[GitHub] Error fetching rate limit:', getErrorMessage(error));
      throw this.handleApiError(error);
    }
  }

  /**
   * Helper: Find the most active day from commits
   */
  private findMostActiveDay(commits: CommitMetadata[]): string {
    if (commits.length === 0) return 'N/A';
    
    const dayCount = new Map<string, number>();
    commits.forEach(commit => {
      const day = new Date(commit.date).toISOString().split('T')[0];
      dayCount.set(day, (dayCount.get(day) || 0) + 1);
    });

    let maxDay = '';
    let maxCount = 0;
    dayCount.forEach((count, day) => {
      if (count > maxCount) {
        maxCount = count;
        maxDay = day;
      }
    });

    return maxDay || 'N/A';
  }

  /**
   * Helper: Calculate contribution streak
   */
  private calculateStreak(commits: CommitMetadata[]): number {
    if (commits.length === 0) return 0;

    const dates = commits
      .map(c => new Date(c.date).toISOString().split('T')[0])
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const next = new Date(dates[i + 1]);
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  }

  /**
   * Handle GitHub API errors with helpful messages
   */
  private handleApiError(error: unknown): Error {
    if (error instanceof Error) {
      const message = error.message;
      
      // Rate limiting
      if (message.includes('rate limit')) {
        return new Error('GitHub API rate limit exceeded. Please try again later.');
      }
      
      // Authentication
      if (message.includes('401') || message.includes('Bad credentials')) {
        return new Error('Invalid GitHub token. Please check your GITHUB_TOKEN in .env file.');
      }
      
      // Not found
      if (message.includes('404')) {
        return new Error('Repository or resource not found.');
      }
      
      return error;
    }
    
    return new Error(String(error));
  }
}

/**
 * Singleton GitHub client instance
 */
export const githubClient = new GitHubClient();
