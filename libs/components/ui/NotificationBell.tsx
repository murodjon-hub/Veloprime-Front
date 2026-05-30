import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
	const [open, setOpen] = useState(false);
	const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotification();

	const handleBellClick = () => setOpen((prev) => !prev);

	return (
		<div className="notif-bell" style={{ position: 'relative' }}>
			{/* Bell button */}
			<motion.button
				className="notif-bell__btn"
				onClick={handleBellClick}
				whileTap={{ scale: 0.88 }}
				aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
				aria-expanded={open}
			>
				<Bell size={17} />

				{/* Unread badge */}
				<AnimatePresence>
					{unreadCount > 0 && (
						<motion.span
							className="notif-bell__badge"
							key="badge"
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{    scale: 0, opacity: 0 }}
							transition={{ type: 'spring', stiffness: 500, damping: 28 }}
						>
							{unreadCount > 99 ? '99+' : unreadCount}
						</motion.span>
					)}
				</AnimatePresence>

				{/* Pulse ring when there are unread notifications */}
				{unreadCount > 0 && <span className="notif-bell__pulse" />}
			</motion.button>

			{/* Dropdown panel */}
			<NotificationDropdown
				open={open}
				notifications={notifications}
				unreadCount={unreadCount}
				onClose={() => setOpen(false)}
				onMarkRead={markRead}
				onMarkAllRead={markAllRead}
				onDismiss={dismiss}
			/>
		</div>
	);
};

export default NotificationBell;
