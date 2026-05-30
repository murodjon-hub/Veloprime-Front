import React, { useState } from 'react';
import Link from 'next/link';
import {
	Avatar, Box, Fade, IconButton, Menu, MenuItem,
	Table, TableBody, TableCell, TableContainer,
	TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { BoardArticle } from '../../../types/board-article/board-article';
import { BoardArticleStatus } from '../../../enums/board-article.enum';
import { getImageUrl } from '../../../utils';
import { StatusBadge } from '../shared/StatusBadge';

const COLS = ['ARTICLE', 'CATEGORY', 'AUTHOR', 'VIEWS', 'LIKES', 'DATE', 'STATUS', ''];
const ALL_STATUSES = Object.values(BoardArticleStatus);

interface Props {
	articles: BoardArticle[];
	updateArticleHandler: (data: { _id: string; articleStatus: string }) => void;
	removeArticleHandler: (id: string) => void;
}

export function CommunityArticleList({ articles, updateArticleHandler, removeArticleHandler }: Props) {
	const [anchor, setAnchor] = useState<null | { el: HTMLElement; id: string; status: string }>(null);

	const open  = (e: React.MouseEvent<HTMLButtonElement>, id: string, status: string) =>
		setAnchor({ el: e.currentTarget, id, status });
	const close = () => setAnchor(null);

	return (
		<TableContainer>
			<Table size="medium" sx={{ minWidth: 750 }}>
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
					{articles.length === 0 && (
						<TableRow>
							<TableCell colSpan={8} align="center" sx={{ py: 6, color: '#bbb', fontSize: 13 }}>
								No articles found
							</TableCell>
						</TableRow>
					)}

					{articles.map((a) => {
						const isDeleted = a.articleStatus === BoardArticleStatus.DELETE;
						const dateStr   = a.createdAt
							? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
							: '—';

						return (
							<TableRow key={a._id} hover sx={{ '& td': { borderBottom: '1px solid #f9f9f9', py: 1.2 } }}>

								{/* Article title */}
								<TableCell sx={{ maxWidth: 260 }}>
									{a.articleStatus === BoardArticleStatus.ACTIVE ? (
										<Link
											href={`/community/detail?articleCategory=${a.articleCategory}&id=${a._id}`}
											style={{ textDecoration: 'none' }}
										>
											<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', '&:hover': { color: '#e92c28' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
												{a.articleTitle}
											</Typography>
										</Link>
									) : (
										<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
											{a.articleTitle}
										</Typography>
									)}
									<Typography sx={{ fontSize: 11, color: '#aaa' }}>{a._id.slice(-8)}</Typography>
								</TableCell>

								{/* Category */}
								<TableCell><StatusBadge status={a.articleCategory} /></TableCell>

								{/* Author */}
								<TableCell>
									<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<Avatar
											src={getImageUrl(a.memberData?.memberImage, '/img/profile/defaultUser.svg')}
											sx={{ width: 26, height: 26 }}
										/>
										<Typography sx={{ fontSize: 12, color: '#374151' }}>
											{a.memberData?.memberNick ?? '—'}
										</Typography>
									</Box>
								</TableCell>

								{/* Views */}
								<TableCell>
									<Typography sx={{ fontSize: 12, color: '#6b7280' }}>{a.articleViews ?? 0}</Typography>
								</TableCell>

								{/* Likes */}
								<TableCell>
									<Typography sx={{ fontSize: 12, color: '#6b7280' }}>{a.articleLikes ?? 0}</Typography>
								</TableCell>

								{/* Date */}
								<TableCell>
									<Typography sx={{ fontSize: 12, color: '#374151' }}>{dateStr}</Typography>
								</TableCell>

								{/* Status */}
								<TableCell><StatusBadge status={a.articleStatus} /></TableCell>

								{/* Actions */}
								<TableCell align="right">
									{isDeleted ? (
										<Tooltip title="Permanently remove">
											<IconButton
												size="small"
												onClick={() => removeArticleHandler(a._id)}
												sx={{ color: '#dc2626' }}
											>
												<DeleteForeverIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									) : (
										<IconButton
											size="small"
											onClick={(e) => open(e, a._id, a.articleStatus)}
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
						onClick={() => { updateArticleHandler({ _id: anchor!.id, articleStatus: status }); close(); }}
						sx={{ fontSize: 13, py: 1 }}
					>
						Set&nbsp;<StatusBadge status={status} />
					</MenuItem>
				))}
			</Menu>
		</TableContainer>
	);
}
