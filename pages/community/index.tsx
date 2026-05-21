import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Card, CardContent, CardMedia, Stack, Pagination } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
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

const CATEGORIES = [
  { label: 'All Posts', value: null },
  { label: 'Free',      value: BoardArticleCategory.FREE },
  { label: 'Recommend', value: BoardArticleCategory.RECOMMEND },
  { label: 'News',      value: BoardArticleCategory.NEWS },
];

const Community: NextPage = ({ initialInput }: T) => {
  const device  = useDeviceDetect();
  const router  = useRouter();
  const user    = useReactiveVar(userVar);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchCommunity, setSearchCommunity] = useState({ ...initialInput });
  const [boardArticles, setBoardArticles]     = useState<BoardArticle[]>([]);
  const [totalCount, setTotalCount]           = useState<number>(0);

  /** APOLLO **/
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

  /** HANDLERS **/
  const categoryHandler = (value: string | null) => {
    setActiveCategory(value);
    setSearchCommunity({
      ...searchCommunity,
      page: 1,
      search: value ? { articleCategory: value } : {},
    });
  };

  const paginationHandler = (_: T, value: number) => {
    setSearchCommunity({ ...searchCommunity, page: value });
  };

  const likeArticleHandler = async (e: React.MouseEvent, id: string) => {
    try {
      e.stopPropagation();
      if (!id) return;
      if (!user?._id) throw new Error(Messages.error2);
      await likeTargetBoardArticle({ variables: { input: id } });
      await boardArticlesRefetch({ input: searchCommunity });
      await sweetTopSmallSuccessAlert('Success!', 750);
    } catch (err: any) {
      console.log('ERROR, likeArticleHandler:', err.message);
      sweetMixinErrorAlert(err.message).then();
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  if (device === 'mobile') {
    return <Stack>COMMUNITY MOBILE</Stack>;
  }

  return (
    <Box className="blogs-page-container">

      {/* Header */}
      <Box className="blogs-header">
        <Typography variant="h2" className="page-title">
          OUR BLOGS
        </Typography>
        <Button
          variant="contained"
          startIcon={<CreateIcon />}
          className="write-blog-button"
          onClick={() => router.push('/community/write')}
        >
          Write a Blog
        </Button>
      </Box>

      <Box className="blogs-layout">

        {/* Sidebar */}
        <Box className="blogs-sidebar">
          <Typography variant="h6" className="sidebar-title">
            Categories
          </Typography>
          <ul className="category-list">
            {CATEGORIES.map((cat) => (
              <li
                key={cat.label}
                className={`category-item ${activeCategory === cat.value ? 'active' : ''}`}
                onClick={() => categoryHandler(cat.value)}
              >
                {cat.label}
              </li>
            ))}
          </ul>
        </Box>

        {/* Blog Grid */}
        <Box className="blog-grid">
          {boardArticles.length > 0 ? (
            boardArticles.map((article: BoardArticle) => (
              <Card
                key={article._id}
                className="blog-card"
                elevation={0}
                onClick={() => router.push(`/community/${article._id}`)}
              >
                <CardMedia
                  component="img"
                  image={
                    article?.articleImage
                      ? `${process.env.NEXT_PUBLIC_API_URL}/${article.articleImage}`
                      : '/img/blog-placeholder.jpg'
                  }
                  alt={article.articleTitle}
                  className="blog-card-image"
                />
                <CardContent className="blog-card-content">

                  {/* Date + Category */}
                  <Box className="blog-card-meta">
                    <Typography variant="body2" className="blog-date">
                      {formatDate(article.createdAt)}
                    </Typography>
                    <Typography variant="body2" className="blog-category-link">
                      {article.articleCategory}
                    </Typography>
                  </Box>

                  {/* Title */}
                  <Typography variant="h5" className="blog-title">
                    {article.articleTitle}
                  </Typography>

                  {/* Excerpt */}
                  <Typography variant="body2" className="blog-excerpt">
                    {article.articleContent?.slice(0, 120)}...
                  </Typography>

                  {/* Author */}
                  {article.memberData && (
                    <Box className="blog-author">
                      <Box
                        component="img"
                        className="blog-author-img"
                        src={
                          article.memberData.memberImage
                            ? `${process.env.NEXT_PUBLIC_API_URL}/${article.memberData.memberImage}`
                            : '/img/profile/defaultUser.svg'
                        }
                        alt={article.memberData.memberNick}
                      />
                      <Typography className="blog-author-nick">
                        {article.memberData.memberNick}
                      </Typography>
                    </Box>
                  )}

                  {/* Stats */}
                  <Box className="blog-card-footer" onClick={(e) => e.stopPropagation()}>
                    <Box
                      className={`blog-like-btn ${article.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
                      onClick={(e) => likeArticleHandler(e, article._id)}
                    >
                      ♥ {article.articleLikes ?? 0}
                    </Box>
                    <Typography className="blog-views">👁 {article.articleViews ?? 0}</Typography>
                    <Typography className="blog-comments">💬 {article.articleComments ?? 0}</Typography>
                  </Box>

                </CardContent>
              </Card>
            ))
          ) : (
            <Box className="no-data">
              <img src="/img/icons/icoAlert.svg" alt="" />
              <p>No articles found!</p>
            </Box>
          )}
        </Box>
      </Box>

      {/* Pagination */}
      {totalCount > searchCommunity.limit && (
        <Stack className="pagination-conf">
          <Stack className="pagination-box">
            <Pagination
              count={Math.ceil(totalCount / searchCommunity.limit)}
              page={searchCommunity.page}
              shape="circular"
              color="primary"
              onChange={paginationHandler}
            />
          </Stack>
          <Stack className="total">
            <Typography>Total {totalCount} article(s) available</Typography>
          </Stack>
        </Stack>
      )}

    </Box>
  );
};

Community.defaultProps = {
  initialInput: {
    page: 1,
    limit: 6,
    sort: 'createdAt',
    direction: 'DESC',
    search: {},
  },
};

export default withLayoutBasic(Community);