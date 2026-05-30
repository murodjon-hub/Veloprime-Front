import React, { useState } from 'react';
import { Heart, Eye, MessageCircle, ArrowUpRight } from 'lucide-react';

import { motion } from 'framer-motion';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/router';
import {
	ProductType,
	ProductStatus,
	ProductAgeCategory,
	ProductColor,
	ProductSize,
} from '../../enums/product/product';
import { getImageUrl } from '../../utils';

const LIKE_TARGET_PRODUCT = gql`
  mutation LikeTargetProduct($input: String!) {
    likeTargetProduct(productId: $input) {
      _id
      productLikes
      meLiked { memberId likeRefId myFavorite }
    }
  }
`;

export interface Product {
	_id: string;
	productType: ProductType;
	productStatus: ProductStatus;
	productAgeCategory: ProductAgeCategory;
	productColor: ProductColor;
	productSize: ProductSize;
	productName: string;
	productPrice: number;
	productViews: number;
	productLikes: number;
	productComments: number;
	productRank: number;
	productImages: string[];
	productDesc: string;
	memberId: string;
	soldAt?: string;
	deletedAt?: string;
	updatedAt: string;
	meLiked?: { memberId: string; likeRefId: string; myFavorite: boolean }[];
	memberData?: { memberNick: string; memberImage?: string };
}

interface ProductCardProps {
	product: Product;
	index?: number;
}

const STATUS_LABEL: Record<ProductStatus, string> = {
	[ProductStatus.ACTIVE]:  'Available',
	[ProductStatus.SOLD]:    'Sold',
	[ProductStatus.HIDDEN]:  'Hidden',
	[ProductStatus.DELETED]: 'Deleted',
};

const STATUS_COLOR: Record<ProductStatus, string> = {
	[ProductStatus.ACTIVE]:  '#22c55e',
	[ProductStatus.SOLD]:    '#ef4444',
	[ProductStatus.HIDDEN]:  '#f59e0b',
	[ProductStatus.DELETED]: '#9ca3af',
};

const TYPE_LABEL: Record<ProductType, string> = {
	[ProductType.ROAD]:      'Road',
	[ProductType.MOUNTAIN]:  'Mountain',
	[ProductType.HYBRID]:    'Hybrid',
	[ProductType.BMX]:       'BMX',
	[ProductType.E_BIKE]:    'E-Bike',
	[ProductType.KIDS]:      'Kids',
	[ProductType.TOURING]:   'Touring',
	[ProductType.ACCESSORY]: 'Accessory',
};

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
	const router = useRouter();
	const [imgError, setImgError]   = useState(false);
	const [liked, setLiked]         = useState(product.meLiked?.[0]?.myFavorite ?? false);
	const [likeCount, setLikeCount] = useState(product.productLikes);
	const [hovered, setHovered]     = useState(false);

	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

	if (product.productType === ProductType.ACCESSORY) return null;

	const imgSrc = imgError
		? '/img/4253517958_2224302_3.png'
		: getImageUrl(product.productImages?.[0], '/img/4253517958_2224302_3.png');

	const handleLike = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			const { data } = await likeTargetProduct({ variables: { input: product._id } });
			const next = data?.likeTargetProduct?.productLikes ?? likeCount;
			setLiked(next > likeCount);
			setLikeCount(next);
		} catch {}
	};

	const goToDetail = () => router.push(`/products/${product._id}`);
	const isSold     = product.productStatus === ProductStatus.SOLD;

	return (
		<motion.div
			className="pc"
			initial={{ opacity: 0, y: 28 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
			onHoverStart={() => setHovered(true)}
			onHoverEnd={() => setHovered(false)}
		>
			<div className="product-card" onClick={goToDetail} style={{ opacity: isSold ? 0.72 : 1 }}>

				{/* ── Image ──────────────────────────────────────── */}
				<div className="product-card__img-wrap">
					<motion.img
						src={imgSrc}
						alt={product.productName}
						onError={() => setImgError(true)}
						className="product-card__img"
						animate={{ scale: hovered ? 1.07 : 1 }}
						transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
					/>

					<span
						className="product-card__badge"
						style={{ background: STATUS_COLOR[product.productStatus] }}
					>
						{STATUS_LABEL[product.productStatus]}
					</span>

					<motion.button
						className={`product-card__like${liked ? ' product-card__like--active' : ''}`}
						onClick={handleLike}
						whileTap={{ scale: 0.9 }}
					>
						<motion.span
							key={liked ? 'liked' : 'not'}
							initial={{ scale: 0.6, opacity: 0 }}
							animate={{ scale: 1,   opacity: 1 }}
							transition={{ duration: 0.18 }}
						>
							<Heart size={13} fill={liked ? '#e63946' : 'none'} color={liked ? '#e63946' : '#666'} strokeWidth={2} />
						</motion.span>
						<span className="product-card__like-count">{likeCount}</span>
					</motion.button>

					<motion.div
						className="product-card__overlay"
						animate={{ opacity: hovered ? 1 : 0 }}
						transition={{ duration: 0.22 }}
					>
						<div className="product-card__view-btn">
							<ArrowUpRight size={20} />
							<span>View Details</span>
						</div>
					</motion.div>
				</div>

				{/* ── Body ───────────────────────────────────────── */}
				<div className="product-card__body">
					<div className="product-card__meta-row">
						<span className="product-card__type">{TYPE_LABEL[product.productType]}</span>
						{product.productSize && (
							<span className="product-card__size">{product.productSize}</span>
						)}
					</div>

					<p className="product-card__name">{product.productName}</p>

					{product.productDesc && (
						<p className="product-card__desc">
							{product.productDesc.slice(0, 72)}…
						</p>
					)}

					<div className="product-card__stats">
						<span className="product-card__stat">
							<Eye size={11} /> {product.productViews}
						</span>
						<span className="product-card__stat">
							<MessageCircle size={11} /> {product.productComments}
						</span>
					</div>

					<div className="product-card__footer">
						<span className="product-card__price">
							${product.productPrice?.toLocaleString()}
						</span>
						<span className="product-card__age-tag">
							{product.productAgeCategory}
						</span>
					</div>
				</div>

			</div>
		</motion.div>
	);
};

export default ProductCard;
