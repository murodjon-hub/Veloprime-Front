import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box, Divider, InputAdornment, List, ListItem,
	MenuItem, Select, Stack, TablePagination,
	TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling } from '../../../libs/sweetAlert';

const TABS = [
	{ label: 'All',     value: 'ALL'    },
	{ label: 'Active',  value: 'ACTIVE' },
	{ label: 'Blocked', value: 'BLOCK'  },
	{ label: 'Deleted', value: 'DELETE' },
];

const AdminUsers: NextPage = ({ initialInquiry }: any) => {
	const [inquiry,    setInquiry]    = useState(initialInquiry);
	const [activeTab,  setActiveTab]  = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [typeFilter, setTypeFilter] = useState('ALL');

	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	const { data, refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
	});

	const members = data?.getAllMembersByAdmin?.list ?? [];
	const total   = data?.getAllMembersByAdmin?.metaCounter?.[0]?.total ?? 0;

	const buildSearch = (tab = activeTab, type = typeFilter, text = searchText) => {
		const s: any = {};
		if (tab !== 'ALL')  s.memberStatus = tab as MemberStatus;
		if (type !== 'ALL') s.memberType   = type as MemberType;
		if (text)           s.text         = text;
		return s;
	};

	const applyTab = (tab: string) => {
		setActiveTab(tab);
		setInquiry({ ...inquiry, page: 1, search: buildSearch(tab) });
	};

	const applyType = (type: string) => {
		setTypeFilter(type);
		setInquiry({ ...inquiry, page: 1, search: buildSearch(activeTab, type) });
	};

	const handleSearch = (e: React.KeyboardEvent) => {
		if (e.key !== 'Enter') return;
		setInquiry({ ...inquiry, page: 1, search: buildSearch(activeTab, typeFilter, searchText) });
	};

	const updateMemberHandler = async (updateData: { _id: string; [key: string]: any }) => {
		try {
			await updateMemberByAdmin({ variables: { input: updateData } });
			await refetch({ input: inquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component="div" className="content">
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
				<Box component="div">
					<Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Member Management</Typography>
					<Typography sx={{ fontSize: 12, color: '#aaa', mt: 0.3 }}>{total} total members</Typography>
				</Box>
			</Stack>

			<Box component="div" className="table-wrap">
				<List className="tab-menu">
					{TABS.map(({ label, value }) => (
						<ListItem key={value} onClick={() => applyTab(value)} className={activeTab === value ? 'li on' : 'li'} sx={{ cursor: 'pointer' }}>
							{label}
						</ListItem>
					))}
				</List>
				<Divider />

				<Stack direction="row" alignItems="center" gap={2} sx={{ p: '16px 20px' }}>
					<TextField
						size="small"
						placeholder="Search by nickname…"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={handleSearch}
						InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#bbb' }} /></InputAdornment> }}
						sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
					/>
					<Select size="small" value={typeFilter} onChange={(e) => applyType(e.target.value)} sx={{ minWidth: 160, borderRadius: 2 }}>
						<MenuItem value="ALL">All Roles</MenuItem>
						<MenuItem value={MemberType.USER}>User</MenuItem>
						<MenuItem value={MemberType.MEMBER}>Member</MenuItem>
						<MenuItem value={MemberType.AGENT}>Agent</MenuItem>
						<MenuItem value={MemberType.ADMIN}>Admin</MenuItem>
					</Select>
				</Stack>
				<Divider />

				<MemberPanelList members={members} updateMemberHandler={updateMemberHandler} />

				<TablePagination
					rowsPerPageOptions={[10, 20, 40, 60]}
					component="div"
					count={total}
					rowsPerPage={inquiry.limit}
					page={inquiry.page - 1}
					onPageChange={(_e: unknown, p: number) => setInquiry({ ...inquiry, page: p + 1 })}
					onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => setInquiry({ ...inquiry, page: 1, limit: parseInt(e.target.value, 10) })}
				/>
			</Box>
		</Box>
	);
};

AdminUsers.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', search: {} },
};

export default withAdminLayout(AdminUsers);
