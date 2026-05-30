import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';

/**
 * Redirects to `redirectTo` if the user is not authenticated.
 * Returns the current user reactive var value.
 */
export function useRequireAuth(redirectTo = '/account/join') {
	const router = useRouter();
	const user   = useReactiveVar(userVar);

	useEffect(() => {
		if (!user._id) {
			router.replace({
				pathname: redirectTo,
				query: { next: router.asPath },
			});
		}
	}, [user._id, router, redirectTo]);

	return user;
}

/**
 * Redirects to `redirectTo` if the user IS authenticated.
 * Useful for login / register pages.
 */
export function useRedirectIfAuth(redirectTo = '/') {
	const router = useRouter();
	const user   = useReactiveVar(userVar);

	useEffect(() => {
		if (user._id) router.replace(redirectTo);
	}, [user._id, router, redirectTo]);

	return user;
}
