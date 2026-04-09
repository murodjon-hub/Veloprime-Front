import React, { useState } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useQuery } from '@apollo/client';
import Swal from 'sweetalert2';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { ProductType } from '../../enums/product/product';
import { ProductInquiry } from '../../types/product/productInput';

const Accessories = () => {
	const [initialInput] = useState<ProductInquiry>({
		page: 1,
		limit: 3,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			productTypeList: [ProductType.ACCESSORY],
		},
	});

	const { data, loading, error } = useQuery(GET_PRODUCTS, {
		variables: { input: initialInput },
	});

	const accessories = data?.getProducts?.list || [];

	const handleBuyNow = (accessory: any) => {
		Swal.fire({
			icon: 'info',
			title: accessory.productName,
			text: `Price: $${accessory.productPrice.toLocaleString()}`,
			confirmButtonText: 'Add to Cart',
			showCancelButton: true,
			confirmButtonColor: '#1a1a1a',
			cancelButtonColor: '#d33',
		}).then((result) => {
			if (result.isConfirmed) {
				Swal.fire({
					icon: 'success',
					title: 'Added to Cart!',
					text: `${accessory.productName} has been added to your cart.`,
					timer: 2000,
					showConfirmButton: false,
				});
			}
		});
	};

	if (loading)
		return (
			<Box className="accessories-section">
				<Container maxWidth="lg">
					<Typography>Loading...</Typography>
				</Container>
			</Box>
		);

	if (error)
		return (
			<Box className="accessories-section">
				<Container maxWidth="lg">
					<Typography>Error loading accessories</Typography>
				</Container>
			</Box>
		);

	return (
		<Box className="accessories-section">
			<Container maxWidth="lg">
				<Box className="accessories-header">
					<Typography variant="h4" component="h2" className="accessories-title">
						ACCESSORIES
					</Typography>
					<Button variant="outlined" className="accessories-see-all-button">
						See All →
					</Button>
				</Box>

				<Box className="accessories-grid">
					{accessories.length === 0 ? (
						<Typography className="accessories-empty">No accessories found.</Typography>
					) : (
						accessories.map((accessory: any) => (
							<Box key={accessory._id} className="accessory-card">
								<Box className="accessory-card-content">
									<Typography className="accessory-name">{accessory.productName}</Typography>
									<Typography className="accessory-category">{accessory.productType}</Typography>
								</Box>

								<Box className="accessory-image-wrapper">
									<img
										className="accessory-image"
										src={
											accessory.productImages?.[0]
												? `${process.env.NEXT_PUBLIC_API_URL}/${accessory.productImages[0]}`
												: '/img/R1-01.webp'
										}
										alt={accessory.productName}
									/>
								</Box>

								<Box className="accessory-card-footer">
									<Typography className="accessory-price">${accessory.productPrice.toLocaleString()}</Typography>
									<Button 
										className="accessory-buy-button"
										onClick={() => handleBuyNow(accessory)}
									>
										Buy Now
									</Button>
								</Box>
							</Box>
						))
					)}
				</Box>
			</Container>
		</Box>
	);
};

export default Accessories;
