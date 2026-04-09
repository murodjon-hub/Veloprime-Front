import React, { useState } from 'react';
import { Stack, Box, Container, Typography, IconButton, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { ProductType, ProductStatus } from '../../enums/product/product';
import { ProductInquiry } from '../../types/product/productInput';

const FeaturedProduct = () => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const [initialInput] = useState<ProductInquiry>({
		page: 1,
		limit: 10,
		sort: 'productLikes',
		direction: Direction.DESC,
		search: {
			productTypeList: [ProductType.ROAD, ProductType.E_BIKE],
		},
	});

	const { data, loading, error } = useQuery(GET_PRODUCTS, {
		variables: { input: initialInput },
	});

	const products = data?.getProducts?.list || [];

	const handlePrev = () => {
		setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
	};

	const currentProduct = products[currentIndex];

	if (loading)
		return (
			<Stack className={'popular-properties'}>
				<p>Loading...</p>
			</Stack>
		);
	if (error)
		return (
			<Stack className={'popular-properties'}>
				<p>Error loading featured product</p>
			</Stack>
		);
	if (!currentProduct) return null;

	return (
		<Stack className={'popular-properties'}>
			<Container maxWidth="lg" className="featured-bike-section">
				<Typography variant="h1" className="featured-bike-top-text">
					Discover our featured bike crafted for those who ride beyond limits.
				</Typography>

				<Box className="featured-bike-carousel">
					<IconButton className="carousel-arrow arrow-left" onClick={handlePrev}>
						<ArrowBackIcon />
					</IconButton>

					<Box className="bike-image-container">
						<Typography component="span" className="background-number">
							{currentProduct.productName}
						</Typography>
						<img
							className="bike-image"
							src={
								currentProduct.productImages?.[0]
									? `${process.env.NEXT_PUBLIC_API_URL}/${currentProduct.productImages[0]}`
									: '../img/4253517958_2224302_3.png'
							}
							alt={currentProduct.productName}
						/>
					</Box>

					<IconButton className="carousel-arrow arrow-right" onClick={handleNext}>
						<ArrowForwardIcon />
					</IconButton>
				</Box>

				<Box className="featured-bike-info">
					<Typography variant="h2" className="bike-title">
						{currentProduct.productName}
					</Typography>
					<Typography variant="body1" className="bike-description">
						{currentProduct.productDesc ||
							'Smooth, stylish, and effortlessly powerful built for everyday adventures with comfort, control, and performance in every ride.'}
					</Typography>
					<Button variant="contained" className="buy-now-btn">
						Buy Now
					</Button>
				</Box>

				{/* Dot indicators */}
				<Box className="carousel-dots">
					{products.map((_: any, i: number) => (
						<Box
							key={i}
							onClick={() => setCurrentIndex(i)}
							className={`carousel-dot ${i === currentIndex ? 'active' : ''}`}
						/>
					))}
				</Box>
			</Container>
		</Stack>
	);
};

export default FeaturedProduct;
