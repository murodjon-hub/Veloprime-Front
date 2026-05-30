import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AiChatWindow } from './AiChatWindow';

export function AiLauncher() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<AnimatePresence>
				{open && (
					<div className="ai-launcher__window-wrap">
						<AiChatWindow onClose={() => setOpen(false)} />
					</div>
				)}
			</AnimatePresence>

			<motion.button
				className={`ai-launcher__btn${open ? ' ai-launcher__btn--open' : ''}`}
				onClick={() => setOpen((p) => !p)}
				whileHover={{ scale: 1.06 }}
				whileTap={{ scale: 0.94 }}
				title="VeloPrime AI"
			>
				{/* Pulse ring — only when closed */}
				{!open && (
					<motion.span
						className="ai-launcher__pulse"
						animate={{ scale: [1, 1.55, 1], opacity: [0.55, 0, 0.55] }}
						transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
					/>
				)}
				<span className="ai-launcher__icon">
					{open ? (
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
							<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					) : (
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 2a10 10 0 0 1 10 10c0 4.42-2.87 8.17-6.84 9.49L12 22l-3.16-.51C4.87 20.17 2 16.42 2 12A10 10 0 0 1 12 2z"/>
							<circle cx="8.5" cy="12.5" r="1"/><circle cx="12" cy="12.5" r="1"/><circle cx="15.5" cy="12.5" r="1"/>
						</svg>
					)}
				</span>
				{!open && <span className="ai-launcher__label">Ask AI</span>}
			</motion.button>
		</>
	);
}
