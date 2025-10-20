import type { ParsedRequirements } from './parser';

interface ExploriumSupplier {
  company_name: string;
  hq_location: string;
  website?: string;
  signals: Record<string, unknown>;
  lead_time_days?: number;
  certifications?: string[];
  recycled_content_percent?: number;
}

export interface RankedSupplier extends ExploriumSupplier {
  matchScore: number;
  matchTemp: 'hot' | 'warm' | 'cold';
  reasons: string[];
}

export function rankSuppliers(parsed: ParsedRequirements, suppliers: ExploriumSupplier[]): RankedSupplier[] {
  function isTruthy(value: unknown): boolean {
    if (typeof value === 'string') {
      return ['true', '1', 'yes', 'y'].includes(value.trim().toLowerCase());
    }
    if (typeof value === 'number') {
      return value > 0;
    }
    return Boolean(value);
  }

  const targetLeadDays =
    typeof parsed.delivery?.days === 'number'
      ? parsed.delivery.days
      : typeof parsed.delivery?.weeks === 'number'
        ? parsed.delivery.weeks * 7
        : null;

  const ranked = suppliers.map((s) => {
    const signals = s.signals ?? {};
    const iso = isTruthy(signals['iso_9001']);
    const as9100 = isTruthy(signals['as9100']);
    const cnc = isTruthy(signals['has_cnc_capability']);
    const recycled = Number(signals['recycled_content_percent'] ?? signals['sustainability_recycled_percent'] ?? 0);
    const leadValue =
      typeof s.lead_time_days === 'number'
        ? s.lead_time_days
        : Number(signals['lead_time_days'] ?? signals['avg_lead_time_days'] ?? NaN);
    const lead = Number.isFinite(leadValue) ? Number(leadValue) : null;
    const estBudgetMin = Number(signals['est_budget_min'] ?? NaN);
    const estBudgetMax = Number(signals['est_budget_max'] ?? NaN);

    let score = 40;
    const reasons: string[] = [];
    const certificationSet = new Set<string>(Array.isArray(s.certifications) ? s.certifications : []);

    if (iso) {
      score += 18;
      certificationSet.add('ISO 9001');
      reasons.push('ISO 9001 certified');
    }
    if (as9100) {
      score += 12;
      certificationSet.add('AS9100');
      reasons.push('AS9100 aerospace certified');
    }
    if (cnc) {
      score += 10;
      reasons.push('CNC capability');
    }

    if (lead !== null) {
      if (targetLeadDays !== null) {
        if (lead <= targetLeadDays) {
          score += 15;
          reasons.push(`Meets delivery target (${lead} days)`);
        } else if (lead <= targetLeadDays + 7) {
          score += 7;
          reasons.push(`Near delivery target (${lead} days)`);
        } else {
          score -= 5;
          reasons.push(`Longer delivery (~${lead} days)`);
        }
      } else {
        if (lead <= 10) {
          score += 12;
          reasons.push(`Fast lead time (${lead} days)`);
        } else if (lead <= 21) {
          score += 6;
          reasons.push(`Standard lead time (${lead} days)`);
        } else {
          score -= 3;
          reasons.push(`Extended lead time (${lead} days)`);
        }
      }
    }

    if (recycled > 0) {
      score += recycled >= 50 ? 10 : 5;
      reasons.push(`${recycled}% recycled content`);
    }

    if (parsed.budget && (typeof parsed.budget.min === 'number' || typeof parsed.budget.max === 'number')) {
      const targetMin = typeof parsed.budget.min === 'number' ? parsed.budget.min : null;
      const targetMax = typeof parsed.budget.max === 'number' ? parsed.budget.max : null;
      const supplierMin = Number.isFinite(estBudgetMin) ? estBudgetMin : null;
      const supplierMax = Number.isFinite(estBudgetMax) ? estBudgetMax : null;

      if (supplierMin !== null || supplierMax !== null) {
        const withinLowerBound = targetMin === null || (supplierMax ?? supplierMin ?? targetMin) >= targetMin;
        const withinUpperBound = targetMax === null || (supplierMin ?? supplierMax ?? targetMax) <= targetMax;

        if (withinLowerBound && withinUpperBound) {
          score += 4;
          reasons.push('Matches target budget');
        } else if (targetMax !== null && supplierMin !== null && supplierMin > targetMax) {
          score -= 6;
          reasons.push('Likely above your budget');
        } else if (targetMin !== null && supplierMax !== null && supplierMax < targetMin) {
          score -= 2;
          reasons.push('Below requested budget range');
        }
      } else {
        reasons.push('Budget signals unavailable');
      }
    }

    const certifications = Array.from(certificationSet);

    if (Array.isArray(parsed.certifications) && parsed.certifications.length) {
      const matches = parsed.certifications.filter((cert) =>
        certifications.some((existing) => existing.toLowerCase() === cert.toLowerCase()),
      );
      if (matches.length === parsed.certifications.length) {
        score += 5;
        reasons.push('Matches requested certifications');
      }
    }

    const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
    const temp: RankedSupplier['matchTemp'] = boundedScore >= 85 ? 'hot' : boundedScore >= 65 ? 'warm' : 'cold';

    const enriched: RankedSupplier = {
      ...s,
      matchScore: boundedScore,
      matchTemp: temp,
      reasons,
      certifications,
      ...(lead !== null ? { lead_time_days: lead } : {}),
      ...(Number.isFinite(recycled) && recycled > 0 ? { recycled_content_percent: Math.round(recycled) } : {}),
    };

    return enriched;
  });

  return ranked;
}
