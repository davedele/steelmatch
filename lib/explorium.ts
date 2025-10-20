import type { ParsedRequirements } from './parser';

type Ok = { ok: true; data: any[]; correlation_id?: string };
type Err = { ok: false; code: string; message: string; status?: number; correlation_id?: string };

type SignalRecord = Record<string, unknown>;

interface ExploriumRecord {
  business_id?: string;
  company_name?: string;
  name?: string;
  hq_location?: string;
  location?: string;
  state?: string;
  website?: string;
  domain?: string;
  signals?: SignalRecord;
  signal_values?: SignalRecord;
  [key: string]: unknown;
}

interface BusinessMatch {
  business_id: string;
  company_name: string;
  confidence_score?: number;
}

interface StatsResponse {
  total_count: number;
  filters_applied: Record<string, unknown>;
  correlation_id?: string;
}

// Rate limiter: 200 queries per minute = 1 query per 300ms
class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private lastCall = 0;
  private readonly minInterval = 300; // 300ms between calls (200 qpm)

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastCall = now - this.lastCall;
          if (timeSinceLastCall < this.minInterval) {
            await new Promise((r) => setTimeout(r, this.minInterval - timeSinceLastCall));
          }
          this.lastCall = Date.now();
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) await task();
    }
    this.processing = false;
  }
}

const rateLimiter = new RateLimiter();

/**
 * Build filters object following Explorium's API structure
 * Filters use "values" objects with include/exclude patterns
 * Reference: https://developers.explorium.ai/reference/quick-starts/quick-starts
 */
function buildFilters(parsed: ParsedRequirements): Record<string, unknown> {
  const filters: Record<string, unknown> = {
    // Base filters for U.S. manufacturers
    countries: {
      values: ['United States'],
      operator: 'include',
    },
    // NAICS codes for metal manufacturing
    naics_codes: {
      values: [
        '331110', // Iron and Steel Mills
        '331222', // Steel Wire Drawing
        '332322', // Sheet Metal Work Manufacturing
        '332431', // Metal Can Manufacturing
        '332721', // Precision Turned Product Manufacturing
      ],
      operator: 'include',
    },
  };

  // Location filters
  if (parsed.location?.state) {
    filters.states = {
      values: [parsed.location.state],
      operator: 'include',
    };
  }
  if (parsed.location?.zip) {
    filters.zip_codes = {
      values: [parsed.location.zip],
      operator: 'include',
    };
  }

  // Lead time filter (if delivery requirement specified)
  const targetLeadDays =
    typeof parsed.delivery?.days === 'number'
      ? parsed.delivery.days
      : typeof parsed.delivery?.weeks === 'number'
        ? parsed.delivery.weeks * 7
        : null;

  if (targetLeadDays) {
    filters.lead_time_days_max = targetLeadDays;
  }

  // Budget filters
  if (parsed.budget?.min) {
    filters.project_budget_min = parsed.budget.min;
  }
  if (parsed.budget?.max) {
    filters.project_budget_max = parsed.budget.max;
  }

  // Employee count (quality filter)
  filters.employee_count = {
    values: ['10+'],
    operator: 'include',
  };

  return filters;
}

/**
 * Step 1: Assess market potential using stats endpoint
 */
async function getBusinessStats(filters: Record<string, unknown>, apiKey: string): Promise<StatsResponse | Err> {
  const baseUrl = process.env.EXPLORIUM_API_URL || 'https://api.explorium.ai/v1';
  const endpoint = `${baseUrl}/businesses/stats`;

  try {
    const response = await rateLimiter.throttle(() =>
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ filters }),
        cache: 'no-store',
      }),
    );

    const json = await response.json().catch(() => ({}));
    const correlation_id = json?.correlation_id || response.headers.get('x-correlation-id') || undefined;

    console.log('[Explorium Stats] status:', response.status, 'correlation_id:', correlation_id);

    if (!response.ok) {
      const message = json?.detail || json?.message || 'Stats endpoint error';
      console.error('[Explorium Stats] error:', message, 'correlation_id:', correlation_id);
      return { ok: false, code: 'STATS_ERROR', message, status: response.status, correlation_id };
    }

    return {
      total_count: json?.total_count || 0,
      filters_applied: json?.filters || filters,
      correlation_id,
    };
  } catch (error) {
    console.error('[Explorium Stats] request failed:', error);
    return { ok: false, code: 'NETWORK_ERROR', message: 'Stats request failed', status: 500 };
  }
}

/**
 * Step 2: Match businesses to get accurate business_ids
 * Uses natural language query + filters for better matching
 */
async function matchBusinesses(
  query: string,
  filters: Record<string, unknown>,
  apiKey: string,
): Promise<{ ok: true; matches: BusinessMatch[]; correlation_id?: string } | Err> {
  const baseUrl = process.env.EXPLORIUM_API_URL || 'https://api.explorium.ai/v1';
  const endpoint = `${baseUrl}/businesses/match`;

  const payload = {
    query: query, // Natural language query
    filters,
    limit: 10, // Get more matches initially
  };

  try {
    console.log('[Explorium Match] payload:', JSON.stringify(payload, null, 2));

    const response = await rateLimiter.throttle(() =>
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      }),
    );

    const json = await response.json().catch(() => ({}));
    const correlation_id = json?.correlation_id || response.headers.get('x-correlation-id') || undefined;

    console.log('[Explorium Match] status:', response.status, 'correlation_id:', correlation_id);

    if (!response.ok) {
      const message = json?.detail || json?.message || 'Match endpoint error';
      console.error('[Explorium Match] error:', message, 'correlation_id:', correlation_id);
      return { ok: false, code: 'MATCH_ERROR', message, status: response.status, correlation_id };
    }

    const matches: BusinessMatch[] = Array.isArray(json?.matches)
      ? json.matches
      : Array.isArray(json?.results)
        ? json.results
        : [];

    return { ok: true, matches, correlation_id };
  } catch (error) {
    console.error('[Explorium Match] request failed:', error);
    return { ok: false, code: 'NETWORK_ERROR', message: 'Match request failed', status: 500 };
  }
}

