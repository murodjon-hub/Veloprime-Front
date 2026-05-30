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
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { CommunityArticleList } from '../../../libs/components/admin/community/CommunityArticleList';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';

const TABS = [
	{ label: 'All',     value: 'ALL'                     },
	{ label: 'Active',  value: BoardArticleStatus.ACTIVE  },
	{ label: 'Deleted', value: BoardArticleStatus.DELETE  },
];

const AdminCommunity: NextPage = ({ initialInquiry }: any) => {
	const [inquiry,      setInquiry]      = useState(initialInquiry);
	const [activeTab,    setActiveTab]    = useState('ALL');
	const [searchText,   setSearchText]   = useState('');
	const [categoryFilter, setCategoryFilter] = useState('ALL');

	const [updateBoardArticleByAdmin] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeBoardArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

	const { data, refetch } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
	});

	const articles = data?.getAllBoardArticlesByAdmin?.list ?? [];
	const total    = data?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total ?? 0;

	const buildSearch = (tab = activeTab, cat = categoryFilter, text = searchText) => {
		const s: any = {};
		if (tab !== 'ALL') s.articleStatus   = tab as BoardArticleStatus;
		if (cat !== 'ALL') s.articleCategory = cat as BoardArticleCategory;
		if (text)          s.text            = text;
		return s;
	};

	const applyTab = (tab: string) => {
		setActiveTab(tab);
		setInquiry({ ...inquiry, page: 1, search: buildSearch(tab) });
	};

	const applyCategory = (cat: string) => {
		setCategoryFilter(cat);
		setInquiry({ ...inquiry, page: 1, search: buildSearch(activeTab, cat) });
	};

	const handleSearch = (e: React.KeyboardEvent) => {
		if (e.key !== 'Enter') return;
		setInquiry({ ...inquiry, page: 1, search: buildSearch(activeTab, categoryFilter, searchText) });
	};

	const updateArticleHandler = async (updateData: { _id: string; articleStatus: string }) => {
		try {
			await updateBoardArticleByAdmin({ variables: { input: updateData } });
			await refetch({ input: inquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const removeArticleHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Permanently remove this article?')) {
				await removeBoardArticleByAdmin({ variables: { input: id } });
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
					<Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Article Management</Typography>
					<Typography sx={{ fontSize: 12, color: '#aaa', mt: 0.3 }}>{total} total articles</Typography>
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
						placeholder="Search articles…"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={handleSearch}
						InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#bbb' }} /></InputAdornment> }}
						sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
					/>
					<Select size="small" value={categoryFilter} onChange={(e) => applyCategory(e.target.value)} sx={{ minWidth: 160, borderRadius: 2 }}>
						<MenuItem value="ALL">All Categories</MenuItem>
						{Object.values(BoardArticleCategory).map((cat) => (
							<MenuItem key={cat} value={cat}>{cat}</MenuItem>
						))}
					</Select>
				</Stack>
				<Divider />

				<CommunityArticleList
					articles={articles}
					updateArticleHandler={updateArticleHandler}
					removeArticleHandler={removeArticleHandler}
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

AdminCommunity.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default withAdminLayout(AdminCommunity);
