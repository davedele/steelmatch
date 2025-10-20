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
 * Build filters object following Explorium's actual API structure
 * Reference: https://developers.explorium.ai/reference/businesses/fetch_businesses
 * Format: { "filter_name": { "values": ["value1", "value2"] } }
 */
function buildFilters(parsed: ParsedRequirements): Record<string, unknown> {
  const filters: Record<string, unknown> = {
    // Base filter for U.S. only
    country_code: {
      values: ['US'], // Use country code, not full name
    },
    // Filter by company size - focus on established manufacturers
    // Valid values: '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10001+'
    company_size: {
      values: ['51-200', '201-500', '501-1000', '1001-5000'],
    },
    // Use google_category for industry filtering
    // Examples: "manufacturing", "metal fabrication", "machinery", etc.
    google_category: {
      values: ['manufacturing', 'metal fabrication', 'machinery'],
    },
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
          'accept': 'application/json',
          'api_key': apiKey,
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
          'accept': 'application/json',
          'api_key': apiKey,
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
 * Step 3: Fetch business data using filters
 * Reference: https://developers.explorium.ai/reference/businesses/fetch_businesses
 */
async function fetchBusinesses(
  businessIds: string[],
  filters: Record<string, unknown>,
  apiKey: string,
): Promise<Ok | Err> {
  const baseUrl = process.env.EXPLORIUM_API_URL || 'https://api.explorium.ai/v1';
  const endpoint = `${baseUrl}/businesses`;

  // Build payload according to actual API spec
  const payload = {
    request_context: {},
    mode: 'preview' as const, // Use 'preview' to get less data and avoid timeout
    size: 10, // Request only 10 records
    page_size: 10, // Records per page
    page: 1,
    filters,
  };

  try {
    console.log('[Explorium Fetch] business_ids:', businessIds);

    const response = await rateLimiter.throttle(() =>
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'api_key': apiKey,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      }),
    );

    const json = await response.json().catch(() => ({}));
    const correlation_id = json?.response_context?.correlation_id || response.headers.get('x-correlation-id') || undefined;

    console.log('[Explorium Fetch] status:', response.status, 'correlation_id:', correlation_id);
    console.log('[Explorium Fetch] response:', JSON.stringify(json).substring(0, 500));

    if (!response.ok) {
      const message = json?.detail || json?.message || 'Fetch endpoint error';
      console.error('[Explorium Fetch] error:', message, 'correlation_id:', correlation_id);
      return { ok: false, code: 'FETCH_ERROR', message, status: response.status, correlation_id };
    }

    // Extract data from response (actual field is 'data')
    const records = Array.isArray(json?.data) ? json.data : [];

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
 * Main query function using Explorium Fetch Businesses API
 * Reference: https://developers.explorium.ai/reference/businesses/fetch_businesses
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

  // Build filters based on requirements
  const filters = buildFilters(parsed);

  console.log('[Explorium] Fetching businesses with filters:', JSON.stringify(filters, null, 2));

  // Fetch businesses directly using filters
  // We search by criteria (location, industry, size) rather than matching specific companies
  const fetchResult = await fetchBusinesses([], filters, apiKey);
  
  if (!fetchResult.ok) {
    return fetchResult;
  }

  console.log('[Explorium] Fetched:', fetchResult.data.length, 'businesses');

  return fetchResult;
}
