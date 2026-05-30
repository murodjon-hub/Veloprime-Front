// Re-export from the canonical source so callers that import from here
// get the same behaviour as callers that import from sweetAlert.ts.
export {
	sweetErrorHandling as sweetErrorHandlerDefault,
	sweetMixinSuccessAlert as sweetSuccessHandler,
	sweetConfirmAlert as sweetConfirm,
} from '../sweetAlert';

export function parseGraphQLError(err: unknown): string {
	if (!err) return 'Unknown error';
	const e = err as any;
	return (
		e?.graphQLErrors?.[0]?.message ||
		e?.networkError?.result?.errors?.[0]?.message ||
		e?.message ||
		'Something went wrong'
	);
}
