import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Avatar, Chip, Pagination, Typography, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { Follower } from '../../types/follow/follow';
import { getImageUrl } from '../../utils';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { MemberType } from '../../enums/member.enum';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const badgeVariant = (type: string) => {
	switch (type) {
		case MemberType.MEMBER: return 'follow-card__badge--member';
		case MemberType.ADMIN: return 'follow-card__badge--admin';
		default:               return 'follow-card__badge--user';
	}
};

const MemberFollowers = (props: MemberFollowsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, likeMemberHandler, redirectToMemberPageHandler } = props;
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const user = useReactiveVar(userVar);

	const { refetch: getMemberFollowersRefetch } = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search?.followingId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowers(data?.getMemberFollowers?.list ?? []);
			setTotal(data?.getMemberFollowers?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		const id = router.query.memberId ? (router.query.memberId as string) : user?._id;
		setFollowInquiry((prev) => ({ ...prev, search: { followingId: id } }));
	}, [router.query.memberId, user?._id]);

	useEffect(() => {
		if (followInquiry?.search?.followingId) {
			getMemberFollowersRefetch({ input: followInquiry });
		}
	}, [followInquiry]);

	const paginationHandler = (_: ChangeEvent<unknown>, value: number) => {
		setFollowInquiry((prev) => ({ ...prev, page: value }));
	};

	return (
		<Box component="div">
			{/* Header */}
			<Box component="div" className="follows-header">
				<Typography className="follows-header__title">Followers</Typography>
				<Typography className="follows-header__count">{total} people</Typography>
			</Box>

			{/* Empty state */}
			{memberFollowers.length === 0 && (
				<Box component="div" className="follows-empty">
					<PeopleOutlineIcon className="follows-empty__icon" />
					<Typography className="follows-empty__title">No followers yet</Typography>
					<Typography className="follows-empty__sub">When someone follows this rider, they'll show up here.</Typography>
				</Box>
			)}

			{/* Grid */}
			{memberFollowers.length > 0 && (
				<Box component="div" className="follows-grid">
					{memberFollowers.map((follower: Follower) => {
						const fd = follower?.followerData;
						const isMe = user?._id === follower?.followerId;
						const isLiked = follower?.meLiked?.[0]?.myFavorite;
						const isFollowing = follower?.meFollowed?.[0]?.myFollowing;

						return (
							<Box
								component="div"
								key={follower._id}
								className="follow-card"
								onClick={() => redirectToMemberPageHandler(fd?._id)}
							>
								{/* Header: avatar + name */}
								<Box component="div" className="follow-card__header">
									<Box component="div" className="follow-card__avatar-wrap">
										<Avatar
											src={getImageUrl(fd?.memberImage, '/img/profile/defaultUser.svg')}
											className="follow-card__avatar"
											sx={{ width: 52, height: 52 }}
										/>
									</Box>
									<Box component="div" className="follow-card__meta">
										<Typography className="follow-card__name">{fd?.memberNick ?? 'Rider'}</Typography>
										{fd?.memberType && (
											<Chip
												label={fd.memberType}
												size="small"
												className={`follow-card__badge ${badgeVariant(fd.memberType)}`}
											/>
										)}
									</Box>
								</Box>

								{/* Stats */}
								<Box component="div" className="follow-card__stats">
									<Box component="div" className="follow-card__stat">
										<span className="follow-card__stat-num">{fd?.memberFollowers ?? 0}</span>
										<span className="follow-card__stat-label">Followers</span>
									</Box>
									<Box component="div" className="follow-card__stat-sep" />
									<Box component="div" className="follow-card__stat">
										<span className="follow-card__stat-num">{fd?.memberFollowings ?? 0}</span>
										<span className="follow-card__stat-label">Following</span>
									</Box>
									<Box component="div" className="follow-card__stat-sep" />
									<Box component="div" className="follow-card__stat">
										<span className="follow-card__stat-num">{fd?.memberProducts ?? 0}</span>
										<span className="follow-card__stat-label">Bikes</span>
									</Box>
								</Box>

								{/* Bio */}
								{fd?.memberDesc && (
									<Typography className="follow-card__bio">{fd.memberDesc}</Typography>
								)}

								{/* Actions */}
								{!isMe && (
									<Box component="div" className="follow-card__actions" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
										{isFollowing ? (
											<Button
												className="follow-card__follow-btn follow-card__follow-btn--following"
												onClick={() => unsubscribeHandler(fd?._id, getMemberFollowersRefetch, followInquiry)}
											>
												Following ✓
											</Button>
										) : (
											<Button
												className="follow-card__follow-btn follow-card__follow-btn--follow"
												onClick={() => subscribeHandler(fd?._id, getMemberFollowersRefetch, followInquiry)}
											>
												+ Follow
											</Button>
										)}

										<IconButton
											className={`follow-card__like-btn${isLiked ? ' follow-card__like-btn--liked' : ''}`}
											onClick={() => likeMemberHandler(fd?._id, getMemberFollowersRefetch, followInquiry)}
											size="small"
										>
											{isLiked ? <FavoriteIcon sx={{ fontSize: 16 }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
										</IconButton>
										<Typography className="follow-card__like-count">{fd?.memberLikes ?? 0}</Typography>
									</Box>
								)}
							</Box>
						);
					})}
				</Box>
			)}

			{/* Pagination */}
			{total > followInquiry.limit && (
				<Box component="div" className="follows-pagination">
					<Pagination
						page={followInquiry.page}
						count={Math.ceil(total / followInquiry.limit)}
						onChange={paginationHandler}
						shape="circular"
						color="primary"
					/>
					<Box component="div" className="total-result">
						<Typography>{total} followers</Typography>
					</Box>
				</Box>
			)}
		</Box>
	);
};

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		search: { followingId: '' },
	},
};

export default MemberFollowers;
