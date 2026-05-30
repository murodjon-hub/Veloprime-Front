import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Send } from 'lucide-react';
import { useAiChat } from '../../hooks/useAiChat';
import { AiMessage } from './AiMessage';
import { AiTyping } from './AiTyping';
import { AiEmptyState } from './AiEmptyState';

interface Props {
	onClose: () => void;
}

export function AiChatWindow({ onClose }: Props) {
	const { messages, isTyping, sendMessage, clearChat } = useAiChat();
	const [input, setInput] = useState('');
	const bottomRef   = useRef<HTMLDivElement>(null);
	const inputRef    = useRef<HTMLTextAreaElement>(null);
	const lastAiId    = [...messages].reverse().find((m) => m.role === 'assistant')?.id;

	// Auto-scroll on new messages or typing
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isTyping]);

	// Focus input on open
	useEffect(() => {
		setTimeout(() => inputRef.current?.focus(), 120);
	}, []);

	const submit = () => {
		const text = input.trim();
		if (!text || isTyping) return;
		setInput('');
		sendMessage(text);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
	};

	return (
		<motion.div
			className="ai-window"
			initial={{ opacity: 0, scale: 0.94, y: 24 }}
			animate={{ opacity: 1, scale: 1,    y: 0  }}
			exit={{    opacity: 0, scale: 0.94, y: 24 }}
			transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
		>
			{/* Header */}
			<div className="ai-window__header">
				<div className="ai-window__header-left">
					<div className="ai-window__header-avatar">VP</div>
					<div>
						<p className="ai-window__header-name">VeloPrime AI</p>
						<p className="ai-window__header-status">
							<span className="ai-window__status-dot" />
							Cycling Concierge
						</p>
					</div>
				</div>
				<div className="ai-window__header-actions">
					{messages.length > 0 && (
						<button className="ai-window__icon-btn" onClick={clearChat} title="Clear chat">
							<Trash2 size={14} />
						</button>
					)}
					<button className="ai-window__icon-btn" onClick={onClose} title="Close">
						<X size={16} />
					</button>
				</div>
			</div>

			{/* Messages */}
			<div className="ai-window__messages">
				{messages.length === 0 ? (
					<AiEmptyState onSelect={(p) => { setInput(p); setTimeout(submit, 0); sendMessage(p); }} />
				) : (
					<>
						{messages.map((msg) => (
							<AiMessage
								key={msg.id}
								message={msg}
								animate={msg.id === lastAiId && msg.role === 'assistant'}
							/>
						))}
						{isTyping && <AiTyping />}
					</>
				)}
				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<div className="ai-window__input-area">
				<textarea
					ref={inputRef}
					className="ai-window__input"
					placeholder="Ask about bikes, events, gear…"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={onKeyDown}
					rows={1}
					maxLength={500}
				/>
				<button
					className={`ai-window__send-btn${input.trim() && !isTyping ? ' active' : ''}`}
					onClick={submit}
					disabled={!input.trim() || isTyping}
				>
					<Send size={15} />
				</button>
			</div>
		</motion.div>
	);
}
