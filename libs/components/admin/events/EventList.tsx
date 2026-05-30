import React, { useState } from 'react';
import {
	Avatar, Box, Fade, IconButton, Menu, MenuItem,
	Table, TableBody, TableCell, TableContainer,
	TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Event } from '../../../types/event/event';
import { getImageUrl } from '../../../utils';
import { StatusBadge } from '../shared/StatusBadge';

const COLS = ['EVENT', 'ROUTE', 'DATE', 'PARTICIPANTS', 'ORGANIZER', 'STATUS', ''];
const ALL_STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

interface Props {
	events: (Event & { memberData?: { _id: string; memberNick: string; memberImage: string } })[];
	updateEventHandler: (data: { _id: string; eventStatus: string }) => void;
	removeEventHandler: (id: string) => void;
}

export function EventPanelList({ events, updateEventHandler, removeEventHandler }: Props) {
	const [anchor, setAnchor] = useState<null | { el: HTMLElement; id: string; status: string }>(null);

	const open  = (e: React.MouseEvent<HTMLButtonElement>, id: string, status: string) =>
		setAnchor({ el: e.currentTarget, id, status });
	const close = () => setAnchor(null);

	return (
		<TableContainer>
			<Table size="medium" sx={{ minWidth: 700 }}>
				<TableHead>
					<TableRow sx={{ background: '#fafafa' }}>
						{COLS.map((col) => (
							<TableCell key={col} sx={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 0.5, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
								{col}
							</TableCell>
						))}
					</TableRow>
				</TableHead>

				<TableBody>
					{events.length === 0 && (
						<TableRow>
							<TableCell colSpan={7} align="center" sx={{ py: 6, color: '#bbb', fontSize: 13 }}>
								No events found
							</TableCell>
						</TableRow>
					)}

					{events.map((ev) => {
						const dateStr = ev.eventDate
							? new Date(ev.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
							: '—';
						const isCancelled = ev.eventStatus === 'CANCELLED';

						return (
							<TableRow key={ev._id} hover sx={{ '& td': { borderBottom: '1px solid #f9f9f9', py: 1.2 } }}>

								{/* Event */}
								<TableCell>
									<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
										<Box
											component="img"
											src={getImageUrl(ev.eventImage, '/img/banner/header1.svg')}
											sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'cover', border: '1px solid #f0f0f0', flexShrink: 0 }}
										/>
										<Box component="div">
											<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{ev.eventTitle}</Typography>
											<Typography sx={{ fontSize: 11, color: '#aaa' }}>{ev._id.slice(-8)}</Typography>
										</Box>
									</Box>
								</TableCell>

								{/* Route */}
								<TableCell>
									<Typography sx={{ fontSize: 12, color: '#374151' }}>
										{ev.fromLocation} → {ev.toLocation}
									</Typography>
									{ev.distance && (
										<Typography sx={{ fontSize: 11, color: '#aaa' }}>{ev.distance}</Typography>
									)}
								</TableCell>

								{/* Date */}
								<TableCell>
									<Typography sx={{ fontSize: 12, color: '#374151' }}>{dateStr}</Typography>
								</TableCell>

								{/* Participants */}
								<TableCell>
									<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
										{ev.currentParticipants ?? 0}
										<Typography component="span" sx={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>
											/{ev.maxParticipants ?? '∞'}
										</Typography>
									</Typography>
								</TableCell>

								{/* Organizer */}
								<TableCell>
									<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Avatar
											src={getImageUrl(ev.memberData?.memberImage, '/img/profile/defaultUser.svg')}
											sx={{ width: 26, height: 26 }}
										/>
										<Typography sx={{ fontSize: 12, color: '#374151' }}>
											{ev.memberData?.memberNick ?? '—'}
										</Typography>
									</Box>
								</TableCell>

								{/* Status */}
								<TableCell><StatusBadge status={ev.eventStatus} /></TableCell>

								{/* Actions */}
								<TableCell align="right">
									{isCancelled ? (
										<Tooltip title="Permanently remove">
											<IconButton
												size="small"
												onClick={() => removeEventHandler(ev._id)}
												sx={{ color: '#dc2626' }}
											>
												<DeleteForeverIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									) : (
										<IconButton
											size="small"
											onClick={(e) => open(e, ev._id, ev.eventStatus)}
											sx={{ color: '#9ca3af' }}
										>
											<MoreVertIcon fontSize="small" />
										</IconButton>
									)}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>

			<Menu
				anchorEl={anchor?.el}
				open={Boolean(anchor)}
				onClose={close}
				TransitionComponent={Fade}
				PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 160 } }}
			>
				{ALL_STATUSES.filter(s => s !== anchor?.status).map(status => (
					<MenuItem
						key={status}
						onClick={() => { updateEventHandler({ _id: anchor!.id, eventStatus: status }); close(); }}
						sx={{ fontSize: 13, py: 1 }}
					>
						Set&nbsp;<StatusBadge status={status} />
					</MenuItem>
				))}
			</Menu>
		</TableContainer>
	);
}
