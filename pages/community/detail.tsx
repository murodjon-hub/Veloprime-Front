import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Box, Typography, Button, CircularProgress,
	IconButton, Tooltip, LinearProgress,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Moment from 'react-moment';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { GET_BOARD_ARTICLE, GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { getImageUrl } from '../../libs/utils';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import Swal from 'sweetalert2';

const readingTime = (html: string) => {
	const words = (html ?? '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
};

const CATEGORY_LABELS: Record<string, string> = {
	FREE: 'Free Board', RECOMMEND: 'Recommend', NEWS: 'News', HUMOR: 'Humor',
};

const ArticleDetailPage: NextPage = () => {
	const router = useRouter();
	const { id }  = router.query;
	const user    = useReactiveVar(userVar);
	const articleRef = useRef<HTMLDivElement>(null);

	const [liked, setLiked]           = useState(false);
	const [likeCount, setLikeCount]   = useState(0);
	const [initialized, setInit]      = useState(false);
	const [readProgress, setProgress] = useState(0);

	// Reading progress bar
	useEffect(() => {
		const onScroll = () => {
			const el  = articleRef.current;
			if (!el) return;
			const rect  = el.getBoundingClientRect();
			const total = el.offsetHeight - window.innerHeight;
			if (total <= 0) { setProgress(100); return; }
			const scrolled = Math.max(0, -rect.top);
			setProgress(Math.min(100, Math.round((scrolled / total) * 100)));
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const { data, loading } = useQuery(GET_BOARD_ARTICLE, {
		variables: { input: id as string },
		skip: !id,
		onCompleted(data) {
			if (!initialized && data?.getBoardArticle) {
				const a = data.getBoardArticle;
				setLiked(a.meLiked?.[0]?.myFavorite ?? false);
				setLikeCount(a.articleLikes);
				setInit(true);
			}
		},
	});

	const { data: relatedData } = useQuery(GET_BOARD_ARTICLES, {
		variables: { input: { page: 1, limit: 4, sort: 'createdAt', direction: 'DESC', search: {} } },
		skip: !id,
	});

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const article: BoardArticle | undefined = data?.getBoardArticle;
	const related: BoardArticle[] = (relatedData?.getBoardArticles?.list ?? [])
		.filter((a: BoardArticle) => a._id !== id)
		.slice(0, 3);

	const rtMin = article ? readingTime(article.articleContent) : 1;

	const handleLike = async () => {
		if (!user?._id) {
			Swal.fire({ icon: 'warning', title: 'Login required', text: 'Please login to like this article.', confirmButtonColor: '#1a1a1a' });
			return;
		}
		try {
			const { data: md } = await likeTargetBoardArticle({ variables: { input: article!._id } });
			const newCount = md?.likeTargetBoardArticle?.articleLikes ?? likeCount;
			const nowLiked = newCount > likeCount;
			setLiked(nowLiked);
			setLikeCount(newCount);
		} catch (err: any) {
			sweetMixinErrorAlert(err?.message ?? 'Like failed').then();
		}
	};

	const handleShare = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			Swal.fire({ icon: 'success', title: 'Link copied!', timer: 1200, showConfirmButton: false });
		} catch {
			Swal.fire({ icon: 'info', title: 'Share this link', text: window.location.href });
		}
	};

	const goToAuthor = () => {
		if (!article?.memberData?._id) return;
		if (article.memberData._id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${article.memberData._id}`);
	};

	const goToArticle = (a: BoardArticle) => {
		router.push(
			{ pathname: '/community/detail', query: { id: a._id, articleCategory: a.articleCategory } },
			undefined,
			{ shallow: true },
		);
	};

	if (loading) {
		return (
			<Box component="div" className="article-detail-page">
				<Box component="div" className="article-detail-page__loading">
					<CircularProgress sx={{ color: '#1a1a1a' }} size={44} />
				</Box>
			</Box>
		);
	}

	if (!article) {
		return (
			<Box component="div" className="article-detail-page">
				<Box component="div" className="article-detail-page__not-found">
					<Typography variant="h4">Article not found</Typography>
					<Button onClick={() => router.push('/community')} className="article-detail-page__back-btn">
						Back to Community
					</Button>
				</Box>
			</Box>
		);
	}

	return (
		<Box component="div" className="article-detail-page" ref={articleRef}>

			{/* ── Sticky reading progress ── */}
			<LinearProgress
				variant="determinate"
				value={readProgress}
				className="article-detail-page__progress"
			/>

			{/* ── Hero cover ── */}
			<Box component="div" className="article-detail-page__hero">
				{article.articleImage ? (
					<>
						<img
							src={getImageUrl(article.articleImage, '/img/community/communityImg.png')}
							alt={article.articleTitle}
							className="article-detail-page__hero-img"
						/>
						<Box component="div" className="article-detail-page__hero-overlay" />
					</>
				) : (
					<Box component="div" className="article-detail-page__hero-gradient" />
				)}
				<Box component="div" className="article-detail-page__hero-content">
					<Button
						startIcon={<ArrowBackIcon />}
						className="article-detail-page__back-btn"
						onClick={() => router.push('/community')}
					>
						Community
					</Button>
					<Box component="div" className="article-detail-page__hero-cat">
						{CATEGORY_LABELS[article.articleCategory] ?? article.articleCategory}
					</Box>
					<Typography variant="h1" className="article-detail-page__hero-title">
						{article.articleTitle}
					</Typography>
					<Box component="div" className="article-detail-page__hero-meta">
						<img
							src={getImageUrl(article.memberData?.memberImage, '/img/profile/defaultUser.svg')}
							alt={article.memberData?.memberNick}
							className="article-detail-page__hero-avatar"
							onClick={goToAuthor}
						/>
						<Box component="div">
							<Typography className="article-detail-page__hero-author" onClick={goToAuthor}>
								{article.memberData?.memberNick ?? 'Anonymous'}
							</Typography>
							<Box component="div" className="article-detail-page__hero-date-row">
								<Moment format="MMMM DD, YYYY">{article.createdAt}</Moment>
								<span className="article-detail-page__hero-dot">·</span>
								<AccessTimeIcon sx={{ fontSize: 13 }} />
								<span>{rtMin} min read</span>
								<span className="article-detail-page__hero-dot">·</span>
								<RemoveRedEyeOutlinedIcon sx={{ fontSize: 13 }} />
								<span>{article.articleViews}</span>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>

			{/* ── Main layout: content + sticky actions ── */}
			<Box component="div" className="article-detail-page__layout">

				{/* ── Sticky left actions ── */}
				<Box component="div" className="article-detail-page__actions-col">
					<Box component="div" className="article-detail-page__actions">
						<Tooltip title={liked ? 'Unlike' : 'Like'} placement="right">
							<Box component="div" className="article-detail-page__action-btn" onClick={handleLike}>
								{liked
									? <FavoriteIcon className="article-detail-page__action-icon article-detail-page__action-icon--liked" />
									: <FavoriteBorderIcon className="article-detail-page__action-icon" />}
								<Typography className="article-detail-page__action-count">{likeCount}</Typography>
							</Box>
						</Tooltip>
						<Tooltip title="Comments" placement="right">
							<Box component="div" className="article-detail-page__action-btn">
								<ChatBubbleOutlineIcon className="article-detail-page__action-icon" />
								<Typography className="article-detail-page__action-count">{article.articleComments}</Typography>
							</Box>
						</Tooltip>
						<Tooltip title="Share" placement="right">
							<Box component="div" className="article-detail-page__action-btn" onClick={handleShare}>
								<ShareOutlinedIcon className="article-detail-page__action-icon" />
							</Box>
						</Tooltip>
					</Box>
				</Box>

				{/* ── Article body ── */}
				<Box component="div" className="article-detail-page__content-col">

					{/* Rendered HTML from Toast UI WYSIWYG */}
					<Box
						component="div"
						className="article-detail-page__body toastui-editor-contents"
						dangerouslySetInnerHTML={{ __html: article.articleContent }}
					/>

					{/* ── Bottom actions ── */}
					<Box component="div" className="article-detail-page__bottom-actions">
						<Button
							variant={liked ? 'contained' : 'outlined'}
							startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
							onClick={handleLike}
							className={`article-detail-page__bottom-btn${liked ? ' liked' : ''}`}
						>
							{liked ? 'Liked' : 'Like'} · {likeCount}
						</Button>
						<Button
							variant="outlined"
							startIcon={<ShareOutlinedIcon />}
							onClick={handleShare}
							className="article-detail-page__bottom-btn"
						>
							Share
						</Button>
					</Box>

					{/* ── Author card ── */}
					<Box component="div" className="article-detail-page__author-card" onClick={goToAuthor}>
						<img
							src={getImageUrl(article.memberData?.memberImage, '/img/profile/defaultUser.svg')}
							alt={article.memberData?.memberNick}
							className="article-detail-page__author-card-img"
						/>
						<Box component="div">
							<Typography className="article-detail-page__author-card-name">
								{article.memberData?.memberNick ?? 'Anonymous'}
							</Typography>
							{article.memberData?.memberDesc && (
								<Typography className="article-detail-page__author-card-bio">
									{article.memberData.memberDesc}
								</Typography>
							)}
							<Box component="div" className="article-detail-page__author-card-stats">
								<Box component="div" className="article-detail-page__author-card-stat">
									<RemoveRedEyeOutlinedIcon sx={{ fontSize: 13 }} />
									<span>{article.memberData?.memberViews ?? 0} profile views</span>
								</Box>
								<Box component="div" className="article-detail-page__author-card-stat">
									<FavoriteBorderIcon sx={{ fontSize: 13 }} />
									<span>{article.memberData?.memberLikes ?? 0} likes</span>
								</Box>
							</Box>
						</Box>
					</Box>

					{/* ── Related articles ── */}
					{related.length > 0 && (
						<Box component="div" className="article-detail-page__related">
							<Typography className="article-detail-page__related-title">More from Community</Typography>
							<Box component="div" className="article-detail-page__related-grid">
								{related.map((a) => (
									<Box component="div" key={a._id} className="related-card" onClick={() => goToArticle(a)}>
										<Box component="div" className="related-card__img-wrap">
											<img
												src={getImageUrl(a.articleImage, '/img/community/communityImg.png')}
												alt={a.articleTitle}
												className="related-card__img"
											/>
										</Box>
										<Box component="div" className="related-card__body">
											<Typography className="related-card__cat">
												{CATEGORY_LABELS[a.articleCategory] ?? a.articleCategory}
											</Typography>
											<Typography className="related-card__title">{a.articleTitle}</Typography>
											<Box component="div" className="related-card__meta">
												<img
													src={getImageUrl(a.memberData?.memberImage, '/img/profile/defaultUser.svg')}
													alt="" className="related-card__avatar"
												/>
												<Typography className="related-card__author">{a.memberData?.memberNick ?? 'Anonymous'}</Typography>
												<span className="related-card__dot">·</span>
												<Typography className="related-card__date">
													<Moment fromNow>{a.createdAt}</Moment>
												</Typography>
											</Box>
										</Box>
									</Box>
								))}
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default withLayoutBasic(ArticleDetailPage);
