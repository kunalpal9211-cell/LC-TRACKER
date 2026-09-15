import { useState, useEffect } from 'react';
import RATINGS from './ratings.json';
import BUNDLED_COMPANIES from './allCompanies.json';

const GITHUB_OWNER = 'snehasishroy';
const GITHUB_REPO = 'leetcode-companywise-interview-questions';
const GITHUB_BRANCH = 'master';
const POLL_MS = 3 * 60 * 1000;

const CATALOG_CACHE_KEY = 'spydex_gh_company_catalog_v1';
const QUESTION_CACHE_PREFIX = 'spydex_gh_q_v1_';

const SKIP_DIRS = new Set(['.idea', 'src', 'target', '.github', 'node_modules']);

const TIER_BY_ID = {
  google: 'FAANG', meta: 'FAANG', amazon: 'FAANG', apple: 'FAANG', netflix: 'FAANG', microsoft: 'FAANG',
  openai: 'AI & Frontier', anthropic: 'AI & Frontier', nvidia: 'AI & Frontier', databricks: 'AI & Frontier',
  'x-ai': 'AI & Frontier', groq: 'AI & Frontier', perplexity: 'AI & Frontier',
  bloomberg: 'Fintech / Quant', 'goldman-sachs': 'Fintech / Quant', citadel: 'Fintech / Quant',
  'jane-street': 'Fintech / Quant', stripe: 'Fintech / Quant', 'two-sigma': 'Fintech / Quant',
  'morgan-stanley': 'Fintech / Quant', jpmorgan: 'Fintech / Quant', paypal: 'Fintech / Quant',
  uber: 'Top Tech', airbnb: 'Top Tech', doordash: 'Top Tech', atlassian: 'Top Tech',
  snowflake: 'Top Tech', linkedin: 'Big Tech', adobe: 'Big Tech', oracle: 'Big Tech',
  salesforce: 'Big Tech', cisco: 'Big Tech', bytedance: 'Top Tech',
  flipkart: 'Indian Tech', swiggy: 'Indian Tech', zomato: 'Indian Tech', cred: 'Indian Tech'
};

const LOGO_BY_TIER = {
  'FAANG': 'terminal',
  'AI & Frontier': 'psychology',
  'Fintech / Quant': 'account_balance',
  'Top Tech': 'rocket_launch',
  'Big Tech': 'apartment',
  'Indian Tech': 'public'
};

const PREFERRED_TOP = [
  'google', 'meta', 'amazon', 'apple', 'netflix', 'microsoft', 'uber', 'openai',
  'nvidia', 'bloomberg', 'stripe', 'linkedin', 'adobe', 'airbnb', 'databricks',
  'goldman-sachs', 'oracle', 'salesforce', 'doordash', 'atlassian', 'snowflake',
  'bytedance', 'paypal', 'flipkart', 'citadel', 'jane-street', 'anthropic'
];

export const COMPANY_TIERS = [
  'All',
  'FAANG',
  'AI & Frontier',
  'Fintech / Quant',
  'Top Tech',
  'Big Tech',
  'Indian Tech'
];

export const TIMEFRAMES = [
  { id: 'thirty-days', label: 'Last 30 Days' },
  { id: 'three-months', label: 'Last 3 Months' },
  { id: 'six-months', label: 'Last 6 Months' },
  { id: 'more-than-six-months', label: '6+ Months' },
  { id: 'all', label: 'All Time' }
];

let catalogState = loadCachedCatalog();
const catalogListeners = new Set();

function loadCachedCatalog() {
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.companies) && parsed.companies.length > 50) {
        return {
          companies: parsed.companies,
          sha: parsed.sha || '',
          updatedAt: parsed.updatedAt || '',
          loading: false,
          error: null
        };
      }
    }
  } catch {
    /* ignore */
  }
  return emptyCatalog();
}

function emptyCatalog() {
  return { 
    companies: Array.isArray(BUNDLED_COMPANIES) && BUNDLED_COMPANIES.length ? BUNDLED_COMPANIES : [], 
    sha: '', 
    updatedAt: '', 
    loading: false, 
    error: null 
  };
}

function persistCatalog(next) {
  try {
    localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({
      companies: next.companies,
      sha: next.sha,
      updatedAt: next.updatedAt
    }));
  } catch {
    /* ignore */
  }
}

function setCatalog(partial) {
  catalogState = { ...catalogState, ...partial };
  catalogListeners.forEach((fn) => fn(catalogState));
}

