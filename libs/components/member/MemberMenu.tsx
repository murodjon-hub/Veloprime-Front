import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Typography, Avatar, Chip, Button, CircularProgress } from '@mui/material';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import { Member } from '../../types/member/member';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_MEMBER } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { getImageUrl } from '../../utils';
import { T } from '../../types/common';
import { MemberType } from '../../enums/member.enum';

interface MemberMenuProps {
	subscribeHandler: (id: string, refetch: any, memberId: any) => Promise<void>;
	unsubscribeHandler: (id: string, refetch: any, memberId: any) => Promise<void>;
}

const TABS = [
	{ value: 'bikes',      label: 'Bikes',     icon: <DirectionsBikeIcon sx={{ fontSize: 15 }} />, countKey: 'memberProducts'  },
	{ value: 'followers',  label: 'Followers', icon: <PeopleOutlineIcon sx={{ fontSize: 15 }} />,  countKey: 'memberFollowers' },
	{ value: 'followings', label: 'Following', icon: <GroupAddOutlinedIcon sx={{ fontSize: 15 }} />, countKey: 'memberFollowings' },
	{ value: 'articles',   label: 'Articles',  icon: <ArticleOutlinedIcon sx={{ fontSize: 15 }} />,  countKey: 'memberArticles'  },
];

const BADGE_CLASS: Record<string, string> = {
	[MemberType.MEMBER]: 'memb-profile-card__badge--member',
	[MemberType.ADMIN]: 'memb-profile-card__badge--admin',
};

const MemberMenu = ({ subscribeHandler, unsubscribeHandler }: MemberMenuProps) => {
	const router = useRouter();
	const category    = (router.query.category as string) ?? 'bikes';
	const { memberId } = router.query;
	const currentUser  = useReactiveVar(userVar);

	const [member,     setMember]     = useState<Member | null>(null);
	const [following,  setFollowing]  = useState(false);
	const [followLoading, setFollowLoading] = useState(false);

	const { refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const m = data?.getMember;
			setMember(m);
			setFollowing(m?.meFollowed?.[0]?.myFollowing ?? false);
		},
	});

	const handleFollow = async () => {
		if (!member?._id) return;
		if (!currentUser?._id) {
			router.push('/account/join');
			return;
		}
		setFollowLoading(true);
		setFollowing((prev) => !prev);
		try {
			if (following) {
				await unsubscribeHandler(member._id, getMemberRefetch, memberId);
			} else {
				await subscribeHandler(member._id, getMemberRefetch, memberId);
			}
		} catch {
			setFollowing((prev) => !prev);
		} finally {
			setFollowLoading(false);
		}
	};

	const isOwnProfile = member?._id && currentUser?._id === member._id;

	return (
		<>
			{/* ── Hero banner ──────────────────────────────────────────────── */}
			<Box component="div" className="memb-hero">
				<Box
					component="img"
					src="/img/banner/hero_bg.jpg"
					className="memb-hero__cover"
					onError={(e: any) => { e.target.style.display = 'none'; }}
				/>
				<Box component="div" className="memb-hero__overlay" />
			</Box>

			{/* ── Profile card ─────────────────────────────────────────────── */}
			<Box component="div" className="memb-profile-card">
				<Box component="div" className="memb-profile-card__inner">

					{/* Avatar (overlaps hero) */}
					<Box component="div" className="memb-profile-card__avatar-wrap">
						<Avatar
							src={getImageUrl(member?.memberImage, '/img/profile/defaultUser.svg')}
							className="memb-profile-card__avatar"
							sx={{ width: 96, height: 96 }}
						/>
						<Box component="div" className="memb-profile-card__online-dot" />
					</Box>

					{/* Name + bio + stats */}
					<Box component="div" className="memb-profile-card__info">
						<Box component="div" className="memb-profile-card__name-row">
							<Typography className="memb-profile-card__name">
								{member?.memberNick ?? (memberId ? '…' : '—')}
							</Typography>
							{member?.memberType && (
								<Chip
									label={member.memberType}
									size="small"
									className={`memb-profile-card__badge ${BADGE_CLASS[member.memberType] ?? ''}`}
								/>
							)}
						</Box>

						{member?.memberFullName && (
							<Typography className="memb-profile-card__fullname">
								{member.memberFullName}
							</Typography>
						)}

						<Typography className="memb-profile-card__sub">
							{member?.memberAddress || 'Cycling enthusiast'}
						</Typography>

						{member?.memberDesc && (
							<Typography className="memb-profile-card__bio">
								{member.memberDesc}
							</Typography>
						)}

						<Box component="div" className="memb-profile-card__stats">
							<Box component="div" className="memb-profile-card__stat">
								<span>{member?.memberProducts ?? 0}</span>
								<span>Bikes</span>
							</Box>
							<Box component="div" className="memb-profile-card__stat-dot" />
							<Box component="div" className="memb-profile-card__stat">
								<span>{member?.memberFollowers ?? 0}</span>
								<span>Followers</span>
							</Box>
							<Box component="div" className="memb-profile-card__stat-dot" />
							<Box component="div" className="memb-profile-card__stat">
								<span>{member?.memberFollowings ?? 0}</span>
								<span>Following</span>
							</Box>
							<Box component="div" className="memb-profile-card__stat-dot" />
							<Box component="div" className="memb-profile-card__stat">
								<span>{member?.memberLikes ?? 0}</span>
								<span>Likes</span>
							</Box>
						</Box>
					</Box>

					{/* Follow button */}
					{member?._id && !isOwnProfile && (
						<Box component="div" className="memb-profile-card__actions">
							<Button
								className={`memb-profile-card__follow-btn ${
									following ? 'memb-profile-card__follow-btn--following' : 'memb-profile-card__follow-btn--follow'
								}`}
								onClick={handleFollow}
								disabled={followLoading}
								startIcon={
									followLoading
										? <CircularProgress size={14} color="inherit" />
										: following
											? <HowToRegOutlinedIcon sx={{ fontSize: 16 }} />
											: <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
								}
							>
								{following ? 'Following' : 'Follow'}
							</Button>
						</Box>
					)}

					{/* Own profile shortcut */}
					{isOwnProfile && (
						<Box component="div" className="memb-profile-card__actions">
							<Button
								className="memb-profile-card__edit-btn"
								onClick={() => router.push('/mypage?category=settings')}
							>
								Edit Profile
							</Button>
						</Box>
					)}
				</Box>
			</Box>

			{/* ── Tab navigation ────────────────────────────────────────────── */}
			<Box component="div" className="memb-tabs">
				<Box component="div" className="memb-tabs__inner">
					{TABS.map((tab) => {
						const count = member ? (member as any)[tab.countKey] : undefined;
						return (
							<Link
								key={tab.value}
								href={{ pathname: '/member', query: { ...router.query, category: tab.value } }}
								scroll={false}
								style={{ textDecoration: 'none' }}
							>
								<Box component="div" className={`memb-tab${category === tab.value ? ' active' : ''}`}>
									{tab.icon}
									{tab.label}
									{count != null && (
										<Box component="span" className="memb-tab__count">{count}</Box>
									)}
								</Box>
							</Link>
						);
					})}
				</Box>
			</Box>
		</>
	);
};

export default MemberMenu;
