import React from 'react';
import { Stack } from '@mui/material';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';

const withLayoutMain = (Component: React.ComponentType<any>) => {
	return (props: any) => {
		return (
			<>
				<Head>
					<title>VELOPRIME — Premium Bicycle Marketplace</title>
					<meta name="description" content="Discover next-generation bikes built for power, precision, and adventure." />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
				</Head>
				<Stack id="pc-wrap">
					<Stack id="top">
						<Top />
					</Stack>
					<Stack id="main">
						<Component {...props} />
					</Stack>
					<footer id="footer">
						<Footer />
					</footer>
				</Stack>
			</>
		);
	};
};

export default withLayoutMain;
