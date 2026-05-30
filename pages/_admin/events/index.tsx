import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box, Divider, InputAdornment, List, ListItem,
	Stack, TablePagination, TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_EVENTS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_EVENT_BY_ADMIN, UPDATE_EVENT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { EventPanelList } from '../../../libs/components/admin/events/EventList';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';

const TABS = [
	{ label: 'All',       value: 'ALL'       },
	{ label: 'Upcoming',  value: 'UPCOMING'  },
	{ label: 'Ongoing',   value: 'ONGOING'   },
	{ label: 'Completed', value: 'COMPLETED' },
	{ label: 'Cancelled', value: 'CANCELLED' },
];

const AdminEvents: NextPage = ({ initialInquiry }: any) => {
	const [inquiry,    setInquiry]    = useState(initialInquiry);
	const [activeTab,  setActiveTab]  = useState('ALL');
	const [searchText, setSearchText] = useState('');

	const [updateEventByAdmin] = useMutation(UPDATE_EVENT_BY_ADMIN);
	const [removeEventByAdmin] = useMutation(REMOVE_EVENT_BY_ADMIN);

	const { data, refetch } = useQuery(GET_ALL_EVENTS_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
	});

	const events = data?.getAllEventsByAdmin?.list ?? [];
	const total  = data?.getAllEventsByAdmin?.metaCounter?.[0]?.total ?? 0;

	const buildSearch = (tab = activeTab, text = searchText) => {
		const s: any = {};
		if (tab !== 'ALL') s.eventStatus = tab;
		if (text)          s.text        = text;
		return s;
	};

	const applyTab = (tab: string) => {
		setActiveTab(tab);
		setInquiry({ ...inquiry, page: 1, search: buildSearch(tab) });
	};

	const handleSearch = (e: React.KeyboardEvent) => {
		if (e.key !== 'Enter') return;
		setInquiry({ ...inquiry, page: 1, search: buildSearch(activeTab, searchText) });
	};

	const updateEventHandler = async (updateData: { _id: string; eventStatus: string }) => {
		try {
			await updateEventByAdmin({ variables: { input: updateData } });
			await refetch({ input: inquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const removeEventHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Permanently delete this event?')) {
				await removeEventByAdmin({ variables: { input: id } });
				await refetch({ input: inquiry });
			}
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component="div" className="content">
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
				<Box component="div">
					<Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Event Management</Typography>
					<Typography sx={{ fontSize: 12, color: '#aaa', mt: 0.3 }}>{total} total events</Typography>
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
						placeholder="Search events…"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={handleSearch}
						InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#bbb' }} /></InputAdornment> }}
						sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
					/>
				</Stack>
				<Divider />

				<EventPanelList
					events={events}
					updateEventHandler={updateEventHandler}
					removeEventHandler={removeEventHandler}
				/>

				<TablePagination
					rowsPerPageOptions={[10, 20, 40, 60]}
					component="div"
					count={total}
					rowsPerPage={inquiry.limit}
					page={inquiry.page - 1}
					onPageChange={(_e, p) => setInquiry({ ...inquiry, page: p + 1 })}
					onRowsPerPageChange={(e) => setInquiry({ ...inquiry, page: 1, limit: parseInt(e.target.value, 10) })}
				/>
			</Box>
		</Box>
	);
};

AdminEvents.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default withAdminLayout(AdminEvents);
