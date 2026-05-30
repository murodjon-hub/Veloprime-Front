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
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_PRODUCT_BY_ADMIN, UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { ProductPanelList } from '../../../libs/components/admin/properties/PropertyList';
import { ProductStatus, ProductType } from '../../../libs/enums/product/product';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';

const TABS: { label: string; value: string }[] = [
	{ label: 'All',     value: 'ALL'     },
	{ label: 'Active',  value: 'ACTIVE'  },
	{ label: 'Sold',    value: 'SOLD'    },
	{ label: 'Hidden',  value: 'HIDDEN'  },
	{ label: 'Deleted', value: 'DELETED' },
];

const AdminProducts: NextPage = ({ initialInquiry }: any) => {
	const [inquiry, setInquiry] = useState(initialInquiry);
	const [activeTab, setActiveTab] = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [typeFilter, setTypeFilter] = useState('ALL');

	const [updateProductByAdmin] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const [removeProductByAdmin] = useMutation(REMOVE_PRODUCT_BY_ADMIN);

	const { data, loading, refetch } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
	});

	const products = data?.getAllProductsByAdmin?.list ?? [];
	const total    = data?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0;

	const applyTab = (tab: string) => {
		setActiveTab(tab);
		const search: any = {};
		if (tab !== 'ALL') search.productStatus = tab;
		if (typeFilter !== 'ALL') search.productType = typeFilter;
		setInquiry({ ...inquiry, page: 1, search });
	};

	const applyType = (type: string) => {
		setTypeFilter(type);
		const search: any = {};
		if (activeTab !== 'ALL') search.productStatus = activeTab;
		if (type !== 'ALL') search.productType = type;
		setInquiry({ ...inquiry, page: 1, search });
	};

	const handleSearch = (e: React.KeyboardEvent) => {
		if (e.key !== 'Enter') return;
		const search: any = {};
		if (activeTab !== 'ALL') search.productStatus = activeTab;
		if (typeFilter !== 'ALL') search.productType = typeFilter;
		if (searchText) search.text = searchText;
		setInquiry({ ...inquiry, page: 1, search });
	};

	const updateProductHandler = async (updateData: { _id: string; productStatus: string }) => {
		try {
			await updateProductByAdmin({ variables: { input: updateData } });
			await refetch({ input: inquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const removeProductHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Permanently remove this product?')) {
				await removeProductByAdmin({ variables: { input: id } });
				await refetch({ input: inquiry });
			}
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component="div" className="content">
			{/* Header */}
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
				<Box component="div">
					<Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>Product Management</Typography>
					<Typography sx={{ fontSize: 12, color: '#aaa', mt: 0.3 }}>{total} total listings</Typography>
				</Box>
			</Stack>

			<Box component="div" className="table-wrap">
				{/* Status tabs */}
				<List className="tab-menu">
					{TABS.map(({ label, value }) => (
						<ListItem
							key={value}
							onClick={() => applyTab(value)}
							className={activeTab === value ? 'li on' : 'li'}
							sx={{ cursor: 'pointer' }}
						>
							{label}
						</ListItem>
					))}
				</List>
				<Divider />

				{/* Search + filter bar */}
				<Stack direction="row" alignItems="center" gap={2} sx={{ p: '16px 20px' }}>
					<TextField
						size="small"
						placeholder="Search products…"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						onKeyDown={handleSearch}
						InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#bbb' }} /></InputAdornment> }}
						sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
					/>
					<Select
						size="small"
						value={typeFilter}
						onChange={(e) => applyType(e.target.value)}
						sx={{ minWidth: 160, borderRadius: 2 }}
					>
						<MenuItem value="ALL">All Types</MenuItem>
						{Object.values(ProductType).map((t) => (
							<MenuItem key={t} value={t}>{t}</MenuItem>
						))}
					</Select>
				</Stack>
				<Divider />

				<ProductPanelList
					products={products}
					updateProductHandler={updateProductHandler}
					removeProductHandler={removeProductHandler}
				/>

				<TablePagination
					rowsPerPageOptions={[10, 20, 40, 60]}
					component="div"
					count={total}
					rowsPerPage={inquiry.limit}
					page={inquiry.page - 1}
					onPageChange={(_e, newPage) => setInquiry({ ...inquiry, page: newPage + 1 })}
					onRowsPerPageChange={(e) => setInquiry({ ...inquiry, page: 1, limit: parseInt(e.target.value, 10) })}
				/>
			</Box>
		</Box>
	);
};

AdminProducts.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default withAdminLayout(AdminProducts);
