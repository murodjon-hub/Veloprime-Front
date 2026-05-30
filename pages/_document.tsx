import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/favicon.svg" />

				{/* SEO */}
				<meta name="keyword" content={'veloprime, bicycles, e-bikes, road bikes, bike shop, cycling accessories'} />
				<meta
					name={'description'}
					content={
						'Buy and sell bikes anywhere anytime. Best Road Bikes & E-Bikes at the best prices on Veloprime. | ' +
						'Покупайте и продавайте велосипеды в любой точке в любое время. Лучшие велосипеды по лучшим ценам на Veloprime. | ' +
						'언제 어디서나 최고의 자전거를 구매하고 판매하세요. Veloprime에서 최적의 가격으로 최고의 자전거를 만나보세요'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
