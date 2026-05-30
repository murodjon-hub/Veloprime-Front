import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Pagination, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import CommunityCard from '../common/CommunityCard';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';

const MemberArticles: NextPage = ({ initialInput }: any) => {
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(initialInput);
	const [memberBoArticles, setMemberBoArticles] = useState<BoardArticle[]>([]);

	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { refetch: boardArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setMemberBoArticles(data?.getBoardArticles?.list ?? []);
			setTotal(data?.getBoardArticles?.metaCounter?.[0]?.total || 0);
		},
	});

	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { memberId: memberId } });
	}, [memberId]);

	const paginationHandler = (_: any, value: number) => setSearchFilter({ ...searchFilter, page: value });

	const likeArticleHandler = async (_: any, user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetBoardArticle({ variables: { input: id } });
			await boardArticlesRefetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Box component="div" className="member-articles">
			<Box component="div" className="member-articles__header">
				<h2>Articles</h2>
				<span>{total} article{total !== 1 ? 's' : ''}</span>
			</Box>

			{memberBoArticles.length === 0 ? (
				<Box component="div" className="member-articles__empty">
					<ArticleOutlinedIcon sx={{ fontSize: 48, color: '#e0e0e0' }} />
					<Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#111', mt: 1 }}>
						No articles yet
					</Typography>
					<p>This rider hasn't published any articles yet.</p>
				</Box>
			) : (
				<Box component="div" className="member-articles__grid">
					{memberBoArticles.map((boardArticle: BoardArticle) => (
						<CommunityCard
							key={boardArticle._id}
							boardArticle={boardArticle}
							likeArticleHandler={likeArticleHandler}
							size="small"
						/>
					))}
				</Box>
			)}

			{total > searchFilter.limit && (
				<Box component="div" className="member-articles__pagination">
					<Pagination
						count={Math.ceil(total / searchFilter.limit) || 1}
						page={searchFilter.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Typography>{total} article{total !== 1 ? 's' : ''}</Typography>
				</Box>
			)}
		</Box>
	);
};

MemberArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MemberArticles;
