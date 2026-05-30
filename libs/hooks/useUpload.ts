import { useState, useCallback, useRef } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { getJwtToken } from '../auth';
import { sweetErrorHandlerDefault } from '../utils/errorHandler';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 10;

export interface UploadedFile {
	url: string;       // path returned by API (relative, e.g. "uploads/abc.jpg")
	fullUrl: string;   // absolute preview URL
	name: string;
}

interface UseUploadReturn {
	upload: (files: FileList | File[]) => Promise<UploadedFile[]>;
	uploading: boolean;
	progress: number;       // 0–100
	cancelUpload: () => void;
	error: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3009';

export function useUpload(endpoint = '/uploads/image'): UseUploadReturn {
	const [uploading, setUploading]   = useState(false);
	const [progress, setProgress]     = useState(0);
	const [error, setError]           = useState<string | null>(null);
	const cancelSourceRef             = useRef<CancelTokenSource | null>(null);

	const upload = useCallback(async (files: FileList | File[]): Promise<UploadedFile[]> => {
		const fileArr = Array.from(files);

		// Validate
		for (const f of fileArr) {
			if (!ALLOWED_TYPES.includes(f.type)) {
				const msg = `${f.name}: only JPEG, PNG and WebP are allowed.`;
				sweetErrorHandlerDefault(msg);
				setError(msg);
				return [];
			}
			if (f.size > MAX_SIZE_MB * 1024 * 1024) {
				const msg = `${f.name}: file must be smaller than ${MAX_SIZE_MB} MB.`;
				sweetErrorHandlerDefault(msg);
				setError(msg);
				return [];
			}
		}

		setError(null);
		setUploading(true);
		setProgress(0);

		const formData = new FormData();
		fileArr.forEach((f) => formData.append('images', f));

		const source = axios.CancelToken.source();
		cancelSourceRef.current = source;

		try {
			const { data } = await axios.post<{ data: { imagesUploader: string[] } }>(
				`${API_URL}${endpoint}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${getJwtToken()}`,
					},
					cancelToken: source.token,
					onUploadProgress: (e: ProgressEvent) => {
						if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
					},
				},
			);

			const paths: string[] = data?.data?.imagesUploader ?? [];
			return paths.map((p) => ({
				url: p,
				fullUrl: `${API_URL}/${p}`,
				name: p.split('/').pop() ?? p,
			}));
		} catch (err: any) {
			if (axios.isCancel(err)) return [];
			const msg = err?.response?.data?.message ?? 'Upload failed.';
			setError(msg);
			sweetErrorHandlerDefault(msg);
			return [];
		} finally {
			setUploading(false);
			cancelSourceRef.current = null;
		}
	}, [endpoint]);

	const cancelUpload = useCallback(() => {
		cancelSourceRef.current?.cancel('Upload cancelled by user.');
		setUploading(false);
		setProgress(0);
	}, []);

	return { upload, uploading, progress, cancelUpload, error };
}
