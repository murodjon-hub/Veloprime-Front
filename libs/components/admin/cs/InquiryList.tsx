import React, { useState } from 'react';
import {
	Avatar, Box, Fade, IconButton, Menu, MenuItem,
	Table, TableBody, TableCell, TableContainer,
	TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { getImageUrl } from '../../../utils';
import { StatusBadge } from '../shared/StatusBadge';

const COLS = ['QUESTION', 'AUTHOR', 'STATUS', 'DATE', ''];

const INQUIRY_STATUSES = ['PENDING', 'ANSWERED', 'CLOSED'];

export interface InquiryItem {
	_id: string;
	inquiryTitle: string;
	inquiryStatus: string;
	createdAt: string;
	memberData?: { _id: string; memberNick: string; memberImage: string };
}

interface Props {
	items: InquiryItem[];
	updateHandler: (data: { _id: string; inquiryStatus: string }) => void;
	removeHandler: (id: string) => void;
}

export function InquiryList({ items, updateHandler, removeHandler }: Props) {
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
					{items.length === 0 && (
						<TableRow>
							<TableCell colSpan={5} align="center" sx={{ py: 6, color: '#bbb', fontSize: 13 }}>
								No inquiries found
							</TableCell>
						</TableRow>
					)}

					{items.map((item) => {
						const isClosed = item.inquiryStatus === 'CLOSED';
						return (
							<TableRow key={item._id} hover sx={{ '& td': { borderBottom: '1px solid #f9f9f9', py: 1.2 } }}>

								<TableCell sx={{ maxWidth: 340 }}>
									<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
										{item.inquiryTitle}
									</Typography>
									<Typography sx={{ fontSize: 11, color: '#aaa' }}>{item._id.slice(-8)}</Typography>
								</TableCell>

								<TableCell>
									<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Avatar
											src={getImageUrl(item.memberData?.memberImage, '/img/profile/defaultUser.svg')}
											sx={{ width: 26, height: 26 }}
										/>
										<Typography sx={{ fontSize: 12, color: '#374151' }}>
											{item.memberData?.memberNick ?? '—'}
										</Typography>
									</Box>
								</TableCell>

								<TableCell><StatusBadge status={item.inquiryStatus} /></TableCell>

								<TableCell>
									<Typography sx={{ fontSize: 12, color: '#374151' }}>
										{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
									</Typography>
								</TableCell>

								<TableCell align="right">
									{isClosed ? (
										<Tooltip title="Permanently remove">
											<IconButton size="small" onClick={() => removeHandler(item._id)} sx={{ color: '#dc2626' }}>
												<DeleteForeverIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									) : (
										<IconButton size="small" onClick={(e) => open(e, item._id, item.inquiryStatus)} sx={{ color: '#9ca3af' }}>
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
				{INQUIRY_STATUSES.filter(s => s !== anchor?.status).map(status => (
					<MenuItem
						key={status}
						onClick={() => { updateHandler({ _id: anchor!.id, inquiryStatus: status }); close(); }}
						sx={{ fontSize: 13, py: 1 }}
					>
						Set&nbsp;<StatusBadge status={status} />
					</MenuItem>
				))}
			</Menu>
		</TableContainer>
	);
}
