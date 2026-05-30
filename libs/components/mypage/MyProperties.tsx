import React, { useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Chip, Pagination, Typography } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { T } from '../../types/common';
import { ProductStatus } from '../../enums/product/product';
import { Product } from '../product/ProductCard';
import { useRouter } from 'next/router';
import { UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { getImageUrl } from '../../utils';
import AddIcon from '@mui/icons-material/Add';

const STATUS_TABS = [
	{ label: 'Active',  value: ProductStatus.ACTIVE },
	{ label: 'Sold',    value: ProductStatus.SOLD },
	{ label: 'Hidden',  value: ProductStatus.HIDDEN },
];

const MyProperties: NextPage = ({ initialInput }: any) => {
	const [searchFilter, setSearchFilter] = useState<T>(initialInput);
	const [myProducts, setMyProducts] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const router = useRouter();

	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const { refetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMyProducts(data?.getProducts?.list ?? []);
			setTotal(data?.getProducts?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const paginationHandler = (_: T, value: number) => setSearchFilter({ ...searchFilter, page: value });

	const changeStatusHandler = (status: ProductStatus) =>
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, productStatus: status } });

	const deleteProductHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Delete this bike listing?')) {
				await updateProduct({ variables: { input: { _id: id, productStatus: ProductStatus.DELETED } } });
				await refetch({ input: searchFilter });
			}
		} catch (err: any) { await sweetErrorHandling(err); }
	};

	const updateStatusHandler = async (status: ProductStatus, id: string) => {
		try {
			if (await sweetConfirmAlert(`Change status to ${status}?`)) {
				await updateProduct({ variables: { input: { _id: id, productStatus: status } } });
				await refetch({ input: searchFilter });
			}
		} catch (err: any) { await sweetErrorHandling(err); }
	};

	const currentStatus = searchFilter?.search?.productStatus;

	return (
		<Box component="div" id="my-property-page">
			{/* Header */}
			<Box component="div" className="myprop-header">
				<Typography className="myprop-header__title">My Bikes</Typography>
				<Button
					className="myprop-header__add-btn"
					startIcon={<AddIcon sx={{ fontSize: 14 }} />}
					onClick={() => router.push('/products/addproduct')}
				>
					Add Listing
				</Button>
			</Box>

			{/* Status tabs */}
			<Box component="div" className="myprop-tabs">
				{STATUS_TABS.map((tab) => (
					<Chip
						key={tab.value}
						label={tab.label}
						clickable
						onClick={() => changeStatusHandler(tab.value)}
						className={currentStatus === tab.value ? 'active' : ''}
					/>
				))}
			</Box>

			{/* Table */}
			{myProducts.length === 0 ? (
				<Box component="div" className="no-data">
					<img src="/img/icons/icoAlert.svg" alt="" />
					<p>No {currentStatus?.toLowerCase() ?? ''} bikes found.</p>
				</Box>
			) : (
				<Box component="div" className="myprop-table">
					{/* Table head */}
					<Box component="div" className="myprop-table__head">
						<Typography className="myprop-table__head-cell">Bike</Typography>
						<Typography className="myprop-table__head-cell">Price</Typography>
						<Typography className="myprop-table__head-cell">Type</Typography>
						<Typography className="myprop-table__head-cell">Status</Typography>
						<Typography className="myprop-table__head-cell">Actions</Typography>
					</Box>

					{/* Rows */}
					{myProducts.map((product: Product) => (
						<Box component="div" key={product._id} className="myprop-table__row">
							{/* Name + image */}
							<Box
								component="div"
								className="myprop-table__name-cell"
								onClick={() => router.push(`/products/${product._id}`)}
							>
								<img
									src={getImageUrl(product.productImages?.[0], '/img/placeholder-bike.png')}
									alt={product.productName}
								/>
								<Typography className="myprop-table__name">{product.productName}</Typography>
							</Box>

							{/* Price */}
							<Typography className="myprop-table__cell">
								${product.productPrice?.toLocaleString()}
							</Typography>

							{/* Type */}
							<Typography className="myprop-table__cell">{product.productType}</Typography>

							{/* Status badge */}
							<Box component="div">
								<Typography className={`myprop-table__status myprop-table__status--${product.productStatus}`}>
									{product.productStatus}
								</Typography>
							</Box>

							{/* Actions */}
							<Box component="div" className="myprop-table__actions">
								{product.productStatus === ProductStatus.ACTIVE && (
									<>
										<Button
											className="myprop-table__action-btn"
											variant="outlined"
											size="small"
											onClick={() => router.push(`/mypage?category=addProduct&productId=${product._id}`)}
										>
											Edit
										</Button>
										<Button
											className="myprop-table__action-btn"
											variant="outlined"
											color="error"
											size="small"
											onClick={() => deleteProductHandler(product._id)}
										>
											Delete
										</Button>
									</>
								)}
								{product.productStatus === ProductStatus.SOLD && (
									<Button
										className="myprop-table__action-btn"
										variant="outlined"
										size="small"
										onClick={() => updateStatusHandler(ProductStatus.ACTIVE, product._id)}
									>
										Relist
									</Button>
								)}
								{product.productStatus === ProductStatus.HIDDEN && (
									<Button
										className="myprop-table__action-btn"
										variant="outlined"
										size="small"
										onClick={() => updateStatusHandler(ProductStatus.ACTIVE, product._id)}
									>
										Unhide
									</Button>
								)}
							</Box>
						</Box>
					))}
				</Box>
			)}

			{/* Pagination */}
			{total > searchFilter.limit && (
				<Box component="div" className="myprop-pagination">
					<Pagination
						count={Math.ceil(total / searchFilter.limit)}
						page={searchFilter.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Typography>{total} bike{total !== 1 ? 's' : ''}</Typography>
				</Box>
			)}
		</Box>
	);
};

MyProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'createdAt',
		direction: 'DESC',
		search: { productStatus: 'ACTIVE' },
	},
};

export default MyProperties;
