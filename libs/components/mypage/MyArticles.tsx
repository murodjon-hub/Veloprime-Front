import React, { useState } from 'react';
import { NextPage } from 'next';
import { Box, Pagination, Typography } from '@mui/material';
import CommunityCard from '../common/CommunityCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

const MyArticles: NextPage = ({ initialInput }: T) => {
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState({
		...initialInput,
		search: { memberId: user._id },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { refetch: boardArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted(data: T) {
			setBoardArticles(data?.getBoardArticles?.list ?? []);
			setTotalCount(data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	const paginationHandler = (_: any, value: number) => setSearchCommunity({ ...searchCommunity, page: value });

	const likeBoArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);
			await likeTargetBoardArticle({ variables: { input: id } });
			await boardArticlesRefetch({ input: searchCommunity });
			await sweetTopSmallSuccessAlert('Success!', 750);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div id="my-articles-page">
			<Box component="div" className="articles-header">
				<h2>My Articles</h2>
				<span>{totalCount} article{totalCount !== 1 ? 's' : ''}</span>
			</Box>

			{boardArticles.length === 0 ? (
				<Box component="div" sx={{ py: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
					<ArticleOutlinedIcon sx={{ fontSize: 48, color: '#e0e0e0' }} />
					<Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#111' }}>
						No articles yet
					</Typography>
					<Typography sx={{ fontSize: 13, color: '#9a9a96' }}>
						Share your rides and stories with the community.
					</Typography>
				</Box>
			) : (
				<Box component="div" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', mb: '8px' }}>
					{boardArticles.map((boardArticle: BoardArticle) => (
						<CommunityCard
							key={boardArticle._id}
							boardArticle={boardArticle}
							likeArticleHandler={likeBoArticleHandler}
							size="small"
						/>
					))}
				</Box>
			)}

			{totalCount > searchCommunity.limit && (
				<Box component="div" className="pagination-config">
					<Pagination
						count={Math.ceil(totalCount / searchCommunity.limit)}
						page={searchCommunity.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Box component="div" className="total-result">
						<p>{totalCount} article{totalCount !== 1 ? 's' : ''}</p>
					</Box>
				</Box>
			)}
		</div>
	);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;
