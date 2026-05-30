import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Box, Button, FormControl, MenuItem, Select,
	TextField, Typography, CircularProgress, LinearProgress, Tooltip,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useMutation, useReactiveVar } from '@apollo/client';
import axios from 'axios';
import { getJwtToken } from '../../../libs/auth';
import { userVar } from '../../../apollo/store';
import { BoardArticleCategory } from '../../../libs/enums/board-article.enum';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { getImageUrl } from '../../../libs/utils';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';

const CATEGORY_LABELS: Record<BoardArticleCategory, string> = {
	[BoardArticleCategory.FREE]:      'Free Board',
	[BoardArticleCategory.RECOMMEND]: 'Recommend',
	[BoardArticleCategory.NEWS]:      'News',
	[BoardArticleCategory.HUMOR]:     'Humor',
};

const readingTime = (text: string) => {
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
};

const WriteBlogPage: NextPage = () => {
	const router          = useRouter();
	const token           = getJwtToken();
	const user            = useReactiveVar(userVar);
	const coverInputRef   = useRef<HTMLInputElement>(null);
	const dropZoneRef     = useRef<HTMLDivElement>(null);

	const [articleTitle, setArticleTitle]       = useState('');
	const [articleContent, setArticleContent]   = useState('');
	const [articleImage, setArticleImage]       = useState('');
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);
	const [coverPreview, setCoverPreview]       = useState('');
	const [coverUploading, setCoverUploading]   = useState(false);
	const [uploadProgress, setUploadProgress]   = useState(0);
	const [isDragging, setIsDragging]           = useState(false);
	const [isSubmitting, setIsSubmitting]       = useState(false);

	useEffect(() => {
		if (!user?._id && typeof window !== 'undefined') {
			const timer = setTimeout(() => {
				if (!userVar()._id) router.push('/account/join?referrer=/community/write');
			}, 800);
			return () => clearTimeout(timer);
		}
	}, [user?._id]);

	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	const uploadImageToServer = useCallback(async (file: File): Promise<string | undefined> => {
		try {
			setUploadProgress(0);
			const fd = new FormData();
			fd.append('operations', JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }`,
				variables: { file: null, target: 'article' },
			}));
			fd.append('map', JSON.stringify({ '0': ['variables.file'] }));
			fd.append('0', file);

			const response = await axios.post(
				process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://localhost:3009/graphql',
				fd,
				{
					headers: {
						'apollo-require-preflight': 'true',
						Authorization: `Bearer ${token}`,
					},
					onUploadProgress: (e) => {
						if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
					},
				},
			);
			return response.data?.data?.imageUploader;
		} catch (err) {
			sweetErrorHandling(new Error('Image upload failed.')).then();
			return undefined;
		}
	}, [token]);

	const handleCoverFile = useCallback(async (file: File) => {
		if (!file.type.startsWith('image/')) return;
		setCoverPreview(URL.createObjectURL(file));
		setCoverUploading(true);
		const url = await uploadImageToServer(file);
		if (url) setArticleImage(url);
		setCoverUploading(false);
		setUploadProgress(0);
	}, [uploadImageToServer]);

	const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleCoverFile(file);
	}, [handleCoverFile]);

	const removeCover = useCallback(() => {
		setCoverPreview('');
		setArticleImage('');
		if (coverInputRef.current) coverInputRef.current.value = '';
	}, []);

	const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
	const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
	const onDrop      = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) handleCoverFile(file);
	}, [handleCoverFile]);

	const handleSubmit = useCallback(async () => {
		if (!user?._id) { router.push('/account/join'); return; }

		if (!articleTitle.trim()) {
			sweetErrorHandling(new Error('Please add a title before publishing.')).then(); return;
		}
		if (!articleContent.trim()) {
			sweetErrorHandling(new Error('Your story is empty. Please write something.')).then(); return;
		}

		setIsSubmitting(true);
		try {
			const input: any = {
				articleTitle:    articleTitle.trim(),
				articleContent:  articleContent.trim(),
				articleCategory,
			};
			if (articleImage) input.articleImage = articleImage;

			await createBoardArticle({ variables: { input } });
			await sweetTopSuccessAlert('Story published!', 700);
			await router.push('/community');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setIsSubmitting(false);
		}
	}, [user, router, articleTitle, articleContent, articleImage, articleCategory, createBoardArticle]);

	const wordCount    = useMemo(() => articleContent.trim().split(/\s+/).filter(Boolean).length, [articleContent]);
	const rtMin        = useMemo(() => readingTime(articleContent), [articleContent]);
	const plainExcerpt = articleContent.slice(0, 160);

	const readyChecks = [
		{ label: 'Cover image', done: !!articleImage,                      required: false },
		{ label: 'Title',       done: articleTitle.trim().length > 0,      required: true  },
		{ label: 'Content',     done: articleContent.trim().length > 0,    required: true  },
		{ label: 'Category',    done: true,                                required: true  },
	];
	const allReady = readyChecks.filter((c) => c.required).every((c) => c.done);

	return (
		<Box component="div" id="write-blog-page">

			{/* ── Sticky top nav ── */}
			<Box component="div" className="wb-nav">
				<Box component="div" className="wb-nav__left">
					<Typography className="wb-nav__brand">New Story</Typography>
					{wordCount > 0 && (
						<Typography className="wb-nav__wordcount">{wordCount} words · {rtMin} min read</Typography>
					)}
				</Box>
				<Box component="div" className="wb-nav__right">
					<Button
						className="wb-nav__btn wb-nav__btn--cancel"
						onClick={() => router.push('/community')}
						disabled={isSubmitting}
					>
						Discard
					</Button>
					<Tooltip title={!allReady ? 'Complete all requirements before publishing' : ''} arrow>
						<span>
							<Button
								className="wb-nav__btn wb-nav__btn--publish"
								onClick={handleSubmit}
								disabled={isSubmitting || !allReady}
								startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
							>
								{isSubmitting ? 'Publishing…' : 'Publish'}
							</Button>
						</span>
					</Tooltip>
				</Box>
			</Box>

			{/* ── Two-column body ── */}
			<Box component="div" className="wb-body">

				{/* ── LEFT: writing column ── */}
				<Box component="div" className="wb-editor-col">

					{/* Cover upload */}
					<Box component="div" className="wb-cover">
						{coverPreview ? (
							<Box component="div" className="wb-cover__preview">
								<img src={coverPreview} alt="Cover" className="wb-cover__img" />
								{coverUploading && (
									<Box component="div" className="wb-cover__progress-wrap">
										<LinearProgress variant="determinate" value={uploadProgress} className="wb-cover__progress" />
										<Typography className="wb-cover__progress-label">Uploading {uploadProgress}%</Typography>
									</Box>
								)}
								<Box component="div" className="wb-cover__actions">
									<Button startIcon={<AddPhotoAlternateOutlinedIcon />}
										onClick={() => coverInputRef.current?.click()} disabled={coverUploading}
										className="wb-cover__btn">Change</Button>
									<Button startIcon={<CancelOutlinedIcon />}
										onClick={removeCover} disabled={coverUploading}
										className="wb-cover__btn wb-cover__btn--remove">Remove</Button>
								</Box>
							</Box>
						) : (
							<Box
								component="div"
								ref={dropZoneRef}
								className={`wb-cover__drop${isDragging ? ' dragging' : ''}`}
								onClick={() => coverInputRef.current?.click()}
								onDragEnter={onDragEnter}
								onDragOver={(e: React.DragEvent) => e.preventDefault()}
								onDragLeave={onDragLeave}
								onDrop={onDrop}
							>
								<AddPhotoAlternateOutlinedIcon className="wb-cover__drop-icon" />
								<Typography className="wb-cover__drop-text">
									{isDragging ? 'Drop to set cover' : 'Add cover image'}
								</Typography>
								<Typography className="wb-cover__drop-sub">
									Drag & drop or click · JPG, PNG · 1400 × 600 recommended
								</Typography>
							</Box>
						)}
						<input ref={coverInputRef} type="file" accept="image/*" hidden onChange={handleCoverChange} />
					</Box>

					{/* Title */}
					<TextField
						className="wb-title-input"
						placeholder="Your story title…"
						multiline
						variant="standard"
						fullWidth
						value={articleTitle}
						onChange={(e) => setArticleTitle(e.target.value)}
						InputProps={{ disableUnderline: true }}
						inputProps={{ maxLength: 120 }}
					/>

					<Box component="div" className="wb-divider" />

					{/* Content textarea */}
					<TextField
						className="wb-content-input"
						placeholder="Tell your cycling story…"
						multiline
						variant="standard"
						fullWidth
						minRows={18}
						value={articleContent}
						onChange={(e) => setArticleContent(e.target.value)}
						InputProps={{ disableUnderline: true }}
					/>
				</Box>

				{/* ── RIGHT: Sidebar ── */}
				<Box component="div" className="wb-sidebar">

					{/* Live preview card */}
					<Box component="div" className="wb-sidebar__section">
						<Typography className="wb-sidebar__section-label">Preview</Typography>
						<Box component="div" className="wb-preview-card">
							<Box component="div" className="wb-preview-card__img-wrap">
								{coverPreview || articleImage ? (
									<img
										src={coverPreview || getImageUrl(articleImage)}
										alt="preview"
										className="wb-preview-card__img"
									/>
								) : (
									<Box component="div" className="wb-preview-card__img-empty">
										<AddPhotoAlternateOutlinedIcon sx={{ fontSize: 28, color: '#ccc' }} />
									</Box>
								)}
								<Box component="div" className="wb-preview-card__cat-badge">{CATEGORY_LABELS[articleCategory]}</Box>
							</Box>
							<Box component="div" className="wb-preview-card__body">
								<Typography className="wb-preview-card__title" noWrap={false}>
									{articleTitle || <span className="wb-preview-card__placeholder">Your title will appear here</span>}
								</Typography>
								{plainExcerpt && (
									<Typography className="wb-preview-card__excerpt">
										{plainExcerpt}{plainExcerpt.length >= 160 ? '…' : ''}
									</Typography>
								)}
								<Box component="div" className="wb-preview-card__meta">
									<img
										src={getImageUrl(user?.memberImage, '/img/profile/defaultUser.svg')}
										alt={user?.memberNick}
										className="wb-preview-card__avatar"
									/>
									<Box component="div">
										<Typography className="wb-preview-card__author">{user?.memberNick ?? 'You'}</Typography>
										<Box component="div" className="wb-preview-card__info">
											<AccessTimeIcon sx={{ fontSize: 12 }} />
											<span>{rtMin} min read</span>
											<RemoveRedEyeOutlinedIcon sx={{ fontSize: 12, ml: '6px' }} />
											<span>0</span>
										</Box>
									</Box>
								</Box>
							</Box>
						</Box>
					</Box>

					{/* Settings */}
					<Box component="div" className="wb-sidebar__section">
						<Typography className="wb-sidebar__section-label">Settings</Typography>
						<Box component="div" className="wb-settings">
							<Typography className="wb-settings__label">Category</Typography>
							<FormControl fullWidth size="small">
								<Select
									value={articleCategory}
									onChange={(e) => setArticleCategory(e.target.value as BoardArticleCategory)}
									className="wb-settings__select"
								>
									{Object.entries(CATEGORY_LABELS).map(([val, label]) => (
										<MenuItem key={val} value={val}>{label}</MenuItem>
									))}
								</Select>
							</FormControl>
						</Box>
					</Box>

					{/* Readiness checklist */}
					<Box component="div" className="wb-sidebar__section">
						<Typography className="wb-sidebar__section-label">Checklist</Typography>
						<Box component="div" className="wb-checklist">
							{readyChecks.map((check) => (
								<Box component="div" key={check.label} className={`wb-checklist__item${check.done ? ' done' : ''}`}>
									{check.done
										? <CheckCircleIcon sx={{ fontSize: 15 }} />
										: <RadioButtonUncheckedIcon sx={{ fontSize: 15 }} />}
									<Typography>
										{check.label}
										{!check.required && (
											<Box component="span" sx={{ fontSize: 10, color: '#9a9a96', ml: '5px', fontWeight: 500 }}>
												optional
											</Box>
										)}
									</Typography>
								</Box>
							))}
						</Box>
					</Box>

					{/* Publish */}
					<Box component="div" className="wb-sidebar__section">
						<Tooltip title={!allReady ? 'Complete all checklist items first' : ''} arrow placement="top">
							<span style={{ display: 'block' }}>
								<Button
									fullWidth
									className="wb-sidebar__publish-btn"
									onClick={handleSubmit}
									disabled={isSubmitting || !allReady}
									startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
								>
									{isSubmitting ? 'Publishing…' : 'Publish Story'}
								</Button>
							</span>
						</Tooltip>
						<Button
							fullWidth
							className="wb-sidebar__cancel-btn"
							onClick={() => router.push('/community')}
							disabled={isSubmitting}
						>
							Discard
						</Button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default withLayoutBasic(WriteBlogPage);
