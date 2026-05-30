import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Stack } from '@mui/material';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import Inquiry from '../../libs/components/cs/Inquiry';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const TABS = [
	{ key: 'notice',  label: 'Notice'  },
	{ key: 'faq',     label: 'FAQ'     },
	{ key: 'inquiry', label: 'Inquiry' },
];

const CS: NextPage = () => {
	const router = useRouter();

	const tab = (router.query.tab as string) ?? 'notice';

	const changeTab = (key: string) =>
		router.push({ pathname: '/cs', query: { tab: key } }, undefined, { scroll: false });

	return (
		<Stack className="cs-page">
			<Stack className="container">
				<Box component="div" className="cs-main-info">
					<Box component="div" className="info">
						<span>Customer Support</span>
						<p>We're here to help you ride better</p>
					</Box>
					<Box component="div" className="btns">
						{TABS.map(({ key, label }) => (
							<div key={key} className={tab === key ? 'active' : ''} onClick={() => changeTab(key)}>
								{label}
							</div>
						))}
					</Box>
				</Box>

				<Box component="div" className="cs-content">
					{tab === 'notice'  && <Notice />}
					{tab === 'faq'     && <Faq />}
					{tab === 'inquiry' && <Inquiry />}
				</Box>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(CS);
