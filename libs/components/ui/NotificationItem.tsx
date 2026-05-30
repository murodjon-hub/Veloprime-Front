import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, UserPlus, CheckCircle, XCircle, Bell, X } from 'lucide-react';
import { AppNotification } from '../../../apollo/store';
import { getImageUrl } from '../../utils';

interface NotificationItemProps {
	notification: AppNotification;
	onMarkRead: (id: string) => void;
	onDismiss: (id: string) => void;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
	LIKE_PRODUCT:     <Heart    size={14} color="#e63946" fill="#e63946" />,
	LIKE_ARTICLE:     <Heart    size={14} color="#e63946" fill="#e63946" />,
	COMMENT_PRODUCT:  <MessageCircle size={14} color="#3b82f6" />,
	COMMENT_ARTICLE:  <MessageCircle size={14} color="#3b82f6" />,
	FOLLOW_MEMBER:    <UserPlus size={14} color="#8b5cf6" />,
	MESSAGE_RECEIVED: <MessageCircle size={14} color="#10b981" />,
	PRODUCT_APPROVED: <CheckCircle   size={14} color="#22c55e" />,
	PRODUCT_REJECTED: <XCircle       size={14} color="#ef4444" />,
	SYSTEM:           <Bell          size={14} color="#f59e0b" />,
};

const TYPE_COLOR: Record<string, string> = {
	LIKE_PRODUCT:     'rgba(230,57,70,0.12)',
	LIKE_ARTICLE:     'rgba(230,57,70,0.12)',
	COMMENT_PRODUCT:  'rgba(59,130,246,0.12)',
	COMMENT_ARTICLE:  'rgba(59,130,246,0.12)',
	FOLLOW_MEMBER:    'rgba(139,92,246,0.12)',
	MESSAGE_RECEIVED: 'rgba(16,185,129,0.12)',
	PRODUCT_APPROVED: 'rgba(34,197,94,0.12)',
	PRODUCT_REJECTED: 'rgba(239,68,68,0.12)',
	SYSTEM:           'rgba(245,158,11,0.12)',
};

function timeAgo(dateStr: string): string {
	const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
	if (diff < 60)  return 'just now';
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

const NotificationItem = ({ notification, onMarkRead, onDismiss }: NotificationItemProps) => {
	const { _id, notificationType, notificationTitle, notificationDesc, isRead, createdAt, authorData } = notification;
	const icon  = TYPE_ICON[notificationType]  ?? <Bell size={14} color="#737373" />;
	const color = TYPE_COLOR[notificationType] ?? 'rgba(0,0,0,0.06)';

	return (
		<motion.div
			className={`notif-item${isRead ? '' : ' notif-item--unread'}`}
			initial={{ opacity: 0, x: -8 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 8 }}
			transition={{ duration: 0.2 }}
			onClick={() => !isRead && onMarkRead(_id)}
		>
			{/* Icon bubble */}
			<div className="notif-item__icon" style={{ background: color }}>
				{icon}
			</div>

			{/* Content */}
			<div className="notif-item__content">
				{authorData && (
					<img
						className="notif-item__avatar"
						src={getImageUrl(authorData.memberImage, '/img/profile/defaultUser.svg')}
						alt={authorData.memberNick}
					/>
				)}
				<div className="notif-item__text">
					<p className="notif-item__title">{notificationTitle}</p>
					{notificationDesc && (
						<p className="notif-item__desc">{notificationDesc}</p>
					)}
					<span className="notif-item__time">{timeAgo(createdAt)}</span>
				</div>
			</div>

			{/* Unread dot + dismiss */}
			<div className="notif-item__right">
				{!isRead && <span className="notif-item__dot" />}
				<button
					className="notif-item__dismiss"
					onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDismiss(_id); }}
					aria-label="Dismiss"
				>
					<X size={12} />
				</button>
			</div>
		</motion.div>
	);
};

export default NotificationItem;
