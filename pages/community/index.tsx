import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Box, Typography, Button, Chip, Skeleton, Pagination, Stack,
	InputAdornment, TextField,
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { T } from '../../libs/types/common';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { getImageUrl } from '../../libs/utils';
import Moment from 'react-moment';

const CATEGORIES = [
	{ label: 'All',       value: null },
	{ label: 'Free',      value: BoardArticleCategory.FREE },
	{ label: 'Recommend', value: BoardArticleCategory.RECOMMEND },
	{ label: 'News',      value: BoardArticleCategory.NEWS },
	{ label: 'Humor',     value: BoardArticleCategory.HUMOR },
];

const READING_TIME = (content: string) => {
	const words = content?.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length ?? 0;
	return Math.max(1, Math.round(words / 200));
};

const Community: NextPage = ({ initialInput }: T) => {
	const router = useRouter();
	const user   = useReactiveVar(userVar);

	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [searchText, setSearchText] = useState('');
	const [searchCommunity, setSearchCommunity] = useState({ ...initialInput });
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { data, loading, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchCommunity },
	});

	const boardArticles: BoardArticle[] = data?.getBoardArticles?.list ?? [];
	const totalCount: number            = data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;

	const goToArticle = (article: BoardArticle) => {
		router.push(
			{ pathname: '/community/detail', query: { id: article._id, articleCategory: article.articleCategory } },
			undefined,
			{ shallow: true },
		);
	};

	const categoryHandler = (value: string | null) => {
		setActiveCategory(value);
		setSearchCommunity({ ...searchCommunity, page: 1, search: value ? { articleCategory: value } : {} });
	};

	const searchHandler = (e: React.KeyboardEvent) => {
		if (e.key !== 'Enter') return;
		setSearchCommunity({ ...searchCommunity, page: 1, search: searchText ? { text: searchText } : {} });
	};

	const paginationHandler = (_: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeHandler = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);
			await likeTargetBoardArticle({ variables: { input: id } });
			await refetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('', 500);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handleWriteClick = () => {
		if (!user?._id) { router.push('/account/join?referrer=/community/write'); return; }
		router.push('/community/write');
	};

	const featuredArticle = boardArticles[0];
	const restArticles    = boardArticles.slice(1);

	return (
		<Box component="div" className="community-page">

			{/* ── Hero header ── */}
			<Box component="div" className="community-page__hero">
				<Box component="div" className="community-page__hero-inner">
					<Typography className="community-page__hero-eyebrow">VeloPrime Community</Typography>
					<Typography variant="h1" className="community-page__hero-title">
						Stories from the Saddle
					</Typography>
					<Typography className="community-page__hero-sub">
						Ride reports, gear reviews, route guides, and cycling culture — written by riders, for riders.
					</Typography>
					<Box component="div" className="community-page__hero-actions">
						<Button
							variant="contained"
							startIcon={<CreateIcon />}
							className="community-page__write-btn"
							onClick={handleWriteClick}
						>
							Write a Story
						</Button>
						<TextField
							placeholder="Search stories…"
							size="small"
							className="community-page__search"
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							onKeyDown={searchHandler}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ fontSize: 18, color: '#999' }} />
									</InputAdornment>
								),
							}}
						/>
					</Box>
				</Box>
			</Box>

			{/* ── Category tabs ── */}
			<Box component="div" className="community-page__cats">
				<Box component="div" className="community-page__cats-inner">
					{CATEGORIES.map((cat) => (
						<Chip
							key={cat.label}
							label={cat.label}
							onClick={() => categoryHandler(cat.value)}
							className={`community-page__cat-chip${activeCategory === cat.value ? ' active' : ''}`}
						/>
					))}
				</Box>
			</Box>

			<Box component="div" className="community-page__body">

				{/* ── Featured article (first result, large) ── */}
				{!loading && featuredArticle && (
					<Box component="div" className="community-page__featured" onClick={() => goToArticle(featuredArticle)}>
						<Box component="div" className="community-page__featured-img-wrap">
							<img
								src={getImageUrl(featuredArticle.articleImage, '/img/community/communityImg.png')}
								alt={featuredArticle.articleTitle}
								className="community-page__featured-img"
							/>
							<Box component="div" className="community-page__featured-cat">
								{featuredArticle.articleCategory}
							</Box>
						</Box>
						<Box component="div" className="community-page__featured-body">
							<Typography className="community-page__featured-title">
								{featuredArticle.articleTitle}
							</Typography>
							<Typography className="community-page__featured-excerpt">
								{featuredArticle.articleContent.replace(/<[^>]+>/g, '').slice(0, 200)}…
							</Typography>
							<Box component="div" className="community-page__featured-meta">
								<img
									src={getImageUrl(featuredArticle.memberData?.memberImage, '/img/profile/defaultUser.svg')}
									alt=""
									className="community-page__featured-avatar"
								/>
								<Box component="div">
									<Typography className="community-page__featured-author">
										{featuredArticle.memberData?.memberNick ?? 'Anonymous'}
									</Typography>
									<Typography className="community-page__featured-date">
										<Moment format="MMM DD, YYYY">{featuredArticle.createdAt}</Moment>
										{' · '}{READING_TIME(featuredArticle.articleContent)} min read
									</Typography>
								</Box>
								<Box component="div" className="community-page__featured-stats">
									<Box component="div" className="community-page__stat" onClick={(e: React.MouseEvent) => likeHandler(e, featuredArticle._id)}>
										{featuredArticle.meLiked?.[0]?.myFavorite
											? <FavoriteIcon sx={{ fontSize: 15, color: '#e02323' }} />
											: <FavoriteBorderIcon sx={{ fontSize: 15 }} />}
										<span>{featuredArticle.articleLikes}</span>
									</Box>
									<Box component="div" className="community-page__stat">
										<RemoveRedEyeOutlinedIcon sx={{ fontSize: 15 }} />
										<span>{featuredArticle.articleViews}</span>
									</Box>
								</Box>
							</Box>
						</Box>
					</Box>
				)}
				{loading && (
					<Box component="div" className="community-page__featured community-page__featured--skeleton">
						<Skeleton variant="rectangular" className="community-page__featured-img" sx={{ height: '100%', minHeight: 320, borderRadius: 2 }} />
					</Box>
				)}

				{/* ── Article grid ── */}
				<Box component="div" className="community-page__grid">
					{loading
						? Array.from({ length: 5 }).map((_, i) => (
								<Box component="div" key={i} className="article-card">
									<Skeleton variant="rectangular" sx={{ height: 180, borderRadius: '12px 12px 0 0' }} />
									<Box component="div" sx={{ p: 2 }}>
										<Skeleton width="40%" height={18} sx={{ mb: 1 }} />
										<Skeleton width="95%" height={22} />
										<Skeleton width="70%" height={22} sx={{ mb: 1.5 }} />
										<Skeleton width="55%" height={16} />
									</Box>
								</Box>
						  ))
						: restArticles.map((article) => (
								<Box component="div" key={article._id} className="article-card" onClick={() => goToArticle(article)}>
									<Box component="div" className="article-card__img-wrap">
										<img
											src={getImageUrl(article.articleImage, '/img/community/communityImg.png')}
											alt={article.articleTitle}
											className="article-card__img"
										/>
										<Box component="div" className="article-card__cat">{article.articleCategory}</Box>
									</Box>
									<Box component="div" className="article-card__body">
										<Typography className="article-card__title" title={article.articleTitle}>
											{article.articleTitle}
										</Typography>
										<Typography className="article-card__excerpt">
											{article.articleContent.replace(/<[^>]+>/g, '').slice(0, 110)}…
										</Typography>
										<Box component="div" className="article-card__footer">
											<img
												src={getImageUrl(article.memberData?.memberImage, '/img/profile/defaultUser.svg')}
												alt=""
												className="article-card__avatar"
											/>
											<Box component="div" className="article-card__author-col">
												<Typography className="article-card__author">{article.memberData?.memberNick ?? 'Anonymous'}</Typography>
												<Typography className="article-card__date">
													<Moment format="MMM DD">{article.createdAt}</Moment>
													{' · '}{READING_TIME(article.articleContent)} min
												</Typography>
											</Box>
											<Box component="div" className="article-card__stats">
												<Box
													component="div"
													className={`article-card__stat article-card__stat--like${article.meLiked?.[0]?.myFavorite ? ' liked' : ''}`}
													onClick={(e: React.MouseEvent) => likeHandler(e, article._id)}
												>
													{article.meLiked?.[0]?.myFavorite
														? <FavoriteIcon sx={{ fontSize: 13 }} />
														: <FavoriteBorderIcon sx={{ fontSize: 13 }} />}
													<span>{article.articleLikes}</span>
												</Box>
												<Box component="div" className="article-card__stat">
													<ChatBubbleOutlineIcon sx={{ fontSize: 13 }} />
													<span>{article.articleComments}</span>
												</Box>
											</Box>
										</Box>
									</Box>
								</Box>
						  ))}

					{!loading && boardArticles.length === 0 && (
						<Box component="div" className="community-page__empty">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<Typography>No stories found.</Typography>
							<Button variant="contained" className="community-page__write-btn" onClick={handleWriteClick} sx={{ mt: 2 }}>
								Be the first to write
							</Button>
						</Box>
					)}
				</Box>
			</Box>

			{totalCount > searchCommunity.limit && (
				<Stack className="community-page__pagination">
					<Pagination
						count={Math.ceil(totalCount / searchCommunity.limit)}
						page={searchCommunity.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Typography className="community-page__pagination-total">
						{totalCount} stories total
					</Typography>
				</Stack>
			)}
		</Box>
	);
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 7,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(Community);
