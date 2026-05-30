import Swal from 'sweetalert2';

export function sweetErrorHandlerDefault(message: string): void {
	Swal.fire({
		icon: 'error',
		title: 'Error',
		text: message,
		confirmButtonColor: '#1a1a1a',
		timer: 4000,
		timerProgressBar: true,
	});
}

export function sweetSuccessHandler(message: string): void {
	Swal.fire({
		icon: 'success',
		title: 'Success',
		text: message,
		confirmButtonColor: '#1a1a1a',
		timer: 2500,
		timerProgressBar: true,
	});
}

export function sweetConfirm(title: string, text: string): Promise<boolean> {
	return Swal.fire({
		title,
		text,
		icon: 'question',
		showCancelButton: true,
		confirmButtonColor: '#1a1a1a',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes',
	}).then((r) => r.isConfirmed);
}

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
