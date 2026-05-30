import React, { useEffect, useRef, useState } from 'react';
import { AiChatMessage } from '../../hooks/useAiChat';
import { AiProductCard } from './AiProductCard';
import { AiEventCard } from './AiEventCard';

interface Props {
	message: AiChatMessage;
	animate?: boolean;
}

export function AiMessage({ message, animate }: Props) {
	const { role, content, products, events } = message;
	const isUser = role === 'user';

	const [displayed, setDisplayed] = useState(animate ? '' : content);
	const [done,       setDone]      = useState(!animate);
	const frameRef = useRef<number | null>(null);

	useEffect(() => {
		if (!animate || isUser) { setDisplayed(content); setDone(true); return; }
		let i = 0;
		const tick = () => {
			i++;
			setDisplayed(content.slice(0, i));
			if (i < content.length) frameRef.current = window.setTimeout(tick, 10);
			else setDone(true);
		};
		frameRef.current = window.setTimeout(tick, 10);
		return () => { if (frameRef.current) clearTimeout(frameRef.current); };
	}, [animate, content, isUser]);

	return (
		<div className={`ai-message ai-message--${role}`}>
			{!isUser && <div className="ai-message__avatar">VP</div>}
			<div className="ai-message__body">
				<div className="ai-message__bubble">
					<p className="ai-message__text">{displayed}{!done && <span className="ai-message__cursor" />}</p>
				</div>

				{/* Product cards */}
				{done && products && products.length > 0 && (
					<div className="ai-message__cards">
						{products.map((p: any) => (
							<AiProductCard key={p._id} product={p} />
						))}
					</div>
				)}

				{/* Event cards */}
				{done && events && events.length > 0 && (
					<div className="ai-message__cards">
						{events.map((e: any) => (
							<AiEventCard key={e._id} event={e} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
