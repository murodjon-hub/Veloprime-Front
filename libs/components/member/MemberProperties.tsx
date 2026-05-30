import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Pagination, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';
import { getImageUrl } from '../../utils';
import { Product } from '../product/ProductCard';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';

const MemberProperties: NextPage = ({ initialInput }: any) => {
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState({ ...initialInput });
	const [bikes, setBikes] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);

	const { loading } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setBikes(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (memberId) {
			setSearchFilter((prev: any) => ({
				...prev,
				search: { ...prev.search, memberId: memberId as string },
			}));
		}
	}, [memberId]);

	const paginationHandler = (_: any, value: number) => setSearchFilter((p: any) => ({ ...p, page: value }));

	if (loading) {
		return (
			<Box component="div" className="member-bikes">
				<Box component="div" sx={{ p: '40px 0', textAlign: 'center', color: '#999', fontSize: 14 }}>Loading bikes…</Box>
			</Box>
		);
	}

	if (bikes.length === 0) {
		return (
			<Box component="div" className="member-bikes">
				<Box component="div" className="member-bikes__empty">
					<DirectionsBikeIcon sx={{ fontSize: 48, color: '#e0e0e0' }} />
					<Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#111', mt: 1 }}>
						No bikes listed
					</Typography>
					<p>This rider hasn't listed any bikes yet.</p>
				</Box>
			</Box>
		);
	}

	return (
		<Box component="div" className="member-bikes">
			{/* Header */}
			<Box component="div" className="member-bikes__header">
				<h2>Bikes for Sale</h2>
				<span>{total} listing{total !== 1 ? 's' : ''}</span>
			</Box>

			{/* Grid */}
			<Box component="div" className="member-bikes__grid">
				{bikes.map((bike: Product) => (
					<Box
						component="div"
						key={bike._id}
						className="member-bikes__card"
						onClick={() => router.push(`/products/${bike._id}`)}
					>
						<img
							src={getImageUrl(bike.productImages?.[0], '/img/placeholder-bike.png')}
							alt={bike.productName}
							className="member-bikes__img"
						/>
						<Box component="div" className="member-bikes__body">
							<Box component="div" className="member-bikes__name">{bike.productName}</Box>
							<Box component="div" className="member-bikes__price">${bike.productPrice?.toLocaleString()}</Box>
							<Box component="div" className="member-bikes__meta">
								<Box component="div" className={`member-bikes__status member-bikes__status--${bike.productStatus}`}>
									{bike.productStatus}
								</Box>
								<Box component="div" className="member-bikes__type">{bike.productType}</Box>
							</Box>
						</Box>
					</Box>
				))}
			</Box>

			{/* Pagination */}
			{total > searchFilter.limit && (
				<Box component="div" className="member-bikes__pagination">
					<Pagination
						count={Math.ceil(total / searchFilter.limit)}
						page={searchFilter.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Typography>{total} bike{total !== 1 ? 's' : ''} listed</Typography>
				</Box>
			)}
		</Box>
	);
};

MemberProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: { memberId: '' },
	},
};

export default MemberProperties;
