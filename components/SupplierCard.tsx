import React from 'react';

export interface SupplierCardProps {
  company_name: string;
  hq_location: string;
  matchScore: number;
  lead_time_days?: number;
  certifications?: string[];
  recycled_content_percent?: number;
  matchTemp?: 'hot' | 'warm' | 'cold';
  reasons?: string[];
  website?: string | null;
}

const matchEmoji: Record<'hot' | 'warm' | 'cold', string> = {
  hot: '🔥',
  warm: '🌡️',
  cold: '🧊',
};

function matchLabel(temp?: SupplierCardProps['matchTemp']) {
  if (!temp) return 'Match';
  return temp === 'hot' ? 'Hot match' : temp === 'warm' ? 'Warm match' : 'Exploratory match';
}

export function SupplierCard(props: SupplierCardProps) {
  const {
    company_name,
    hq_location,
    matchScore,
    lead_time_days,
    certifications,
    recycled_content_percent,
    matchTemp,
    reasons,
    website,
  } = props;

  const tempBadge =
    matchTemp &&
    `${matchEmoji[matchTemp]} ${matchLabel(matchTemp)}${typeof matchScore === 'number' ? ` (${matchScore}/100)` : ''}`;

  return (
    <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg text-md text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <p className="font-bold text-base">
          {company_name}
          <span className="ml-1 text-gray-500 text-md">({hq_location})</span>
        </p>
        {tempBadge ? <span className="inline-flex items-center text-xs font-semibold text-primary">{tempBadge}</span> : null}
      </div>
      <ul className="mt-2 space-y-1 text-gray-600 list-disc pl-4">
        <li>
          Match score: <span className="font-semibold">{matchScore}/100</span>
          {typeof lead_time_days === 'number' && (
            <>
              {' '}
              • Lead time: <span className="font-semibold">{lead_time_days} days</span>
            </>
          )}
        </li>
        {certifications?.length ? (
          <li>
            Certifications: <span className="font-semibold">{certifications.join(', ')}</span>
          </li>
        ) : null}
        {typeof recycled_content_percent === 'number' ? (
          <li>
            Sustainability: <span className="font-semibold">{recycled_content_percent}%</span> recycled content
          </li>
        ) : null}
        {website ? (
          <li>
            Website:{' '}
            <a href={website} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
              {website.replace(/^https?:\/\//, '')}
            </a>
          </li>
        ) : null}
      </ul>
      {reasons?.length ? (
        <div className="mt-3">
          <p className="font-semibold text-xs uppercase tracking-wide text-gray-500">Why it fits</p>
          <ul className="mt-1 space-y-1 text-gray-600 list-disc pl-4">
            {reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default SupplierCard;
