import React from 'react';
import { AiSuggestions } from './AiSuggestions';

interface Props {
	onSelect: (prompt: string) => void;
}

export function AiEmptyState({ onSelect }: Props) {
	return (
		<div className="ai-empty">
			<div className="ai-empty__avatar">VP</div>
			<p className="ai-empty__title">VeloPrime AI Concierge</p>
			<p className="ai-empty__sub">
				Ask me anything — bike recommendations, event info, gear advice, or cycling tips.
			</p>
			<AiSuggestions onSelect={onSelect} />
		</div>
	);
}
