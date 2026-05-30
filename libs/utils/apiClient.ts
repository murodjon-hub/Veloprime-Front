import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getJwtToken, logOut } from '../auth';
import { sweetErrorHandlerDefault } from './errorHandler';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3009';

const apiClient: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 30_000,
	withCredentials: true,
});

/* ── Request interceptor — attach auth token ── */
apiClient.interceptors.request.use(
	(config) => {
		const token = getJwtToken();
		if (token && config.headers) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

/* ── Response interceptor — handle global errors ── */
apiClient.interceptors.response.use(
	(response: AxiosResponse) => response,
	(error) => {
		const status: number = error?.response?.status;
		const message: string =
			error?.response?.data?.message ?? error?.message ?? 'Something went wrong.';

		if (status === 401) {
			logOut();
			return Promise.reject(error);
		}
		if (status === 403) {
			sweetErrorHandlerDefault('You do not have permission to perform this action.');
			return Promise.reject(error);
		}
		if (status >= 500) {
			sweetErrorHandlerDefault('Server error — please try again later.');
			return Promise.reject(error);
		}

		return Promise.reject(new Error(message));
	},
);

export default apiClient;

/* ── Typed REST helpers ── */
export const uploadImages = (formData: FormData, onProgress?: (pct: number) => void) =>
	apiClient.post<{ data: { imagesUploader: string[] } }>('/uploads/image', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
		onUploadProgress: (e: ProgressEvent) => {
			if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
		},
	});
