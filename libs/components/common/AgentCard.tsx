import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import Link from 'next/link';
import { getImageUrl } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { MemberType } from '../../enums/member.enum';

const BADGE_LABEL: Record<string, string> = {
	[MemberType.MEMBER]: 'Member',
	[MemberType.ADMIN]: 'Admin',
	[MemberType.USER]:  'User',
};

const BADGE_CLASS: Record<string, string> = {
	[MemberType.MEMBER]: 'mem-card__badge--member',
	[MemberType.ADMIN]: 'mem-card__badge--admin',
};

interface AgentCardProps {
	agent: any;
	likeMemberHandler: any;
}

const AgentCard = ({ agent, likeMemberHandler }: AgentCardProps) => {
	const user    = useReactiveVar(userVar);
	const liked   = agent?.meLiked?.[0]?.myFavorite ?? false;
	const imgSrc  = getImageUrl(agent?.memberImage, '/img/profile/defaultUser.svg');
	const badge   = BADGE_LABEL[agent?.memberType] ?? 'User';
	const badgeCls = BADGE_CLASS[agent?.memberType] ?? '';

	return (
		<Box component="div" className="mem-card">
			<Link href={`/member?memberId=${agent?._id}&category=bikes`} style={{ textDecoration: 'none', color: 'inherit' }}>
				<Box component="div" className="mem-card__top">
					<Avatar src={imgSrc} className="mem-card__avatar" sx={{ width: 72, height: 72 }} />
					<Box component="div" className="mem-card__info">
						<Box component="div" className="mem-card__name-row">
							<Typography className="mem-card__name">
								{agent?.memberFullName || agent?.memberNick}
							</Typography>
							<Chip
								label={badge}
								size="small"
								className={`mem-card__badge ${badgeCls}`}
							/>
						</Box>
						{agent?.memberAddress && (
							<Typography className="mem-card__location">{agent.memberAddress}</Typography>
						)}
					</Box>
				</Box>
			</Link>

			{agent?.memberDesc && (
				<Typography className="mem-card__bio">{agent.memberDesc}</Typography>
			)}

			<Box component="div" className="mem-card__stats">
				<Box component="div" className="mem-card__stat">
					<DirectionsBikeIcon sx={{ fontSize: 13 }} />
					<span>{agent?.memberProducts ?? 0}</span>
					<span>Bikes</span>
				</Box>
				<Box component="div" className="mem-card__stat-dot" />
				<Box component="div" className="mem-card__stat">
					<PeopleOutlineIcon sx={{ fontSize: 13 }} />
					<span>{agent?.memberFollowers ?? 0}</span>
					<span>Followers</span>
				</Box>
				<Box component="div" className="mem-card__stat-dot" />
				<Box component="div" className="mem-card__stat">
					<RemoveRedEyeOutlinedIcon sx={{ fontSize: 13 }} />
					<span>{agent?.memberViews ?? 0}</span>
					<span>Views</span>
				</Box>
			</Box>

			<Box component="div" className="mem-card__footer">
				<Link href={`/member?memberId=${agent?._id}&category=bikes`} style={{ textDecoration: 'none' }}>
					<Box component="span" className="mem-card__view-btn">View Profile</Box>
				</Link>
				<Box
					component="div"
					className={`mem-card__like${liked ? ' mem-card__like--active' : ''}`}
					onClick={(e: React.MouseEvent) => { e.stopPropagation(); likeMemberHandler(user, agent?._id); }}
				>
					{liked
						? <FavoriteIcon sx={{ fontSize: 15, color: '#e02323' }} />
						: <FavoriteBorderIcon sx={{ fontSize: 15 }} />
					}
					<span>{agent?.memberLikes ?? 0}</span>
				</Box>
			</Box>
		</Box>
	);
};

export default AgentCard;
