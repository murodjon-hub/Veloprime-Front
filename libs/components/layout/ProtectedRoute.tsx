import React, { ComponentType } from 'react';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';

interface Options {
	/** Required role. Omit to just require any authenticated user. */
	roles?: MemberType[];
	/** Where to send unauthenticated visitors. Defaults to /account/join */
	redirectTo?: string;
}

/**
 * HOC that wraps a page component with auth + RBAC protection.
 *
 * Usage:
 *   export default withAuth(MyPage, { roles: [MemberType.ADMIN] });
 */
export function withAuth<P extends object>(
	Component: ComponentType<P>,
	options: Options = {},
): ComponentType<P> {
	const { roles, redirectTo = '/account/join' } = options;

	function ProtectedPage(props: P) {
		const router = useRouter();
		const user   = useReactiveVar(userVar);

		// Not logged in
		if (!user._id) {
			if (typeof window !== 'undefined') {
				router.replace({ pathname: redirectTo, query: { next: router.asPath } });
			}
			return null;
		}

		// Role check
		if (roles && roles.length > 0 && !roles.includes(user.memberType as MemberType)) {
			if (typeof window !== 'undefined') router.replace('/');
			return null;
		}

		return <Component {...props} />;
	}

	ProtectedPage.displayName = `withAuth(${Component.displayName ?? Component.name})`;
	return ProtectedPage;
}
