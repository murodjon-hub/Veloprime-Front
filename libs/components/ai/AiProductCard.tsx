import React from 'react';
import { useRouter } from 'next/router';
import { getImageUrl } from '../../utils';

interface Props {
	product: {
		_id: string;
		productName: string;
		productType: string;
		productBrand?: string;
		productPrice: number;
		productRating?: number;
		productImages?: string[];
		productCondition?: string;
	};
}

export function AiProductCard({ product }: Props) {
	const router = useRouter();

	return (
		<div
			className="ai-product-card"
			onClick={() => router.push(`/products/${product._id}`)}
		>
			<div className="ai-product-card__img">
				<img
					src={getImageUrl(product.productImages?.[0], '/img/placeholder-bike.png')}
					alt={product.productName}
				/>
			</div>
			<div className="ai-product-card__info">
				<span className="ai-product-card__type">{product.productType}</span>
				<p className="ai-product-card__name">{product.productName}</p>
				{product.productBrand && (
					<span className="ai-product-card__brand">{product.productBrand}</span>
				)}
				<div className="ai-product-card__footer">
					<span className="ai-product-card__price">${product.productPrice?.toLocaleString()}</span>
					{product.productRating != null && (
						<span className="ai-product-card__rating">★ {product.productRating.toFixed(1)}</span>
					)}
				</div>
			</div>
		</div>
	);
}
