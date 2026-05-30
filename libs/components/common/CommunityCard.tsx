import React from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';
import { getImageUrl } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

const CATEGORY_LABELS: Record<string, string> = {
	FREE: 'Free Board', RECOMMEND: 'Recommend', NEWS: 'News', HUMOR: 'Humor',
};

const readingTime = (html: string) => {
	const words = (html ?? '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
};

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: 'normal' | 'small';
	likeArticleHandler: (e: React.MouseEvent, user: any, articleId: string) => void;
}

const CommunityCard = ({ boardArticle, size = 'normal', likeArticleHandler }: CommunityCardProps) => {
	const router = useRouter();
	const user   = useReactiveVar(userVar);

	const goToArticle = () => {
		router.push(
			{ pathname: '/community/detail', query: { id: boardArticle._id, articleCategory: boardArticle.articleCategory } },
			undefined,
			{ shallow: true },
		);
	};

	const goToMember = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		const mid = boardArticle.memberData?._id;
		if (!mid) return;
		if (mid === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${mid}`);
	};

	const liked   = boardArticle.meLiked?.[0]?.myFavorite ?? false;
	const rtMin   = readingTime(boardArticle.articleContent);
	const excerpt = boardArticle.articleContent.replace(/<[^>]+>/g, '').slice(0, 90);

	return (
		<Box
			component="div"
			className={`cc-card${size === 'small' ? ' cc-card--small' : ''}`}
			onClick={() => goToArticle()}
		>
			<Box component="div" className="cc-card__img-wrap">
				<img
					src={getImageUrl(boardArticle.articleImage, '/img/community/communityImg.png')}
					alt={boardArticle.articleTitle}
					className="cc-card__img"
				/>
				<Box component="div" className="cc-card__cat">
					{CATEGORY_LABELS[boardArticle.articleCategory] ?? boardArticle.articleCategory}
				</Box>
			</Box>

			<Box component="div" className="cc-card__body">
				<Typography className="cc-card__title">{boardArticle.articleTitle}</Typography>
				{size !== 'small' && excerpt && (
					<Typography className="cc-card__excerpt">{excerpt}…</Typography>
				)}

				<Box component="div" className="cc-card__footer">
					<img
						src={getImageUrl(boardArticle.memberData?.memberImage, '/img/profile/defaultUser.svg')}
						alt={boardArticle.memberData?.memberNick}
						className="cc-card__avatar"
						onClick={goToMember}
					/>
					<Box component="div" className="cc-card__author-col">
						<Typography className="cc-card__author" onClick={goToMember}>
							{boardArticle.memberData?.memberNick ?? 'Anonymous'}
						</Typography>
						<Typography className="cc-card__date">
							<Moment format="MMM DD">{boardArticle.createdAt}</Moment>
							{' · '}{rtMin} min
						</Typography>
					</Box>

					<Box component="div" className="cc-card__stats">
						<IconButton
							size="small"
							className={`cc-card__like-btn${liked ? ' liked' : ''}`}
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); likeArticleHandler(e, user, boardArticle._id); }}
						>
							{liked ? <FavoriteIcon sx={{ fontSize: 15 }} /> : <FavoriteBorderIcon sx={{ fontSize: 15 }} />}
						</IconButton>
						<Typography className="cc-card__stat-num">{boardArticle.articleLikes}</Typography>
						<RemoveRedEyeOutlinedIcon sx={{ fontSize: 14, color: '#bbb', ml: '6px' }} />
						<Typography className="cc-card__stat-num">{boardArticle.articleViews}</Typography>
						<ChatBubbleOutlineIcon sx={{ fontSize: 14, color: '#bbb', ml: '6px' }} />
						<Typography className="cc-card__stat-num">{boardArticle.articleComments}</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default CommunityCard;
