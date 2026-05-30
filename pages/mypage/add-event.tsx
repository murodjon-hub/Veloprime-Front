import React, { useCallback, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Box, Typography, TextField, Button, Select, MenuItem,
	FormControl, InputLabel, CircularProgress, Chip, Stack,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RouteIcon from '@mui/icons-material/Route';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventIcon from '@mui/icons-material/Event';
import StraightenIcon from '@mui/icons-material/Straighten';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useMutation, useReactiveVar } from '@apollo/client';
import axios from 'axios';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import { CREATE_EVENT } from '../../apollo/user/mutation';
import { getImageUrl } from '../../libs/utils';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { withAuth } from '../../libs/components/layout/ProtectedRoute';
import { MemberType } from '../../libs/enums/member.enum';

const STATUS_OPTIONS = [
	{ label: 'Upcoming', value: 'UPCOMING' },
	{ label: 'Ongoing',  value: 'ONGOING' },
	{ label: 'Completed', value: 'COMPLETED' },
	{ label: 'Cancelled', value: 'CANCELLED' },
];

interface FormState {
	eventTitle: string;
	eventDesc: string;
	eventImage: string;
	fromLocation: string;
	toLocation: string;
	distance: string;
	eventDate: string;
	maxParticipants: number;
	eventStatus: string;
}

const EMPTY: FormState = {
	eventTitle: '',
	eventDesc: '',
	eventImage: '',
	fromLocation: '',
	toLocation: '',
	distance: '',
	eventDate: '',
	maxParticipants: 50,
	eventStatus: 'UPCOMING',
};

