import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { getImageUrl } from '../utils';
import { Stack, MenuItem, Menu } from '@mui/material';
import { Search, ChevronDown, LogOut, User, Heart, Package, Settings } from 'lucide-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';

const TR: Record<string, Record<string, string>> = {
	en: {
		Home:           'Home',
		Bikes:          'Bikes',
		Accessories:    'Accessories',
		Events:         'Events',
		Blogs:          'Blogs',
		Members:        'Members',
		Login:          'Login',
		SignUp:         'Sign Up',
		eyebrow:        'Premium Bicycle Marketplace',
		titleLine1:     'RIDE',
		titleLine2:     'BEYOND',
		titleLine3:     'LIMITS.',
		subtitle:       'Discover next-generation bikes built for power, precision, and adventure — wherever the road takes you.',
		shopBikes:      'Shop Bikes',
		exploreAcc:     'Explore Accessories',
		bikesListed:    'Bikes Listed',
		brands:         'Brands',
		avgRating:      'Avg. Rating',
		searchPlaceholder: 'Search bikes, accessories, brands…',
		searchBtn:      'Search',
		myPage:         'My Page',
		favorites:      'Favorites',
		myBikes:        'My Bikes',
		admin:          'Admin',
		logout:         'Logout',
		scroll:         'Scroll',
	},
	ru: {
		Home:           'Главная',
		Bikes:          'Велосипеды',
		Accessories:    'Аксессуары',
		Events:         'События',
		Blogs:          'Блоги',
		Members:        'Участники',
		Login:          'Войти',
		SignUp:         'Регистрация',
		eyebrow:        'Премиум маркетплейс велосипедов',
		titleLine1:     'ЕЗДИ',
		titleLine2:     'ДАЛЬШЕ',
		titleLine3:     'ПРЕДЕЛА.',
		subtitle:       'Открой велосипеды нового поколения — для скорости, точности и приключений на любых дорогах.',
		shopBikes:      'Купить велосипед',
		exploreAcc:     'Аксессуары',
		bikesListed:    'Велосипедов',
		brands:         'Брендов',
		avgRating:      'Рейтинг',
		searchPlaceholder: 'Поиск велосипедов, аксессуаров, брендов…',
		searchBtn:      'Найти',
		myPage:         'Моя страница',
		favorites:      'Избранное',
		myBikes:        'Мои велосипеды',
		admin:          'Администратор',
		logout:         'Выйти',
		scroll:         'Пролистать',
	},
	kr: {
		Home:           '홈',
		Bikes:          '바이크',
		Accessories:    '액세서리',
		Events:         '이벤트',
		Blogs:          '블로그',
		Members:        '멤버',
		Login:          '로그인',
		SignUp:         '가입',
		eyebrow:        '프리미엄 자전거 마켓플레이스',
		titleLine1:     '한계를',
		titleLine2:     '넘어',
		titleLine3:     '달려라.',
		subtitle:       '파워, 정밀성, 모험을 위한 차세대 바이크를 발견하세요 — 어떤 도로에서도.',
		shopBikes:      '바이크 쇼핑',
		exploreAcc:     '액세서리 보기',
		bikesListed:    '등록된 바이크',
		brands:         '브랜드',
		avgRating:      '평균 평점',
		searchPlaceholder: '바이크, 액세서리, 브랜드 검색…',
		searchBtn:      '검색',
		myPage:         '마이 페이지',
		favorites:      '즐겨찾기',
		myBikes:        '내 바이크',
		admin:          '관리자',
		logout:         '로그아웃',
		scroll:         '스크롤',
	},
};

const NAV_KEYS = ['Home', 'Bikes', 'Accessories', 'Events', 'Blogs', 'Members'];
const NAV_HREFS: Record<string, string> = {
	Home:        '/',
	Bikes:       '/products',
	Accessories: '/accessories',
	Events:      '/events',
	Blogs:       '/community',
	Members:     '/agent',
};

