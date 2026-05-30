import React, { useState } from 'react';
import { NextPage } from 'next';
import { Box, Pagination, Typography } from '@mui/material';
import { T } from '../../types/common';
import { useQuery } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import ProductCard, { Product } from '../product/ProductCard';
import HistoryIcon from '@mui/icons-material/History';

const RecentlyVisited: NextPage = () => {
	const [recentlyVisited, setRecentlyVisited] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<{ page: number; limit: number }>({ page: 1, limit: 8 });

	useQuery(GET_VISITED, {
		fetchPolicy: 'network-only',
		variables: { input: searchVisited },
		onCompleted(data: T) {
			setRecentlyVisited(data.getVisited?.list ?? []);
			setTotal(data.getVisited?.metaCounter?.[0]?.total || 0);
		},
	});

	const paginationHandler = (_: T, value: number) => setSearchVisited({ ...searchVisited, page: value });

	return (
		<div id="my-favorites-page">
			<Box component="div" className="favorites-header">
				<h2>Recently Viewed</h2>
				<span>{total} bike{total !== 1 ? 's' : ''}</span>
			</Box>

			{recentlyVisited.length === 0 ? (
				<Box component="div" sx={{ py: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
					<HistoryIcon sx={{ fontSize: 48, color: '#e0e0e0' }} />
					<Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#111' }}>
						No bikes viewed yet
					</Typography>
					<Typography sx={{ fontSize: 13, color: '#9a9a96' }}>
						Bikes you browse will appear here.
					</Typography>
				</Box>
			) : (
				<Box component="div" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', mb: '8px' }}>
					{recentlyVisited.map((product: Product) => (
						<ProductCard key={product._id} product={product} />
					))}
				</Box>
			)}

			{total > searchVisited.limit && (
				<Box component="div" className="pagination-config">
					<Pagination
						count={Math.ceil(total / searchVisited.limit)}
						page={searchVisited.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Box component="div" className="total-result">
						<p>{total} bike{total !== 1 ? 's' : ''} viewed</p>
					</Box>
				</Box>
			)}
		</div>
	);
};

export default RecentlyVisited;
