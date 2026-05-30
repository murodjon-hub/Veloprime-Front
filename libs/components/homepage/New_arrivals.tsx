import React from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/router';
import { Direction } from '../../enums/common.enum';
import { ProductInquiry } from '../../types/product/productInput';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { ProductType } from '../../enums/product/product';
import ProductCard from '../product/ProductCard';

const initialInput: ProductInquiry = {
	page:      1,
	limit:     6,
	sort:      'createdAt',
	direction: Direction.DESC,
	search:    { productTypeList: [ProductType.ROAD, ProductType.MOUNTAIN, ProductType.E_BIKE, ProductType.HYBRID] },
};

const SkeletonCard = () => (
	<div className="na-skeleton">
		<div className="na-skeleton__img" />
		<div className="na-skeleton__body">
			<div className="na-skeleton__line na-skeleton__line--sm" />
			<div className="na-skeleton__line na-skeleton__line--lg" />
			<div className="na-skeleton__line na-skeleton__line--md" />
		</div>
	</div>
);

const NewArrivals = () => {
	const router  = useRouter();
	const { data, loading } = useQuery(GET_PRODUCTS, { variables: { input: initialInput } });
	const products = data?.getProducts?.list ?? [];

	return (
		<section className="new-arrivals">
			<div className="new-arrivals__inner">

				{/* Header */}
				<motion.div
					className="section-header"
					initial={{ opacity: 0, y: 24 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
				>
					<div className="section-header__label">
						<TrendingUp size={14} />
						<span>Just dropped</span>
					</div>
					<h2 className="section-header__title">New Arrivals</h2>
					<p className="section-header__sub">
						Freshly added bikes from top brands and private sellers.
					</p>
					<button className="section-header__cta" onClick={() => router.push('/products')}>
						Browse all bikes <ArrowRight size={15} />
					</button>
				</motion.div>

				{/* Grid */}
				<div className="new-arrivals__grid">
					{loading
						? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
						: products.map((p: any, i: number) => (
								<ProductCard key={p._id} product={p} index={i} />
							))
					}
				</div>

			</div>
		</section>
	);
};

export default NewArrivals;
