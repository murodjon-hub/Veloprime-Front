import React from 'react';

const PROMPTS = [
	'Best road bikes under $1,500',
	'Beginner MTB recommendations',
	'Compare carbon vs aluminum',
	'Best helmets for city riding',
	'Upcoming cycling events',
	'E-bike recommendations',
	'Best accessories for long rides',
	'Kids bikes for beginners',
];

interface Props {
	onSelect: (prompt: string) => void;
}

export function AiSuggestions({ onSelect }: Props) {
	return (
		<div className="ai-suggestions">
			{PROMPTS.map((p) => (
				<button key={p} className="ai-suggestions__chip" onClick={() => onSelect(p)}>
					{p}
				</button>
			))}
		</div>
	);
}
