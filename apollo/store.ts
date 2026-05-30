import { makeVar } from '@apollo/client';
import { CustomJwtPayload } from '../libs/types/customJwtPayload';

/* ─────────────────────────────────────────────
   Auth
───────────────────────────────────────────── */
const EMPTY_USER: CustomJwtPayload = {
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
	memberProducts: 0,
	memberRank: 0,
	memberArticles: 0,
	memberFollowers: 0,
	memberFollowings: 0,
	memberComments: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberWarnings: 0,
	memberBlocks: 0,
};

export const userVar = makeVar<CustomJwtPayload>(EMPTY_USER);
export const EMPTY_USER_STATE = EMPTY_USER;

/* ─────────────────────────────────────────────
   WebSocket
───────────────────────────────────────────── */
export const socketVar = makeVar<WebSocket | null>(null);

/* ─────────────────────────────────────────────
   Chat
───────────────────────────────────────────── */
export interface ChatMessage {
	event: 'message' | 'info';
	text?: string;
	memberData?: {
		_id: string;
		memberNick: string;
		memberImage: string;
	};
	action?: 'joined' | 'left';
	totalClients?: number;
	createdAt: string;
}

export const chatMessagesVar  = makeVar<ChatMessage[]>([]);
export const chatOnlineCountVar = makeVar<number>(0);
export const chatTypingVar    = makeVar<string[]>([]);   // nicks currently typing

/* ─────────────────────────────────────────────
   Notifications
───────────────────────────────────────────── */
export interface AppNotification {
	_id: string;
	notificationType:  string;
	notificationGroup: string;
	notificationTitle: string;
	notificationDesc?: string;
	notificationStatus: string;
	authorId:  string;
	receiverId: string;
	productId?: string;
	articleId?: string;
	isRead: boolean;            // derived: notificationStatus === 'READ'
	createdAt: string;
	authorData?: {
		_id: string;
		memberNick: string;
		memberImage: string;
	};
}

export const notificationsVar = makeVar<AppNotification[]>([]);
export const unreadCountVar   = makeVar<number>(0);

/* ─────────────────────────────────────────────
   UI state
───────────────────────────────────────────── */
export const pageLoadingVar  = makeVar<boolean>(false);
export const drawerOpenVar   = makeVar<boolean>(false);   // mobile nav drawer
export const themeVar        = makeVar<'light' | 'dark'>('light');

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
export function pushChatMessage(msg: ChatMessage): void {
	const current = chatMessagesVar();
	// Keep only last 100 messages in memory
	const next = [...current, msg].slice(-100);
	chatMessagesVar(next);
}

export function markAllNotificationsRead(): void {
	const updated = notificationsVar().map((n) => ({ ...n, isRead: true }));
	notificationsVar(updated);
	unreadCountVar(0);
}
