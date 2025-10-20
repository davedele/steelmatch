/**
 * Mock Explorium API responses for testing without a valid API key
 * Enable by setting: EXPLORIUM_MOCK_MODE=true in .env.local
 */

import type { ParsedRequirements } from './parser';

type Ok = { ok: true; data: any[]; correlation_id?: string };
type Err = { ok: false; code: string; message: string; status?: number; correlation_id?: string };

export async function queryExploriumMock(parsed: ParsedRequirements, originalQuery: string): Promise<Ok | Err> {
  console.log('[Explorium Mock] Using mock data for testing');
  console.log('[Explorium Mock] Query:', originalQuery);
  console.log('[Explorium Mock] Parsed:', JSON.stringify(parsed, null, 2));

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Generate mock suppliers based on location
  const location = parsed.location?.state || parsed.location?.zip || 'United States';
  const mockCorrelationId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const mockSuppliers = [
    {
      business_id: 'mock-001',
      company_name: 'Precision Metals Inc',
      hq_location: `${location === 'TX' ? 'Houston' : 'Cleveland'}, ${location === 'TX' ? 'TX' : 'OH'}`,
      website: 'https://precisionmetals.example.com',
      signals: {
        company_name: 'Precision Metals Inc',
        iso_9001_certified: true,
        as9100_certified: true,
        lead_time_days: 10,
        has_cnc_capability: true,
        employee_count: 150,
        recycled_content_percent: 75,
        sustainability_score: 8.5,
      },
    },
    {
      business_id: 'mock-002',
      company_name: 'Advanced Manufacturing Solutions',
      hq_location: `${location === 'CA' ? 'Los Angeles' : 'Detroit'}, ${location === 'CA' ? 'CA' : 'MI'}`,
      website: 'https://ams-mfg.example.com',
      signals: {
        company_name: 'Advanced Manufacturing Solutions',
        iso_9001_certified: true,
        as9100_certified: false,
        lead_time_days: 14,
        has_cnc_capability: true,
        employee_count: 85,
        recycled_content_percent: 60,
        sustainability_score: 7.2,
      },
    },
    {
      business_id: 'mock-003',
      company_name: 'Midwest Steel Fabricators',
      hq_location: 'Chicago, IL',
      website: 'https://midweststeel.example.com',
      signals: {
        company_name: 'Midwest Steel Fabricators',
        iso_9001_certified: true,
        as9100_certified: false,
        nadcap_certified: false,
        lead_time_days: 18,
        has_cnc_capability: true,
        employee_count: 220,
        recycled_content_percent: 45,
        sustainability_score: 6.8,
      },
    },
    {
      business_id: 'mock-004',
      company_name: 'Titan Aerospace Components',
      hq_location: 'Seattle, WA',
      website: 'https://titanaero.example.com',
      signals: {
        company_name: 'Titan Aerospace Components',
        iso_9001_certified: true,
        as9100_certified: true,
        nadcap_certified: true,
        lead_time_days: 12,
        has_cnc_capability: true,
        employee_count: 95,
        recycled_content_percent: 0,
        sustainability_score: 5.5,
      },
    },
    {
      business_id: 'mock-005',
      company_name: 'Superior Metal Works',
      hq_location: `${location === 'TX' ? 'Dallas' : 'Phoenix'}, ${location === 'TX' ? 'TX' : 'AZ'}`,
      website: 'https://superiormetalworks.example.com',
      signals: {
        company_name: 'Superior Metal Works',
        iso_9001_certified: true,
        as9100_certified: false,
        lead_time_days: 21,
        has_cnc_capability: true,
        employee_count: 65,
        recycled_content_percent: 30,
        sustainability_score: 6.0,
      },
    },
  ];

  // Filter based on delivery requirements if specified
  let filteredSuppliers = mockSuppliers;
  const targetLeadDays =
    typeof parsed.delivery?.days === 'number'
      ? parsed.delivery.days
      : typeof parsed.delivery?.weeks === 'number'
        ? parsed.delivery.weeks * 7
        : null;

  if (targetLeadDays) {
    // Include suppliers within target + 7 days
    filteredSuppliers = mockSuppliers.filter((s) => {
      const leadTime = s.signals.lead_time_days as number;
      return leadTime <= targetLeadDays + 7;
    });
  }

  // Prioritize suppliers in the specified location
  if (parsed.location?.state) {
    filteredSuppliers.sort((a, b) => {
      const aInState = a.hq_location.includes(parsed.location!.state!);
      const bInState = b.hq_location.includes(parsed.location!.state!);
      if (aInState && !bInState) return -1;
      if (!aInState && bInState) return 1;
      return 0;
    });
  }

  console.log(
    '[Explorium Mock] Returning',
    filteredSuppliers.length,
    'suppliers, correlation_id:',
    mockCorrelationId,
  );

  return {
    ok: true,
    data: filteredSuppliers,
    correlation_id: mockCorrelationId,
  };
}