const AddEventPage: NextPage = () => {
	const router = useRouter();
	const token  = getJwtToken();
	const user   = useReactiveVar(userVar);

	const [form, setForm]               = useState<FormState>({ ...EMPTY });
	const [coverPreview, setCoverPreview] = useState('');
	const [uploading, setUploading]     = useState(false);
	const [submitting, setSubmitting]   = useState(false);
	const coverRef                      = useRef<HTMLInputElement>(null);

	const [createEvent] = useMutation(CREATE_EVENT);

	const set = (key: keyof FormState, val: any) =>
		setForm((p) => ({ ...p, [key]: val }));

	const uploadImage = useCallback(async (file: File): Promise<string | null> => {
		try {
			const fd = new FormData();
			fd.append('operations', JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }`,
				variables: { file: null, target: 'event' },
			}));
			fd.append('map', JSON.stringify({ '0': ['variables.file'] }));
			fd.append('0', file);

			// Do NOT set Content-Type manually — axios must set it with the multipart boundary
			const res = await axios.post(
				process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://localhost:3009/graphql',
				fd,
				{ headers: { 'apollo-require-preflight': 'true', Authorization: `Bearer ${token}` } },
			);

			const path: string | null = res.data?.data?.imageUploader ?? null;
			if (!path) throw new Error(res.data?.errors?.[0]?.message ?? 'Upload returned empty path');
			return path;
		} catch (err: any) {
			sweetErrorHandling(new Error('Banner upload failed: ' + (err.message ?? 'unknown error'))).then();
			return null;
		}
	}, [token]);

	const handleCoverChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setCoverPreview(URL.createObjectURL(file));
		setUploading(true);
		const url = await uploadImage(file);
		if (url) set('eventImage', url);
		setUploading(false);
	}, [uploadImage]);

	const removeCover = () => {
		setCoverPreview('');
		set('eventImage', '');
		if (coverRef.current) coverRef.current.value = '';
	};

	const handleSubmit = async () => {
		if (!user?._id) { router.push('/account/join'); return; }

		const { eventTitle, eventDesc, eventImage, fromLocation, toLocation, distance, eventDate } = form;
		if (!eventTitle || !eventDesc || !eventImage || !fromLocation || !toLocation || !distance || !eventDate) {
			await sweetErrorHandling(new Error('Please fill in all required fields and upload a banner image.'));
			return;
		}

		const distanceNum = parseFloat(form.distance);
		if (isNaN(distanceNum) || distanceNum <= 0) {
			await sweetErrorHandling(new Error('Distance must be a positive number (e.g. 42.5).'));
			return;
		}

		setSubmitting(true);
		try {
			await createEvent({
				variables: {
					input: {
						eventTitle:      form.eventTitle.trim(),
						eventDesc:       form.eventDesc.trim(),
						eventImage:      form.eventImage,
						fromLocation:    form.fromLocation.trim(),
						toLocation:      form.toLocation.trim(),
						distance:        distanceNum,               // Float — backend expects number
						eventDate:       new Date(form.eventDate),
						maxParticipants: Number(form.maxParticipants),
						eventStatus:     form.eventStatus || 'UPCOMING',
					},
				},
			});
			await sweetTopSuccessAlert('Event published!', 700);
			router.push('/events');
		} catch (err) {
			sweetErrorHandling(err).then();
		} finally {
			setSubmitting(false);
		}
	};

	const isComplete = Boolean(
		form.eventTitle && form.eventDesc && form.eventImage &&
		form.fromLocation && form.toLocation && form.distance && form.eventDate
	);

	return (
		<Box component="div" className="add-event-page">

			{/* Page header */}
			<Box component="div" className="add-event-page__hero">
				<Typography className="add-event-page__hero-label">Dashboard</Typography>
				<Typography variant="h1" className="add-event-page__hero-title">Create an Event</Typography>
				<Typography className="add-event-page__hero-sub">
					Organize a ride, challenge or community event for VeloPrime members
				</Typography>
			</Box>

			<Box component="div" className="add-event-page__body">

				{/* ── Left: form ─────────────────────────────────────────── */}
				<Box component="div" className="add-event-page__form-col">

					{/* Banner upload */}
					<Box component="div" className="add-event-card">
						<Typography className="add-event-card__title">
							<AddPhotoAlternateOutlinedIcon className="add-event-card__icon" />
							Event Banner
						</Typography>

						{coverPreview ? (
							<Box component="div" className="add-event-page__banner-preview">
								<img src={coverPreview} alt="banner" className="add-event-page__banner-img" />
								{uploading && (
									<Box component="div" className="add-event-page__banner-uploading">
										<CircularProgress size={28} sx={{ color: '#fff' }} />
										<Typography>Uploading…</Typography>
									</Box>
								)}
								<Box component="div" className="add-event-page__banner-actions">
									<Button
										startIcon={<AddPhotoAlternateOutlinedIcon />}
										onClick={() => coverRef.current?.click()}
										disabled={uploading}
										className="add-event-page__banner-btn"
									>
										Change
									</Button>
									<Button
										startIcon={<CancelOutlinedIcon />}
										onClick={removeCover}
										disabled={uploading}
										className="add-event-page__banner-btn add-event-page__banner-btn--remove"
									>
										Remove
									</Button>
								</Box>
							</Box>
						) : (
							<Box
								component="div"
								className="add-event-page__banner-empty"
								onClick={() => coverRef.current?.click()}
							>
								<AddPhotoAlternateOutlinedIcon className="add-event-page__banner-empty-icon" />
								<Typography className="add-event-page__banner-empty-hint">
									Click to upload a banner image
								</Typography>
								<Typography className="add-event-page__banner-empty-sub">
									Recommended 1400 × 600 px — JPG or PNG
								</Typography>
							</Box>
						)}
						<input ref={coverRef} type="file" accept="image/*" hidden onChange={handleCoverChange} />
					</Box>

					{/* Basic info */}
					<Box component="div" className="add-event-card">
						<Typography className="add-event-card__title">
							<EventIcon className="add-event-card__icon" />
							Basic Info
						</Typography>
						<TextField
							label="Event Title *"
							fullWidth
							value={form.eventTitle}
							onChange={(e) => set('eventTitle', e.target.value)}
							className="add-event-page__field"
							inputProps={{ maxLength: 80 }}
						/>
						<TextField
							label="Description *"
							fullWidth
							multiline
							minRows={4}
							value={form.eventDesc}
							onChange={(e) => set('eventDesc', e.target.value)}
							className="add-event-page__field"
							helperText="Describe the event, terrain, requirements, and what participants can expect."
						/>
					</Box>

					{/* Route details */}
					<Box component="div" className="add-event-card">
						<Typography className="add-event-card__title">
							<RouteIcon className="add-event-card__icon" />
							Route Details
						</Typography>
						<Box component="div" className="add-event-page__row">
							<TextField
								label="From Location *"
								fullWidth
								value={form.fromLocation}
								onChange={(e) => set('fromLocation', e.target.value)}
								placeholder="e.g. Seoul"
							/>
							<Typography className="add-event-page__arrow">→</Typography>
							<TextField
								label="To Location *"
								fullWidth
								value={form.toLocation}
								onChange={(e) => set('toLocation', e.target.value)}
								placeholder="e.g. Busan"
							/>
						</Box>
						<TextField
							label="Distance (km) *"
							type="number"
							fullWidth
							value={form.distance}
							onChange={(e) => set('distance', e.target.value)}
							placeholder="e.g. 420"
							inputProps={{ min: 0.1, step: 0.1 }}
							className="add-event-page__field"
							InputProps={{ startAdornment: <StraightenIcon sx={{ mr: 1, color: '#aaa' }} /> }}
						/>
					</Box>

					{/* Date & capacity */}
					<Box component="div" className="add-event-card">
						<Typography className="add-event-card__title">
							<CalendarTodayIcon className="add-event-card__icon" />
							Date & Capacity
						</Typography>
						<Box component="div" className="add-event-page__row">
							<TextField
								label="Event Date *"
								type="date"
								fullWidth
								value={form.eventDate}
								onChange={(e) => set('eventDate', e.target.value)}
								InputLabelProps={{ shrink: true }}
								InputProps={{ startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: '#aaa' }} /> }}
							/>
							<TextField
								label="Max Participants"
								type="number"
								fullWidth
								value={form.maxParticipants}
								onChange={(e) => set('maxParticipants', parseInt(e.target.value) || 1)}
								inputProps={{ min: 1, max: 10000 }}
								InputProps={{ startAdornment: <PeopleAltIcon sx={{ mr: 1, color: '#aaa' }} /> }}
							/>
						</Box>
						<FormControl fullWidth className="add-event-page__field">
							<InputLabel>Status</InputLabel>
							<Select
								value={form.eventStatus}
								label="Status"
								onChange={(e) => set('eventStatus', e.target.value)}
							>
								{STATUS_OPTIONS.map((o) => (
									<MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</Box>

				{/* ── Right: sticky sidebar ───────────────────────────── */}
				<Box component="div" className="add-event-page__sidebar">

					{/* Live preview card */}
					<Box component="div" className="add-event-sidebar__preview-card">
						<Typography className="add-event-sidebar__section-label">Preview</Typography>
						<Box component="div" className="add-event-sidebar__card">
							<Box component="div" className="add-event-sidebar__card-img-wrap">
								{(coverPreview || form.eventImage) ? (
									<img
										src={coverPreview || getImageUrl(form.eventImage)}
										alt="preview"
										className="add-event-sidebar__card-img"
									/>
								) : (
									<Box component="div" className="add-event-sidebar__card-img-placeholder">
										<AddPhotoAlternateOutlinedIcon sx={{ fontSize: 36, color: '#ddd' }} />
									</Box>
								)}
								<Box component="div" className="add-event-sidebar__card-status">
									{form.eventStatus}
								</Box>
								{form.distance && (
									<Box component="div" className="add-event-sidebar__card-distance">
										<StraightenIcon sx={{ fontSize: 12 }} />
										{form.distance}
									</Box>
								)}
							</Box>
							<Box component="div" className="add-event-sidebar__card-body">
								<Typography className="add-event-sidebar__card-title" noWrap>
									{form.eventTitle || 'Event Title'}
								</Typography>
								{(form.fromLocation || form.toLocation) && (
									<Typography className="add-event-sidebar__card-route">
										{form.fromLocation || '—'} → {form.toLocation || '—'}
									</Typography>
								)}
								<Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
									{form.eventDate && (
										<Chip
											icon={<CalendarTodayIcon sx={{ fontSize: 11 }} />}
											label={new Date(form.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
											size="small"
											sx={{ fontSize: 11 }}
										/>
									)}
									{form.maxParticipants > 0 && (
										<Chip
											icon={<PeopleAltIcon sx={{ fontSize: 11 }} />}
											label={`${form.maxParticipants} riders`}
											size="small"
											sx={{ fontSize: 11 }}
										/>
									)}
								</Stack>
							</Box>
						</Box>
					</Box>

					{/* Publish controls */}
					<Box component="div" className="add-event-sidebar__publish">
						<Typography className="add-event-sidebar__section-label">Publish</Typography>

						<Box component="div" className="add-event-sidebar__checklist">
							{[
								{ label: uploading ? 'Uploading banner…' : 'Banner uploaded', done: !!(coverPreview || form.eventImage) },
								{ label: 'Title added',        done: !!form.eventTitle },
								{ label: 'Description added',  done: !!form.eventDesc },
								{ label: 'Route defined',      done: !!(form.fromLocation && form.toLocation && form.distance) },
								{ label: 'Date set',           done: !!form.eventDate },
							].map((item) => (
								<Box component="div" key={item.label} className={`add-event-sidebar__check${item.done ? ' done' : ''}`}>
									<CheckCircleIcon sx={{ fontSize: 15 }} />
									<Typography>{item.label}</Typography>
								</Box>
							))}
						</Box>

						<Button
							fullWidth
							className="add-event-sidebar__publish-btn"
							onClick={handleSubmit}
							disabled={!isComplete || submitting || uploading}
							startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
						>
							{submitting ? 'Publishing…' : 'Publish Event'}
						</Button>
						<Button
							fullWidth
							className="add-event-sidebar__cancel-btn"
							onClick={() => router.push('/events')}
							disabled={submitting}
						>
							Cancel
						</Button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default withAuth(withLayoutBasic(AddEventPage) as any, {
	roles: [MemberType.MEMBER, MemberType.ADMIN],
	redirectTo: '/mypage?category=myProfile',
}) as any;
