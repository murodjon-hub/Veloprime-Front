import React, { useEffect, useRef, useState } from 'react';
import { Stack, Menu, MenuItem } from '@mui/material';
import { Search, User, Heart, Package, Settings, LogOut, ChevronDown, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { logOut } from '../auth';
import useDeviceDetect from '../hooks/useDeviceDetect';
import NotificationBell from './ui/NotificationBell';

const LANGUAGES = [
	{ locale: 'en', label: 'English', short: 'EN' },
	{ locale: 'kr', label: '한국어',   short: 'KR' },
	{ locale: 'ru', label: 'Русский',  short: 'RU' },
];

const NAV_TRANSLATIONS: Record<string, Record<string, string>> = {
	en: { Home: 'Home', Bikes: 'Bikes', Accessories: 'Accessories', Events: 'Events', Blogs: 'Blogs', Members: 'Members', Login: 'Login', Register: 'Sign Up' },
	kr: { Home: '홈', Bikes: '바이크', Accessories: '액세서리', Events: '이벤트', Blogs: '블로그', Members: '멤버', Login: '로그인', Register: '가입' },
	ru: { Home: 'Главная', Bikes: 'Велосипеды', Accessories: 'Аксессуары', Events: 'События', Blogs: 'Блоги', Members: 'Участники', Login: 'Войти', Register: 'Регистрация' },
};

const NAV_LINKS = [
	{ key: 'Home',        href: '/' },
	{ key: 'Bikes',       href: '/products' },
	{ key: 'Accessories', href: '/accessories' },
	{ key: 'Events',      href: '/events' },
	{ key: 'Blogs',       href: '/community' },
	{ key: 'Members',     href: '/agent' },
];

const Header2 = () => {
	const device   = useDeviceDetect();
	const router   = useRouter();
	const user     = useReactiveVar(userVar);
	const tr       = NAV_TRANSLATIONS[router.locale ?? 'en'] ?? NAV_TRANSLATIONS.en;
	const t        = (key: string) => tr[key] ?? key;
	const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
	const [scrolled,   setScrolled]   = useState(false);
	const [langOpen,   setLangOpen]   = useState(false);
	const langRef = useRef<HTMLDivElement>(null);

	const currentLang = LANGUAGES.find((l) => l.locale === router.locale) ?? LANGUAGES[0];

	const switchLocale = (locale: string) => {
		router.push(router.asPath, router.asPath, { locale, scroll: false });
		setLangOpen(false);
	};

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 10);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	if (device === 'mobile') {
		return (
			<Stack className="header2-mobile">
				{NAV_LINKS.map((l) => (
					<Link key={l.href} href={l.href}><div>{t(l.key)}</div></Link>
				))}
			</Stack>
		);
	}

	return (
		<header className={`header2${scrolled ? ' header2--scrolled' : ''}`}>
			<div className="header2__inner">

				{/* Logo */}
				<Link href="/" className="header2__logo">VELOPRIME</Link>

				{/* Nav */}
				<nav className="header2__nav">
					{NAV_LINKS.map((l) => (
						<Link
							key={l.href}
							href={l.href}
							className={`header2__nav-link${router.pathname === l.href ? ' active' : ''}`}
						>
							{t(l.key)}
						</Link>
					))}
				</nav>

				{/* Actions */}
				<div className="header2__actions">
					<Link href="/products" className="header2__icon-btn" aria-label="Search">
						<Search size={17} />
					</Link>

					{/* Language switcher */}
					<div className="header2__lang" ref={langRef}>
						<button className="header2__lang-btn" onClick={() => setLangOpen((p) => !p)}>
							<Globe size={13} />
							<span>{currentLang.short}</span>
							<ChevronDown size={11} className={langOpen ? 'rotated' : ''} />
						</button>
						{langOpen && (
							<div className="header2__lang-dropdown">
								{LANGUAGES.map((l) => (
									<button
										key={l.locale}
										className={`header2__lang-option${l.locale === router.locale ? ' active' : ''}`}
										onClick={() => switchLocale(l.locale)}
									>
										<span className="header2__lang-short">{l.short}</span>
										<span className="header2__lang-label">{l.label}</span>
									</button>
								))}
							</div>
						)}
					</div>

					{user?._id && <NotificationBell />}

					{user?._id ? (
						<>
							<button
								className="header2__user-btn"
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setUserAnchor(e.currentTarget)}
							>
								<img
									src={user.memberImage ?? '/img/profile/defaultUser.svg'}
									alt={user.memberNick}
									className="header2__avatar"
								/>
								<span className="header2__nick">{user.memberNick}</span>
								<ChevronDown size={12} />
							</button>
							<Menu
								anchorEl={userAnchor}
								open={Boolean(userAnchor)}
								onClose={() => setUserAnchor(null)}
								transformOrigin={{ vertical: 'top', horizontal: 'right' }}
								anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
								slotProps={{ paper: { sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' } } }}
							>
								<MenuItem onClick={() => { router.push(`/mypage?memberId=${user._id}`); setUserAnchor(null); }}>
									<User size={14} style={{ marginRight: 8 }} /> My Page
								</MenuItem>
								<MenuItem onClick={() => { router.push(`/mypage?category=myFavorites&memberId=${user._id}`); setUserAnchor(null); }}>
									<Heart size={14} style={{ marginRight: 8 }} /> Favorites
								</MenuItem>
								<MenuItem onClick={() => { router.push(`/mypage?category=myProducts&memberId=${user._id}`); setUserAnchor(null); }}>
									<Package size={14} style={{ marginRight: 8 }} /> My Bikes
								</MenuItem>
								{user.memberType === 'ADMIN' && (
									<MenuItem onClick={() => { router.push('/_admin'); setUserAnchor(null); }}>
										<Settings size={14} style={{ marginRight: 8 }} /> Admin
									</MenuItem>
								)}
								<MenuItem onClick={() => { logOut(); setUserAnchor(null); }} sx={{ color: '#e63946', mt: 0.5 }}>
									<LogOut size={14} style={{ marginRight: 8 }} /> Logout
								</MenuItem>
							</Menu>
						</>
					) : (
						<div className="header2__auth">
							<Link href="/account/join">
								<button className="header2__btn-ghost">{t('Login')}</button>
							</Link>
							<Link href="/account/join">
								<button className="header2__btn-primary">{t('Register')}</button>
							</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header2;
