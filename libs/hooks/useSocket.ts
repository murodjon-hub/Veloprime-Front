import { useEffect, useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import {
	socketVar,
	chatMessagesVar,
	chatOnlineCountVar,
	pushChatMessage,
	ChatMessage,
} from '../../apollo/store';
import { getJwtToken } from '../auth';

type SocketEventHandler = (data: any) => void;

/* ─────────────────────────────────────────────
   Global event handler registry
   Allows multiple hooks to subscribe to specific
   WebSocket event names without each creating
   their own socket.
───────────────────────────────────────────── */
const globalHandlers = new Map<string, Set<SocketEventHandler>>();

export function addSocketListener(event: string, handler: SocketEventHandler): () => void {
	if (!globalHandlers.has(event)) globalHandlers.set(event, new Set());
	globalHandlers.get(event)!.add(handler);
	return () => globalHandlers.get(event)?.delete(handler);
}

/* ─────────────────────────────────────────────
   Chat socket hook (preserved from original)
───────────────────────────────────────────── */
interface UseSocketReturn {
	sendMessage: (text: string) => void;
	isConnected: boolean;
}

export function useSocket(): UseSocketReturn {
	const socket = useReactiveVar(socketVar);

	/* ── Dispatch incoming frames ── */
	useEffect(() => {
		if (!socket) return;

		const handleMessage = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data as string);

				// ── Chat: history on connect
				if (data.event === 'getMessages' && Array.isArray(data.list)) {
					chatMessagesVar(data.list);
					return;
				}

				// ── Chat: join/leave info
				if (data.event === 'info') {
					chatOnlineCountVar(data.totalClients ?? 0);
					if (data.action === 'joined' || data.action === 'left') {
						const infoMsg: ChatMessage = {
							event: 'info',
							action: data.action,
							memberData: data.memberData,
							totalClients: data.totalClients,
							createdAt: new Date().toISOString(),
						};
						pushChatMessage(infoMsg);
					}
					return;
				}

				// ── Chat: new message
				if (data.event === 'message') {
					const msg: ChatMessage = {
						event: 'message',
						text: data.text,
						memberData: data.memberData,
						createdAt: new Date().toISOString(),
					};
					pushChatMessage(msg);
					return;
				}

				// ── All other events — dispatch to global registry
				const handlers = globalHandlers.get(data.event);
				if (handlers) handlers.forEach((fn) => fn(data));

			} catch (e) {
				console.error('[useSocket] parse error', e);
			}
		};

		socket.addEventListener('message', handleMessage);
		return () => socket.removeEventListener('message', handleMessage);
	}, [socket]);

	/* ── Send a chat message ── */
	const sendMessage = useCallback(
		(text: string) => {
			if (!socket || socket.readyState !== WebSocket.OPEN) {
				console.warn('[useSocket] socket not open');
				return;
			}
			socket.send(text);
		},
		[socket],
	);

	return { sendMessage, isConnected: socket?.readyState === WebSocket.OPEN };
}

/* ─────────────────────────────────────────────
   Factory — open the WebSocket connection.
   Called once on app mount (see _app.tsx).
───────────────────────────────────────────── */
const WS_URL = process.env.NEXT_PUBLIC_API_WS ?? 'ws://localhost:3009';

export function openSocket(): WebSocket {
	const existing = socketVar();
	if (existing && existing.readyState <= WebSocket.OPEN) return existing;

	const token = getJwtToken();
	const url   = token ? `${WS_URL}?token=${token}` : WS_URL;
	const ws    = new WebSocket(url);

	ws.onopen  = () => { socketVar(ws); };
	ws.onclose = () => { socketVar(null); };
	ws.onerror = (e) => console.warn('[Socket] error', e);

	socketVar(ws);
	return ws;
}
