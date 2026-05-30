import React, { useEffect, useState } from 'react';
import { withRouter } from 'next/router';
import Link from 'next/link';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { CalendarBlank, ChatsCircle, Gauge, Headset, Package, User } from 'phosphor-react';
import cookies from 'js-cookie';

const AdminMenuList = (props: any) => {
	const [openMenu] = useState(typeof window === 'object' ? cookies.get('admin_menu') === 'true' : false);
	const [clickMenu, setClickMenu] = useState<string[]>([]);
	const [clickSubMenu, setClickSubMenu] = useState('');

	const { router: { pathname } } = props;
	const pathnames = pathname.split('/').filter((x: any) => x);

	useEffect(() => {
		switch (pathnames[1]) {
			case 'properties': setClickMenu(['Products']);   break;
			case 'events':     setClickMenu(['Events']);     break;
			case 'community':  setClickMenu(['Community']); break;
			case 'cs':         setClickMenu(['Cs']);         break;
			case 'users':      setClickMenu(['Users']);      break;
			default:           setClickMenu([]);             break;
		}
		switch (pathnames[2]) {
			case 'inquiry': setClickSubMenu('1:1 Inquiry'); break;
			case 'notice':  setClickSubMenu('Notice');      break;
			case 'faq':     setClickSubMenu('FAQ');         break;
			default:        setClickSubMenu('List');        break;
		}
	}, []);

	const subMenuChangeHandler = (target: string) => {
		setClickMenu(prev =>
			prev.includes(target) ? prev.filter(m => m !== target) : [...prev, target]
		);
	};

	const isActive = (path: string) => pathname === path;

	const menu_set = [
		{
			title: 'Users',
			icon: <User size={18} weight="fill" />,
			onClick: () => subMenuChangeHandler('Users'),
		},
		{
			title: 'Products',
			icon: <Package size={18} weight="fill" />,
			onClick: () => subMenuChangeHandler('Products'),
		},
		{
			title: 'Events',
			icon: <CalendarBlank size={18} weight="fill" />,
			onClick: () => subMenuChangeHandler('Events'),
		},
		{
			title: 'Community',
			icon: <ChatsCircle size={18} weight="fill" />,
			onClick: () => subMenuChangeHandler('Community'),
		},
		{
			title: 'Cs',
			icon: <Headset size={18} weight="fill" />,
			onClick: () => subMenuChangeHandler('Cs'),
		},
	];

	const sub_menu_set: Record<string, { title: string; url: string }[]> = {
		Users:     [{ title: 'List', url: '/_admin/users' }],
		Products:  [{ title: 'List', url: '/_admin/properties' }],
		Events:    [{ title: 'List', url: '/_admin/events' }],
		Community: [{ title: 'List', url: '/_admin/community' }],
		Cs: [
			{ title: 'FAQ',     url: '/_admin/cs/faq' },
			{ title: 'Notice',  url: '/_admin/cs/notice' },
			{ title: 'Inquiry', url: '/_admin/cs/inquiry' },
		],
	};

	return (
		<>
			{/* ── Dashboard (direct link, no submenu) ── */}
			<Link href="/_admin" style={{ textDecoration: 'none' }}>
				<ListItemButton
					className={isActive('/_admin') ? 'menu on' : 'menu'}
					sx={{ px: 2.5, minHeight: 48 }}
				>
					<ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
						<Gauge size={18} weight="fill" color={isActive('/_admin') ? '#e92c28' : '#bdbdbd'} />
					</ListItemIcon>
					<ListItemText
						primary={
							<Typography sx={{ fontSize: 14, fontWeight: isActive('/_admin') ? 600 : 400, color: isActive('/_admin') ? '#e92c28' : 'inherit' }}>
								Dashboard
							</Typography>
						}
					/>
				</ListItemButton>
			</Link>

			{/* ── Section menus with submenus ── */}
			{menu_set.map((item, index) => (
				<List className="menu_wrap" key={index} disablePadding>
					<ListItemButton
						onClick={item.onClick}
						component="li"
						className={clickMenu[0] === item.title ? 'menu on' : 'menu'}
						sx={{ minHeight: 48, justifyContent: openMenu ? 'initial' : 'center', px: 2.5 }}
					>
						<ListItemIcon sx={{ minWidth: 0, mr: openMenu ? 3 : 'auto', justifyContent: 'center' }}>
							{React.cloneElement(item.icon, {
								color: clickMenu[0] === item.title ? '#e92c28' : '#bdbdbd',
							})}
						</ListItemIcon>
						<ListItemText>{item.title}</ListItemText>
						{clickMenu.includes(item.title) ? <ExpandLess /> : <ExpandMore />}
					</ListItemButton>

					<Collapse in={clickMenu.includes(item.title)} className="menu" timeout="auto" component="li" unmountOnExit>
						<List className="menu-list" disablePadding>
							{sub_menu_set[item.title]?.map((sub, i) => (
								<Link href={sub.url} shallow replace key={i} style={{ textDecoration: 'none' }}>
									<ListItemButton
										component="li"
										className={clickMenu[0] === item.title && clickSubMenu === sub.title ? 'li on' : 'li'}
									>
										<Typography variant={sub.title as any} component="span">
											{sub.title}
										</Typography>
									</ListItemButton>
								</Link>
							))}
						</List>
					</Collapse>
				</List>
			))}
		</>
	);
};

export default withRouter(AdminMenuList);
