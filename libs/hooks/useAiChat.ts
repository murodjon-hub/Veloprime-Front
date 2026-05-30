import { useState, useCallback, useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { ASK_AI } from '../../apollo/ai/mutation';

export interface AiChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: number;
	products?: any[];
	events?: any[];
}

const STORAGE_KEY = 'veloprime:ai_chat';
const MAX_STORED  = 30;

export function useAiChat() {
	const [messages, setMessages] = useState<AiChatMessage[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [error,    setError]    = useState<string | null>(null);
	const apolloClient = useApolloClient();

	// Rehydrate from localStorage on mount
	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) setMessages(JSON.parse(raw).slice(-MAX_STORED));
		} catch {}
	}, []);

	// Persist to localStorage whenever messages change
	useEffect(() => {
		if (!messages.length) return;
		try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED))); } catch {}
	}, [messages]);

	const sendMessage = useCallback(async (text: string) => {
		const prompt = text.trim().slice(0, 1000);
		if (!prompt || isTyping) return;

		setError(null);

		const userMsg: AiChatMessage = {
			id:        `u_${Date.now()}`,
			role:      'user',
			content:   prompt,
			timestamp: Date.now(),
		};

		setMessages((prev) => [...prev, userMsg]);
		setIsTyping(true);

		try {
			const { data, errors } = await apolloClient.mutate({
				mutation:  ASK_AI,
				variables: { input: { prompt } },
			});

			if (errors?.length) throw new Error(errors[0].message);

			const reply = data?.askAi?.reply?.trim() || "I couldn't generate a response. Please try again.";

			const assistantMsg: AiChatMessage = {
				id:        `a_${Date.now()}`,
				role:      'assistant',
				content:   reply,
				timestamp: Date.now(),
			};

			setMessages((prev) => [...prev, assistantMsg]);
		} catch (err: any) {
			const errText = err?.message?.toLowerCase() ?? '';
			const reply =
				errText.includes('rate') || errText.includes('quota')
					? 'Too many requests — please wait a moment before asking again.'
					: "I'm having trouble connecting right now. Please try again in a moment.";

			setError(reply);
			setMessages((prev) => [
				...prev,
				{ id: `e_${Date.now()}`, role: 'assistant', content: reply, timestamp: Date.now() },
			]);
		} finally {
			setIsTyping(false);
		}
	}, [isTyping, apolloClient]);

	const clearChat = useCallback(() => {
		setMessages([]);
		setError(null);
		try { localStorage.removeItem(STORAGE_KEY); } catch {}
	}, []);

	return { messages, isTyping, error, sendMessage, clearChat };
}
