/**
 * MCP Tool: get_skills_matrix
 * Analyzes repositories and generates a comprehensive skills matrix
 */

import { githubClient } from '../github-client.js';
import { ToolResult } from '../types/index.js';
import { createErrorResponse, getErrorMessage } from '../utils.js';

export interface SkillCategory {
  category: string;
  skills: SkillInfo[];
  total_projects: number;
}

export interface SkillInfo {
  skill: string;
  proficiency: 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner';
  projects: string[];
  years_experience?: string;
}

export interface SkillsMatrix {
  developer_profile: {
    name: string;
    role: string;
    location: string;
    total_projects: number;
  };
  technical_skills: SkillCategory[];
  top_languages: { language: string; percentage: number; projects: number }[];
  domains: { domain: string; projects: string[]; count: number }[];
  summary: string;
}

/**
 * Generate a comprehensive skills matrix from GitHub repositories
 */
export async function getSkillsMatrix(args: { use_cache?: boolean } = {}): Promise<ToolResult<SkillsMatrix>> {
  try {
    const { use_cache = true } = args;
    console.error('[Tool] get_skills_matrix called');

    const [repos, stats] = await Promise.all([
      githubClient.listRepositories(use_cache),
      githubClient.getRepositoryStats(use_cache)
    ]);

    // Categorize projects by domain
    const domainMapping: Record<string, string[]> = {
      'DevOps & CI/CD': [],
      'Web Development': [],
      'AI & Machine Learning': [],
      'Mobile Development': [],
      'Cloud & Infrastructure': [],
      'Microservices': [],
      'IoT & Embedded': [],
      'Data Science': []
    };

    repos.forEach(repo => {
      const name = repo.name.toLowerCase();
      const desc = (repo.description || '').toLowerCase();
      const topics = repo.topics.map(t => t.toLowerCase());

      if (name.includes('devops') || topics.includes('devops') || topics.includes('ci-cd') || name.includes('jenkins')) {
        domainMapping['DevOps & CI/CD'].push(repo.name);
      }
      if (repo.language === 'JavaScript' || repo.language === 'TypeScript' || topics.includes('react') || topics.includes('angular')) {
        domainMapping['Web Development'].push(repo.name);
      }
      if (topics.includes('machine-learning') || topics.includes('ai') || name.includes('ia') || desc.includes('opencv')) {
        domainMapping['AI & Machine Learning'].push(repo.name);
      }
      if (topics.includes('mobile') || repo.language === 'Swift' || repo.language === 'Kotlin') {
        domainMapping['Mobile Development'].push(repo.name);
      }
      if (topics.includes('aws') || topics.includes('docker') || topics.includes('kubernetes') || name.includes('aws')) {
        domainMapping['Cloud & Infrastructure'].push(repo.name);
      }
      if (topics.includes('microservices') || name.includes('microservice')) {
        domainMapping['Microservices'].push(repo.name);
      }
    });

    // Build skills categories
    const technicalSkills: SkillCategory[] = [
      {
        category: 'Programming Languages',
        skills: stats.languages.slice(0, 5).map(lang => ({
          skill: lang.language,
          proficiency: lang.count >= 10 ? 'Expert' : lang.count >= 5 ? 'Advanced' : 'Intermediate',
          projects: lang.repositories.slice(0, 5)
        })),
        total_projects: repos.length
      },
      {
        category: 'DevOps & Tools',
        skills: [
          { skill: 'Docker', proficiency: 'Advanced' as const, projects: repos.filter(r => r.topics.includes('docker')).map(r => r.name).slice(0, 3) },
          { skill: 'Jenkins', proficiency: 'Advanced' as const, projects: repos.filter(r => r.name.toLowerCase().includes('jenkins')).map(r => r.name).slice(0, 3) },
          { skill: 'CI/CD Pipelines', proficiency: 'Advanced' as const, projects: domainMapping['DevOps & CI/CD'].slice(0, 3) },
          { skill: 'Git & GitHub', proficiency: 'Expert' as const, projects: [repos[0]?.name || 'All Projects'] }
        ],
        total_projects: domainMapping['DevOps & CI/CD'].length
      },
      {
        category: 'Cloud & Infrastructure',
        skills: [
          { skill: 'AWS', proficiency: 'Advanced' as const, projects: repos.filter(r => r.topics.includes('aws') || r.name.toLowerCase().includes('aws')).map(r => r.name).slice(0, 3) },
          { skill: 'Microservices Architecture', proficiency: 'Advanced' as const, projects: domainMapping['Microservices'].slice(0, 3) }
        ],
        total_projects: domainMapping['Cloud & Infrastructure'].length
      }
    ];

    const domains = Object.entries(domainMapping)
      .filter(([_, projects]) => projects.length > 0)
      .map(([domain, projects]) => ({
        domain,
        projects: projects.slice(0, 5),
        count: projects.length
      }))
      .sort((a, b) => b.count - a.count);

    const matrix: SkillsMatrix = {
      developer_profile: {
        name: 'Wael Marwani',
        role: 'Full Stack Developer | DevOps Engineer | IT Engineer',
        location: 'Ariana, Tunisia',
        total_projects: repos.length
      },
      technical_skills: technicalSkills,
      top_languages: stats.languages.slice(0, 5).map(lang => ({
        language: lang.language,
        percentage: lang.percentage,
        projects: lang.count
      })),
      domains,
      summary: `Experienced ${repos.length}-project developer specializing in ${stats.languages[0]?.language || 'Full Stack'} development with ${stats.total_stars} GitHub stars across portfolio. Strong expertise in DevOps, Cloud Infrastructure, and Modern Web Technologies.`
    };

    return {
      success: true,
      data: matrix,
      cached: use_cache,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Tool] Error in get_skills_matrix:', getErrorMessage(error));
    return {
      success: false,
      error: createErrorResponse('GET_SKILLS_MATRIX_ERROR', `Failed to generate skills matrix: ${getErrorMessage(error)}`),
      timestamp: new Date().toISOString()
    };
  }
}
