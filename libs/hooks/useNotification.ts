import { useEffect, useCallback } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { notificationsVar, unreadCountVar, AppNotification, userVar } from '../../apollo/store';
import { addSocketListener } from './useSocket';
import {
	GET_MY_NOTIFICATIONS,
	GET_UNREAD_NOTIFICATION_COUNT,
} from '../../apollo/user/query';
import {
	MARK_NOTIFICATION_READ,
	MARK_ALL_NOTIFICATIONS_READ,
	REMOVE_NOTIFICATION,
} from '../../apollo/user/mutation';
import { T } from '../types/common';

/* ─────────────────────────────────────────────
   Map raw socket payload → AppNotification
───────────────────────────────────────────── */
function socketPayloadToNotification(data: Record<string, unknown>): AppNotification {
	return {
		_id:               (data._id as string)               ?? String(Date.now()),
		notificationType:  (data.notificationType as string)  ?? 'SYSTEM',
		notificationGroup: (data.notificationGroup as string) ?? 'SYSTEM',
		notificationTitle: (data.notificationTitle as string) ?? 'New notification',
		notificationDesc:  data.notificationDesc as string    ?? undefined,
		notificationStatus: 'WAIT',
		authorId:          (data.authorId as string)          ?? '',
		receiverId:        (data.receiverId as string)        ?? '',
		productId:         data.productId  as string          ?? undefined,
		articleId:         data.articleId  as string          ?? undefined,
		isRead:            false,
		createdAt:         (data.createdAt as string)         ?? new Date().toISOString(),
	};
}

/* ─────────────────────────────────────────────
   Main hook
───────────────────────────────────────────── */
export function useNotification() {
	const notifications = useReactiveVar(notificationsVar);
	const unreadCount   = useReactiveVar(unreadCountVar);
	const user          = useReactiveVar(userVar);

	/* ── Apollo mutations ── */
	const [markReadMutation]    = useMutation(MARK_NOTIFICATION_READ);
	const [markAllReadMutation] = useMutation(MARK_ALL_NOTIFICATIONS_READ);
	const [removeMutation]      = useMutation(REMOVE_NOTIFICATION);

	/* ── Fetch unread count from server on mount (initialises badge) ── */
	useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
		skip: !user._id,
		fetchPolicy: 'network-only',
		onCompleted: (data: T) => {
			const count = data?.getUnreadNotificationCount ?? 0;
			unreadCountVar(count);
		},
	});

	/* ── Fetch the 10 most recent notifications for the dropdown ── */
	useQuery(GET_MY_NOTIFICATIONS, {
		skip: !user._id,
		variables: { input: { page: 1, limit: 10 } },
		fetchPolicy: 'network-only',
		onCompleted: (data: T) => {
			const list: AppNotification[] = (data?.getMyNotifications?.list ?? []).map(
				(n: any): AppNotification => ({
					...n,
					isRead: n.notificationStatus === 'READ',
				}),
			);
			notificationsVar(list);
			unreadCountVar(data?.getMyNotifications?.unreadCount ?? 0);
		},
	});

	/* ── Live WebSocket event → update badge + prepend to list ── */
	useEffect(() => {
		if (!user._id) return;

		const remove = addSocketListener('notification', (data) => {
			const incoming = socketPayloadToNotification(data);

			// Prepend; keep list capped at 50
			notificationsVar([incoming, ...notificationsVar()].slice(0, 50));
			unreadCountVar(unreadCountVar() + 1);
		});

		return remove;
	}, [user._id]);

	/* ── Mark one notification as read ── */
	const markRead = useCallback(
		async (id: string) => {
			// Optimistic update
			notificationsVar(
				notificationsVar().map((n) =>
					n._id === id ? { ...n, isRead: true, notificationStatus: 'READ' } : n,
				),
			);
			unreadCountVar(Math.max(0, unreadCountVar() - 1));

			try {
				await markReadMutation({ variables: { input: id } });
			} catch (e) {
				console.warn('[useNotification] markRead failed:', e);
				// Revert optimistic update
				notificationsVar(
					notificationsVar().map((n) =>
						n._id === id ? { ...n, isRead: false, notificationStatus: 'WAIT' } : n,
					),
				);
				unreadCountVar(unreadCountVar() + 1);
			}
		},
		[markReadMutation],
	);

	/* ── Mark all as read ── */
	const markAllRead = useCallback(async () => {
		const prev = notificationsVar();
		// Optimistic
		notificationsVar(
			prev.map((n) => ({ ...n, isRead: true, notificationStatus: 'READ' })),
		);
		unreadCountVar(0);

		try {
			await markAllReadMutation();
		} catch (e) {
			console.warn('[useNotification] markAllRead failed:', e);
			notificationsVar(prev);
			unreadCountVar(prev.filter((n) => !n.isRead).length);
		}
	}, [markAllReadMutation]);

	/* ── Delete / dismiss one notification ── */
	const dismiss = useCallback(
		async (id: string) => {
			const prev     = notificationsVar();
			const filtered = prev.filter((n) => n._id !== id);

			// Optimistic
			notificationsVar(filtered);
			unreadCountVar(filtered.filter((n) => !n.isRead).length);

			try {
				await removeMutation({ variables: { input: id } });
			} catch (e) {
				console.warn('[useNotification] dismiss failed:', e);
				notificationsVar(prev);
				unreadCountVar(prev.filter((n) => !n.isRead).length);
			}
		},
		[removeMutation],
	);

	return { notifications, unreadCount, markRead, markAllRead, dismiss };
}
