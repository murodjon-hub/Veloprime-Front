import React from 'react';
import { useQuery } from '@apollo/client';
import {
	Avatar, Box, Button, Card, CardContent, Chip,
	Grid, LinearProgress, Table, TableBody, TableCell,
	TableHead, TableRow, Typography,
} from '@mui/material';
import {
	People, DirectionsBike, Event,
	Article, ArrowUpward, ArrowDownward,
	OpenInNew, Launch,
} from '@mui/icons-material';
import Link from 'next/link';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { GET_ALL_EVENTS_BY_ADMIN } from '../../../apollo/admin/query';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { getImageUrl } from '../../utils';
import { MemberType } from '../../enums/member.enum';

const STATUS_COLOR: Record<string, string> = {
	ACTIVE:   '#22c55e',
	PAUSE:    '#f59e0b',
	DELETE:   '#ef4444',
	BLOCK:    '#8b5cf6',
	HOLD:     '#6b7280',
	SOLD:     '#3b82f6',
};

function StatusBadge({ status }: { status: string }) {
	const color = STATUS_COLOR[status] ?? '#6b7280';
	return (
		<span
			style={{
				display: 'inline-block',
				padding: '2px 10px',
				borderRadius: 20,
				fontSize: 11,
				fontWeight: 600,
				background: color + '22',
				color,
				letterSpacing: 0.3,
			}}
		>
			{status}
		</span>
	);
}

function StatCard({
	label, value, icon, color, trend, loading,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
	color: string;
	trend?: number;
	loading?: boolean;
}) {
	return (
		<Card className="dash-stat-card" sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
			<CardContent sx={{ p: '20px !important' }}>
				<Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
					<Box component="div">
						<Typography sx={{ fontSize: 13, color: '#888', mb: 0.5, fontWeight: 500 }}>{label}</Typography>
						{loading ? (
							<LinearProgress sx={{ width: 80, mt: 1, mb: 1 }} />
						) : (
							<Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.2 }}>
								{value.toLocaleString()}
							</Typography>
						)}
						{trend !== undefined && !loading && (
							<Box component="div" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
								{trend >= 0
									? <ArrowUpward sx={{ fontSize: 13, color: '#22c55e' }} />
									: <ArrowDownward sx={{ fontSize: 13, color: '#ef4444' }} />}
								<Typography sx={{ fontSize: 12, color: trend >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
									{Math.abs(trend)}% this month
								</Typography>
							</Box>
						)}
					</Box>
					<Box
						component="div"
						sx={{
							width: 48, height: 48, borderRadius: 2,
							background: color + '18',
							display: 'flex', alignItems: 'center', justifyContent: 'center',
						}}
					>
						{React.cloneElement(icon as React.ReactElement, { sx: { color, fontSize: 24 } })}
					</Box>
				</Box>
			</CardContent>
		</Card>
	);
}


const BASE_INPUT = { page: 1, limit: 5, sort: 'createdAt', direction: 'DESC', search: {} };
const COUNT_INPUT = { page: 1, limit: 1, sort: 'createdAt', direction: 'DESC', search: {} };

