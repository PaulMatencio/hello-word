import fs from 'fs';
import path from 'path';

interface SkillCacheEntry {
  content: string;
  loadedAt: number;
}

const skillCache = new Map<string, SkillCacheEntry>();
const CACHE_TTL_MS = 60_000; // 1 minute in memory

/**
 * Strips YAML frontmatter from markdown files if present
 */
function stripFrontmatter(markdown: string): string {
  if (markdown.startsWith('---')) {
    const end = markdown.indexOf('---', 3);
    if (end !== -1) {
      return markdown.slice(end + 3).trim();
    }
  }
  return markdown.trim();
}

/**
 * Safely loads a skill's SKILL.md file from .agents/plugins/
 */
export function loadSkill(pluginName: string, skillName: string): string | null {
  const cacheKey = `${pluginName}/${skillName}`;
  const now = Date.now();
  const cached = skillCache.get(cacheKey);
  if (cached && now - cached.loadedAt < CACHE_TTL_MS) {
    return cached.content;
  }

  // Attempt resolving from workspace .agents/plugins
  const candidatePaths = [
    path.join(process.cwd(), '.agents', 'plugins', pluginName, 'skills', skillName, 'SKILL.md'),
    path.join(process.cwd(), '.agents', 'skills', `${pluginName}-${skillName}`, 'SKILL.md'),
  ];

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        const rawContent = fs.readFileSync(candidate, 'utf8');
        const cleanContent = stripFrontmatter(rawContent);
        skillCache.set(cacheKey, { content: cleanContent, loadedAt: now });
        return cleanContent;
      }
    } catch (err) {
      console.warn(`[SkillLoader] Could not read skill at ${candidate}:`, err);
    }
  }

  return null;
}

/**
 * Returns aggregated Midnight Expert skill markdown instructions tailored to the copilot action.
 */
export function getSkillsForAction(action: string, promptText: string = ''): string {
  const loadedSkills: Array<{ name: string; content: string }> = [];

  const addSkill = (plugin: string, skill: string, label: string) => {
    const content = loadSkill(plugin, skill);
    if (content) {
      loadedSkills.push({ name: label, content });
    }
  };

  switch (action) {
    case 'generate_tests':
      addSkill('midnight-cq', 'compact-testing', 'Midnight-CQ: Compact Contract Testing Standards');
      addSkill('compact-core', 'compact-witness-ts', 'Compact-Core: TypeScript Witness & Runtime Mappings');
      break;

    case 'fix_error':
      addSkill('compact-core', 'compact-debugging', 'Compact-Core: Compiler & Runtime Debugging Guide');
      addSkill('midnight-status-codes', 'status-codes', 'Midnight-Status-Codes: Diagnostic Routing');
      break;

    case 'audit_zk':
      addSkill('compact-core', 'compact-security', 'Compact-Core: Zero-Knowledge Security Threat Model');
      addSkill('compact-core', 'compact-review', 'Compact-Core: Contract Review & Verification Checklists');
      break;

    case 'generate_client':
      addSkill('midnight-dapp-dev', 'core', 'Midnight-DApp-Dev: TypeScript DApp Integration & Architecture');
      addSkill('compact-core', 'compact-witness-ts', 'Compact-Core: Witness & Private State Patterns');
      break;

    default: {
      // General chat or explain: load contextually based on user prompt keywords
      const lower = promptText.toLowerCase();
      if (lower.includes('test') || lower.includes('vitest') || lower.includes('simulator')) {
        addSkill('midnight-cq', 'compact-testing', 'Midnight-CQ: Compact Contract Testing Standards');
      }
      if (lower.includes('error') || lower.includes('fail') || lower.includes('fix') || lower.includes('bug')) {
        addSkill('compact-core', 'compact-debugging', 'Compact-Core: Compiler & Runtime Debugging Guide');
      }
      if (lower.includes('security') || lower.includes('audit') || lower.includes('privacy') || lower.includes('leak')) {
        addSkill('compact-core', 'compact-security', 'Compact-Core: Zero-Knowledge Security Threat Model');
      }
      if (lower.includes('witness') || lower.includes('private state') || lower.includes('sdk') || lower.includes('client')) {
        addSkill('compact-core', 'compact-witness-ts', 'Compact-Core: TypeScript Witness & Runtime Mappings');
      }
      break;
    }
  }

  if (loadedSkills.length === 0) {
    return '';
  }

  return loadedSkills
    .map(
      (s) => `
================================================================================
### 📚 MIDNIGHT EXPERT KNOWLEDGE BASE INJECTION: ${s.name}
================================================================================
${s.content}
`
    )
    .join('\n\n');
}
