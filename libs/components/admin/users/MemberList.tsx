import React, { useState } from 'react';
import {
	Avatar, Box, Fade, IconButton, Menu, MenuItem,
	Table, TableBody, TableCell, TableContainer,
	TableHead, TableRow, Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Member } from '../../../types/member/member';
import { getImageUrl } from '../../../utils';
import { MemberStatus, MemberType } from '../../../enums/member.enum';
import { StatusBadge } from '../shared/StatusBadge';

const COLS = ['MEMBER', 'FULL NAME', 'PHONE', 'TYPE', 'WARNS', 'STATUS', ''];

const STATUS_ACTIONS = [MemberStatus.ACTIVE, MemberStatus.BLOCK, MemberStatus.DELETE];
const TYPE_ACTIONS   = [MemberType.USER, MemberType.MEMBER, MemberType.AGENT, MemberType.ADMIN];

interface Props {
	members: Member[];
	updateMemberHandler: (data: { _id: string; [key: string]: any }) => void;
}

export function MemberPanelList({ members, updateMemberHandler }: Props) {
	const [anchor, setAnchor] = useState<null | { el: HTMLElement; member: Member }>(null);

	const open  = (e: React.MouseEvent<HTMLButtonElement>, member: Member) =>
		setAnchor({ el: e.currentTarget, member });
	const close = () => setAnchor(null);

	const act = (update: { _id: string; [key: string]: any }) => {
		updateMemberHandler(update);
		close();
	};

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
					{members.length === 0 && (
						<TableRow>
							<TableCell colSpan={7} align="center" sx={{ py: 6, color: '#bbb', fontSize: 13 }}>
								No members found
							</TableCell>
						</TableRow>
					)}

					{members.map((m) => (
						<TableRow key={m._id} hover sx={{ '& td': { borderBottom: '1px solid #f9f9f9', py: 1.2 } }}>

							{/* Member */}
							<TableCell>
								<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
									<Avatar
										src={getImageUrl(m.memberImage, '/img/profile/defaultUser.svg')}
										sx={{ width: 36, height: 36 }}
									/>
									<Box component="div">
										<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{m.memberNick}</Typography>
										<Typography sx={{ fontSize: 11, color: '#aaa' }}>{m._id.slice(-8)}</Typography>
									</Box>
								</Box>
							</TableCell>

							{/* Full name */}
							<TableCell>
								<Typography sx={{ fontSize: 12, color: '#374151' }}>{m.memberFullName || '—'}</Typography>
							</TableCell>

							{/* Phone */}
							<TableCell>
								<Typography sx={{ fontSize: 12, color: '#374151' }}>{m.memberPhone}</Typography>
							</TableCell>

							{/* Type */}
							<TableCell><StatusBadge status={m.memberType} /></TableCell>

							{/* Warnings */}
							<TableCell>
								<Typography
									sx={{
										fontSize: 12, fontWeight: 600,
										color: m.memberWarnings > 0 ? '#dc2626' : '#9ca3af',
									}}
								>
									{m.memberWarnings ?? 0}
								</Typography>
							</TableCell>

							{/* Status */}
							<TableCell><StatusBadge status={m.memberStatus} /></TableCell>

							{/* Actions */}
							<TableCell align="right">
								<IconButton size="small" onClick={(e) => open(e, m)} sx={{ color: '#9ca3af' }}>
									<MoreVertIcon fontSize="small" />
								</IconButton>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Action menu */}
			<Menu
				anchorEl={anchor?.el}
				open={Boolean(anchor)}
				onClose={close}
				TransitionComponent={Fade}
				PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 180 } }}
			>
				{anchor && (
					<>
						<MenuItem disabled sx={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, letterSpacing: 0.5, py: 0.5 }}>
							SET STATUS
						</MenuItem>
						{STATUS_ACTIONS.filter(s => s !== anchor.member.memberStatus).map(s => (
							<MenuItem key={s} onClick={() => act({ _id: anchor.member._id, memberStatus: s })} sx={{ fontSize: 13, py: 0.8 }}>
								<StatusBadge status={s} />
							</MenuItem>
						))}
						<MenuItem disabled sx={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, letterSpacing: 0.5, py: 0.5, mt: 0.5 }}>
							SET ROLE
						</MenuItem>
						{TYPE_ACTIONS.filter(t => t !== anchor.member.memberType).map(t => (
							<MenuItem key={t} onClick={() => act({ _id: anchor.member._id, memberType: t })} sx={{ fontSize: 13, py: 0.8 }}>
								<StatusBadge status={t} />
							</MenuItem>
						))}
					</>
				)}
			</Menu>
		</TableContainer>
	);
}
