import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { getImageUrl } from '../../utils';
import { sweetErrorHandling } from '../../sweetAlert';
import { BoardArticle } from '../../types/board-article/board-article';

const INITIAL_INPUT = {
	page: 1,
	limit: 3,
	sort: 'createdAt',
	direction: 'DESC',
	search: {},
};

const CATEGORY_LABELS: Record<string, string> = {
	FREE: 'Free Board',
	RECOMMEND: 'Recommend',
	NEWS: 'News',
	HUMOR: 'Humor',
};

const Community = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const { data, loading, refetch } = useQuery(GET_BOARD_ARTICLES, {
		variables: { input: INITIAL_INPUT },
		notifyOnNetworkStatusChange: true,
	});

	const [likeArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const articles: BoardArticle[] = data?.getBoardArticles?.list ?? [];

	const likeHandler = useCallback(
		async (e: React.MouseEvent, articleId: string) => {
			e.stopPropagation();
			if (!user._id) {
				router.push('/account/join');
				return;
			}
			try {
				await likeArticle({ variables: { input: articleId } });
				await refetch();
			} catch (err) {
				await sweetErrorHandling(err);
			}
		},
		[user._id, likeArticle, refetch, router],
	);

	const goToArticle = (article: BoardArticle) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { id: article._id, articleCategory: article.articleCategory },
			},
			undefined,
			{ shallow: true },
		);
	};

	return (
		<Box component="div" className="community-section">
			{/* ── Cinematic hero banner ── */}
			<Box component="div" className="hero-section">
				<img
					src="/img/berend-verheijen-JQu0OZ9YqUY-unsplash.jpg"
					alt="Mountain biking action background"
					className="hero-bg-image"
				/>
				<Box component="div" className="hero-overlay" />
				<Box component="div" className="hero-content">
					<Typography variant="h2" component="h1" className="hero-title">
						JOIN OUR COMMUNITY
						<br />
						OF RIDERS
					</Typography>
					<Typography variant="body1" className="hero-subtitle">
						Ride reports, gear reviews, local trails, race recaps — all from fellow cyclists.
						Add your voice to the conversation.
					</Typography>
					<Button
						variant="contained"
						disableElevation
						endIcon={<ArrowForwardIcon />}
						className="hero-cta-button"
						onClick={() => router.push('/community')}
					>
						Explore Community
					</Button>
				</Box>
			</Box>

			{/* ── Article cards ── */}
			<Box component="div" className="community-articles">
				<Box component="div" className="community-articles__header">
					<Typography className="community-articles__heading">Latest from the Community</Typography>
					<Button
						endIcon={<ArrowForwardIcon />}
						className="community-articles__view-all"
						onClick={() => router.push('/community')}
					>
						View all
					</Button>
				</Box>

				<Box component="div" className="community-articles__grid">
					{loading
						? Array.from({ length: 3 }).map((_, i) => (
								<Box component="div" key={i} className="community-card">
									<Skeleton variant="rectangular" className="community-card__img" />
									<Box component="div" className="community-card__body">
										<Skeleton width="30%" height={20} sx={{ mb: 1 }} />
										<Skeleton width="90%" height={24} />
										<Skeleton width="70%" height={24} sx={{ mb: 1.5 }} />
										<Skeleton width="50%" height={18} />
									</Box>
								</Box>
						  ))
						: articles.map((article) => {
								const liked = article.meLiked?.[0]?.myFavorite ?? false;
								const categoryLabel = CATEGORY_LABELS[article.articleCategory] ?? article.articleCategory;
								const publishDate = new Date(article.createdAt).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: 'numeric',
								});

								return (
									<Box
										component="div"
										key={article._id}
										className="community-card"
										onClick={() => goToArticle(article)}
									>
										<Box component="div" className="community-card__img-wrap">
											<img
												src={getImageUrl(article.articleImage, '/img/community/communityImg.png')}
												alt={article.articleTitle}
												className="community-card__img"
											/>
											<Box component="div" className="community-card__category">{categoryLabel}</Box>
										</Box>

										<Box component="div" className="community-card__body">
											<Typography className="community-card__title" title={article.articleTitle}>
												{article.articleTitle}
											</Typography>

											<Box component="div" className="community-card__author">
												<img
													src={getImageUrl(
														article.memberData?.memberImage,
														'/img/profile/defaultUser.svg',
													)}
													alt={article.memberData?.memberNick ?? 'Author'}
													className="community-card__avatar"
												/>
												<Box component="div">
													<Typography className="community-card__author-name">
														{article.memberData?.memberNick ?? 'Anonymous'}
													</Typography>
													<Typography className="community-card__date">{publishDate}</Typography>
												</Box>
											</Box>

											<Box component="div" className="community-card__stats">
												<Box
													component="div"
													className={`community-card__stat community-card__stat--like${liked ? ' liked' : ''}`}
													onClick={(e: React.MouseEvent) => likeHandler(e, article._id)}
													title={liked ? 'Unlike' : 'Like'}
												>
													{liked ? (
														<FavoriteIcon sx={{ fontSize: 15 }} />
													) : (
														<FavoriteBorderIcon sx={{ fontSize: 15 }} />
													)}
													<span>{article.articleLikes}</span>
												</Box>
												<Box component="div" className="community-card__stat">
													<RemoveRedEyeIcon sx={{ fontSize: 15 }} />
													<span>{article.articleViews}</span>
												</Box>
												<Box component="div" className="community-card__stat">
													<ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />
													<span>{article.articleComments}</span>
												</Box>
											</Box>
										</Box>
									</Box>
								);
						  })}

					{!loading && articles.length === 0 && (
						<Box component="div" className="community-articles__empty">
							<Typography>No articles yet — be the first to share!</Typography>
							<Button
								variant="contained"
								className="hero-cta-button"
								onClick={() => router.push('/community/write')}
								sx={{ mt: 2 }}
							>
								Write an Article
							</Button>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default Community;
