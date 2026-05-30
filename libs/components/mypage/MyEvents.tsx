import React, { useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, MenuItem, Pagination, Select, Typography } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_MY_EVENTS } from '../../../apollo/user/query';
import { DELETE_EVENT, UPDATE_EVENT } from '../../../apollo/user/mutation';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { getImageUrl } from '../../utils';
import { Event } from '../../types/event/event';
import { T } from '../../types/common';
import AddIcon from '@mui/icons-material/Add';

const STATUS_OPTIONS = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

const MyEvents: NextPage = ({ initialInput }: any) => {
	const [query, setQuery] = useState<T>(initialInput);
	const [events, setEvents] = useState<Event[]>([]);
	const [total, setTotal] = useState(0);
	const router = useRouter();

	const [updateEvent] = useMutation(UPDATE_EVENT);
	const [deleteEvent] = useMutation(DELETE_EVENT);

	const { refetch } = useQuery(GET_MY_EVENTS, {
		fetchPolicy: 'network-only',
		variables: { input: query },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setEvents(data?.getMyEvents?.list ?? []);
			setTotal(data?.getMyEvents?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const filterByStatus = (status: string | null) => setQuery({ ...query, page: 1, eventStatus: status ?? undefined });
	const paginationHandler = (_: any, value: number) => setQuery({ ...query, page: value });

	const changeStatusHandler = async (eventId: string, newStatus: string) => {
		try {
			await updateEvent({ variables: { input: { _id: eventId, eventStatus: newStatus } } });
			await sweetTopSmallSuccessAlert('Status updated!', 700);
			await refetch({ input: query });
		} catch (err) {
			sweetErrorHandling(err).then();
		}
	};

	const deleteHandler = async (eventId: string) => {
		try {
			if (await sweetConfirmAlert('Delete this event? This cannot be undone.')) {
				await deleteEvent({ variables: { input: eventId } });
				await sweetTopSmallSuccessAlert('Event deleted.', 700);
				await refetch({ input: query });
			}
		} catch (err) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<div id="my-events-page">
			{/* Header */}
			<Box component="div" className="myev-header">
				<Typography className="myev-header__title">My Events</Typography>
				<Button
					className="myev-header__create-btn"
					variant="contained"
					startIcon={<AddIcon sx={{ fontSize: 14 }} />}
					onClick={() => router.push('/events/create')}
				>
					Create Event
				</Button>
			</Box>

			{/* Status filter tabs */}
			<Box component="div" className="myev-tabs">
				<span
					className={`myev-tab${!query.eventStatus ? ' active' : ''}`}
					onClick={() => filterByStatus(null)}
				>
					All
				</span>
				{STATUS_OPTIONS.map((s) => (
					<span
						key={s}
						className={`myev-tab${query.eventStatus === s ? ' active' : ''}`}
						onClick={() => filterByStatus(s)}
					>
						{s.charAt(0) + s.slice(1).toLowerCase()}
					</span>
				))}
			</Box>

			{/* Table */}
			{events.length === 0 ? (
				<Box component="div" className="no-data">
					<img src="/img/icons/icoAlert.svg" alt="" />
					<p>No events found. Create your first event!</p>
				</Box>
			) : (
				<Box component="div" className="myev-table">
					{/* Head */}
					<Box component="div" className="myev-table__head">
						<Typography className="myev-table__head-cell">Event</Typography>
						<Typography className="myev-table__head-cell">Route</Typography>
						<Typography className="myev-table__head-cell">Date</Typography>
						<Typography className="myev-table__head-cell">Riders</Typography>
						<Typography className="myev-table__head-cell">Status</Typography>
						<Typography className="myev-table__head-cell">Actions</Typography>
					</Box>

					{/* Rows */}
					{events.map((ev: Event) => (
						<Box component="div" key={ev._id} className="myev-table__row">
							{/* Name + image */}
							<Box
								component="div"
								className="myev-table__name-cell"
								onClick={() => router.push(`/events/${ev._id}`)}
							>
								<img
									src={getImageUrl(ev.eventImage, '/img/banner/header1.svg')}
									alt={ev.eventTitle}
								/>
								<Typography className="myev-table__name">{ev.eventTitle}</Typography>
							</Box>

							{/* Route */}
							<Typography className="myev-table__cell" noWrap>
								{ev.fromLocation} → {ev.toLocation}
							</Typography>

							{/* Date */}
							<Typography className="myev-table__cell">
								{new Date(ev.eventDate).toLocaleDateString('en-US', {
									month: 'short', day: 'numeric', year: 'numeric',
								})}
							</Typography>

							{/* Participants */}
							<Typography className="myev-table__participants">
								{ev.currentParticipants} / {ev.maxParticipants}
							</Typography>

							{/* Status dropdown */}
							<Box component="div">
								<Select
									size="small"
									value={ev.eventStatus}
									onChange={(e) => changeStatusHandler(ev._id, e.target.value)}
									renderValue={(v) => (
										<Typography className={`myev-table__status myev-table__status--${v}`}>
											{(v as string).charAt(0) + (v as string).slice(1).toLowerCase()}
										</Typography>
									)}
									sx={{ fontSize: 12, minWidth: 110, '.MuiOutlinedInput-notchedOutline': { border: 'none' }, background: 'transparent' }}
								>
									{STATUS_OPTIONS.map((s) => (
										<MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
											{s.charAt(0) + s.slice(1).toLowerCase()}
										</MenuItem>
									))}
								</Select>
							</Box>

							{/* Actions */}
							<Box component="div" className="myev-table__actions">
								<Button
									className="myev-table__action-btn"
									variant="outlined"
									size="small"
									onClick={() => router.push(`/events/${ev._id}`)}
								>
									View
								</Button>
								<Button
									className="myev-table__action-btn"
									variant="outlined"
									color="error"
									size="small"
									onClick={() => deleteHandler(ev._id)}
								>
									Delete
								</Button>
							</Box>
						</Box>
					))}
				</Box>
			)}

			{/* Pagination */}
			{total > query.limit && (
				<Box component="div" className="myev-pagination">
					<Pagination
						count={Math.ceil(total / query.limit)}
						page={query.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Typography>{total} event{total !== 1 ? 's' : ''}</Typography>
				</Box>
			)}
		</div>
	);
};

MyEvents.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
	},
};

export default MyEvents;
