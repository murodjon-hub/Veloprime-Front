import React, { useCallback, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Box, Typography, TextField, Button, Select, MenuItem,
	FormControl, InputLabel, CircularProgress, Chip, Avatar,
	LinearProgress, Tooltip,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
	eventTitle: string;
	eventDesc: string;
	eventImage: string;
	fromLocation: string;
	toLocation: string;
	distanceKm: string;      // stored as string for input UX, parsed to Float on submit
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
	distanceKm: '',
	eventDate: '',
	maxParticipants: 50,
	eventStatus: 'UPCOMING',
};

const STATUS_OPTIONS = [
	{ label: 'Upcoming',  value: 'UPCOMING',  color: '#3b82f6' },
	{ label: 'Ongoing',   value: 'ONGOING',   color: '#22c55e' },
	{ label: 'Completed', value: 'COMPLETED', color: '#6b7280' },
	{ label: 'Cancelled', value: 'CANCELLED', color: '#ef4444' },
];

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
	{ id: 1, label: 'Cover & Basics' },
	{ id: 2, label: 'Route & Schedule' },
	{ id: 3, label: 'Preview & Publish' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const CreateEventPage: NextPage = () => {
	const router = useRouter();
	const token  = getJwtToken();
	const user   = useReactiveVar(userVar);

	const [step, setStep]                   = useState(1);
	const [form, setForm]                   = useState<FormState>({ ...EMPTY });
	const [coverPreview, setCoverPreview]   = useState('');
	const [uploading, setUploading]         = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [dragOver, setDragOver]           = useState(false);
	const [submitting, setSubmitting]       = useState(false);
	const [fieldErrors, setFieldErrors]     = useState<Partial<Record<keyof FormState, string>>>({});
	const coverRef                          = useRef<HTMLInputElement>(null);

	const [createEvent] = useMutation(CREATE_EVENT);

	const set = (key: keyof FormState, val: any) => {
		setForm((p) => ({ ...p, [key]: val }));
		if (fieldErrors[key]) setFieldErrors((p) => ({ ...p, [key]: undefined }));
	};

	// ─── Upload ───────────────────────────────────────────────────────────────

	const uploadImage = useCallback(async (file: File): Promise<string | null> => {
		const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
		if (file.size > MAX_SIZE) {
			sweetErrorHandling(new Error('Image must be under 8 MB.')).then();
			return null;
		}
		if (!file.type.startsWith('image/')) {
			sweetErrorHandling(new Error('Only image files are allowed.')).then();
			return null;
		}

		try {
			const fd = new FormData();
			fd.append('operations', JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }`,
				variables: { file: null, target: 'event' },
			}));
			fd.append('map', JSON.stringify({ '0': ['variables.file'] }));
			fd.append('0', file);

			const res = await axios.post(
				process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://localhost:3009/graphql',
				fd,
				{
					headers: { 'apollo-require-preflight': 'true', Authorization: `Bearer ${token}` },
					onUploadProgress: (e) => {
						if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
					},
				},
			);

			const path: string | null = res.data?.data?.imageUploader ?? null;
			if (!path) throw new Error(res.data?.errors?.[0]?.message ?? 'Upload returned empty path');
			return path;
		} catch (err: any) {
			sweetErrorHandling(new Error('Upload failed: ' + (err.message ?? 'unknown'))).then();
			return null;
		}
	}, [token]);

	const processCoverFile = useCallback(async (file: File) => {
		setCoverPreview(URL.createObjectURL(file));
		setUploading(true);
		setUploadProgress(0);
		const path = await uploadImage(file);
		if (path) {
			set('eventImage', path);
		} else {
			setCoverPreview('');
		}
		setUploading(false);
		setUploadProgress(0);
	}, [uploadImage]);

	const handleCoverChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) await processCoverFile(file);
	}, [processCoverFile]);

	const handleDrop = useCallback(async (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		const file = e.dataTransfer.files?.[0];
		if (file) await processCoverFile(file);
	}, [processCoverFile]);

	const removeCover = () => {
		setCoverPreview('');
		set('eventImage', '');
		if (coverRef.current) coverRef.current.value = '';
	};

	// ─── Validation ───────────────────────────────────────────────────────────

	const validateStep1 = (): boolean => {
		const errors: typeof fieldErrors = {};
		if (!form.eventTitle.trim()) errors.eventTitle = 'Event title is required';
		else if (form.eventTitle.trim().length < 5) errors.eventTitle = 'Title must be at least 5 characters';
		else if (form.eventTitle.trim().length > 80) errors.eventTitle = 'Title cannot exceed 80 characters';
		if (!form.eventDesc.trim()) errors.eventDesc = 'Description is required';
		else if (form.eventDesc.trim().length < 20) errors.eventDesc = 'Description must be at least 20 characters';
		if (!form.eventImage) errors.eventImage = 'Banner image is required';
		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const validateStep2 = (): boolean => {
		const errors: typeof fieldErrors = {};
		if (!form.fromLocation.trim()) errors.fromLocation = 'Start location is required';
		if (!form.toLocation.trim()) errors.toLocation = 'Destination is required';
		if (!form.distanceKm.trim()) errors.distanceKm = 'Distance is required';
		else {
			const d = parseFloat(form.distanceKm);
			if (isNaN(d) || d <= 0) errors.distanceKm = 'Distance must be a positive number';
			else if (d > 50000) errors.distanceKm = 'Distance seems unrealistic';
		}
		if (!form.eventDate) errors.eventDate = 'Event date is required';
		else if (new Date(form.eventDate) < new Date()) errors.eventDate = 'Event date must be in the future';
		if (form.maxParticipants < 1) errors.maxParticipants = 'At least 1 participant required';
		setFieldErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const nextStep = () => {
		if (step === 1 && !validateStep1()) return;
		if (step === 2 && !validateStep2()) return;
		setStep((s) => Math.min(s + 1, 3));
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const prevStep = () => {
		setStep((s) => Math.max(s - 1, 1));
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// ─── Submit ───────────────────────────────────────────────────────────────

	const handleSubmit = async () => {
		if (!user?._id) { router.push('/account/join'); return; }
		if (!validateStep1() || !validateStep2()) {
			setStep(1);
			return;
		}

		const distance = parseFloat(form.distanceKm);
		if (isNaN(distance) || distance <= 0) {
			sweetErrorHandling(new Error('Invalid distance value.')).then();
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
						distance,                                   // Float — backend expects number
						eventDate:       new Date(form.eventDate),
						maxParticipants: Number(form.maxParticipants),
						eventStatus:     form.eventStatus || 'UPCOMING',
					},
				},
			});
			await sweetTopSuccessAlert('🎉 Event published successfully!', 1200);
			router.push('/events');
		} catch (err) {
			sweetErrorHandling(err).then();
		} finally {
			setSubmitting(false);
		}
	};

	// ─── Helpers ──────────────────────────────────────────────────────────────

	const isStep1Complete = Boolean(form.eventTitle && form.eventDesc && form.eventImage && !uploading);
	const isStep2Complete = Boolean(form.fromLocation && form.toLocation && form.distanceKm && form.eventDate);
	const isReadyToPublish = isStep1Complete && isStep2Complete;

	const displayDate = (iso: string) => {
		if (!iso) return null;
		try {
			return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
		} catch { return iso; }
	};

	const statusObj = STATUS_OPTIONS.find((s) => s.value === form.eventStatus) ?? STATUS_OPTIONS[0];

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<Box component="div" className="ce-page">

			{/* ── Top header ── */}
			<Box component="div" className="ce-page__header">
				<Box component="div" className="ce-page__header-inner">
					<Box component="div" className="ce-page__header-left">
						<Typography className="ce-page__breadcrumb">
							<span onClick={() => router.push('/events')} style={{ cursor: 'pointer' }}>Events</span>
							<span className="ce-page__breadcrumb-sep">/</span>
							<span>Create Event</span>
						</Typography>
						<Typography className="ce-page__title">Publish a Cycling Event</Typography>
						<Typography className="ce-page__sub">
							Organize a ride, challenge or community gathering for VeloPrime members
						</Typography>
					</Box>

					{/* Step progress */}
					<Box component="div" className="ce-page__steps">
						{STEPS.map((s, i) => (
							<React.Fragment key={s.id}>
								<Box
									component="div"
									className={`ce-step ${step === s.id ? 'ce-step--active' : ''} ${step > s.id ? 'ce-step--done' : ''}`}
									onClick={() => {
										if (s.id < step) setStep(s.id);
										else if (s.id === step + 1) nextStep();
									}}
								>
									<Box component="div" className="ce-step__circle">
										{step > s.id
											? <CheckCircleIcon sx={{ fontSize: 20 }} />
											: <Typography className="ce-step__num">{s.id}</Typography>
										}
									</Box>
									<Typography className="ce-step__label">{s.label}</Typography>
								</Box>
								{i < STEPS.length - 1 && <Box component="div" className={`ce-step__line ${step > s.id ? 'ce-step__line--done' : ''}`} />}
							</React.Fragment>
						))}
					</Box>
				</Box>
			</Box>

			{/* ── Body ── */}
			<Box component="div" className="ce-page__body">

				{/* ── LEFT: Form column ── */}
				<Box component="div" className="ce-page__form-col">

					{/* ══ STEP 1: Cover + Basics ══ */}
					{step === 1 && (
						<Box component="div" className="ce-step-panel">
							<Typography className="ce-section__title">
								<AddPhotoAlternateOutlinedIcon className="ce-section__icon" />
								Event Banner
							</Typography>
							<Typography className="ce-section__hint">
								Upload a cinematic banner that captures the spirit of your event. Recommended 1400 × 600 px.
							</Typography>

							{/* Upload area */}
							{!coverPreview ? (
								<Box
									component="div"
									className={`ce-upload-zone ${dragOver ? 'ce-upload-zone--drag' : ''} ${fieldErrors.eventImage ? 'ce-upload-zone--error' : ''}`}
									onClick={() => coverRef.current?.click()}
									onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }}
									onDragLeave={() => setDragOver(false)}
									onDrop={handleDrop}
								>
									<CloudUploadOutlinedIcon className="ce-upload-zone__icon" />
									<Typography className="ce-upload-zone__main">
										{dragOver ? 'Release to upload' : 'Drag & drop or click to upload'}
									</Typography>
									<Typography className="ce-upload-zone__sub">JPG, PNG · Max 8 MB · 1400 × 600 px recommended</Typography>
								</Box>
							) : (
								<Box component="div" className="ce-banner-preview">
									<img src={coverPreview} alt="event banner" className="ce-banner-preview__img" />
									<Box component="div" className="ce-banner-preview__overlay" />

									{uploading && (
										<Box component="div" className="ce-banner-preview__uploading">
											<CircularProgress size={32} sx={{ color: '#fff' }} />
											<Typography className="ce-banner-preview__pct">{uploadProgress}%</Typography>
											<LinearProgress
												variant="determinate"
												value={uploadProgress}
												className="ce-banner-preview__bar"
											/>
										</Box>
									)}

									{!uploading && form.eventImage && (
										<Box component="div" className="ce-banner-preview__ready">
											<CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} />
											<Typography>Banner ready</Typography>
										</Box>
									)}

									<Box component="div" className="ce-banner-preview__actions">
										<Button
											className="ce-banner-btn"
											startIcon={<AddPhotoAlternateOutlinedIcon />}
											onClick={() => coverRef.current?.click()}
											disabled={uploading}
										>
											Change
										</Button>
										<Button
											className="ce-banner-btn ce-banner-btn--remove"
											startIcon={<DeleteOutlineIcon />}
											onClick={removeCover}
											disabled={uploading}
										>
											Remove
										</Button>
									</Box>
								</Box>
							)}
							{fieldErrors.eventImage && (
								<Typography className="ce-field-error">{fieldErrors.eventImage}</Typography>
							)}
							<input ref={coverRef} type="file" accept="image/*" hidden onChange={handleCoverChange} />

							{/* Title */}
							<Box component="div" className="ce-section__group">
								<Typography className="ce-section__title" sx={{ mt: 3 }}>
									Event Details
								</Typography>
								<TextField
									label="Event Title *"
									fullWidth
									value={form.eventTitle}
									onChange={(e) => set('eventTitle', e.target.value)}
									error={!!fieldErrors.eventTitle}
									helperText={fieldErrors.eventTitle ?? `${form.eventTitle.length}/80 characters`}
									inputProps={{ maxLength: 80 }}
									className="ce-field"
								/>
								<TextField
									label="Description *"
									fullWidth
									multiline
									minRows={5}
									value={form.eventDesc}
									onChange={(e) => set('eventDesc', e.target.value)}
									error={!!fieldErrors.eventDesc}
									helperText={fieldErrors.eventDesc ?? 'Describe the event, terrain, requirements, and what participants can expect.'}
									className="ce-field"
								/>
							</Box>

							<Box component="div" className="ce-step-nav">
								<Box component="div" />
								<Button
									className="ce-btn ce-btn--next"
									endIcon={<ArrowForwardIcon />}
									onClick={nextStep}
								>
									Route & Schedule
								</Button>
							</Box>
						</Box>
					)}

					{/* ══ STEP 2: Route + Schedule ══ */}
					{step === 2 && (
						<Box component="div" className="ce-step-panel">
							{/* Route */}
							<Typography className="ce-section__title">
								<SwapHorizIcon className="ce-section__icon" />
								Route Information
							</Typography>
							<Typography className="ce-section__hint">
								Define the start and finish of your event route.
							</Typography>

							<Box component="div" className="ce-route-row">
								<Box component="div" className="ce-route-field">
									<LocationOnOutlinedIcon className="ce-route-field__pin ce-route-field__pin--from" />
									<TextField
										label="Start Location *"
										fullWidth
										value={form.fromLocation}
										onChange={(e) => set('fromLocation', e.target.value)}
										error={!!fieldErrors.fromLocation}
										helperText={fieldErrors.fromLocation ?? 'e.g. Seoul, Gangnam-gu'}
										placeholder="Start city or address"
										className="ce-field"
									/>
								</Box>

								<Box component="div" className="ce-route-connector">
									<Box component="div" className="ce-route-connector__line" />
									<ArrowForwardIcon className="ce-route-connector__arrow" />
								</Box>

								<Box component="div" className="ce-route-field">
									<LocationOnOutlinedIcon className="ce-route-field__pin ce-route-field__pin--to" />
									<TextField
										label="Destination *"
										fullWidth
										value={form.toLocation}
										onChange={(e) => set('toLocation', e.target.value)}
										error={!!fieldErrors.toLocation}
										helperText={fieldErrors.toLocation ?? 'e.g. Busan, Haeundae'}
										placeholder="Finish city or address"
										className="ce-field"
									/>
								</Box>
							</Box>

							<Box component="div" className="ce-route-stats">
								<TextField
									label="Distance (km) *"
									type="number"
									fullWidth
									value={form.distanceKm}
									onChange={(e) => set('distanceKm', e.target.value)}
									error={!!fieldErrors.distanceKm}
									helperText={fieldErrors.distanceKm ?? 'Total route distance in kilometres'}
									inputProps={{ min: 0.1, step: 0.1 }}
									InputProps={{
										startAdornment: <StraightenOutlinedIcon sx={{ mr: 1, color: '#aaa', fontSize: 20 }} />,
										endAdornment: <Typography sx={{ color: '#aaa', fontSize: 13 }}>km</Typography>,
									}}
									className="ce-field"
								/>
							</Box>

							{/* Schedule */}
							<Typography className="ce-section__title" sx={{ mt: 3 }}>
								<CalendarMonthOutlinedIcon className="ce-section__icon" />
								Schedule & Capacity
							</Typography>

							<Box component="div" className="ce-schedule-row">
								<TextField
									label="Event Date *"
									type="date"
									fullWidth
									value={form.eventDate}
									onChange={(e) => set('eventDate', e.target.value)}
									error={!!fieldErrors.eventDate}
									helperText={fieldErrors.eventDate ?? 'Select a future date'}
									InputLabelProps={{ shrink: true }}
									inputProps={{ min: new Date().toISOString().split('T')[0] }}
									className="ce-field"
								/>
								<TextField
									label="Max Participants"
									type="number"
									fullWidth
									value={form.maxParticipants}
									onChange={(e) => set('maxParticipants', Math.max(1, parseInt(e.target.value) || 1))}
									error={!!fieldErrors.maxParticipants}
									helperText={fieldErrors.maxParticipants ?? 'Maximum number of riders'}
									inputProps={{ min: 1, max: 10000 }}
									InputProps={{
										startAdornment: <GroupOutlinedIcon sx={{ mr: 1, color: '#aaa', fontSize: 20 }} />,
									}}
									className="ce-field"
								/>
							</Box>

							<Box component="div" className="ce-step-nav">
								<Button
									className="ce-btn ce-btn--back"
									startIcon={<ArrowBackIcon />}
									onClick={prevStep}
								>
									Back
								</Button>
								<Button
									className="ce-btn ce-btn--next"
									endIcon={<ArrowForwardIcon />}
									onClick={nextStep}
								>
									Preview & Publish
								</Button>
							</Box>
						</Box>
					)}

					{/* ══ STEP 3: Review + Publish ══ */}
					{step === 3 && (
						<Box component="div" className="ce-step-panel">
							<Typography className="ce-section__title">
								<RocketLaunchOutlinedIcon className="ce-section__icon" />
								Review your Event
							</Typography>
							<Typography className="ce-section__hint">
								Check everything looks right before publishing. You can edit your event after publishing.
							</Typography>

							{/* Summary cards */}
							<Box component="div" className="ce-review-grid">
								<Box component="div" className="ce-review-card" onClick={() => setStep(1)}>
									<Typography className="ce-review-card__label">Banner & Basics</Typography>
									<Box component="div" className="ce-review-card__thumb-wrap">
										{(coverPreview || form.eventImage) && (
											<img src={coverPreview || getImageUrl(form.eventImage)} alt="" className="ce-review-card__thumb" />
										)}
									</Box>
									<Typography className="ce-review-card__value" sx={{ fontWeight: 700, mt: 1 }}>
										{form.eventTitle}
									</Typography>
									<Typography className="ce-review-card__desc">
										{form.eventDesc.slice(0, 80)}{form.eventDesc.length > 80 ? '…' : ''}
									</Typography>
									<Typography className="ce-review-card__edit">Edit</Typography>
								</Box>

								<Box component="div" className="ce-review-card" onClick={() => setStep(2)}>
									<Typography className="ce-review-card__label">Route & Schedule</Typography>
									<Box component="div" className="ce-review-card__stat">
										<LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#e63946' }} />
										<Typography>{form.fromLocation} → {form.toLocation}</Typography>
									</Box>
									<Box component="div" className="ce-review-card__stat">
										<StraightenOutlinedIcon sx={{ fontSize: 16, color: '#e63946' }} />
										<Typography>{form.distanceKm} km</Typography>
									</Box>
									<Box component="div" className="ce-review-card__stat">
										<CalendarMonthOutlinedIcon sx={{ fontSize: 16, color: '#e63946' }} />
										<Typography>{displayDate(form.eventDate)}</Typography>
									</Box>
									<Box component="div" className="ce-review-card__stat">
										<GroupOutlinedIcon sx={{ fontSize: 16, color: '#e63946' }} />
										<Typography>{form.maxParticipants} riders max</Typography>
									</Box>
									<Typography className="ce-review-card__edit">Edit</Typography>
								</Box>
							</Box>

							{/* Status selector */}
							<Box component="div" className="ce-status-section">
								<Typography className="ce-section__title">Initial Status</Typography>
								<Typography className="ce-section__hint" sx={{ mb: 2 }}>
									New events should typically start as "Upcoming". Change this if you are publishing an event that is already in progress.
								</Typography>
								<Box component="div" className="ce-status-pills">
									{STATUS_OPTIONS.map((s) => (
										<Box
											component="div"
											key={s.value}
											className={`ce-status-pill ${form.eventStatus === s.value ? 'ce-status-pill--active' : ''}`}
											style={{ '--pill-color': s.color } as React.CSSProperties}
											onClick={() => set('eventStatus', s.value)}
										>
											<Box component="div" className="ce-status-pill__dot" style={{ background: s.color }} />
											{s.label}
										</Box>
									))}
								</Box>
							</Box>

							{/* Readiness checklist */}
							<Box component="div" className="ce-checklist">
								{[
									{ label: 'Banner uploaded',   done: !!form.eventImage },
									{ label: 'Title added',       done: form.eventTitle.trim().length >= 5 },
									{ label: 'Description added', done: form.eventDesc.trim().length >= 20 },
									{ label: 'Route defined',     done: !!(form.fromLocation && form.toLocation && form.distanceKm) },
									{ label: 'Date set',          done: !!(form.eventDate && new Date(form.eventDate) > new Date()) },
								].map((item) => (
									<Box component="div" key={item.label} className={`ce-checklist__item ${item.done ? 'done' : ''}`}>
										{item.done
											? <CheckCircleIcon sx={{ fontSize: 16 }} />
											: <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />
										}
										<Typography>{item.label}</Typography>
									</Box>
								))}
							</Box>

							<Box component="div" className="ce-step-nav">
								<Button className="ce-btn ce-btn--back" startIcon={<ArrowBackIcon />} onClick={prevStep}>
									Back
								</Button>
								<Tooltip title={!isReadyToPublish ? 'Complete all required fields first' : ''}>
									<span>
										<Button
											className="ce-btn ce-btn--publish"
											onClick={handleSubmit}
											disabled={!isReadyToPublish || submitting || uploading}
											startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <RocketLaunchOutlinedIcon />}
										>
											{submitting ? 'Publishing…' : 'Publish Event'}
										</Button>
									</span>
								</Tooltip>
							</Box>
						</Box>
					)}
				</Box>

				{/* ── RIGHT: Sticky live preview ── */}
				<Box component="div" className="ce-page__sidebar">
					<Box component="div" className="ce-preview">
						<Typography className="ce-preview__label">LIVE PREVIEW</Typography>

						<Box component="div" className="ce-preview__card">
							{/* Banner */}
							<Box component="div" className="ce-preview__img-wrap">
								{(coverPreview || form.eventImage) ? (
									<img
										src={coverPreview || getImageUrl(form.eventImage)}
										alt="preview"
										className="ce-preview__img"
									/>
								) : (
									<Box component="div" className="ce-preview__img-placeholder">
										<AddPhotoAlternateOutlinedIcon sx={{ fontSize: 32, color: '#ccc' }} />
										<Typography sx={{ fontSize: 11, color: '#aaa', mt: 0.5 }}>No banner yet</Typography>
									</Box>
								)}
								<Box component="div" className="ce-preview__img-overlay" />

								{/* Status badge */}
								<Box
									component="div"
									className="ce-preview__status"
									style={{ background: statusObj.color }}
								>
									{form.eventStatus}
								</Box>

								{/* Distance badge */}
								{form.distanceKm && (
									<Box component="div" className="ce-preview__distance">
										<StraightenOutlinedIcon sx={{ fontSize: 11 }} />
										{form.distanceKm} km
									</Box>
								)}
							</Box>

							{/* Card body */}
							<Box component="div" className="ce-preview__body">
								<Typography className="ce-preview__title" noWrap>
									{form.eventTitle || 'Event Title Will Appear Here'}
								</Typography>

								{(form.fromLocation || form.toLocation) && (
									<Box component="div" className="ce-preview__route">
										<LocationOnOutlinedIcon sx={{ fontSize: 13 }} />
										<Typography noWrap>
											{form.fromLocation || '—'} → {form.toLocation || '—'}
										</Typography>
									</Box>
								)}

								<Box component="div" className="ce-preview__chips">
									{form.eventDate && (
										<Chip
											icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 12 }} />}
											label={displayDate(form.eventDate) ?? ''}
											size="small"
											className="ce-preview__chip"
										/>
									)}
									{form.maxParticipants > 0 && (
										<Chip
											icon={<GroupOutlinedIcon sx={{ fontSize: 12 }} />}
											label={`${form.maxParticipants} riders`}
											size="small"
											className="ce-preview__chip"
										/>
									)}
								</Box>

								{/* Organizer */}
								<Box component="div" className="ce-preview__organizer">
									<Avatar
										src={getImageUrl(user?.memberImage, '/img/profile/defaultUser.svg')}
										sx={{ width: 26, height: 26 }}
									/>
									<Typography className="ce-preview__organizer-name">
										{user?.memberNick ?? 'You'}
									</Typography>
								</Box>
							</Box>
						</Box>

						{/* Completion indicator */}
						<Box component="div" className="ce-preview__progress">
							<Typography className="ce-preview__progress-label">
								Setup progress
							</Typography>
							<LinearProgress
								variant="determinate"
								value={
									([form.eventImage, form.eventTitle, form.eventDesc,
									  form.fromLocation && form.toLocation, form.distanceKm, form.eventDate]
									  .filter(Boolean).length / 6) * 100
								}
								className="ce-preview__progress-bar"
							/>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default withAuth(withLayoutBasic(CreateEventPage) as any, {
	roles: [MemberType.MEMBER, MemberType.ADMIN],
	redirectTo: '/account/join?referrer=/events/create',
}) as any;
