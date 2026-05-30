import React from 'react';
import { useRouter } from 'next/router';
import { getImageUrl } from '../../utils';

interface Props {
	event: {
		_id: string;
		eventTitle: string;
		eventDate: string;
		eventImage?: string;
		fromLocation?: string;
		toLocation?: string;
		distance?: number;
		eventStatus?: string;
	};
}

export function AiEventCard({ event }: Props) {
	const router  = useRouter();
	const dateStr = event.eventDate
		? new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
		: '';

	return (
		<div
			className="ai-event-card"
			onClick={() => router.push(`/events/${event._id}`)}
		>
			<div className="ai-event-card__img">
				<img
					src={getImageUrl(event.eventImage, '/img/banner/header1.svg')}
					alt={event.eventTitle}
				/>
			</div>
			<div className="ai-event-card__info">
				<p className="ai-event-card__title">{event.eventTitle}</p>
				<span className="ai-event-card__date">{dateStr}</span>
				{event.fromLocation && event.toLocation && (
					<span className="ai-event-card__route">
						{event.fromLocation} → {event.toLocation}
						{event.distance ? ` · ${event.distance}km` : ''}
					</span>
				)}
			</div>
		</div>
	);
}
