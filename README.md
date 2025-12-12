# 🚀 GitInsight-MCP

**A Model Context Protocol (MCP) Server for GitHub Profile Integration**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0.4-green.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-marwaniiwael18-black.svg)](https://github.com/marwaniiwael18)
[![Built with Claude](https://img.shields.io/badge/Built%20with-Claude-5A67D8.svg)](https://claude.ai)

> A learning project built to explore the Model Context Protocol (MCP) and MCP Inspector tool. This server provides GitHub profile integration and was entirely built in collaboration with Claude AI.

**Author:** Wael Marwani  
**Portfolio:** [marwaniwael.engineer](https://marwaniwael.engineer)  
**Email:** wael.marwani@esprit.tn  
**Location:** Ariana, Tunisia  

**🤖 Built with Claude AI** - Every commit co-authored with Claude

---

## 📋 Table of Contents

- [What is MCP?](#-what-is-mcp)
- [Why This Project Matters](#-why-this-project-matters)
- [Features](#-features)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Available Tools](#-available-tools)
- [Example Queries](#-example-queries)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Technical Stack](#-technical-stack)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🤖 What is MCP?

The **Model Context Protocol (MCP)** is an open protocol that enables AI assistants to securely connect to external data sources and tools. Think of it as a standardized way for AI models like Claude to interact with your applications and services.

**Key Concepts:**
- **MCP Server**: Provides tools and data (this project!)
- **MCP Client**: AI assistant that uses the tools (e.g., Claude Desktop)
- **Tools**: Functions that the AI can call to perform actions
- **Protocol**: Standardized communication format using JSON-RPC

GitInsight-MCP implements an MCP server that exposes your GitHub profile data to AI assistants, allowing them to answer questions about your repositories, analyze your coding patterns, and generate portfolio insights.
I Built This Project

I created **GitInsight-MCP** to:

🔍 **Explore the MCP Inspector** - Wanted to see how MCP servers work and test them interactively  
🛠️ **Discover New MCP Tools** - Learn about the Model Context Protocol ecosystem  
🤖 **Collaborate with Claude AI** - Built entirely using Claude as a coding partner  
📚 **Learn by Doing** - Hands-on experience with TypeScript, Node.js, and GitHub API  
🚀 **Create Something Useful** - A practical tool that actually works with my GitHub profile

**This is a learning project** showcasing:
- **AI-Assisted Development** - Every line of code written with Claude
- **Modern Backend Stack** - TypeScript, Node.js, MCP SDK
- **Real API Integration** - GitHub Octokit, caching, error handling
- **Production Quality** - Full documentation, proper architecture

**Perfect for:**
- Developers exploring MCP and AI-assisted coding
- Learning how to build tools that AI assistants can use
- Understanding the Model Context Protocol specification
- DevOps Engineers wanting to showcase AI integration skills
- Full Stack Developers building MCP servers
- Anyone creating an intelligent portfolio assistant

---

## ✨ Features

### 🔧 Core Functionality
- ✅ **8 Powerful MCP Tools** - From basic queries to advanced portfolio generation
- ✅ **3 MCP Resources** - Readable developer profile, resume, and skills data
- ✅ **3 MCP Prompts** - Pre-configured for recruiters and technical assessment
- ✅ **Intelligent Caching** - Reduces GitHub API calls and respects rate limits
- ✅ **Rate Limit Protection** - Automatic handling of GitHub API constraints
- ✅ **Error Resilience** - Comprehensive error handling with helpful messages
- ✅ **TypeScript Safety** - Full type coverage for reliability

### 🎯 Recruiter-Focused Features
- 📊 **Skills Matrix** - Automated technical skills assessment with proficiency levels
- 📄 **Portfolio Summary** - Professional candidate evaluation ready for HR
- 📝 **Auto-Generated Resume** - Markdown CV from GitHub data
- 🎤 **Recruiter Prompts** - Pre-built evaluation templates for hiring managers

### 📊 Data Insights
- 📦 Repository metadata (stars, forks, languages, topics)
- 📝 Commit history and activity tracking
- 📈 Aggregate statistics and analytics
- 🔍 Advanced filtering by technology, topic, or stars
- 📅 Contribution patterns and streaks
- 💼 Comprehensive skills categorization

### 🎨 Developer Experience
- 🚀 Easy setup with clear documentation
- 🔐 Secure token-based authentication
- 🎯 Clear error messages for debugging
- 📖 Comprehensive inline code comments
- 🧪 Production-ready architecture

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Claude Desktop │  ← AI Assistant (MCP Client)
└────────┬────────┘
         │ MCP Protocol (JSON-RPC over stdio)
         ▼
┌─────────────────┐
│ GitInsight-MCP  │  ← This Server
│   MCP Server    │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬─────────┐
    ▼         ▼          ▼         ▼
┌────────┐ ┌──────┐ ┌────────┐ ┌─────┐
│ GitHub │ │Cache │ │ Tools  │ │Error│
│ Client │ │Layer │ │Handler │ │ Mgmt│
└────┬───┘ └──────┘ └────────┘ └─────┘
     │
     ▼
┌─────────────────┐
│  GitHub API     │  ← Data Source
│  (Octokit)      │
└─────────────────┘
```

**Flow:**
1. User asks Claude a question about your GitHub profile
2. Claude calls GitInsight-MCP tools via MCP protocol
3. Server checks cache or queries GitHub API
4. Results are formatted and returned to Claude
5. Claude presents insights to the user in natural language

---

## 📦 Installation

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **GitHub Personal Access Token** ([Create one](https://github.com/settings/tokens))
- **Claude Desktop** (optional, for testing) ([Download](https://claude.ai/download))

### Step 1: Clone the Repository

\`\`\`bash
git clone https://github.com/marwaniiwael18/GitInsight-MCP.git
cd GitInsight-MCP
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 3: Build the Project

\`\`\`bash
npm run build
\`\`\`

---

## ⚙️ Configuration

### Step 1: Create Environment File

Copy the example environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

### Step 2: Configure Environment Variables

Edit \`.env\` with your details:

\`\`\`env
# GitHub Personal Access Token
# Generate at: https://github.com/settings/tokens
# Required scopes: repo, read:user
GITHUB_TOKEN=ghp_your_actual_token_here

# Your GitHub Username
GITHUB_USERNAME=marwaniiwael18

# Cache Settings (optional)
CACHE_TTL_SECONDS=3600
CACHE_CHECK_PERIOD_SECONDS=600
\`\`\`

**Creating a GitHub Token:**
1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: \`repo\`, \`read:user\`, \`read:org\`
4. Copy the token and paste it in your \`.env\` file

### Step 3: Configure Claude Desktop

Add this to your Claude Desktop config file:

**macOS:** \`~/Library/Application Support/Claude/claude_desktop_config.json\`  
**Windows:** \`%APPDATA%\\Claude\\claude_desktop_config.json\`

\`\`\`json
{
  "mcpServers": {
    "gitinsight-mcp": {
      "command": "node",
      "args": [
        "/absolute/path/to/GitInsight-MCP/dist/index.js"
      ],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here",
        "GITHUB_USERNAME": "marwaniiwael18"
      }
    }
  }
}
\`\`\`

**Important:** Replace \`/absolute/path/to/\` with the actual path to your project!

---

## 🚀 Usage

### Running the Server Standalone

\`\`\`bash
npm start
\`\`\`

You should see:
\`\`\`
============================================================
GitInsight MCP Server - Starting...
============================================================
GitHub User: marwaniiwael18
Cache TTL: 3600 seconds
Tools Available: 6
============================================================
GitHub API Rate Limit: 5000/5000
Server ready! Waiting for MCP client connections...
============================================================
\`\`\`

### Using with Claude Desktop

1. Restart Claude Desktop after configuration
2. Start a new conversation
3. Ask questions about your GitHub profile!

**The server will automatically start when Claude needs it.**

---

## 🛠️ Available Tools

### 1️⃣ \`list_repositories\`

Lists all your public repositories with metadata.

**Parameters:**
- \`use_cache\` (boolean): Use cached data (default: true)
- \`sort_by\` (string): Sort by 'stars', 'forks', 'updated', 'name'
- \`limit\` (number): Maximum repositories to return

**Returns:** Array of repositories with name, description, stars, forks, language, topics, etc.

---

### 2️⃣ \`get_repository_details\`

Get detailed information about a specific repository.

**Parameters:**
- \`repository_name\` (string, **required**): Repository name
- \`use_cache\` (boolean): Use cached data
- \`include_readme\` (boolean): Include README content

**Returns:** Full repository details, topics, README (if requested)

---

### 3️⃣ \`get_recent_commits\`

Fetch recent commits for a repo or across all repos.

**Parameters:**
- \`repository_name\` (string, optional): Specific repo or all repos
- \`limit\` (number): Max commits to return (default: 50)
- \`use_cache\` (boolean): Use cached data

**Returns:** Array of commits with SHA, message, author, date, URL

---

### 4️⃣ \`get_repository_stats\`

Calculate aggregate statistics across all repositories.

**Parameters:**
- \`use_cache\` (boolean): Use cached data

**Returns:**
- Total repositories, stars, forks
- Language breakdown with percentages
- Most starred/forked repos
- Recently updated repos
- Total open issues

---

### 5️⃣ \`search_projects_by_tech\`

Search and filter repositories by technology.

**Parameters:**
- \`language\` (string): Filter by language (e.g., "Python", "JavaScript")
- \`topic\` (string): Filter by topic (e.g., "devops", "ai")
- \`min_stars\` (number): Minimum stars required
- \`sort_by\` (string): Sort field
- \`order\` (string): 'asc' or 'desc'

**Returns:** Filtered and sorted repositories

---

### 6️⃣ \`get_contribution_activity\`

Analyze contribution activity and patterns.

**Parameters:**
- \`use_cache\` (boolean): Use cached data

**Returns:**
- Total commits
- Repositories contributed to
- Most active day
- Contribution streak

---

### 7️⃣ \`get_skills_matrix\` 🎯 **FOR RECRUITERS**

Generate a comprehensive technical skills assessment matrix.

**Parameters:**
- \`use_cache\` (boolean): Use cached data

**Returns:**
- Developer profile summary
- Categorized technical skills (Languages, DevOps, Cloud)
- Proficiency levels (Expert/Advanced/Intermediate/Beginner)
- Domain expertise breakdown (DevOps, Web Dev, AI/ML, etc.)
- Top languages with percentages
- Project counts per skill

**Perfect for:** HR screening, technical assessment, candidate evaluation

---

### 8️⃣ \`generate_portfolio_summary\` 📄 **FOR RECRUITERS**

Create a recruiter-friendly professional portfolio summary.

**Parameters:**
- \`use_cache\` (boolean): Use cached data

**Returns:**
- Candidate profile (name, title, contact, location)
- Professional summary paragraph
- Key achievements list
- Featured projects with highlights and technologies
- Technical proficiency breakdown
- GitHub metrics (repos, stars, contributions, streak)
- Availability status

**Perfect for:** Initial screening, candidate presentation, hiring decisions

---

## 📚 MCP Resources

Resources are readable data endpoints that AI assistants can access:

### Resource: \`portfolio://profile\`
Developer profile with contact information and specializations (JSON)

### Resource: \`portfolio://resume\`
Auto-generated professional resume from GitHub data (Markdown)

### Resource: \`portfolio://skills\`
Complete skills matrix with proficiency assessment (JSON)

**Usage Example:**
Ask Claude: "Read my portfolio profile" or "Show me my resume"

---

## 🎤 MCP Prompts

Pre-configured prompt templates for common scenarios:

### Prompt: \`recruiter_evaluation\`
🎯 Comprehensive candidate evaluation for HR and recruiters  
Combines portfolio summary, skills matrix, stats, and activity into a hiring recommendation

### Prompt: \`technical_assessment\`
🔧 Deep technical analysis for engineering managers  
Analyzes code quality, tech stack depth, and suggests interview questions

### Prompt: \`portfolio_showcase\`
💼 Impressive portfolio presentation  
Creates a compelling narrative highlighting achievements and value proposition

**Usage Example:**
In Claude Desktop or MCP Inspector, select a prompt to execute the evaluation automatically

---

## 💬 Example Queries

Try asking Claude these questions:

**For Developers:**
> "What are my most starred repositories?"

> "Show me statistics about my GitHub profile"

> "What programming languages do I use most?"

**For Project Discovery:**
> "Find all my DevOps projects"

> "Show me my Python projects with the most stars"

> "What are my recent AI/ML repositories?"

**For Recruiters & HR:** 🎯
> "Generate a portfolio summary for this candidate"

> "Show me the skills matrix with proficiency levels"

> "Read the portfolio resume"

> "Use the recruiter_evaluation prompt"

> "What are this developer's key strengths?"

**For Activity Tracking:**
> "What have I been working on recently?"

> "Show my commit activity for the last month"

> "What's my contribution streak?"

**For Detailed Analysis:**
> "Give me details about my DEVOPS-Project repository"

> "Analyze my AWS-App project and tell me about it"

> "Generate a technical assessment for hiring managers"

---

## 👨‍💻 Development

### Scripts

\`\`\`bash
# Build TypeScript
npm run build

# Development mode (watch for changes)
npm run dev

# Run the server
npm start

# Test with MCP Inspector
npm run inspector
\`\`\`

### MCP Inspector

Test your server with the official MCP Inspector:

\`\`\`bash
npm run inspector
\`\`\`

This opens a web interface to test your tools interactively.

---

## 📁 Project Structure

\`\`\`
GitInsight-MCP/
├── src/
│   ├── index.ts                 # MCP server entry point
│   ├── config.ts                # Environment configuration
│   ├── github-client.ts         # GitHub API wrapper (Octokit)
│   ├── cache.ts                 # Caching service
│   ├── utils.ts                 # Helper functions
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── tools/
│       ├── index.ts             # Tools barrel export
│       ├── list-repositories.ts
│       ├── get-repository-details.ts
│       ├── get-recent-commits.ts
│       ├── get-repository-stats.ts
│       ├── search-projects-by-tech.ts
│       └── get-contribution-activity.ts
├── dist/                        # Compiled JavaScript
├── .env                         # Environment variables (create this)
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── claude-desktop-config.json   # Example Claude config
└── README.md                    # This file
\`\`\`

---

## 🔧 Technical Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe development |
| **Node.js** | Runtime environment |
| **@modelcontextprotocol/sdk** | MCP protocol implementation |
| **@octokit/rest** | GitHub API client |
| **node-cache** | In-memory caching |
| **dotenv** | Environment configuration |

---

## 🐛 Troubleshooting

### Issue: "Missing required environment variables"

**Solution:** Create a \`.env\` file with \`GITHUB_TOKEN\` and \`GITHUB_USERNAME\`

### Issue: "GitHub API rate limit exceeded"

**Solution:** 
- Wait for the rate limit to reset (shown in server logs)
- Use caching (\`use_cache: true\`)
- Authenticate with a valid token (increases limit to 5000/hour)

### Issue: "Invalid GitHub token"

**Solution:**
- Generate a new token at https://github.com/settings/tokens
- Ensure scopes include: \`repo\`, \`read:user\`
- Check for typos in your \`.env\` file

### Issue: Claude Desktop doesn't show the server

**Solution:**
- Check the config file path is correct for your OS
- Use absolute paths in \`claude_desktop_config.json\`
- Restart Claude Desktop completely
- Check Claude Desktop logs for errors

### Issue: Server crashes on startup

**Solution:**
- Run \`npm run build\` first
- Check Node.js version is 18+
- Verify all dependencies installed: \`npm install\`

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🌟 Showcase

**Featured Projects Highlighted by GitInsight-MCP:**

- **AWS-App** - Skill-sharing platform (JavaScript)
- **Application_Web_Distibue** - Microservices architecture (Spring Boot + Angular)
- **DEVOPS-Project** - CI/CD pipeline (Jenkins, Docker)
- **Car-Number-Plates-Detection-IA-Model** - Computer Vision (OpenCV)
- **Parkini** - Smart parking with face recognition
- **SentinelX-Diagnostic-Platform** - Recent diagnostic platform

---

## 📞 Contact

**Wael Marwani**  
📧 Email: wael.marwani@esprit.tn  
🌐 Portfolio: [marwaniwael.engineer](https://marwaniwael.engineer)  
💼 GitWhat I Learned

Building this project with Claude taught me:

- **MCP Protocol Implementation** - How to build servers for AI assistants
- **MCP Inspector Usage** - Testing and debugging MCP tools interactively
- **AI-Assisted Development** - Collaborating with Claude to write production code
- **RESTful API Integration** - GitHub API via Octokit
- **Caching Strategies** - Performance optimization techniques
- **Error Handling** - Building resilient systems
- **TypeScript Best Practices** - Type safety and modern JavaScript
- **Git Collaboration** - Using co-authored commits with AI

## 🤝 Development Process

**This entire project was built using Claude AI:**

✅ All code written through Claude conversations  
✅ Every commit co-authored: `Co-authored-by: claude <noreply@anthropic.com>`  
✅ Architecture designed collaboratively  
✅ Documentation generated with AI assistance  
✅ Debugging and testing done together  

**Why this matters:** Demonstrates how AI can be a powerful coding partner for learning and building real projects.

---

**Built with ❤️ and 🤖 by Wael Marwani & Claude**  
*A collaboration between human curiosity and AI assistance*

⭐ Star this repo if you're interested in MCP or AI-assisted development
---

**Built with ❤️ by Wael Marwani**  
*Showcasing DevOps expertise through AI integration*

⭐ Star this repo if you find it useful!
