import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import YouTubeIcon from '@mui/icons-material/YouTube';
import useDeviceDetect from '../hooks/useDeviceDetect';

const LINKS = {
	marketplace: [
		{ label: 'All Bikes',       href: '/products' },
		{ label: 'Accessories',     href: '/accessories' },
		{ label: 'New Arrivals',    href: '/products?sort=createdAt' },
		{ label: 'Best Sellers',    href: '/products?sort=productLikes' },
	],
	company: [
		{ label: 'About Us',   href: '/about' },
		{ label: 'Events',     href: '/events' },
		{ label: 'Blog',       href: '/community' },
		{ label: 'Sellers',    href: '/agent' },
	],
	support: [
		{ label: 'FAQ',            href: '/cs/faq' },
		{ label: 'Contact Us',     href: '/cs/inquiry' },
		{ label: 'Sell a Bike',    href: '/mypage?category=addProduct' },
		{ label: 'My Account',     href: '/mypage' },
	],
};

const Footer = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const year   = new Date().getFullYear();

	if (device === 'mobile') {
		return (
			<footer className="footer footer--mobile">
				<div className="footer__brand">VELOPRIME</div>
				<nav className="footer__mobile-nav">
					{LINKS.marketplace.map((l) => (
						<Link key={l.href} href={l.href} className="footer__mobile-link">{l.label}</Link>
					))}
				</nav>
				<p className="footer__copy">© {year} VELOPRIME</p>
			</footer>
		);
	}

	return (
		<footer className="footer">
			<div className="footer__inner">

				{/* Brand column */}
				<div className="footer__brand-col">
					<div className="footer__logo" onClick={() => router.push('/')}>VELOPRIME</div>
					<p className="footer__tagline">
						Premium bicycles for every rider.<br />
						Discover, compare, and ride smarter.
					</p>
					<div className="footer__social">
						<button className="footer__social-btn"><InstagramIcon sx={{ fontSize: 16 }} /></button>
						<button className="footer__social-btn"><TwitterIcon sx={{ fontSize: 16 }} /></button>
						<button className="footer__social-btn"><FacebookOutlinedIcon sx={{ fontSize: 16 }} /></button>
						<button className="footer__social-btn"><YouTubeIcon sx={{ fontSize: 16 }} /></button>
					</div>
					<div className="footer__contact">
						<div className="footer__contact-row"><Mail size={13} /> hello@veloprime.com</div>
						<div className="footer__contact-row"><Phone size={13} /> +82 10 4867 2909</div>
						<div className="footer__contact-row"><MapPin size={13} /> Seoul, South Korea</div>
					</div>
				</div>

				{/* Link columns */}
				{[
					{ title: 'Marketplace', links: LINKS.marketplace },
					{ title: 'Company',     links: LINKS.company },
					{ title: 'Support',     links: LINKS.support },
				].map(({ title, links }) => (
					<div key={title} className="footer__col">
						<h4 className="footer__col-title">{title}</h4>
						<ul className="footer__col-list">
							{links.map((l) => (
								<li key={l.href}>
									<Link href={l.href} className="footer__link">{l.label}</Link>
								</li>
							))}
						</ul>
					</div>
				))}

				{/* Newsletter */}
				<div className="footer__newsletter-col">
					<h4 className="footer__col-title">Stay in the loop</h4>
					<p className="footer__newsletter-sub">Get new listings, events, and deals.</p>
					<form
						className="footer__newsletter-form"
						onSubmit={(e) => e.preventDefault()}
					>
						<input
							type="email"
							placeholder="Your email"
							className="footer__newsletter-input"
						/>
						<button type="submit" className="footer__newsletter-btn">
							<ArrowRight size={16} />
						</button>
					</form>
				</div>

			</div>

			{/* Bottom bar */}
			<div className="footer__bottom">
				<div className="footer__bottom-inner">
					<span className="footer__copy">© {year} VELOPRIME. All rights reserved.</span>
					<div className="footer__bottom-links">
						<Link href="/cs" className="footer__bottom-link">Privacy</Link>
						<Link href="/cs" className="footer__bottom-link">Terms</Link>
						<Link href="/cs" className="footer__bottom-link">Cookies</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
