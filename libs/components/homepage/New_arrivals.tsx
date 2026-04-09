import React, { useState } from 'react';
import { Stack } from '@mui/material';
import { useQuery } from '@apollo/client';
import { Direction } from '../../enums/common.enum';
import { ProductInquiry } from '../../types/product/productInput';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { ProductType } from '../../enums/product/product';

const NewArrivals = () => {
	const [initialInput, setInitialInput] = useState<ProductInquiry>({
		page: 1,
		limit: 3,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			productTypeList: [ProductType.ROAD, ProductType.E_BIKE],
		},
	});

	const { data, loading, error } = useQuery(GET_PRODUCTS, {
		variables: {
			input: initialInput,
		},
	});

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error loading products</p>;

	const products = data?.getProducts?.list || [];

	return (
		<Stack className={'trend-properties'}>
			<section className="new-arrivals-section">
				<div className="new-arrivals-header">
					<h2 className="new-arrivals-title">New Arrivals</h2>
					<button className="new-arrivals-see-all-btn">See All</button>
				</div>

				<div className="new-arrivals-grid">
					{products.map((product: any) => (
						<div key={product._id} className="product-card">
							<div className="product-card-header">
								<h3 className="product-name">{product.productName}</h3>
								<p className="product-category">{product.productType}</p>
							</div>

							<div className="product-image-container">
								<img
									className="product-image"
									src={`${process.env.NEXT_PUBLIC_API_URL}/${product.productImages[0]}`}
									alt={product.productName}
								/>
							</div>

							<div className="product-card-footer">
								<span className="product-price">${product.productPrice}</span>
								<button className="product-buy-btn">Buy Now</button>
							</div>
						</div>
					))}
				</div>
			</section>
		</Stack>
	);
};

export default NewArrivals;