export default function AdminDashboard() {
	const { data: membersData,  loading: loadingM } = useQuery(GET_ALL_MEMBERS_BY_ADMIN,       { variables: { input: COUNT_INPUT },   fetchPolicy: 'cache-and-network' });
	const { data: productsData, loading: loadingP } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN,      { variables: { input: COUNT_INPUT },   fetchPolicy: 'cache-and-network' });
	const { data: eventsData,   loading: loadingE } = useQuery(GET_ALL_EVENTS_BY_ADMIN,        { variables: { input: COUNT_INPUT },   fetchPolicy: 'cache-and-network' });
	const { data: articlesData, loading: loadingA } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN,{ variables: { input: COUNT_INPUT },   fetchPolicy: 'cache-and-network' });

	const { data: recentMembersData  } = useQuery(GET_ALL_MEMBERS_BY_ADMIN,       { variables: { input: BASE_INPUT }, fetchPolicy: 'cache-and-network' });
	const { data: recentProductsData } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN,      { variables: { input: BASE_INPUT }, fetchPolicy: 'cache-and-network' });

	const totalMembers  = membersData?.getAllMembersByAdmin?.metaCounter?.[0]?.total  ?? 0;
	const totalProducts = productsData?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalEvents   = eventsData?.getAllEventsByAdmin?.metaCounter?.[0]?.total    ?? 0;
	const totalArticles = articlesData?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total ?? 0;

	const recentMembers  = recentMembersData?.getAllMembersByAdmin?.list   ?? [];
	const recentProducts = recentProductsData?.getAllProductsByAdmin?.list  ?? [];

	const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

	return (
		<Box component="div" className="admin-dashboard">

			{/* ── Header ── */}
			<Box component="div" className="admin-dashboard__header">
				<Box component="div">
					<Typography className="admin-dashboard__title">Dashboard</Typography>
					<Typography className="admin-dashboard__date">{today}</Typography>
				</Box>
				<Link href="/" style={{ textDecoration: 'none' }}>
					<Button
						variant="outlined"
						size="small"
						startIcon={<Launch sx={{ fontSize: 16 }} />}
						sx={{ borderColor: '#e0e0e0', color: '#666', textTransform: 'none', borderRadius: 2 }}
					>
						View Site
					</Button>
				</Link>
			</Box>

			{/* ── Stat cards ── */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard label="Total Members"  value={totalMembers}  icon={<People />}         color="#6366f1" trend={12} loading={loadingM} />
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard label="Total Listings" value={totalProducts} icon={<DirectionsBike />} color="#e92c28" trend={5}  loading={loadingP} />
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard label="Total Events"   value={totalEvents}   icon={<Event />}           color="#f59e0b" trend={-3} loading={loadingE} />
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					<StatCard label="Blog Articles"  value={totalArticles} icon={<Article />}         color="#22c55e" trend={8}  loading={loadingA} />
				</Grid>
			</Grid>

			{/* ── Recent tables ── */}
			<Grid container spacing={3} sx={{ mb: 4 }}>

				{/* Recent Members */}
				<Grid item xs={12} md={6}>
					<Card sx={{ borderRadius: 3, border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
						<CardContent sx={{ p: '0 !important' }}>
							<Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '16px 20px' }}>
								<Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Recent Members</Typography>
								<Link href="/_admin/users" style={{ textDecoration: 'none' }}>
									<Button size="small" endIcon={<OpenInNew sx={{ fontSize: 13 }} />}
										sx={{ textTransform: 'none', fontSize: 12, color: '#6366f1' }}>
										View all
									</Button>
								</Link>
							</Box>
							<Table size="small">
								<TableHead>
									<TableRow sx={{ background: '#fafafa' }}>
										<TableCell sx={{ fontSize: 11, color: '#999', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>MEMBER</TableCell>
										<TableCell sx={{ fontSize: 11, color: '#999', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>TYPE</TableCell>
										<TableCell sx={{ fontSize: 11, color: '#999', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>STATUS</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{recentMembers.map((m: any) => (
										<TableRow key={m._id} hover sx={{ '& td': { borderBottom: '1px solid #f9f9f9', py: 1 } }}>
											<TableCell>
												<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<Avatar
														src={getImageUrl(m.memberImage, '/img/profile/defaultUser.svg')}
														sx={{ width: 30, height: 30 }}
													/>
													<Box component="div">
														<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{m.memberNick}</Typography>
														<Typography sx={{ fontSize: 11, color: '#aaa' }}>{m.memberPhone}</Typography>
													</Box>
												</Box>
											</TableCell>
											<TableCell>
												<Chip label={m.memberType} size="small"
													sx={{ fontSize: 10, height: 20, bgcolor: m.memberType === MemberType.ADMIN ? '#6366f1' : '#e0e7ff', color: m.memberType === MemberType.ADMIN ? '#fff' : '#6366f1' }} />
											</TableCell>
											<TableCell><StatusBadge status={m.memberStatus} /></TableCell>
										</TableRow>
									))}
									{recentMembers.length === 0 && (
										<TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: '#bbb', fontSize: 13 }}>No members yet</TableCell></TableRow>
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</Grid>

				{/* Recent Products */}
				<Grid item xs={12} md={6}>
					<Card sx={{ borderRadius: 3, border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
						<CardContent sx={{ p: '0 !important' }}>
							<Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '16px 20px' }}>
								<Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Recent Listings</Typography>
								<Link href="/_admin/properties" style={{ textDecoration: 'none' }}>
									<Button size="small" endIcon={<OpenInNew sx={{ fontSize: 13 }} />}
										sx={{ textTransform: 'none', fontSize: 12, color: '#e92c28' }}>
										View all
									</Button>
								</Link>
							</Box>
							<Table size="small">
								<TableHead>
									<TableRow sx={{ background: '#fafafa' }}>
										<TableCell sx={{ fontSize: 11, color: '#999', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>PRODUCT</TableCell>
										<TableCell sx={{ fontSize: 11, color: '#999', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>PRICE</TableCell>
										<TableCell sx={{ fontSize: 11, color: '#999', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>STATUS</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{recentProducts.map((p: any) => (
										<TableRow key={p._id} hover sx={{ '& td': { borderBottom: '1px solid #f9f9f9', py: 1 } }}>
											<TableCell>
												<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
													<Box
														component="img"
														src={getImageUrl(p.productImages?.[0], '/img/banner/header1.svg')}
														sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'cover', border: '1px solid #f0f0f0' }}
													/>
													<Box component="div">
														<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#333', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
															{p.productName}
														</Typography>
														<Typography sx={{ fontSize: 11, color: '#aaa' }}>{p.productType}</Typography>
													</Box>
												</Box>
											</TableCell>
											<TableCell>
												<Typography sx={{ fontSize: 12, fontWeight: 600, color: '#e92c28' }}>
													${p.productPrice?.toLocaleString()}
												</Typography>
											</TableCell>
											<TableCell><StatusBadge status={p.productStatus} /></TableCell>
										</TableRow>
									))}
									{recentProducts.length === 0 && (
										<TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: '#bbb', fontSize: 13 }}>No products yet</TableCell></TableRow>
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			{/* ── Quick Actions ── */}
			<Card sx={{ borderRadius: 3, border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
				<CardContent sx={{ p: '24px !important' }}>
					<Typography sx={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', mb: 2 }}>Quick Actions</Typography>
					<Grid container spacing={2}>
						{[
							{ label: 'Manage Members',  href: '/_admin/users',      color: '#6366f1', bg: '#eef2ff' },
							{ label: 'Manage Listings', href: '/_admin/properties', color: '#e92c28', bg: '#fff1f1' },
							{ label: 'Manage Events',   href: '/_admin/events',     color: '#f59e0b', bg: '#fffbeb' },
							{ label: 'Manage Blogs',    href: '/_admin/community',  color: '#22c55e', bg: '#f0fdf4' },
							{ label: 'FAQ',             href: '/_admin/cs/faq',     color: '#06b6d4', bg: '#ecfeff' },
							{ label: 'Inquiries',       href: '/_admin/cs/inquiry', color: '#8b5cf6', bg: '#f5f3ff' },
						].map(({ label, href, color, bg }) => (
							<Grid item xs={6} sm={4} md={2} key={href}>
								<Link href={href} style={{ textDecoration: 'none' }}>
									<Box
										component="div"
										sx={{
											p: 2, borderRadius: 2, background: bg, cursor: 'pointer',
											textAlign: 'center', border: `1px solid ${color}22`,
											transition: 'transform 0.15s, box-shadow 0.15s',
											'&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${color}22` },
										}}
									>
										<Typography sx={{ fontSize: 13, fontWeight: 600, color }}>{label}</Typography>
									</Box>
								</Link>
							</Grid>
						))}
					</Grid>
				</CardContent>
			</Card>
		</Box>
	);
}
