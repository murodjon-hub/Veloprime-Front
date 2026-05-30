import React, { useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box, Button, Divider, InputAdornment, List, ListItem,
	MenuItem, Select, Stack, TablePagination,
	TextField, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { NoticeList } from '../../../libs/components/admin/cs/NoticeList';
import { NoticeCategory, NoticeStatus } from '../../../libs/enums/notice.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';

const TABS = [
	{ label: 'All',     value: 'ALL'               },
	{ label: 'Active',  value: NoticeStatus.ACTIVE  },
	{ label: 'Hold',    value: NoticeStatus.HOLD    },
	{ label: 'Deleted', value: NoticeStatus.DELETE  },
];

const AdminNotice: NextPage = ({ initialInquiry }: any) => {
	const [inquiry,        setInquiry]        = useState(initialInquiry);
	const [activeTab,      setActiveTab]      = useState('ALL');
	const [searchText,     setSearchText]     = useState('');
	const [categoryFilter, setCategoryFilter] = useState('ALL');

	const items: any[] = [];
	const total        = 0;

	const applyTab = (tab: string) => {
		setActiveTab(tab);
		setInquiry({ ...inquiry, page: 1 });
	};

	const handleSearch = (e: React.KeyboardEvent) => {
		if (e.key !== 'Enter') return;
		setInquiry({ ...inquiry, page: 1 });
	};

	const updateHandler = async (_data: { _id: string; noticeStatus: string }) => {
		try {
			// wire up mutation when backend is ready
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const removeHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Permanently remove this notice?')) {
				// wire up mutation when backend is ready
			}
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component="div" className="content">
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
				<Box component="div">
					<Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Notice Management</Typography>
					<Typography sx={{ fontSize: 12, color: '#aaa', mt: 0.3 }}>{total} total notices</Typography>
				</Box>
				<Button variant="contained" size="small" startIcon={<AddRoundedIcon />}
					sx={{ borderRadius: 2, background: '#1a1a2e', '&:hover': { background: '#e92c28' } }}>
					Add Notice
				</Button>
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
						placeholder="Search notices…"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={handleSearch}
						InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#bbb' }} /></InputAdornment> }}
						sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
					/>
					<Select size="small" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} sx={{ minWidth: 160, borderRadius: 2 }}>
						<MenuItem value="ALL">All Categories</MenuItem>
						{Object.values(NoticeCategory).map((cat) => (
							<MenuItem key={cat} value={cat}>{cat}</MenuItem>
						))}
					</Select>
				</Stack>
				<Divider />

				<NoticeList
					items={items}
					updateHandler={updateHandler}
					removeHandler={removeHandler}
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

AdminNotice.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default withAdminLayout(AdminNotice);
