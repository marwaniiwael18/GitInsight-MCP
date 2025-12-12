/**
 * TypeScript type definitions for GitInsight MCP Server
 * These types define the structure of data returned from GitHub API
 * and used throughout the MCP server implementation
 */

/**
 * Repository information from GitHub API
 */
export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  open_issues_count: number;
  is_template: boolean;
  visibility: string;
  default_branch: string;
  homepage: string | null;
  archived: boolean;
  disabled: boolean;
  fork: boolean;
}

/**
 * Simplified repository metadata for list operations
 */
export interface RepositoryMetadata {
  name: string;
  full_name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  last_updated: string;
  created_at: string;
  open_issues: number;
  homepage: string | null;
}

/**
 * Commit information from GitHub API
 */
export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  repository?: string;
}

/**
 * Simplified commit data for MCP responses
 */
export interface CommitMetadata {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
  repository: string;
}

/**
 * GitHub user contribution activity data
 */
export interface ContributionActivity {
  total_commits: number;
  total_prs: number;
  total_issues: number;
  total_reviews: number;
  repositories_contributed_to: number;
  most_active_day: string;
  contribution_streak: number;
}

/**
 * Repository statistics aggregation
 */
export interface RepositoryStats {
  total_repositories: number;
  total_stars: number;
  total_forks: number;
  total_size_kb: number;
  languages: LanguageStats[];
  most_starred_repo: RepositoryMetadata | null;
  most_forked_repo: RepositoryMetadata | null;
  recently_updated: RepositoryMetadata[];
  total_open_issues: number;
}

/**
 * Programming language usage statistics
 */
export interface LanguageStats {
  language: string;
  count: number;
  repositories: string[];
  percentage: number;
}

/**
 * Search filters for repository queries
 */
export interface SearchFilters {
  language?: string;
  topic?: string;
  min_stars?: number;
  has_issues?: boolean;
  is_template?: boolean;
  is_fork?: boolean;
  sort_by?: 'stars' | 'forks' | 'updated' | 'created' | 'name';
  order?: 'asc' | 'desc';
}

/**
 * Configuration for the MCP server
 */
export interface ServerConfig {
  github_token: string;
  github_username: string;
  cache_ttl: number;
  cache_check_period: number;
  api_base_url: string;
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

/**
 * MCP Tool execution result
 */
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  cached?: boolean;
  timestamp: string;
}
