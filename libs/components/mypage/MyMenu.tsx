import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, Typography, Avatar, Chip, Divider } from '@mui/material';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HistoryIcon from '@mui/icons-material/History';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import { useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { getImageUrl } from '../../utils';
import { logOut, setJwtToken, updateUserInfo } from '../../auth';
import { sweetConfirmAlert, sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { MemberType } from '../../enums/member.enum';

interface NavItemProps {
	href: string;
	icon: React.ReactNode;
	label: string;
	active: boolean;
	count?: number;
}

const NavItem = ({ href, icon, label, active, count }: NavItemProps) => (
	<Link href={href} scroll={false} style={{ textDecoration: 'none', display: 'block' }}>
		<Box component="div" className={`mp-nav-item${active ? ' active' : ''}`}>
			<Box component="div" className="mp-nav-item__icon">{icon}</Box>
			<Typography className="mp-nav-item__label">{label}</Typography>
			{count !== undefined && <Box component="span" className="mp-nav-item__count">{count}</Box>}
		</Box>
	</Link>
);

const MyMenu = () => {
	const router = useRouter();
	const category = (router.query.category as string) ?? 'myProfile';
	const user = useReactiveVar(userVar);
	const [updateMember] = useMutation(UPDATE_MEMBER);

	const isSeller = user.memberType === MemberType.MEMBER;
	const isAdmin = user.memberType === MemberType.ADMIN;
	const isSellerOrAdmin = isSeller || isAdmin;

	const badgeClass =
		user.memberType === MemberType.MEMBER  ? 'member-badge' :
		user.memberType === MemberType.ADMIN   ? 'admin-badge'  : '';

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch {}
	};

	const becomeSellerHandler = async () => {
		try {
			const confirmed = await sweetConfirmAlert(
				'Become a Member?\n\nYou will be able to list bikes and create events.',
			);
			if (!confirmed) return;
			const result = await updateMember({
				variables: { input: { _id: user._id, memberType: MemberType.MEMBER } },
			});
			const token = result.data?.updateMember?.accessToken;
			if (token) { setJwtToken(token); updateUserInfo(token); }
			await sweetMixinSuccessAlert('You are now a Member!');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component="div" className="mp-sidebar">
			{/* Profile section */}
			<Box component="div" className="mp-sidebar__profile">
				<Avatar
					src={getImageUrl(user?.memberImage, '/img/profile/defaultUser.svg')}
					className="mp-sidebar__avatar"
					sx={{ width: 52, height: 52 }}
				/>
				<Box component="div" className="mp-sidebar__user">
					<Typography className="mp-sidebar__name">{user?.memberNick ?? 'Cyclist'}</Typography>
					<Chip
						label={user?.memberType ?? 'USER'}
						size="small"
						className={`mp-sidebar__badge ${badgeClass}`}
					/>
				</Box>
			</Box>

			{/* Stats strip */}
			<Box component="div" className="mp-sidebar__stats">
				<Box component="div" className="mp-sidebar__stat">
					<Typography className="mp-sidebar__stat-num">{user?.memberProducts ?? 0}</Typography>
					<Typography className="mp-sidebar__stat-label">Bikes</Typography>
				</Box>
				<Box component="div" className="mp-sidebar__stat-divider" />
				<Box component="div" className="mp-sidebar__stat">
					<Typography className="mp-sidebar__stat-num">{user?.memberFollowers ?? 0}</Typography>
					<Typography className="mp-sidebar__stat-label">Followers</Typography>
				</Box>
				<Box component="div" className="mp-sidebar__stat-divider" />
				<Box component="div" className="mp-sidebar__stat">
					<Typography className="mp-sidebar__stat-num">{user?.memberFollowings ?? 0}</Typography>
					<Typography className="mp-sidebar__stat-label">Following</Typography>
				</Box>
			</Box>

			{/* Marketplace section */}
			{isSellerOrAdmin && (
				<>
					<Typography className="mp-sidebar__section-label">Marketplace</Typography>
					<NavItem
						href="/products/addproduct"
						icon={<AddCircleOutlineIcon />}
						label="Add Bike Listing"
						active={false}
					/>
					<NavItem
						href="/mypage?category=myProducts"
						icon={<DirectionsBikeIcon />}
						label="My Bikes"
						active={category === 'myProducts'}
					/>
				</>
			)}

			{/* Collection section */}
			<Divider className="mp-sidebar__divider" />
			<Typography className="mp-sidebar__section-label">Collection</Typography>
			<NavItem
				href="/mypage?category=myFavorites"
				icon={<FavoriteBorderIcon />}
				label="Saved Bikes"
				active={category === 'myFavorites'}
			/>
			<NavItem
				href="/mypage?category=recentlyVisited"
				icon={<HistoryIcon />}
				label="Recently Viewed"
				active={category === 'recentlyVisited'}
			/>

			{/* Community section */}
			<Divider className="mp-sidebar__divider" />
			<Typography className="mp-sidebar__section-label">Community</Typography>
			<NavItem
				href="/mypage?category=myArticles"
				icon={<ArticleOutlinedIcon />}
				label="My Articles"
				active={category === 'myArticles'}
			/>
			<NavItem
				href="/mypage?category=myEvents"
				icon={<EmojiEventsOutlinedIcon />}
				label="My Events"
				active={category === 'myEvents'}
			/>
			<NavItem
				href="/community/write"
				icon={<EditNoteIcon />}
				label="Write Article"
				active={false}
			/>
			{isSellerOrAdmin && (
				<NavItem
					href="/events/create"
					icon={<AddCircleOutlineIcon />}
					label="Create Event"
					active={false}
				/>
			)}

			{/* Network section */}
			<Divider className="mp-sidebar__divider" />
			<Typography className="mp-sidebar__section-label">Network</Typography>
			<NavItem
				href="/mypage?category=followers"
				icon={<PeopleOutlineIcon />}
				label="My Followers"
				active={category === 'followers'}
				count={user?.memberFollowers}
			/>
			<NavItem
				href="/mypage?category=followings"
				icon={<GroupAddOutlinedIcon />}
				label="Following"
				active={category === 'followings'}
				count={user?.memberFollowings}
			/>

			{/* Account section */}
			<Divider className="mp-sidebar__divider" />
			<Typography className="mp-sidebar__section-label">Account</Typography>
			<NavItem
				href="/mypage?category=myProfile"
				icon={<PersonOutlineIcon />}
				label="Profile Settings"
				active={category === 'myProfile'}
			/>

			{user.memberType === MemberType.USER && (
				<Box component="div" className="mp-sidebar__become-member" onClick={becomeSellerHandler}>
					<StorefrontOutlinedIcon />
					<Typography>Become a Member</Typography>
				</Box>
			)}

			<Box component="div" className="mp-sidebar__logout" onClick={logoutHandler}>
				<LogoutIcon />
				<Typography>Logout</Typography>
			</Box>
		</Box>
	);
};

export default MyMenu;
