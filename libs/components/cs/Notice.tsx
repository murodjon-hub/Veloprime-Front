import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const NOTICES = [
	{
		id: 'n1',
		tag: 'Event',
		icon: <EventNoteOutlinedIcon />,
		title: 'Spring Cycling Season Sale — Up to 30% Off Selected Bikes',
		date: '12.05.2025',
		content:
			'Celebrate the new cycling season with our biggest sale yet. Discounts apply to road bikes, e-bikes, and select accessories. Offer valid until 31.05.2025.',
	},
	{
		id: 'n2',
		tag: 'Event',
		icon: <EventNoteOutlinedIcon />,
		title: 'Free Listing Promotion for New Sellers',
		date: '01.04.2025',
		content:
			'New members who register as sellers in April 2025 can list their first 3 bikes with zero commission. Sign up now and start selling today.',
	},
	{
		id: 'n3',
		tag: 'Notice',
		icon: <BuildOutlinedIcon />,
		title: 'Platform Maintenance — April 28, 02:00–04:00 KST',
		date: '24.04.2025',
		content:
			'Scheduled maintenance will cause brief downtime. Listings and chat will be unavailable during this window. We apologize for any inconvenience.',
	},
	{
		id: 'n4',
		tag: 'Update',
		icon: <ChatBubbleOutlineOutlinedIcon />,
		title: 'New Feature: Real-Time Chat with Sellers',
		date: '10.03.2025',
		content:
			'You can now message sellers directly from any product page. Look for the chat icon on listings to get answers on sizing, condition, and availability.',
	},
	{
		id: 'n5',
		tag: 'Policy',
		icon: <GavelOutlinedIcon />,
		title: 'Updated Community Guidelines',
		date: '01.03.2025',
		content:
			'We have updated our community guidelines to better reflect our values. Please review the new rules before posting in the community section.',
	},
];

const TAG_STYLE: Record<string, { bg: string; color: string }> = {
	Event:  { bg: '#fff0f0', color: '#e92c28' },
	Notice: { bg: '#fef9c3', color: '#ca8a04' },
	Update: { bg: '#eff6ff', color: '#2563eb' },
	Policy: { bg: '#f5f3ff', color: '#7c3aed' },
};

const Notice = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	}

	return (
		<Stack className="notice-content">
			<Stack direction="row" alignItems="center" gap={1} sx={{ mb: 3 }}>
				<CampaignOutlinedIcon sx={{ color: '#e92c28', fontSize: 22 }} />
				<Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>Notice</Typography>
			</Stack>

			<Stack gap={2}>
				{NOTICES.map((notice) => {
					const tag = TAG_STYLE[notice.tag] ?? { bg: '#f3f4f6', color: '#6b7280' };
					return (
						<Box component="div" key={notice.id} className="notice-card">
							<Box component="div" className="notice-card__icon-col">
								<Box component="div" className="notice-card__icon-wrap" sx={{ background: tag.bg, color: tag.color }}>
									{notice.icon}
								</Box>
							</Box>
							<Box component="div" className="notice-card__body">
								<Stack direction="row" alignItems="center" gap={1.2} sx={{ mb: 0.8 }}>
									<Box component="span" className="notice-card__tag" sx={{ background: tag.bg, color: tag.color }}>
										{notice.tag}
									</Box>
									<Box component="span" className="notice-card__date">{notice.date}</Box>
								</Stack>
								<Typography className="notice-card__title">{notice.title}</Typography>
								<Typography className="notice-card__content">{notice.content}</Typography>
							</Box>
						</Box>
					);
				})}
			</Stack>
		</Stack>
	);
};

export default Notice;