/**
 * Step 3: Fetch business data using matched business_ids
 */
async function fetchBusinesses(
  businessIds: string[],
  filters: Record<string, unknown>,
  apiKey: string,
): Promise<Ok | Err> {
  if (!businessIds.length) {
    return { ok: true, data: [] };
  }

  const baseUrl = process.env.EXPLORIUM_API_URL || 'https://api.explorium.ai/v1';
  const endpoint = `${baseUrl}/businesses`;

  // Request specific signals/attributes
  const requestedSignals = [
    'company_name',
    'hq_location',
    'website',
    'domain',
    'employee_count',
    'iso_9001_certified',
    'as9100_certified',
    'nadcap_certified',
    'lead_time_days',
    'avg_lead_time_days',
    'recycled_content_percent',
    'sustainability_score',
    'has_cnc_capability',
    'cnc_capability',
    'manufacturing_capabilities',
    'certifications',
  ];

  const payload = {
    business_ids: businessIds,
    filters,
    signals: requestedSignals,
    page: 1,
    page_size: Math.min(businessIds.length, 100), // Max 100 per page
  };

  try {
    console.log('[Explorium Fetch] business_ids:', businessIds);

    const response = await rateLimiter.throttle(() =>
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      }),
    );

    const json = await response.json().catch(() => ({}));
    const correlation_id = json?.correlation_id || response.headers.get('x-correlation-id') || undefined;

    console.log('[Explorium Fetch] status:', response.status, 'correlation_id:', correlation_id);
    console.log('[Explorium Fetch] response:', json);

    if (!response.ok) {
      const message = json?.detail || json?.message || 'Fetch endpoint error';
      console.error('[Explorium Fetch] error:', message, 'correlation_id:', correlation_id);
      return { ok: false, code: 'FETCH_ERROR', message, status: response.status, correlation_id };
    }

    const records = Array.isArray(json?.businesses)
      ? json.businesses
      : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.results)
          ? json.results
          : [];

    const normalized = records.map((record: ExploriumRecord) => {
      const signals = record?.signals ?? record?.signal_values ?? {};
      return {
        business_id: record.business_id,
        company_name:
          record.company_name ?? record.name ?? (signals as SignalRecord).company_name ?? 'Untitled Supplier',
        hq_location:
          record.hq_location ??
          record.location ??
          record.state ??
          (signals as SignalRecord).hq_location ??
          (signals as SignalRecord).state ??
          'United States',
        website: record.website ?? record.domain ?? (signals as SignalRecord).website ?? null,
        signals,
      };
    });

    return { ok: true, data: normalized, correlation_id };
  } catch (error) {
    console.error('[Explorium Fetch] request failed:', error);
    return { ok: false, code: 'NETWORK_ERROR', message: 'Fetch request failed', status: 500 };
  }
}

/**
 * Main query function implementing the recommended workflow:
 * 1. Assess market potential (stats)
 * 2. Match businesses (get business_ids)
 * 3. Fetch enriched business data
 * 
 * Mock Mode: Set EXPLORIUM_MOCK_MODE=true to use test data
 */
export async function queryExplorium(parsed: ParsedRequirements, originalQuery: string): Promise<Ok | Err> {
  // Check for mock mode (useful for testing without valid API key)
  if (process.env.EXPLORIUM_MOCK_MODE === 'true') {
    const { queryExploriumMock } = await import('./explorium-mock');
    return queryExploriumMock(parsed, originalQuery);
  }

  const apiKey = process.env.EXPLORIUM_API_KEY;
  if (!apiKey) {
    console.error('[Explorium] API key missing');
    return { ok: false, code: 'NO_API_KEY', message: 'Explorium API key missing', status: 500 };
  }

  // Build filters once
  const filters = buildFilters(parsed);

  console.log('[Explorium] Starting workflow with filters:', JSON.stringify(filters, null, 2));

  // Step 1: Assess market potential
  const stats = await getBusinessStats(filters, apiKey);
  if ('ok' in stats && !stats.ok) {
    // If stats fails, continue anyway (non-critical)
    console.warn('[Explorium] Stats check failed, continuing:', stats.message);
  } else {
    console.log('[Explorium] Market size:', (stats as StatsResponse).total_count, 'businesses');
  }

  // Step 2: Match businesses
  const matchResult = await matchBusinesses(originalQuery, filters, apiKey);
  if (!matchResult.ok) {
    return matchResult;
  }

  const { matches, correlation_id: match_correlation_id } = matchResult;
  console.log('[Explorium] Matched:', matches.length, 'businesses', 'correlation_id:', match_correlation_id);

  if (!matches.length) {
    return {
      ok: true,
      data: [],
      ...(match_correlation_id ? { correlation_id: match_correlation_id } : {}),
    };
  }

  // Extract top 5 business_ids by confidence
  const businessIds = matches
    .sort((a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0))
    .slice(0, 5)
    .map((m) => m.business_id);

  // Step 3: Fetch enriched business data
  const fetchResult = await fetchBusinesses(businessIds, filters, apiKey);
  if (!fetchResult.ok) {
    return fetchResult;
  }

  console.log('[Explorium] Fetched:', fetchResult.data.length, 'enriched businesses');

  return fetchResult;
}
