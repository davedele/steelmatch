export interface ParsedRequirements {
  material: { family: 'steel' | 'aluminum' | 'titanium' | 'other'; grade?: string } | null;
  tolerance: { value: number; unit: 'in' | 'mm' } | null;
  quantity: { value: number; unit: 'lbs' | 'kg' | 'units' } | null;
  delivery: { days?: number; weeks?: number } | null;
  location?: { state?: string; zip?: string } | null;
  capabilities?: string[];
  certifications?: string[];
  budget?: { min?: number; max?: number } | null;
  missing: Array<'location' | 'material' | 'delivery' | 'quantity' | 'tolerance'>;
}

export function parseRequirements(
  input: string,
  ctx?: { location?: string; deliveryDays?: number; budgetUSD?: { min?: number; max?: number } },
): ParsedRequirements {
  const text = input || '';
  const missing: ParsedRequirements['missing'] = [];

  const states: Record<string, string> = {
    alabama: 'AL',
    alaska: 'AK',
    arizona: 'AZ',
    arkansas: 'AR',
    california: 'CA',
    colorado: 'CO',
    connecticut: 'CT',
    delaware: 'DE',
    florida: 'FL',
    georgia: 'GA',
    hawaii: 'HI',
    idaho: 'ID',
    illinois: 'IL',
    indiana: 'IN',
    iowa: 'IA',
    kansas: 'KS',
    kentucky: 'KY',
    louisiana: 'LA',
    maine: 'ME',
    maryland: 'MD',
    massachusetts: 'MA',
    michigan: 'MI',
    minnesota: 'MN',
    mississippi: 'MS',
    missouri: 'MO',
    montana: 'MT',
    nebraska: 'NE',
    nevada: 'NV',
    'new hampshire': 'NH',
    'new jersey': 'NJ',
    'new mexico': 'NM',
    'new york': 'NY',
    'north carolina': 'NC',
    'north dakota': 'ND',
    ohio: 'OH',
    oklahoma: 'OK',
    oregon: 'OR',
    pennsylvania: 'PA',
    'rhode island': 'RI',
    'south carolina': 'SC',
    'south dakota': 'SD',
    tennessee: 'TN',
    texas: 'TX',
    utah: 'UT',
    vermont: 'VT',
    virginia: 'VA',
    washington: 'WA',
    'west virginia': 'WV',
    wisconsin: 'WI',
    wyoming: 'WY',
  };

  let location: ParsedRequirements['location'] = null;

  if (ctx?.location) {
    const token = String(ctx.location).trim();
    const zipMatch = token.match(/^\d{5}$/);
    if (zipMatch) {
      location = { zip: zipMatch[0] };
    } else if (/^[a-zA-Z]{2}$/.test(token)) {
      location = { state: token.toUpperCase() };
    } else {
      // Try full state name
      const lowered = token.toLowerCase();
      const stateEntry = Object.entries(states).find(([name]) => name === lowered);
      if (stateEntry) {
        location = { state: stateEntry[1] };
      }
    }
  }

  if (!location) {
    const zipMatch = text.match(/\b(\d{5})(?:-\d{4})?\b/);
    if (zipMatch) {
      location = { zip: zipMatch[1]! };
    }
  }

  if (!location) {
    const lowered = text.toLowerCase();
    const stateMatch = Object.entries(states).find(
      ([name, abbrev]) => lowered.includes(name) || new RegExp(`\\b${abbrev}\\b`, 'i').test(text),
    );
    if (stateMatch) {
      location = { state: stateMatch[1] };
    }
  }

  if (!location) {
    missing.push('location');
  }

  let material: ParsedRequirements['material'] = null;
  type MaterialFamily = NonNullable<ParsedRequirements['material']>['family'];
  const materialFamilies: Array<{ family: MaterialFamily; keywords: string[] }> = [
    { family: 'steel', keywords: ['stainless', 'steel', 'carbon steel', 'alloy steel'] },
    { family: 'aluminum', keywords: ['aluminum', 'aluminium'] },
    { family: 'titanium', keywords: ['titanium'] },
  ];
  const family = materialFamilies.find((f) => f.keywords.some((kw) => new RegExp(`\\b${kw}\\b`, 'i').test(text)));
  if (family) {
    const gradeMatch = text.match(/\b(1[0-9]{2}|2[0-9]{2}|3[0-9]{2}|4[0-9]{2})(?:\s*[A-Z]?)\b/);
    material = { family: family.family, ...(gradeMatch?.[0] ? { grade: gradeMatch[0] } : {}) };
  } else if (text.trim()) {
    material = { family: 'other' };
  } else {
    missing.push('material');
  }

  let tolerance: ParsedRequirements['tolerance'] = null;
  const tolMatch =
    text.match(/[\u00B1+\-~]?\s*(\d+(?:\.\d+)?)(?:\s*(?:in(?:ch(?:es)?)?|mm|millimeters?|["]))/i) ||
    text.match(/\b(?:plus\/minus|\+\/-)\s*(\d+(?:\.\d+)?)(?:\s*(in|mm|mil(?:s)?|["]))?/i);
  if (tolMatch) {
    const value = parseFloat(String(tolMatch[1]));
    const unitToken = String(tolMatch[0]).toLowerCase();
    const unit: 'in' | 'mm' = unitToken.includes('mm') ? 'mm' : 'in';
    tolerance = { value, unit };
  } else {
    missing.push('tolerance');
  }

  let quantity: ParsedRequirements['quantity'] = null;
  const qtyMatch = text.match(/\b(\d[\d,\.]*)\s*(lbs?|pounds?|kg|kilograms?|tons?|units|pcs|pieces?)\b/i);
  if (qtyMatch) {
    const value = Number(String(qtyMatch[1]).replace(/,/g, ''));
    const unitToken = String(qtyMatch[2]).toLowerCase();
    type QuantityUnit = NonNullable<ParsedRequirements['quantity']>['unit'];
    let unit: QuantityUnit = 'units';
    if (/(lb|pound)/.test(unitToken)) unit = 'lbs';
    else if (/(kg|kilogram)/.test(unitToken)) unit = 'kg';
    quantity = { value, unit };
  } else {
    missing.push('quantity');
  }

  let delivery: ParsedRequirements['delivery'] = null;
  const deliveryMatch = text.match(/\b(?:in|within)\s*(\d+(?:\.\d+)?)\s*(days?|weeks?)\b/i);
  if (deliveryMatch) {
    const value = Number(deliveryMatch[1]);
    const unitWord = String(deliveryMatch[2]).toLowerCase();
    if (/week/.test(unitWord)) {
      delivery = { weeks: value };
    } else {
      delivery = { days: value };
    }
  } else if (typeof ctx?.deliveryDays === 'number' && Number.isFinite(ctx.deliveryDays)) {
    delivery = { days: ctx.deliveryDays };
  } else {
    missing.push('delivery');
  }

  const capabilities: string[] = [];
  if (/\bcnc\b/i.test(text)) capabilities.push('CNC');
  if (/\blaser (?:cut|cutting)\b/i.test(text)) capabilities.push('Laser cutting');
  if (/\bwaterjet\b/i.test(text)) capabilities.push('Waterjet');
  if (/\bwelding\b/i.test(text)) capabilities.push('Welding');

  const certifications: string[] = [];
  if (/iso\s*9001/i.test(text)) certifications.push('ISO 9001');
  if (/as\s*9100/i.test(text)) certifications.push('AS9100');
  if (/nadcap/i.test(text)) certifications.push('NADCAP');

  const budget = ctx?.budgetUSD && (typeof ctx.budgetUSD.min === 'number' || typeof ctx.budgetUSD.max === 'number')
    ? (() => {
        const b: { min?: number; max?: number } = {};
        if (typeof ctx.budgetUSD!.min === 'number') b.min = ctx.budgetUSD!.min;
        if (typeof ctx.budgetUSD!.max === 'number') b.max = ctx.budgetUSD!.max;
        return b;
      })()
    : null;

  return {
    material,
    tolerance,
    quantity,
    delivery,
    location,
    capabilities,
    certifications,
    budget,
    missing,
  };
}
