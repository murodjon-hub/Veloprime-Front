import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Pagination, Typography } from '@mui/material';
import AgentCard from '../../libs/components/common/AgentCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { GET_AGENTS } from '../../apollo/user/query';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { sweetErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { Messages } from '../../libs/config';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SORT_OPTIONS = [
	{ label: 'Newest',    sort: 'createdAt',   direction: 'DESC' },
	{ label: 'Oldest',   sort: 'createdAt',   direction: 'ASC'  },
	{ label: 'Most liked',  sort: 'memberLikes', direction: 'DESC' },
	{ label: 'Most viewed', sort: 'memberViews', direction: 'DESC' },
];

const MemberList: NextPage = ({ initialInput }: any) => {
	const router = useRouter();
	const user   = useReactiveVar(userVar);

	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [members, setMembers] = useState<Member[]>([]);
	const [total,   setTotal]   = useState<number>(0);
	const [searchText, setSearchText] = useState('');

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { refetch } = useQuery(GET_AGENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMembers(data?.getAgents?.list ?? []);
			setTotal(data?.getAgents?.metaCounter?.[0]?.total ?? 0);
		},
	});

	useEffect(() => {
		if (router.query.input) {
			setSearchFilter(JSON.parse(router.query.input as string));
		} else {
			router.replace(`/agent?input=${JSON.stringify(searchFilter)}`);
		}
	}, [router.query.input]);

	const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const opt = SORT_OPTIONS[Number(e.target.value)];
		setSearchFilter((prev: any) => ({ ...prev, page: 1, sort: opt.sort, direction: opt.direction }));
	};

	const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			setSearchFilter((prev: any) => ({
				...prev, page: 1, search: { ...prev.search, text: searchText },
			}));
		}
	};

	const paginationHandler = async (_: ChangeEvent<unknown>, value: number) => {
		const next = { ...searchFilter, page: value };
		setSearchFilter(next);
		await router.push(`/agent?input=${JSON.stringify(next)}`, undefined, { scroll: false });
	};

	const likeMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			await refetch({ input: searchFilter });
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			sweetErrorAlert(err.message).then();
		}
	};

	const currentSortIdx = SORT_OPTIONS.findIndex(
		(o) => o.sort === searchFilter.sort && o.direction === searchFilter.direction,
	);

	return (
		<div className="agent-list-page">
			{/* ── Hero ─────────────────────────────────────────────────────── */}
			<Box component="div" className="members-hero">
				<Box component="div" className="members-hero__bg" />
				<Typography className="members-hero__title">Community Members</Typography>
				<Typography className="members-hero__sub">
					Discover riders, sellers, and cycling enthusiasts
				</Typography>
			</Box>

			{/* ── Controls ──────────────────────────────────────────────────── */}
			<Box component="div" className="members-controls">
				<input
					className="members-controls__search"
					type="text"
					placeholder="Search members…"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					onKeyDown={handleSearch}
				/>
				<select
					className="members-controls__sort"
					value={currentSortIdx === -1 ? 0 : currentSortIdx}
					onChange={handleSort}
				>
					{SORT_OPTIONS.map((opt, i) => (
						<option key={i} value={i}>{opt.label}</option>
					))}
				</select>
				{total > 0 && (
					<Typography className="members-controls__total">
						{total} member{total !== 1 ? 's' : ''}
					</Typography>
				)}
			</Box>

			{/* ── Grid ──────────────────────────────────────────────────────── */}
			{members.length === 0 ? (
				<Box component="div" className="members-empty">
					<PeopleOutlineIcon sx={{ fontSize: 48, color: '#e0e0e0' }} />
					<Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 700, color: '#111', mt: 1 }}>
						No members found
					</Typography>
					<p>Try adjusting your search or check back later.</p>
				</Box>
			) : (
				<Box component="div" className="members-grid">
					{members.map((member: Member) => (
						<AgentCard key={member._id} agent={member} likeMemberHandler={likeMemberHandler} />
					))}
				</Box>
			)}

			{/* ── Pagination ────────────────────────────────────────────────── */}
			{total > searchFilter.limit && (
				<Box component="div" className="members-pagination">
					<Pagination
						page={searchFilter.page}
						count={Math.ceil(total / searchFilter.limit)}
						onChange={paginationHandler}
						shape="circular"
						color="primary"
					/>
					<p>{total} member{total !== 1 ? 's' : ''} in the community</p>
				</Box>
			)}
		</div>
	);
};

MemberList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(MemberList);
