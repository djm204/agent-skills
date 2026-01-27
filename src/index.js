import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// Available templates
const TEMPLATES = {
  'blockchain': {
    description: 'Smart contracts, DeFi protocols, and Web3 applications (Solidity, Foundry, Viem)',
    rules: ['defi-patterns.md', 'gas-optimization.md', 'overview.md', 'security.md', 'smart-contracts.md', 'testing.md', 'web3-integration.md']
  },
  'cli-tools': {
    description: 'Command-line applications and developer tools (Cobra, Commander, Click)',
    rules: ['architecture.md', 'arguments.md', 'distribution.md', 'error-handling.md', 'overview.md', 'testing.md', 'user-experience.md']
  },
  'documentation': {
    description: 'Technical documentation standards (READMEs, API docs, ADRs, code comments)',
    rules: ['adr.md', 'api-documentation.md', 'code-comments.md', 'maintenance.md', 'overview.md', 'readme-standards.md']
  },
  'fullstack': {
    description: 'Full-stack web applications (Next.js, Nuxt, SvelteKit, Remix)',
    rules: ['api-contracts.md', 'architecture.md', 'overview.md', 'shared-types.md', 'testing.md']
  },
  'mobile': {
    description: 'Mobile applications (React Native, Flutter, native iOS/Android)',
    rules: ['navigation.md', 'offline-first.md', 'overview.md', 'performance.md', 'testing.md']
  },
  'utility-agent': {
    description: 'AI agent utilities with context management and hallucination prevention',
    rules: ['action-control.md', 'context-management.md', 'hallucination-prevention.md', 'overview.md', 'token-optimization.md']
  },
  'web-backend': {
    description: 'Backend APIs and services (REST, GraphQL, microservices)',
    rules: ['api-design.md', 'authentication.md', 'database-patterns.md', 'error-handling.md', 'overview.md', 'security.md', 'testing.md']
  },
  'web-frontend': {
    description: 'Frontend web applications (SPAs, SSR, static sites, PWAs)',
    rules: ['accessibility.md', 'component-patterns.md', 'overview.md', 'performance.md', 'state-management.md', 'styling.md', 'testing.md']
  }
};

const SHARED_RULES = [
  'code-quality.md',
  'communication.md', 
  'core-principles.md',
  'git-workflow.md',
  'security-fundamentals.md'
];

// Colors
const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

function printBanner() {
  console.log(colors.blue(`
╔═══════════════════════════════════════════════════════════╗
║              Cursor Templates Installer                   ║
╚═══════════════════════════════════════════════════════════╝
`));
}

function printHelp() {
  console.log(`${colors.yellow('Usage:')}
  npx cursor-templates <templates...>

${colors.yellow('Options:')}
  --list, -l     List available templates
  --help, -h     Show this help message
  --dry-run      Show what would be installed

${colors.yellow('Examples:')}
  npx cursor-templates web-frontend
  npx cursor-templates web-frontend web-backend
  npx cursor-templates fullstack
  npx cursor-templates mobile utility-agent

${colors.dim('Shared rules (code-quality, security, git-workflow, etc.) are always included.')}
`);
}

