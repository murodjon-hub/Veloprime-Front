import { Stack } from '@mui/material';
import Head from 'next/head';
import Footer from '../Footer';
import Header2 from '../Header2';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		return (
			<>
				<Head>
					<title>VELOPRIME — Premium Bicycle Marketplace</title>
					<meta name="description" content="Buy, sell, and discover premium bicycles on VELOPRIME." />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
				</Head>
				<Stack id="pc-wrap">
					<Stack id="top">
						<Header2 />
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

export default withLayoutBasic;
