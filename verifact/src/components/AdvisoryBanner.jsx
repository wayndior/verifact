import React from 'react';

/**
 * Short legal/UX notice: AI outputs are advisory, not an official misconduct finding.
 */
export default function AdvisoryBanner() {
  return (
    <div
      role="note"
      style={{
        fontSize: '0.75rem',
        lineHeight: 1.45,
        color: '#64748B',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '10px 14px',
        marginBottom: '20px',
      }}
    >
      <strong style={{ color: '#475569' }}>Advisory only.</strong>{' '}
      Verifact uses AI to highlight possible factual issues and similarity signals. Results can be wrong or
      incomplete and are not a legal plagiarism ruling or an official academic misconduct determination—always
      apply your own review and follow the policies of your school or employer.
    </div>
  );
}
