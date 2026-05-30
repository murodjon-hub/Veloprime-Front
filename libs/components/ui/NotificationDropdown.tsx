import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellOff, CheckCheck } from 'lucide-react';
import NotificationItem from './NotificationItem';
import { AppNotification } from '../../../apollo/store';

interface NotificationDropdownProps {
	open: boolean;
	notifications: AppNotification[];
	unreadCount: number;
	onClose: () => void;
	onMarkRead: (id: string) => void;
	onMarkAllRead: () => void;
	onDismiss: (id: string) => void;
}

const NotificationDropdown = ({
	open,
	notifications,
	unreadCount,
	onClose,
	onMarkRead,
	onMarkAllRead,
	onDismiss,
}: NotificationDropdownProps) => {
	const ref = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		const handle = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) onClose();
		};
		document.addEventListener('mousedown', handle);
		return () => document.removeEventListener('mousedown', handle);
	}, [open, onClose]);

	// Close on Escape
	useEffect(() => {
		if (!open) return;
		const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
		document.addEventListener('keydown', handle);
		return () => document.removeEventListener('keydown', handle);
	}, [open, onClose]);

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					ref={ref}
					className="notif-dropdown"
					initial={{ opacity: 0, y: -8, scale: 0.97 }}
					animate={{ opacity: 1, y: 0,  scale: 1     }}
					exit={{    opacity: 0, y: -8, scale: 0.97  }}
					transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
				>
					{/* Header */}
					<div className="notif-dropdown__header">
						<span className="notif-dropdown__title">
							Notifications
							{unreadCount > 0 && (
								<span className="notif-dropdown__count">{unreadCount}</span>
							)}
						</span>
						{unreadCount > 0 && (
							<button
								className="notif-dropdown__mark-all"
								onClick={onMarkAllRead}
								title="Mark all as read"
							>
								<CheckCheck size={14} />
								Mark all read
							</button>
						)}
					</div>

					{/* List */}
					<div className="notif-dropdown__list">
						<AnimatePresence initial={false}>
							{notifications.length === 0 ? (
								<motion.div
									className="notif-dropdown__empty"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
								>
									<BellOff size={32} color="#d4d4d4" />
									<p>You're all caught up</p>
								</motion.div>
							) : (
								notifications.map((n) => (
									<NotificationItem
										key={n._id}
										notification={n}
										onMarkRead={onMarkRead}
										onDismiss={onDismiss}
									/>
								))
							)}
						</AnimatePresence>
					</div>

					{/* Footer */}
					{notifications.length > 0 && (
						<div className="notif-dropdown__footer">
							<button className="notif-dropdown__view-all" onClick={onClose}>
								View all notifications
							</button>
						</div>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default NotificationDropdown;