function titleFromId(id) {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toCompany(id) {
  const tier = TIER_BY_ID[id] || 'Top Tech';
  return {
    id,
    name: titleFromId(id),
    tier,
    logo: LOGO_BY_TIER[tier] || 'terminal'
  };
}

function pickTopCompanies(companies) {
  const byId = new Map(companies.map((c) => [c.id, c]));
  const preferred = PREFERRED_TOP.map((id) => byId.get(id)).filter(Boolean);
  if (preferred.length >= 12) return preferred.slice(0, 28);
  const rest = companies.filter((c) => !PREFERRED_TOP.includes(c.id));
  return [...preferred, ...rest].slice(0, 28);
}

export function getCompanyCatalog() {
  return catalogState;
}

export function getTopCompanies(companies = catalogState.companies) {
  return pickTopCompanies(companies);
}

export const ALL_COMPANIES = Array.isArray(BUNDLED_COMPANIES) && BUNDLED_COMPANIES.length
  ? BUNDLED_COMPANIES
  : [];

export const TOP_COMPANIES = pickTopCompanies(ALL_COMPANIES);

async function fetchHead() {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${GITHUB_BRANCH}`,
    { headers: { Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) throw new Error(`GitHub commit lookup failed (${res.status})`);
  const data = await res.json();
  return {
    sha: data.sha,
    updatedAt: data.commit?.committer?.date || data.commit?.author?.date || ''
  };
}

async function fetchCompanyFolders(sha) {
  const ref = sha || GITHUB_BRANCH;
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/?ref=${encodeURIComponent(ref)}`,
    { headers: { Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) throw new Error(`GitHub company list failed (${res.status})`);
  const items = await res.json();
  if (!Array.isArray(items)) throw new Error('Unexpected GitHub contents response');

  return items
    .filter((item) => item?.type === 'dir' && item.name && !SKIP_DIRS.has(item.name) && !item.name.startsWith('.'))
    .map((item) => toCompany(item.name))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function refreshCatalog({ force = false } = {}) {
  setCatalog({ loading: catalogState.companies.length === 0, error: null });
  try {
    const head = await fetchHead();
    if (!force && catalogState.sha && catalogState.sha === head.sha && catalogState.companies.length) {
      setCatalog({ loading: false, updatedAt: head.updatedAt, error: null });
      return catalogState;
    }

    const previousSha = catalogState.sha;
    const companies = await fetchCompanyFolders(head.sha);
    const next = {
      companies,
      sha: head.sha,
      updatedAt: head.updatedAt,
      loading: false,
      error: null
    };
    if (previousSha && previousSha !== head.sha) {
      clearQuestionCache();
    }
    persistCatalog(next);
    setCatalog(next);
    return next;
  } catch (err) {
    console.error('Company catalog GitHub sync failed:', err);
    setCatalog({
      loading: false,
      error: catalogState.companies.length
        ? null
        : (err.message || 'Could not load companies from GitHub')
    });
    return catalogState;
  }
}

function clearQuestionCache() {
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(QUESTION_CACHE_PREFIX)) toRemove.push(key);
    }
    toRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}

let pollStarted = false;
function ensurePolling() {
  if (pollStarted || typeof window === 'undefined') return;
  pollStarted = true;
  refreshCatalog();
  setInterval(() => refreshCatalog(), POLL_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshCatalog();
  });
}

export function useCompanyCatalog() {
  const [state, setState] = useState(catalogState);

  useEffect(() => {
    catalogListeners.add(setState);
    ensurePolling();
    return () => catalogListeners.delete(setState);
  }, []);

  const activeCompanies = (state.companies && state.companies.length > 0)
    ? state.companies
    : ALL_COMPANIES;

  return {
    companies: activeCompanies,
    topCompanies: pickTopCompanies(activeCompanies),
    sha: state.sha,
    updatedAt: state.updatedAt,
    loading: state.loading && activeCompanies.length === 0,
    error: state.error,
    refresh: () => refreshCatalog({ force: true })
  };
}

function questionCacheKey(companyId, timeframe, sha) {
  return `${QUESTION_CACHE_PREFIX}${sha}_${companyId}_${timeframe}`;
}

function readQuestionCache(companyId, timeframe, sha) {
  if (!sha) return null;
  try {
    const raw = localStorage.getItem(questionCacheKey(companyId, timeframe, sha));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeQuestionCache(companyId, timeframe, sha, questions) {
  if (!sha) return;
  try {
    localStorage.setItem(questionCacheKey(companyId, timeframe, sha), JSON.stringify(questions));
  } catch {
    /* ignore */
  }
}

function csvUrls(companyId, timeframe, sha) {
  const ref = sha || GITHUB_BRANCH;
  const path = `${companyId}/${timeframe}.csv`;
  return [
    `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${ref}/${path}`,
    `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${ref}/${path}`
  ];
}

async function fetchCsvText(companyId, timeframe, sha) {
  const ref = sha || GITHUB_BRANCH;
  const timeframesToTry = timeframe === 'all' ? ['all'] : [timeframe, 'all'];

  for (const tf of timeframesToTry) {
    const primaryUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${ref}/${companyId}/${tf}.csv`;
    try {
      const res = await fetch(primaryUrl, { cache: 'no-cache' });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim() && !text.trim().startsWith('<!')) return text;
      }
      // If 404, this specific timeframe doesn't exist for this company; proceed directly to fallback
      if (res.status === 404) {
        continue;
      }
    } catch {
      // If CDN failed on network level, try raw GitHub mirror
      try {
        const fallbackUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${ref}/${companyId}/${tf}.csv`;
        const fallbackRes = await fetch(fallbackUrl, { cache: 'no-cache' });
        if (fallbackRes.ok) {
          const text = await fallbackRes.text();
          if (text && text.trim() && !text.trim().startsWith('<!')) return text;
        }
      } catch {}
    }
  }
  return '';
}