const Top = () => {
	const device  = useDeviceDetect();
	const user    = useReactiveVar(userVar);
	const router  = useRouter();
	const tr      = TR[router.locale ?? 'en'] ?? TR.en;
	const t       = (key: string) => tr[key] ?? key;

	const [scrolled,    setScrolled]    = useState(false);
	const [langAnchor,  setLangAnchor]  = useState<null | HTMLElement>(null);
	const [userAnchor,  setUserAnchor]  = useState<null | HTMLElement>(null);
	const [searchOpen,  setSearchOpen]  = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 60);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		if (searchOpen) searchRef.current?.focus();
	}, [searchOpen]);

	const langChoice = useCallback(async (e: React.MouseEvent<HTMLElement>) => {
		const id = (e.currentTarget as HTMLElement).id;
		setLangAnchor(null);
		await router.push(router.asPath, router.asPath, { locale: id });
	}, [router]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
			setSearchOpen(false);
			setSearchQuery('');
		}
	};

	const currentLocale = (router.locale ?? 'en').toUpperCase();

	if (device === 'mobile') {
		return (
			<Stack className="mobile-nav">
				{NAV_KEYS.map((key) => (
					<Link key={key} href={NAV_HREFS[key]}>
						<div>{t(key)}</div>
					</Link>
				))}
			</Stack>
		);
	}

	return (
		<Stack className="navbar">
			<div className="hero">
				<div className="hero__bg">
					<img src="/img/michal-robak-AAiETm0sKoM-unsplash.jpg" alt="Premium bicycle" className="hero__bg-img" />
					<div className="hero__overlay" />
				</div>

				{/* ── Top Bar ── */}
				<header className={`hero__topbar${scrolled ? ' hero__topbar--scrolled' : ''}`}>
					<div className="hero__topbar-inner">

						<Link href="/" className="hero__logo">VELOPRIME</Link>

						<nav className="hero__nav">
							{NAV_KEYS.map((key) => (
								<Link
									key={key}
									href={NAV_HREFS[key]}
									className={`hero__nav-link${router.pathname === NAV_HREFS[key] ? ' active' : ''}`}
								>
									{t(key)}
								</Link>
							))}
						</nav>

						<div className="hero__actions">
							<button className="hero__icon-btn" onClick={() => setSearchOpen((p) => !p)} aria-label="Search">
								<Search size={18} />
							</button>

							<button
								className="hero__icon-btn hero__lang-btn"
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => setLangAnchor(e.currentTarget)}
							>
								{currentLocale} <ChevronDown size={12} />
							</button>
							<Menu anchorEl={langAnchor} open={Boolean(langAnchor)} onClose={() => setLangAnchor(null)}>
								{[
									{ id: 'en', label: 'English' },
									{ id: 'kr', label: '한국어' },
									{ id: 'ru', label: 'Русский' },
								].map((l) => (
									<MenuItem key={l.id} id={l.id} onClick={langChoice} sx={{ fontSize: 13 }}>
										{l.label}
									</MenuItem>
								))}
							</Menu>

							{user?._id ? (
								<>
									<button
										className="hero__user-btn"
										onClick={(e: React.MouseEvent<HTMLButtonElement>) => setUserAnchor(e.currentTarget)}
									>
										<img
											src={getImageUrl(user.memberImage, '/img/profile/defaultUser.svg')}
											alt={user.memberNick}
											className="hero__avatar"
										/>
										<span className="hero__user-nick">{user.memberNick}</span>
									</button>
									<Menu
										anchorEl={userAnchor}
										open={Boolean(userAnchor)}
										onClose={() => setUserAnchor(null)}
										transformOrigin={{ vertical: 'top', horizontal: 'right' }}
										anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
										PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: 2, boxShadow: '0 16px 48px rgba(0,0,0,0.15)' } }}
									>
										<MenuItem onClick={() => { router.push(`/mypage?memberId=${user._id}`); setUserAnchor(null); }}>
											<User size={15} style={{ marginRight: 8 }} /> {t('myPage')}
										</MenuItem>
										<MenuItem onClick={() => { router.push(`/mypage?category=myFavorites&memberId=${user._id}`); setUserAnchor(null); }}>
											<Heart size={15} style={{ marginRight: 8 }} /> {t('favorites')}
										</MenuItem>
										<MenuItem onClick={() => { router.push(`/mypage?category=myProducts&memberId=${user._id}`); setUserAnchor(null); }}>
											<Package size={15} style={{ marginRight: 8 }} /> {t('myBikes')}
										</MenuItem>
										{user.memberType === 'ADMIN' && (
											<MenuItem onClick={() => { router.push('/_admin'); setUserAnchor(null); }}>
												<Settings size={15} style={{ marginRight: 8 }} /> {t('admin')}
											</MenuItem>
										)}
										<MenuItem onClick={() => { logOut(); setUserAnchor(null); }} sx={{ color: '#e63946', mt: 0.5 }}>
											<LogOut size={15} style={{ marginRight: 8 }} /> {t('logout')}
										</MenuItem>
									</Menu>
								</>
							) : (
								<div className="hero__auth">
									<Link href="/account/join">
										<button className="hero__btn-ghost">{t('Login')}</button>
									</Link>
									<Link href="/account/join">
										<button className="hero__btn-primary">{t('SignUp')}</button>
									</Link>
								</div>
							)}
						</div>
					</div>

					{searchOpen && (
						<div className="hero__searchbar">
							<form onSubmit={handleSearch} className="hero__search-form">
								<Search size={16} className="hero__search-icon" />
								<input
									ref={searchRef}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder={t('searchPlaceholder')}
									className="hero__search-input"
								/>
								<button type="submit" className="hero__search-submit">{t('searchBtn')}</button>
							</form>
						</div>
					)}
				</header>

				{/* ── Hero Content ── */}
				<div className="hero__content">
					<div className="hero__content-inner">
						<p className="hero__eyebrow">{t('eyebrow')}</p>
						<h1 className="hero__title">
							{t('titleLine1')}<br />
							<span className="hero__title-accent">{t('titleLine2')}</span><br />
							{t('titleLine3')}
						</h1>
						<p className="hero__subtitle">{t('subtitle')}</p>
						<div className="hero__cta-group">
							<Link href="/products">
								<button className="hero__cta-primary">
									{t('shopBikes')}
									<span className="hero__cta-arrow">→</span>
								</button>
							</Link>
							<Link href="/accessories">
								<button className="hero__cta-secondary">{t('exploreAcc')}</button>
							</Link>
						</div>
						<div className="hero__stats">
							<div className="hero__stat">
								<span className="hero__stat-num">500+</span>
								<span className="hero__stat-label">{t('bikesListed')}</span>
							</div>
							<div className="hero__stat-divider" />
							<div className="hero__stat">
								<span className="hero__stat-num">120+</span>
								<span className="hero__stat-label">{t('brands')}</span>
							</div>
							<div className="hero__stat-divider" />
							<div className="hero__stat">
								<span className="hero__stat-num">4.9★</span>
								<span className="hero__stat-label">{t('avgRating')}</span>
							</div>
						</div>
					</div>
				</div>

				<div className="hero__scroll-hint">
					<div className="hero__scroll-line" />
					<span>{t('scroll')}</span>
				</div>
			</div>
		</Stack>
	);
};

export default withRouter(Top);
