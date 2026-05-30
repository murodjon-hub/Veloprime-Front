import React from 'react';

const COLORS: Record<string, { bg: string; text: string }> = {
	ACTIVE:    { bg: '#dcfce7', text: '#16a34a' },
	SOLD:      { bg: '#dbeafe', text: '#2563eb' },
	HIDDEN:    { bg: '#fef9c3', text: '#ca8a04' },
	DELETED:   { bg: '#fee2e2', text: '#dc2626' },
	DELETE:    { bg: '#fee2e2', text: '#dc2626' },
	BLOCK:     { bg: '#ede9fe', text: '#7c3aed' },
	UPCOMING:  { bg: '#dcfce7', text: '#16a34a' },
	ONGOING:   { bg: '#dbeafe', text: '#2563eb' },
	COMPLETED: { bg: '#f3f4f6', text: '#6b7280' },
	CANCELLED: { bg: '#fee2e2', text: '#dc2626' },
	FREE:      { bg: '#f0fdf4', text: '#16a34a' },
	RECOMMEND: { bg: '#fdf4ff', text: '#9333ea' },
	NEWS:      { bg: '#eff6ff', text: '#2563eb' },
	HUMOR:     { bg: '#fff7ed', text: '#ea580c' },
	USER:      { bg: '#f3f4f6', text: '#374151' },
	MEMBER:    { bg: '#eff6ff', text: '#2563eb' },
	AGENT:     { bg: '#ecfdf5', text: '#059669' },
	ADMIN:     { bg: '#fdf4ff', text: '#7c3aed' },
	HOLD:      { bg: '#fef9c3', text: '#ca8a04' },
	TERMS:     { bg: '#f0fdf4', text: '#16a34a' },
	INQUIRY:   { bg: '#eff6ff', text: '#2563eb' },
	FAQ:       { bg: '#fdf4ff', text: '#7c3aed' },
	PENDING:   { bg: '#fef9c3', text: '#ca8a04' },
	ANSWERED:  { bg: '#dcfce7', text: '#16a34a' },
	CLOSED:    { bg: '#f3f4f6', text: '#6b7280' },
};

export function StatusBadge({ status }: { status: string }) {
	const c = COLORS[status] ?? { bg: '#f3f4f6', text: '#6b7280' };
	return (
		<span style={{
			display: 'inline-block',
			padding: '2px 10px',
			borderRadius: 20,
			fontSize: 11,
			fontWeight: 600,
			background: c.bg,
			color: c.text,
			letterSpacing: 0.3,
			whiteSpace: 'nowrap',
		}}>
			{status}
		</span>
	);
}