function splitCsvLine(line) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current.trim());
  return parts;
}

function parseCsvClient(csvText, company) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length <= 1) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const idx = {
    id: header.findIndex((h) => h === 'id' || h === 'number'),
    url: header.findIndex((h) => h.includes('url') || h.includes('link')),
    title: header.findIndex((h) => h.includes('title') || h === 'name'),
    difficulty: header.findIndex((h) => h.includes('difficulty')),
    acceptance: header.findIndex((h) => h.includes('acceptance')),
    frequency: header.findIndex((h) => h.includes('frequency'))
  };

  const list = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = splitCsvLine(lines[i]);
    if (parts.length < 4) continue;

    const id = parseInt(parts[idx.id >= 0 ? idx.id : 0], 10);
    const url = parts[idx.url >= 0 ? idx.url : 1] || '';
    const title = (parts[idx.title >= 0 ? idx.title : 2] || '').replace(/^"|"$/g, '');
    const difficulty = parts[idx.difficulty >= 0 ? idx.difficulty : parts.length - 3] || 'Medium';
    const acceptance = parts[idx.acceptance >= 0 ? idx.acceptance : parts.length - 2] || '';
    const frequencyStr = parts[idx.frequency >= 0 ? idx.frequency : parts.length - 1] || '';
    const frequency = parseFloat(String(frequencyStr).replace('%', '')) || 0;
    const slug = url.replace(/\/$/, '').split('/').pop();

    list.push({
      id,
      num: id,
      url,
      title,
      name: title,
      slug,
      difficulty,
      acceptance,
      frequency,
      company: titleFromId(company)
    });
  }
  return list;
}

function enrichRatings(questions) {
  return questions.map((q) => {
    let rating = null;
    if (RATINGS) {
      if (RATINGS[q.id]) rating = RATINGS[q.id].rating;
      else if (RATINGS[q.slug]) rating = RATINGS[q.slug].rating;
    }
    if (!rating) {
      rating = q.difficulty === 'Hard' ? 2050 : q.difficulty === 'Medium' ? 1620 : 1250;
    }
    return { ...q, rating: Math.round(rating) };
  });
}

export async function fetchCompanyQuestions(companyId = 'google', timeframe = 'thirty-days') {
  const cleanId = (companyId || 'google').toLowerCase().trim();
  if (!catalogState.sha && catalogState.companies.length === 0) {
    await refreshCatalog();
  }
  const sha = catalogState.sha || GITHUB_BRANCH;

  const cached = readQuestionCache(cleanId, timeframe, sha);
  if (cached) return enrichRatings(cached);

  const csvText = await fetchCsvText(cleanId, timeframe, sha);
  const questions = csvText ? parseCsvClient(csvText, cleanId) : [];
  if (questions.length) writeQuestionCache(cleanId, timeframe, sha, questions);
  return enrichRatings(questions);
}

export async function fetchMultipleCompaniesQuestions(companyIds = ['google'], timeframe = 'thirty-days') {
  if (!Array.isArray(companyIds) || companyIds.length === 0) return [];
  if (companyIds.length === 1) return fetchCompanyQuestions(companyIds[0], timeframe);

  const results = await Promise.allSettled(
    companyIds.map((id) => fetchCompanyQuestions(id, timeframe))
  );

  const questionMap = new Map();
  const companies = catalogState.companies;

  results.forEach((res, idx) => {
    if (res.status !== 'fulfilled' || !Array.isArray(res.value)) return;
    const compId = companyIds[idx];
    const compObj = companies.find((c) => c.id === compId) || toCompany(compId);

    res.value.forEach((q) => {
      const key = q.slug || String(q.id);
      if (!questionMap.has(key)) {
        questionMap.set(key, {
          ...q,
          companies: [compObj.name],
          maxFrequency: q.frequency || 0
        });
      } else {
        const existing = questionMap.get(key);
        if (!existing.companies.includes(compObj.name)) {
          existing.companies.push(compObj.name);
        }
        if ((q.frequency || 0) > (existing.maxFrequency || 0)) {
          existing.maxFrequency = q.frequency;
        }
      }
    });
  });

  return Array.from(questionMap.values()).map((q) => ({
    ...q,
    frequency: q.maxFrequency
  }));
}
