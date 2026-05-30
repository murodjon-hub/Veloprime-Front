import React, { useState } from 'react';
import {
	Box, Button, MenuItem, Select, Stack,
	TextField, Typography,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { sweetErrorHandling } from '../../sweetAlert';
import Swal from 'sweetalert2';

const CATEGORIES = [
	{ value: 'PURCHASE',  label: 'Purchase & Payment'    },
	{ value: 'LISTING',   label: 'Listing a Bike'        },
	{ value: 'ACCOUNT',   label: 'Account & Profile'     },
	{ value: 'TECHNICAL', label: 'Technical Issue'       },
	{ value: 'OTHER',     label: 'Other'                 },
];

const Inquiry = () => {
	const device = useDeviceDetect();
	const user   = useReactiveVar(userVar);

	const [category, setCategory] = useState('PURCHASE');
	const [title,    setTitle]    = useState('');
	const [content,  setContent]  = useState('');
	const [sent,     setSent]     = useState(false);
	const [loading,  setLoading]  = useState(false);

	const canSubmit = title.trim().length > 3 && content.trim().length > 10;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user?._id) {
			await Swal.fire({ icon: 'warning', title: 'Login required', text: 'Please log in to submit an inquiry.', confirmButtonColor: '#e92c28' });
			return;
		}
		if (!canSubmit) return;
		try {
			setLoading(true);
			await new Promise((r) => setTimeout(r, 600));
			setSent(true);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setLoading(false);
		}
	};

	const reset = () => {
		setTitle('');
		setContent('');
		setCategory('PURCHASE');
		setSent(false);
	};

	if (device === 'mobile') {
		return <div>INQUIRY MOBILE</div>;
	}

	if (sent) {
		return (
			<Stack className="inquiry-content" alignItems="center" sx={{ py: 6 }}>
				<CheckCircleOutlineRoundedIcon sx={{ fontSize: 56, color: '#22c55e', mb: 2 }} />
				<Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', mb: 1 }}>Inquiry Submitted</Typography>
				<Typography sx={{ fontSize: 14, color: '#666', mb: 3, textAlign: 'center', maxWidth: 400 }}>
					Thank you for reaching out. Our team will review your inquiry and respond within 1–2 business days.
				</Typography>
				<Button onClick={reset} variant="outlined" sx={{ borderRadius: 2, borderColor: '#1a1a2e', color: '#1a1a2e' }}>
					Submit Another
				</Button>
			</Stack>
		);
	}

	return (
		<Stack className="inquiry-content">
			<Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>1:1 Inquiry</Typography>
			<Typography sx={{ fontSize: 13, color: '#888', mb: 3 }}>
				Can't find what you're looking for? Send us a message and we'll get back to you.
			</Typography>

			<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Box component="div">
					<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.8 }}>Category</Typography>
					<Select
						size="small"
						fullWidth
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						sx={{ borderRadius: 2 }}
					>
						{CATEGORIES.map((c) => (
							<MenuItem key={c.value} value={c.value} sx={{ fontSize: 13 }}>{c.label}</MenuItem>
						))}
					</Select>
				</Box>

				<Box component="div">
					<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.8 }}>Subject</Typography>
					<TextField
						size="small"
						fullWidth
						placeholder="Briefly describe your issue…"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						inputProps={{ maxLength: 120 }}
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
					/>
				</Box>

				<Box component="div">
					<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.8 }}>Message</Typography>
					<TextField
						multiline
						rows={5}
						fullWidth
						placeholder="Describe your question or issue in detail…"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						inputProps={{ maxLength: 1000 }}
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
					/>
					<Typography sx={{ fontSize: 11, color: '#bbb', mt: 0.5, textAlign: 'right' }}>{content.length}/1000</Typography>
				</Box>

				{!user?._id && (
					<Typography sx={{ fontSize: 12, color: '#e92c28' }}>Please log in to submit an inquiry.</Typography>
				)}

				<Button
					type="submit"
					variant="contained"
					disabled={!canSubmit || loading}
					endIcon={<SendRoundedIcon />}
					sx={{
						alignSelf: 'flex-end',
						borderRadius: 2,
						px: 4,
						background: '#1a1a2e',
						'&:hover': { background: '#e92c28' },
						'&:disabled': { background: '#e5e7eb', color: '#9ca3af' },
					}}
				>
					{loading ? 'Sending…' : 'Send Inquiry'}
				</Button>
			</Box>
		</Stack>
	);
};

export default Inquiry;
