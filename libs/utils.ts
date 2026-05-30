import numeral from 'numeral';
import { sweetMixinErrorAlert } from './sweetAlert';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

export const likeTargetProductHandler = async (likeTargetProduct: any, id: string) => {
	try {
		await likeTargetProduct({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		sweetMixinErrorAlert(err).then();
	}
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string) => {
	try {
		await likeTargetBoardArticle({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		sweetMixinErrorAlert(err).then();
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
	try {
		await likeTargetMember({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		sweetMixinErrorAlert(err).then();
	}
};

export const FALLBACK_IMAGE = '/img/icons/no-image.svg';
export const FALLBACK_USER  = '/img/profile/defaultUser.svg';

/**
 * Converts a backend image path to a URL ready for <img src>.
 * Always routes through the Next.js /uploads/ proxy so the browser
 * never makes a cross-origin request directly to the backend.
 *
 * - absolute http URL   → strip host, keep /uploads/... portion
 * - /uploads/... path   → returned as-is (already proxy-ready)
 * - relative path       → prefixed with /
 * - /img/... static     → returned as-is (served by Next.js)
 */
export const getImageUrl = (path?: string | null, fallback = FALLBACK_IMAGE): string => {
	if (!path) return fallback;
	// Absolute URL from backend — extract the /uploads/... segment
	if (path.startsWith('http')) {
		const idx = path.indexOf('/uploads/');
		if (idx !== -1) return path.slice(idx); // → /uploads/...
		return fallback;
	}
	// Already a relative or absolute path
	if (path.startsWith('/')) return path;
	return `/${path}`;
};
