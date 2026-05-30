import { Stack } from '@mui/material';
import Head from 'next/head';
import Footer from '../Footer';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Header2 from '../Header2';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();

		return (
			<>
				<Head>
					<title>VELOPRIME — Premium Bicycle Marketplace</title>
					<meta name="description" content="Buy, sell, and discover premium bicycles on VELOPRIME." />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
				</Head>
				<Stack id={device === 'mobile' ? 'mobile-wrap' : 'pc-wrap'}>
					<Stack id="top">
						<Header2 />
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

export default withLayoutBasic;
