import React, { useState } from 'react';
import { NextPage } from 'next';
import { Box, Pagination, Typography } from '@mui/material';
import { T } from '../../types/common';
import { useQuery } from '@apollo/client';
import { GET_FAVORITES } from '../../../apollo/user/query';
import ProductCard, { Product } from '../product/ProductCard';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const MyFavorites: NextPage = () => {
	const [myFavorites, setMyFavorites] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<{ page: number; limit: number }>({ page: 1, limit: 8 });

	useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFavorites },
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setMyFavorites(data.getFavorites?.list ?? []);
			setTotal(data.getFavorites?.metaCounter?.[0]?.total || 0);
		},
	});

	const paginationHandler = (_: T, value: number) => setSearchFavorites({ ...searchFavorites, page: value });

	return (
		<div id="my-favorites-page">
			<Box component="div" className="favorites-header">
				<h2>Liked Bikes</h2>
				<span>{total} bike{total !== 1 ? 's' : ''}</span>
			</Box>

			{myFavorites.length === 0 ? (
				<Box component="div" sx={{ py: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
					<FavoriteBorderIcon sx={{ fontSize: 48, color: '#e0e0e0' }} />
					<Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#111' }}>
						No liked bikes yet
					</Typography>
					<Typography sx={{ fontSize: 13, color: '#9a9a96' }}>
						Tap the heart on any bike to save it here.
					</Typography>
				</Box>
			) : (
				<Box component="div" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', mb: '8px' }}>
					{myFavorites.map((product: Product) => (
						<ProductCard key={product._id} product={product} />
					))}
				</Box>
			)}

			{total > searchFavorites.limit && (
				<Box component="div" className="pagination-config">
					<Pagination
						count={Math.ceil(total / searchFavorites.limit)}
						page={searchFavorites.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Box component="div" className="total-result">
						<p>{total} bike{total !== 1 ? 's' : ''} liked</p>
					</Box>
				</Box>
			)}
		</div>
	);
};

export default MyFavorites;
