import Swal from 'sweetalert2';

// ── Message cleaner ────────────────────────────────────────────────
// Extracts a readable string from any error shape and strips jargon.
function cleanMessage(raw: unknown): string {
	const msg: string =
		(raw as any)?.graphQLErrors?.[0]?.message ||
		(raw as any)?.networkError?.result?.errors?.[0]?.message ||
		(raw as any)?.message ||
		(typeof raw === 'string' ? raw : 'Something went wrong. Please try again.');

	const lower = msg.toLowerCase();

	if (lower.includes('not authenticated') || lower.includes('not_authenticated'))
		return 'Please log in to continue.';
	if (lower.includes('forbidden') || lower.includes('not authorized'))
		return "You don't have permission to do that.";
	if (lower.includes('network error') || lower.includes('failed to fetch'))
		return 'Network error — please check your connection and try again.';
	if (lower.includes('internal server error'))
		return 'Something went wrong on our end. Please try again.';

	// Strip common backend prefixes
	return msg
		.replace(/^Definer:\s*/i, '')
		.replace(/^Error:\s*/i, '')
		.replace(/^GraphQL error:\s*/i, '');
}

// ── Toast mixin (top-right, non-blocking, auto-dismiss) ────────────
const Toast = Swal.mixin({
	toast: true,
	position: 'top-end',
	showConfirmButton: false,
	timerProgressBar: true,
});

// ── Public toast helpers ───────────────────────────────────────────
export const sweetToastSuccess = (msg: string, duration = 2500) =>
	Toast.fire({ icon: 'success', title: msg, timer: duration });

export const sweetToastError = (msg: unknown, duration = 4000) =>
	Toast.fire({ icon: 'error', title: cleanMessage(msg), timer: duration });

// ── Error handling (all errors route through cleanMessage) ─────────
export const sweetErrorHandling = async (err: any) => {
	await Swal.fire({
		icon: 'error',
		title: 'Error',
		text: cleanMessage(err),
		confirmButtonColor: '#e63946',
		timer: 5000,
		timerProgressBar: true,
	});
};

// Alias — admin pages import this variant
export const sweetErrorHandlingForAdmin = sweetErrorHandling;

// Toast-style error (replaces the old center-modal version)
export const sweetMixinErrorAlert = async (err: any, duration = 4000) =>
	Toast.fire({ icon: 'error', title: cleanMessage(err), timer: duration });

export const sweetErrorAlert = sweetMixinErrorAlert;

// ── Success alerts ─────────────────────────────────────────────────
export const sweetMixinSuccessAlert = async (msg: string, duration = 2500) =>
	Toast.fire({ icon: 'success', title: msg, timer: duration });

export const sweetTopSuccessAlert = sweetMixinSuccessAlert;

// Legacy alias — some pages pass duration + enable_forward
export const sweetTopSmallSuccessAlert = async (
	msg: string,
	duration = 2500,
	enable_forward = false,
) => {
	await Toast.fire({ icon: 'success', title: msg, timer: duration });
	if (enable_forward) window.location.reload();
};

// ── Confirm dialog ─────────────────────────────────────────────────
export const sweetConfirmAlert = (msg: string): Promise<boolean> =>
	Swal.fire({
		icon: 'question',
		text: msg,
		showCancelButton: true,
		confirmButtonColor: '#e63946',
		cancelButtonColor: '#9ca3af',
		confirmButtonText: 'Confirm',
		cancelButtonText: 'Cancel',
		reverseButtons: true,
	}).then((r) => r.isConfirmed);

export const sweetLoginConfirmAlert = (msg: string): Promise<boolean> =>
	Swal.fire({
		text: msg,
		showCancelButton: true,
		confirmButtonColor: '#e63946',
		cancelButtonColor: '#9ca3af',
		confirmButtonText: 'Log in',
		cancelButtonText: 'Cancel',
	}).then((r) => r.isConfirmed);

// ── Misc ───────────────────────────────────────────────────────────
export const sweetContactAlert = async (msg: string, duration = 10000) =>
	Swal.fire({ title: msg, showConfirmButton: false, timer: duration });

export const sweetBasicAlert = (text: string) => Swal.fire(text);
