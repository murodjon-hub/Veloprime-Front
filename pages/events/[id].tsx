import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Box, Typography, Button, Container, Rating,
	CircularProgress, Chip, Stack,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StraightenIcon from '@mui/icons-material/Straighten';
import GroupIcon from '@mui/icons-material/Group';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_EVENT } from '../../apollo/user/query';
import { JOIN_EVENT, LEAVE_EVENT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { Event } from '../../libs/types/event/event';
import { getImageUrl } from '../../libs/utils';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Swal from 'sweetalert2';

const EventDetailPage: NextPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const user = useReactiveVar(userVar);
	const [event, setEvent] = useState<Event | null>(null);
	const [joined, setJoined] = useState(false);
	const [participantCount, setParticipantCount] = useState(0);
	const [actionLoading, setActionLoading] = useState(false);

	const { loading } = useQuery(GET_EVENT, {
		fetchPolicy: 'network-only',
		variables: { input: id },
		skip: !id,
		onCompleted(data) {
			const e = data?.getEvent;
			if (e) {
				setEvent(e);
				setParticipantCount(e.currentParticipants);
				const parts: string[] = e.eventParticipants ?? [];
				if (user?._id) setJoined(parts.includes(user._id as string));
			}
		},
	});

	const [joinEvent] = useMutation(JOIN_EVENT);
	const [leaveEvent] = useMutation(LEAVE_EVENT);

	const formatDate = (iso: string) => {
		try {
			return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		} catch {
			return iso;
		}
	};

	const displayDate = (d: string) => (d?.includes('T') ? formatDate(d) : d);

	const handleJoin = async () => {
		if (!event) return;

		if (!user?._id) {
			router.push(`/account/join?referrer=/events/${event._id}`);
			return;
		}

		if (joined) {
			const result = await Swal.fire({
				title: 'Leave this event?',
				text: `You are currently registered for ${event.eventTitle}.`,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes, leave',
				cancelButtonColor: '#555',
				confirmButtonColor: '#d33',
				background: '#1a1a1a',
				color: '#ffffff',
			});
			if (!result.isConfirmed) return;

			setActionLoading(true);
			try {
				const { data } = await leaveEvent({ variables: { input: event._id } });
				const updated = data?.leaveEvent;
				if (updated) {
					setParticipantCount(updated.currentParticipants);
					const parts: string[] = updated.eventParticipants ?? [];
					setJoined(parts.includes(user._id as string));
				} else {
					setJoined(false);
				}
				Swal.fire({ title: 'Left', text: `You left ${event.eventTitle}.`, icon: 'info', background: '#1a1a1a', color: '#fff', showConfirmButton: false, timer: 1800 });
			} catch (err: any) {
				Swal.fire({ title: 'Error', text: err?.message ?? 'Could not leave.', icon: 'error', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
			} finally {
				setActionLoading(false);
			}
			return;
		}

		const result = await Swal.fire({
			title: `Join ${event.eventTitle}?`,
			html: `<div style="text-align:left;font-size:14px;color:#fff">
				<p><strong>Route:</strong> ${event.fromLocation} → ${event.toLocation}</p>
				<p><strong>Distance:</strong> ${event.distance}</p>
				<p><strong>Date:</strong> ${displayDate(event.eventDate)}</p>
				<p><strong>Spots left:</strong> ${event.maxParticipants - participantCount}</p>
			</div>`,
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Join now!',
			cancelButtonColor: '#d33',
			background: '#1a1a1a',
			color: '#ffffff',
		});
		if (!result.isConfirmed) return;

		setActionLoading(true);
		try {
			const { data } = await joinEvent({ variables: { input: event._id } });
			const updated = data?.joinEvent;
			if (updated) {
				setParticipantCount(updated.currentParticipants);
				const parts: string[] = updated.eventParticipants ?? [];
				setJoined(parts.includes(user._id as string));
			} else {
				setJoined(true);
			}
			Swal.fire({ title: 'Joined!', icon: 'success', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
		} catch (err: any) {
			const msg = err?.message ?? '';
			if (msg.includes('already joined')) {
				setJoined(true);
				Swal.fire({ title: 'Already joined', text: 'You are already registered for this event.', icon: 'info', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
			} else {
				Swal.fire({ title: 'Error', text: msg || 'Could not join.', icon: 'error', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
			}
		} finally {
			setActionLoading(false);
		}
	};

	if (loading) {
		return (
			<Box component="div" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<CircularProgress />
			</Box>
		);
	}

	if (!event) {
		return (
			<Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
				<Typography variant="h5" color="text.secondary">Event not found.</Typography>
				<Button sx={{ mt: 3 }} onClick={() => router.push('/events')}>Back to Events</Button>
			</Container>
		);
	}

	const isFull = participantCount >= event.maxParticipants;
	const spotsLeft = event.maxParticipants - participantCount;
	const progress = Math.min((participantCount / event.maxParticipants) * 100, 100);

	return (
		<Box component="div" className="event-detail">
			{/* Hero */}
			<Box component="div" className="event-detail__hero">
				<img
					src={getImageUrl(event.eventImage)}
					alt={event.eventTitle}
					className="event-detail__hero-img"
				/>
				<Box component="div" className="event-detail__hero-overlay">
					<Container maxWidth="lg">
						<Button
							className="event-detail__back-btn"
							startIcon={<ArrowBackIcon />}
							onClick={() => router.push('/events')}
						>
							All Events
						</Button>
						<Chip label={event.eventStatus} className="event-detail__status-chip" />
						<Typography variant="h1" className="event-detail__hero-title">
							{event.eventTitle}
						</Typography>
						<Box component="div" className="event-detail__hero-route">
							<LocationOnIcon />
							<Typography>{event.fromLocation} → {event.toLocation}</Typography>
						</Box>
					</Container>
				</Box>
			</Box>

			<Container maxWidth="lg" className="event-detail__body">
				<Stack direction={{ xs: 'column', md: 'row' }} gap={4}>

					{/* Main content */}
					<Box component="div" className="event-detail__main">
						<Typography variant="h5" className="event-detail__section-title">About This Event</Typography>
						<Typography className="event-detail__desc">{event.eventDesc}</Typography>

						<Box component="div" className="event-detail__stats-grid">
							<Box component="div" className="event-detail__stat">
								<StraightenIcon className="event-detail__stat-icon" />
								<Box component="div">
									<Typography className="event-detail__stat-label">Distance</Typography>
									<Typography className="event-detail__stat-value">{event.distance}</Typography>
								</Box>
							</Box>
							<Box component="div" className="event-detail__stat">
								<CalendarTodayIcon className="event-detail__stat-icon" />
								<Box component="div">
									<Typography className="event-detail__stat-label">Date</Typography>
									<Typography className="event-detail__stat-value">{displayDate(event.eventDate)}</Typography>
								</Box>
							</Box>
							<Box component="div" className="event-detail__stat">
								<GroupIcon className="event-detail__stat-icon" />
								<Box component="div">
									<Typography className="event-detail__stat-label">Participants</Typography>
									<Typography className="event-detail__stat-value">{participantCount} / {event.maxParticipants}</Typography>
								</Box>
							</Box>
							<Box component="div" className="event-detail__stat">
								<LocationOnIcon className="event-detail__stat-icon" />
								<Box component="div">
									<Typography className="event-detail__stat-label">Route</Typography>
									<Typography className="event-detail__stat-value">{event.fromLocation} → {event.toLocation}</Typography>
								</Box>
							</Box>
						</Box>

						{/* Capacity bar */}
						<Box component="div" className="event-detail__capacity">
							<Box component="div" className="event-detail__capacity-header">
								<Typography className="event-detail__capacity-label">Capacity</Typography>
								<Typography className="event-detail__capacity-count">
									{spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully booked'}
								</Typography>
							</Box>
							<Box component="div" className="event-detail__capacity-bar">
								<Box component="div" className="event-detail__capacity-fill" sx={{ width: `${progress}%` }} />
							</Box>
						</Box>
					</Box>

					{/* Sidebar */}
					<Box component="div" className="event-detail__sidebar">
						<Box component="div" className="event-detail__card">
							<Rating value={event.rating} precision={0.5} readOnly size="medium" />
							<Typography className="event-detail__rating-num">{event.rating?.toFixed(1)} / 5.0</Typography>

							<Box component="div" className="event-detail__card-divider" />

							<Box component="div" className="event-detail__card-row">
								<Typography className="event-detail__card-label">Status</Typography>
								<Chip label={event.eventStatus} size="small" className="event-detail__status-chip--sm" />
							</Box>
							<Box component="div" className="event-detail__card-row">
								<Typography className="event-detail__card-label">Distance</Typography>
								<Typography className="event-detail__card-val">{event.distance}</Typography>
							</Box>
							<Box component="div" className="event-detail__card-row">
								<Typography className="event-detail__card-label">Spots left</Typography>
								<Typography className="event-detail__card-val">{spotsLeft}</Typography>
							</Box>

							<Button
								fullWidth
								className={`event-detail__join-btn${isFull && !joined ? ' full' : ''}${joined ? ' joined' : ''}`}
								disabled={actionLoading || (isFull && !joined)}
								onClick={handleJoin}
							>
								{actionLoading ? '...' : joined ? '✓ Joined — Leave' : isFull ? 'Fully Booked' : 'Join Event'}
							</Button>

							{!user?._id && (
								<Typography className="event-detail__login-hint">
									<span onClick={() => router.push('/account/join')}>Log in</span> to track your registration
								</Typography>
							)}
						</Box>
					</Box>
				</Stack>
			</Container>
		</Box>
	);
};

export default withLayoutBasic(EventDetailPage);
