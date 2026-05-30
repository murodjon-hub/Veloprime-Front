import decodeJWT from 'jwt-decode';
import { initializeApollo, resetApolloStore } from '../../apollo/client';
import { userVar, EMPTY_USER_STATE } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';

/* ─────────────────────────────────────────────
   Token storage (localStorage)
───────────────────────────────────────────── */
const TOKEN_KEY = 'accessToken';

export function getJwtToken(): string {
	if (typeof window === 'undefined') return '';
	return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function setJwtToken(token: string): void {
	localStorage.setItem(TOKEN_KEY, token);
	// Signal other tabs so they can update their userVar
	localStorage.setItem('veloprime:login', Date.now().toString());
}

/** @deprecated Use setJwtToken + updateUserInfo directly. Kept for backwards compat. */
export function updateStorage({ jwtToken }: { jwtToken: string }): void {
	setJwtToken(jwtToken);
}

function removeJwtToken(): void {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.setItem('veloprime:logout', Date.now().toString());
}

/* ─────────────────────────────────────────────
   Token decode + validity check
───────────────────────────────────────────── */
export function isTokenValid(token?: string): boolean {
	const t = token ?? getJwtToken();
	if (!t) return false;
	try {
		const { exp } = decodeJWT<{ exp?: number }>(t);
		return exp ? Date.now() < exp * 1000 : true;
	} catch {
		return false;
	}
}

/** Stub — replace with real refresh-token mutation when backend supports it */
export async function refreshAccessToken(): Promise<string | null> {
	// Currently the backend issues only access tokens (no refresh token).
	// Return null so the error link falls back to logout.
	return null;
}

/* ─────────────────────────────────────────────
   User reactive variable
───────────────────────────────────────────── */
export function updateUserInfo(jwtToken: string): void {
	if (!jwtToken) return;
	try {
		const claims = decodeJWT<CustomJwtPayload>(jwtToken);
		userVar({
			_id:              claims._id              ?? '',
			memberType:       claims.memberType       ?? '',
			memberStatus:     claims.memberStatus     ?? '',
			memberAuthType:   claims.memberAuthType   ?? '',
			memberPhone:      claims.memberPhone      ?? '',
			memberNick:       claims.memberNick       ?? '',
			memberFullName:   claims.memberFullName   ?? '',
			memberImage:      claims.memberImage
				? (claims.memberImage.startsWith('/') ? claims.memberImage : `/${claims.memberImage}`)
				: '/img/profile/defaultUser.svg',
			memberAddress:    claims.memberAddress    ?? '',
			memberDesc:       claims.memberDesc       ?? '',
			memberProducts:   claims.memberProducts   ?? 0,
			memberArticles:   claims.memberArticles   ?? 0,
			memberFollowers:  claims.memberFollowers  ?? 0,
			memberFollowings: claims.memberFollowings ?? 0,
			memberPoints:     claims.memberPoints     ?? 0,
			memberLikes:      claims.memberLikes      ?? 0,
			memberViews:      claims.memberViews      ?? 0,
			memberComments:   claims.memberComments   ?? 0,
			memberRank:       claims.memberRank       ?? 0,
			memberWarnings:   claims.memberWarnings   ?? 0,
			memberBlocks:     claims.memberBlocks     ?? 0,
		});
	} catch (e) {
		console.error('[auth] invalid token', e);
	}
}

/** Call once on app boot to rehydrate auth state from localStorage */
export function rehydrateAuth(): void {
	const token = getJwtToken();
	if (token && isTokenValid(token)) updateUserInfo(token);
	else if (token) removeJwtToken(); // expired — clean up
}

/* ─────────────────────────────────────────────
   Login
───────────────────────────────────────────── */
export async function logIn(nick: string, password: string): Promise<void> {
	const client = initializeApollo();
	try {
		const { data } = await client.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});
		const token: string = data?.login?.accessToken;
		if (!token) throw new Error('No token received');
		setJwtToken(token);
		updateUserInfo(token);
	} catch (err: any) {
		const msg: string = err?.graphQLErrors?.[0]?.message ?? '';
		if (msg.includes('password'))    sweetMixinErrorAlert('Wrong password — please try again.');
		else if (msg.includes('blocked')) sweetMixinErrorAlert('Your account has been blocked.');
		else                              sweetMixinErrorAlert('Login failed — please try again.');
		throw err;
	}
}

/* ─────────────────────────────────────────────
   Sign-up
───────────────────────────────────────────── */
export async function signUp(
	nick: string,
	password: string,
	phone: string,
	type: string,
): Promise<void> {
	const client = initializeApollo();
	try {
		const { data } = await client.mutate({
			mutation: SIGN_UP,
			variables: { input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type } },
			fetchPolicy: 'network-only',
		});
		const token: string = data?.signup?.accessToken;
		if (!token) throw new Error('No token received');
		setJwtToken(token);
		updateUserInfo(token);
	} catch (err: any) {
		const msg: string = err?.graphQLErrors?.[0]?.message ?? '';
		if (msg.includes('nick') || msg.includes('phone'))
			sweetMixinErrorAlert('This username or phone is already taken.');
		else sweetMixinErrorAlert('Registration failed — please try again.');
		throw err;
	}
}

/* ─────────────────────────────────────────────
   Logout
───────────────────────────────────────────── */
export function logOut(): void {
	removeJwtToken();
	userVar({ ...EMPTY_USER_STATE });
	resetApolloStore();
	window.location.replace('/');
}

/* ─────────────────────────────────────────────
   Multi-tab sync
   Listen for login/logout events fired from
   setJwtToken / removeJwtToken via localStorage.
───────────────────────────────────────────── */
export function initMultiTabSync(): () => void {
	if (typeof window === 'undefined') return () => {};

	const handler = (e: StorageEvent) => {
		if (e.key === 'veloprime:logout') {
			userVar({ ...EMPTY_USER_STATE });
			resetApolloStore();
		}
		if (e.key === 'veloprime:login') {
			const token = getJwtToken();
			if (token) updateUserInfo(token);
		}
	};

	const sessionExpiredHandler = () => logOut();

	window.addEventListener('storage', handler);
	window.addEventListener('veloprime:session-expired', sessionExpiredHandler);

	return () => {
		window.removeEventListener('storage', handler);
		window.removeEventListener('veloprime:session-expired', sessionExpiredHandler);
	};
}
