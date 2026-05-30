import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Box, Typography, Button, Container, Rating,
	CircularProgress, Stack, Pagination, Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StraightenIcon from '@mui/icons-material/Straighten';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_EVENTS } from '../../apollo/user/query';
import { JOIN_EVENT, LEAVE_EVENT } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { Event } from '../../libs/types/event/event';
import { MemberType } from '../../libs/enums/member.enum';
import { getImageUrl } from '../../libs/utils';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Swal from 'sweetalert2';

const TABS = [
	{ label: 'All',       value: null },
	{ label: 'Upcoming',  value: 'UPCOMING' },
	{ label: 'Ongoing',   value: 'ONGOING' },
	{ label: 'Completed', value: 'COMPLETED' },
];

const EventsPage: NextPage = ({ initialInput }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [activeTab, setActiveTab] = useState<string | null>('UPCOMING');
	const [search, setSearch] = useState({ ...initialInput, eventStatus: 'UPCOMING' });
	const [events, setEvents] = useState<Event[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [localCounts, setLocalCounts] = useState<Record<string, number>>({});
	const [localParticipants, setLocalParticipants] = useState<Record<string, string[]>>({});
	const [loadingId, setLoadingId] = useState<string | null>(null);

	const { loading, refetch } = useQuery(GET_EVENTS, {
		fetchPolicy: 'network-only',
		variables: { input: search },
		notifyOnNetworkStatusChange: true,
		onCompleted(data) {
			setEvents(data?.getEvents?.list ?? []);
			setTotalCount(data?.getEvents?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const [joinEvent] = useMutation(JOIN_EVENT);
	const [leaveEvent] = useMutation(LEAVE_EVENT);

	const getParticipants = (event: Event): string[] =>
		localParticipants[event._id] ?? (event as any).eventParticipants ?? [];

	const isJoined = (event: Event): boolean =>
		!!user?._id && getParticipants(event).includes(user._id as string);

	const tabHandler = (value: string | null) => {
		setActiveTab(value);
		const next = { ...search, page: 1 };
		if (value) next.eventStatus = value;
		else delete next.eventStatus;
		setSearch(next);
	};

	const paginationHandler = (_: any, value: number) => {
		setSearch({ ...search, page: value });
	};

	const formatDate = (iso: string) => {
		try {
			return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
		} catch {
			return iso;
		}
	};

	const displayDate = (eventDate: string) =>
		eventDate.includes('T') ? formatDate(eventDate) : eventDate;

	const handleJoin = async (event: Event) => {
		if (!user?._id) {
			router.push('/account/join?referrer=/events');
			return;
		}

		if (isJoined(event)) {
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

			setLoadingId(event._id);
			try {
				const { data } = await leaveEvent({ variables: { input: event._id } });
				const updated = data?.leaveEvent;
				if (updated) {
					setLocalCounts((p) => ({ ...p, [event._id]: updated.currentParticipants }));
					setLocalParticipants((p) => ({ ...p, [event._id]: updated.eventParticipants ?? [] }));
				}
				Swal.fire({ title: 'Left', text: `You left ${event.eventTitle}.`, icon: 'info', background: '#1a1a1a', color: '#fff', showConfirmButton: false, timer: 1800 });
			} catch (err: any) {
				Swal.fire({ title: 'Error', text: err?.message ?? 'Could not leave.', icon: 'error', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
			} finally {
				setLoadingId(null);
			}
			return;
		}

		const result = await Swal.fire({
			title: `Join ${event.eventTitle}?`,
			html: `<div style="text-align:left;font-size:14px;color:#fff">
				<p><strong>Route:</strong> ${event.fromLocation} → ${event.toLocation}</p>
				<p><strong>Distance:</strong> ${event.distance}</p>
				<p><strong>Date:</strong> ${displayDate(event.eventDate)}</p>
				<p><strong>Spots left:</strong> ${event.maxParticipants - (localCounts[event._id] ?? event.currentParticipants)}</p>
			</div>`,
			icon: 'question',
			showCancelButton: true,
			confirmButtonText: 'Join now!',
			cancelButtonColor: '#d33',
			background: '#1a1a1a',
			color: '#ffffff',
		});
		if (!result.isConfirmed) return;

		setLoadingId(event._id);
		try {
			const { data } = await joinEvent({ variables: { input: event._id } });
			const updated = data?.joinEvent;
			if (updated) {
				setLocalCounts((p) => ({ ...p, [event._id]: updated.currentParticipants }));
				setLocalParticipants((p) => ({ ...p, [event._id]: updated.eventParticipants ?? [] }));
			}
			Swal.fire({ title: 'Joined!', text: `You joined ${event.eventTitle}!`, icon: 'success', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
		} catch (err: any) {
			const msg = err?.message ?? '';
			if (msg.includes('already joined')) {
				Swal.fire({ title: 'Already joined', text: 'You are already registered.', icon: 'info', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
			} else {
				Swal.fire({ title: 'Error', text: msg || 'Could not join.', icon: 'error', background: '#1a1a1a', color: '#fff', timer: 2000, showConfirmButton: false });
			}
		} finally {
			setLoadingId(null);
		}
	};

	const handleCreateEvent = () => {
		const type = user?.memberType as MemberType | undefined;
		if (!user?._id) {
			router.push('/account/join?referrer=/events/create');
		} else if (type === MemberType.MEMBER || type === MemberType.ADMIN) {
			router.push('/events/create');
		} else {
			Swal.fire({
				title: 'Members Only',
				text: 'Upgrade to a Member account to create events.',
				icon: 'info',
				confirmButtonText: 'Become a Member',
				showCancelButton: true,
				background: '#1a1a1a',
				color: '#fff',
			}).then((r) => { if (r.isConfirmed) router.push('/mypage?category=myProfile'); });
		}
	};

	return (
		<Box component="div" className="events-page">
			<Box component="div" className="events-page__hero">
				<Container maxWidth="lg">
					<Typography className="events-page__hero-label">Cycling Community</Typography>
					<Typography variant="h1" className="events-page__hero-title">
						UPCOMING EVENTS
					</Typography>
					<Typography className="events-page__hero-sub">
						Join rides, meet fellow cyclists and push your limits
					</Typography>
					<Button
						className="events-page__create-btn"
						startIcon={<AddIcon />}
						onClick={handleCreateEvent}
					>
						Create Event
					</Button>
				</Container>
			</Box>

			<Container maxWidth="lg" className="events-page__body">
				{/* Tabs */}
				<Box component="div" className="events-page__tabs">
					{TABS.map((tab) => (
						<Chip
							key={tab.label}
							label={tab.label}
							clickable
							onClick={() => tabHandler(tab.value)}
							className={`events-page__tab${activeTab === tab.value ? ' active' : ''}`}
						/>
					))}
				</Box>

				{/* Grid */}
				{loading ? (
					<Box component="div" sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
						<CircularProgress />
					</Box>
				) : events.length === 0 ? (
					<Box component="div" className="events-page__empty">
						<img src="/img/icons/icoAlert.svg" alt="" />
						<Typography>No events found</Typography>
					</Box>
				) : (
					<Box component="div" className="events-page__grid">
						{events.map((event) => {
							const participants = localCounts[event._id] ?? event.currentParticipants;
							const spotsLeft = event.maxParticipants - participants;
							const isFull = spotsLeft <= 0;
							const joined = isJoined(event);
							const isLoading = loadingId === event._id;

							return (
								<Box
									component="div"
									key={event._id}
									className="events-page__card"
									onClick={() => router.push(`/events/${event._id}`)}
								>
									<Box component="div" className="events-page__card-img-wrap">
										<img
											src={getImageUrl(event.eventImage)}
											alt={event.eventTitle}
											className="events-page__card-img"
										/>
										<Box component="div" className="events-page__card-status">
											{event.eventStatus}
										</Box>
										<Box component="div" className="events-page__card-distance">
											<StraightenIcon sx={{ fontSize: 13 }} />
											{event.distance}
										</Box>
									</Box>

									<Box component="div" className="events-page__card-body">
										<Typography className="events-page__card-title">
											{event.eventTitle}
										</Typography>
										<Typography className="events-page__card-desc">
											{event.eventDesc?.slice(0, 100)}…
										</Typography>

										<Box component="div" className="events-page__card-route">
											<LocationOnIcon sx={{ fontSize: 15 }} />
											<Typography>{event.fromLocation} → {event.toLocation}</Typography>
										</Box>

										<Box component="div" className="events-page__card-meta">
											<Box component="div" className="events-page__card-meta-item">
												<CalendarTodayIcon sx={{ fontSize: 13 }} />
												<Typography>{displayDate(event.eventDate)}</Typography>
											</Box>
											<Box component="div" className="events-page__card-meta-item">
												<GroupIcon sx={{ fontSize: 13 }} />
												<Typography>{participants}/{event.maxParticipants} riders</Typography>
											</Box>
										</Box>

										<Box component="div" className="events-page__card-footer">
											<Box component="div" className="events-page__card-rating">
												<Rating value={event.rating} precision={0.5} readOnly size="small" />
												<Typography>{event.rating?.toFixed(1)}</Typography>
											</Box>
											<Button
												className={`events-page__card-btn${isFull && !joined ? ' full' : ''}${joined ? ' joined' : ''}`}
												disabled={isLoading || (isFull && !joined)}
												onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleJoin(event); }}
											>
												{isLoading ? '...' : joined ? '✓ Joined' : isFull ? 'Full' : 'Join'}
											</Button>
										</Box>
									</Box>
								</Box>
							);
						})}
					</Box>
				)}

				{/* Pagination */}
				{totalCount > search.limit && (
					<Stack className="events-page__pagination">
						<Pagination
							count={Math.ceil(totalCount / search.limit)}
							page={search.page}
							shape="circular"
							color="primary"
							onChange={paginationHandler}
						/>
						<Typography>Total {totalCount} event(s)</Typography>
					</Stack>
				)}
			</Container>
		</Box>
	);
};

EventsPage.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		eventStatus: 'UPCOMING',
	},
};

export default withLayoutBasic(EventsPage);
