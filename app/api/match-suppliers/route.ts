import { NextRequest, NextResponse } from 'next/server';
import { parseRequirements } from '@/lib/parser';
import { queryExplorium } from '@/lib/explorium';
import { rankSuppliers } from '@/lib/scoring';

export async function POST(req: NextRequest) {
  const { query, context } = await req.json();
  if (!query || typeof query !== 'string') {
    return NextResponse.json({ code: 'BAD_REQUEST', message: 'query required' }, { status: 400 });
  }

  const parsed = parseRequirements(query, context);
  try {
    console.log('[api] incoming context', context);
    console.log('[api] parsed requirements', parsed);
  } catch {}
  if (parsed.missing.includes('location')) {
    return NextResponse.json(
      { code: 'CLARIFY', fields: ['location'], needsClarification: true, message: 'Provide state or ZIP.' },
      { status: 422 },
    );
  }

  const upstream = await queryExplorium(parsed, query);
  try {
    console.log('[api] upstream result', upstream);
  } catch {}
  if (!upstream.ok) {
    return NextResponse.json({ code: upstream.code || 'UPSTREAM_ERROR', message: upstream.message }, { status: upstream.status || 502 });
  }

  const ranked = rankSuppliers(parsed, upstream.data);
  const suppliers = ranked.map((supplier) => ({
    company_name: supplier.company_name,
    hq_location: supplier.hq_location,
    matchScore: supplier.matchScore,
    matchTemp: supplier.matchTemp,
    lead_time_days: supplier.lead_time_days,
    certifications: supplier.certifications,
    recycled_content_percent: supplier.recycled_content_percent,
    website: supplier.website ?? null,
    reasons: supplier.reasons,
  }));
  const contextPayload: Record<string, unknown> = {};
  const locationToken = parsed.location?.state ?? parsed.location?.zip;
  if (locationToken) {
    contextPayload.location = locationToken;
  }
  if (parsed.delivery?.days) {
    contextPayload.deliveryDays = parsed.delivery.days;
  } else if (parsed.delivery?.weeks) {
    contextPayload.deliveryDays = parsed.delivery.weeks * 7;
  }
  if (parsed.budget && (parsed.budget.min || parsed.budget.max)) {
    contextPayload.budgetUSD = parsed.budget;
  }

  const responseContext = Object.keys(contextPayload).length ? contextPayload : undefined;

  const result = {
    message: ranked.length
      ? `✅ Found ${ranked.length} qualified U.S. manufacturers.`
      : 'No suppliers matched the filters. Try loosening the requirements.',
    suppliers,
    cta: ranked.length ? 'Would you like us to connect you?' : undefined,
    context: responseContext,
  };
  try {
    console.log('[api] response payload', result);
  } catch {}
  return NextResponse.json(result);
}
