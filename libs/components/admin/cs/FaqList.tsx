import React, { useState } from 'react';
import {
	Box, Fade, IconButton, Menu, MenuItem,
	Table, TableBody, TableCell, TableContainer,
	TableHead, TableRow, Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { NoticeStatus } from '../../../enums/notice.enum';
import { StatusBadge } from '../shared/StatusBadge';

const COLS = ['QUESTION', 'CATEGORY', 'STATUS', 'DATE', ''];
const ALL_STATUSES = Object.values(NoticeStatus);

export interface FaqItem {
	_id: string;
	noticeTitle: string;
	noticeCategory: string;
	noticeStatus: string;
	createdAt: string;
}

interface Props {
	items: FaqItem[];
	updateHandler: (data: { _id: string; noticeStatus: string }) => void;
	removeHandler: (id: string) => void;
}

export function FaqArticlesPanelList({ items, updateHandler, removeHandler }: Props) {
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
								No FAQ entries found
							</TableCell>
						</TableRow>
					)}

					{items.map((item) => (
						<TableRow key={item._id} hover sx={{ '& td': { borderBottom: '1px solid #f9f9f9', py: 1.2 } }}>

							<TableCell sx={{ maxWidth: 340 }}>
								<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
									{item.noticeTitle}
								</Typography>
								<Typography sx={{ fontSize: 11, color: '#aaa' }}>{item._id.slice(-8)}</Typography>
							</TableCell>

							<TableCell><StatusBadge status={item.noticeCategory} /></TableCell>

							<TableCell><StatusBadge status={item.noticeStatus} /></TableCell>

							<TableCell>
								<Typography sx={{ fontSize: 12, color: '#374151' }}>
									{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
								</Typography>
							</TableCell>

							<TableCell align="right">
								<Box component="div" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
									<IconButton
										size="small"
										onClick={(e) => open(e, item._id, item.noticeStatus)}
										sx={{ color: '#9ca3af' }}
									>
										<MoreVertIcon fontSize="small" />
									</IconButton>
								</Box>
							</TableCell>
						</TableRow>
					))}
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
						onClick={() => { updateHandler({ _id: anchor!.id, noticeStatus: status }); close(); }}
						sx={{ fontSize: 13, py: 1 }}
					>
						Set&nbsp;<StatusBadge status={status} />
					</MenuItem>
				))}
				<MenuItem
					onClick={() => { removeHandler(anchor!.id); close(); }}
					sx={{ fontSize: 13, py: 1, color: '#dc2626' }}
				>
					Remove permanently
				</MenuItem>
			</Menu>
		</TableContainer>
	);
}