function printTemplates() {
  console.log(colors.yellow('Available Templates:\n'));
  
  for (const [name, info] of Object.entries(TEMPLATES)) {
    console.log(`  ${colors.green(name)}`);
    console.log(`    ${info.description}\n`);
  }
  
  console.log(colors.blue('Shared rules (always included):'));
  for (const rule of SHARED_RULES) {
    console.log(`  - ${rule.replace('.md', '')}`);
  }
  console.log();
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

function generateClaudeMd(targetDir, installedTemplates) {
  const templateList = installedTemplates
    .map(t => `- **${t}**: ${TEMPLATES[t].description}`)
    .join('\n');

  const templateRuleTables = installedTemplates.map(template => {
    const rules = TEMPLATES[template].rules
      .map(rule => `| \`${template}-${rule}\` | ${rule.replace('.md', '').replace(/-/g, ' ')} guidelines |`)
      .join('\n');
    
    return `
#### ${template.charAt(0).toUpperCase() + template.slice(1)} Rules

| Rule | Purpose |
|------|---------|
${rules}`;
  }).join('\n');

  const content = `# CLAUDE.md - Development Guide

This project uses AI-assisted development with Cursor. The rules in \`.cursorrules/\` provide domain-specific guidance for the AI assistant.

---

## Quick Reference

### Installed Templates

- **Shared** (always included): Core principles, code quality, security, git workflow, communication
${templateList}

### Rule Files

All rules are in \`.cursorrules/\`. The AI assistant automatically reads these when working on your project.

#### Shared Rules (Apply to All Code)

| Rule | Purpose |
|------|---------|
| \`core-principles.md\` | Honesty, simplicity, testing requirements |
| \`code-quality.md\` | SOLID, DRY, clean code patterns |
| \`security-fundamentals.md\` | Zero trust, input validation, secrets |
| \`git-workflow.md\` | Commits, branches, PRs, safety |
| \`communication.md\` | Direct, objective, professional |
${templateRuleTables}

---

## Development Principles

### 1. Honesty Over Output

- If something doesn't work, say it doesn't work
- If you don't know, say you don't know
- Never hide errors or suppress warnings
- Admit mistakes early

### 2. Security First

- Zero trust: Every input is hostile until proven otherwise
- Validate and sanitize all inputs
- No secrets in code or logs
- Least privilege principle

### 3. Tests Are Required

- No feature is complete without tests
- Green CI or it didn't happen
- Test behavior, not implementation

### 4. Code Quality

- SOLID principles
- DRY (Don't Repeat Yourself)
- Functional programming bias
- Explicit over implicit

---

## Definition of Done

A feature is complete when:

- [ ] Code written and reviewed
- [ ] Tests written and passing
- [ ] No linting errors
- [ ] Security reviewed
- [ ] Documentation updated
- [ ] Committed with conventional commit message

---

## Customization

### Adding Project-Specific Rules

1. Create new \`.md\` files in \`.cursorrules/\`
2. Follow the existing naming convention
3. Include clear examples and anti-patterns

### Modifying Existing Rules

Edit files directly in \`.cursorrules/\`. Changes take effect immediately.

### Updating Templates

Re-run the installer to update (will overwrite existing rules):

\`\`\`bash
npx cursor-templates ${installedTemplates.join(' ')}
\`\`\`

---

## Resources

- [Cursor Documentation](https://cursor.sh/docs)
`;

  fs.writeFileSync(path.join(targetDir, 'CLAUDE.md'), content);
}

function install(targetDir, templates, dryRun = false) {
  const cursorrules = path.join(targetDir, '.cursorrules');
  
  if (!dryRun && !fs.existsSync(cursorrules)) {
    fs.mkdirSync(cursorrules, { recursive: true });
  }

  console.log(`${colors.blue('Installing to:')} ${targetDir}\n`);

  // 1. Install shared rules
  console.log(colors.green('► Installing shared rules...'));
  for (const rule of SHARED_RULES) {
    const src = path.join(TEMPLATES_DIR, '_shared', rule);
    const dest = path.join(cursorrules, rule);
    console.log(`  - ${rule}`);
    if (!dryRun) {
      copyFile(src, dest);
    }
  }
  console.log();

  // 2. Install template-specific rules
  for (const template of templates) {
    console.log(colors.green(`► Installing ${template} template...`));
    
    for (const rule of TEMPLATES[template].rules) {
      const src = path.join(TEMPLATES_DIR, template, '.cursorrules', rule);
      const dest = path.join(cursorrules, `${template}-${rule}`);
      console.log(`  - ${template}-${rule}`);
      if (!dryRun) {
        copyFile(src, dest);
      }
    }
    console.log();
  }

  // 3. Generate CLAUDE.md
  console.log(colors.green('► Generating CLAUDE.md...'));
  if (!dryRun) {
    generateClaudeMd(targetDir, templates);
  }
  console.log();

  // Summary
  const totalRules = SHARED_RULES.length + templates.reduce((acc, t) => acc + TEMPLATES[t].rules.length, 0);
  
  console.log(colors.green('════════════════════════════════════════════════════════════'));
  console.log(colors.green('✓ Installation complete!\n'));
  
  console.log(colors.yellow('Installed:'));
  console.log('  - CLAUDE.md (main development guide)');
  console.log(`  - .cursorrules/ (${totalRules} rule files)\n`);
  
  console.log(colors.yellow('Templates:'));
  console.log('  - _shared (always included)');
  for (const template of templates) {
    console.log(`  - ${template}`);
  }
  console.log();
  
  console.log(colors.blue('Next steps:'));
  console.log('  1. Review CLAUDE.md for any customization');
  console.log('  2. Commit the new files to your repository');
  console.log();
}

export function run(args) {
  const templates = [];
  let dryRun = false;

  // Parse arguments
  for (const arg of args) {
    switch (arg) {
      case '--list':
      case '-l':
        printBanner();
        printTemplates();
        process.exit(0);
        break;
      case '--help':
      case '-h':
        printBanner();
        printHelp();
        process.exit(0);
        break;
      case '--dry-run':
        dryRun = true;
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(colors.red(`Error: Unknown option '${arg}'`));
          printHelp();
          process.exit(1);
        }
        templates.push(arg);
    }
  }

  printBanner();

  // Validate
  if (templates.length === 0) {
    console.error(colors.red('Error: No templates specified\n'));
    printHelp();
    process.exit(1);
  }

  for (const template of templates) {
    if (!TEMPLATES[template]) {
      console.error(colors.red(`Error: Unknown template '${template}'\n`));
      printTemplates();
      process.exit(1);
    }
  }

  if (dryRun) {
    console.log(colors.yellow('DRY RUN - No changes will be made\n'));
  }

  // Install to current directory
  install(process.cwd(), templates, dryRun);
}
