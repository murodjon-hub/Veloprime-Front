import React from 'react';
import { Stack } from '@mui/material';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const withLayoutMain = (Component: React.ComponentType<any>) => {
	return (props: any) => {
		const device = useDeviceDetect();

		return (
			<>
				<Head>
					<title>VELOPRIME — Premium Bicycle Marketplace</title>
					<meta name="description" content="Discover next-generation bikes built for power, precision, and adventure." />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
				</Head>
				<Stack id={device === 'mobile' ? 'mobile-wrap' : 'pc-wrap'}>
					<Stack id="top">
						<Top />
					</Stack>
					<Stack id="main">
						<Component {...props} />
					</Stack>
					<Stack id="footer">
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutMain;
