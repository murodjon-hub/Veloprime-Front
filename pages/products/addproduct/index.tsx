import React, { useRef, useState, useCallback, ChangeEvent } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { CREATE_PRODUCT } from '../../../apollo/user/mutation';
import { ProductInput } from '../../../libs/types/product/productInput';
import {
	BrakeType,
	ProductAgeCategory,
	ProductColor,
	ProductCondition,
	ProductSize,
	ProductType,
	SuspensionType,
} from '../../../libs/enums/product/product';
import withLayoutBasic from '../../../libs/components/layout/LayoutBasic';
import { getJwtToken } from '../../../libs/auth';

const STEP_LABELS = ['Category & Type', 'Details & Pricing', 'Photos & Publish'];

const TYPE_CARDS: { value: ProductType; label: string; emoji: string }[] = [
	{ value: ProductType.ROAD,      label: 'Road',      emoji: '🚴' },
	{ value: ProductType.MOUNTAIN,  label: 'Mountain',  emoji: '⛰️' },
	{ value: ProductType.HYBRID,    label: 'Hybrid',    emoji: '🔀' },
	{ value: ProductType.BMX,       label: 'BMX',       emoji: '🛹' },
	{ value: ProductType.E_BIKE,    label: 'E-Bike',    emoji: '⚡' },
	{ value: ProductType.KIDS,      label: 'Kids',      emoji: '🧒' },
	{ value: ProductType.TOURING,   label: 'Touring',   emoji: '🗺️' },
	{ value: ProductType.ACCESSORY, label: 'Accessory', emoji: '🔧' },
];

const CONDITION_CARDS: { value: ProductCondition; label: string; desc: string; color: string }[] = [
	{ value: ProductCondition.NEW,       label: 'New',       desc: 'Never used',         color: '#22c55e' },
	{ value: ProductCondition.LIKE_NEW,  label: 'Like New',  desc: 'Barely used',        color: '#3b82f6' },
	{ value: ProductCondition.GOOD,      label: 'Good',      desc: 'Some wear, works great', color: '#f59e0b' },
	{ value: ProductCondition.FAIR,      label: 'Fair',      desc: 'Visible wear',       color: '#ef4444' },
];

const COLOR_SWATCHES: { value: ProductColor; hex: string }[] = [
	{ value: ProductColor.BLACK,      hex: '#111111' },
	{ value: ProductColor.WHITE,      hex: '#f5f5f5' },
	{ value: ProductColor.RED,        hex: '#e63946' },
	{ value: ProductColor.BLUE,       hex: '#3b82f6' },
	{ value: ProductColor.GREEN,      hex: '#22c55e' },
	{ value: ProductColor.YELLOW,     hex: '#eab308' },
	{ value: ProductColor.ORANGE,     hex: '#f97316' },
	{ value: ProductColor.PURPLE,     hex: '#a855f7' },
	{ value: ProductColor.SILVER,     hex: '#c0c0c0' },
	{ value: ProductColor.GRAY,       hex: '#6b7280' },
	{ value: ProductColor.BROWN,      hex: '#92400e' },
	{ value: ProductColor.PINK,       hex: '#ec4899' },
	{ value: ProductColor.MULTICOLOR, hex: 'linear-gradient(135deg, #e63946, #3b82f6, #22c55e)' },
];

const DEFAULT_PRODUCT: ProductInput = {
	productType: ProductType.ROAD,
	productCondition: ProductCondition.NEW,
	productAgeCategory: ProductAgeCategory.ADULT,
	productColor: ProductColor.BLACK,
	productSize: ProductSize.M,
	productName: '',
	productBrand: '',
	productPrice: 0,
	productImages: [],
	productDesc: '',
	productYear: new Date().getFullYear(),
};

const AddProduct = () => {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dropZoneRef = useRef<HTMLDivElement>(null);
	const token = getJwtToken();

	const [createProduct] = useMutation(CREATE_PRODUCT);
	const [step, setStep] = useState(0);
	const [uploading, setUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [product, setProduct] = useState<ProductInput>(DEFAULT_PRODUCT);
	const [errors, setErrors] = useState<Partial<Record<keyof ProductInput, string>>>({});

	const set = (key: keyof ProductInput, value: any) => {
		setProduct((p) => ({ ...p, [key]: value }));
		if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
	};

	const uploadFiles = useCallback(
		async (files: FileList | File[]) => {
			const fileArr = Array.from(files);
			const remaining = 5 - product.productImages.length;
			if (remaining <= 0) {
				return Swal.fire({ icon: 'warning', title: 'Limit reached', text: 'Maximum 5 images allowed.' });
			}
			const toUpload = fileArr.slice(0, remaining);

			try {
				setUploading(true);
				const formData = new FormData();
				const nullsArray = Array(toUpload.length).fill(null);
				const map: Record<string, string[]> = {};
				toUpload.forEach((_, i) => { map[`${i}`] = [`variables.files.${i}`]; });

				formData.append('operations', JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }`,
					variables: { files: nullsArray, target: 'product' },
				}));
				formData.append('map', JSON.stringify(map));
				toUpload.forEach((file, i) => formData.append(`${i}`, file));

				const response = await axios.post(process.env.NEXT_PUBLIC_API_GRAPHQL_URL!, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						'apollo-require-preflight': true,
						Authorization: `Bearer ${token}`,
					},
				});

				const uploaded: string[] = response.data.data.imagesUploader;
				setProduct((p) => ({ ...p, productImages: [...p.productImages, ...uploaded] }));
			} catch (err: any) {
				Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message || 'Something went wrong.' });
			} finally {
				setUploading(false);
			}
		},
		[product.productImages.length, token],
	);

	const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.length) uploadFiles(e.target.files);
		e.target.value = '';
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
	};

	const removeImage = (index: number) =>
		setProduct((p) => ({ ...p, productImages: p.productImages.filter((_, i) => i !== index) }));

	const validateStep = (): boolean => {
		const errs: typeof errors = {};
		if (step === 1) {
			if (!product.productName.trim()) errs.productName = 'Product name is required.';
			if (!product.productPrice || product.productPrice <= 0) errs.productPrice = 'Price must be greater than 0.';
		}
		if (step === 2) {
			if (product.productImages.length === 0) errs.productImages = 'Please upload at least one image.';
		}
		setErrors(errs);
		return Object.keys(errs).length === 0;
	};

	const nextStep = () => {
		if (validateStep()) setStep((s) => Math.min(s + 1, 2));
	};

	const prevStep = () => setStep((s) => Math.max(s - 1, 0));

	const handleSubmit = async () => {
		if (!validateStep()) return;
		try {
			const confirm = await Swal.fire({
				title: 'List your product?',
				text: `"${product.productName}" will be published to the marketplace.`,
				icon: 'question',
				showCancelButton: true,
				confirmButtonColor: '#A5DC10',
				cancelButtonColor: '#6b7280',
				confirmButtonText: 'Yes, publish it!',
			});
			if (!confirm.isConfirmed) return;

			const input: ProductInput = {
				...product,
				productBrand: product.productBrand || undefined,
				productDesc: product.productDesc || undefined,
			};
			await createProduct({ variables: { input } });

			await Swal.fire({ icon: 'success', title: 'Published!', text: 'Your product is now live.', timer: 2000, showConfirmButton: false });
			router.push('/products');
		} catch (err: any) {
			Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Something went wrong.' });
		}
	};

	return (
		<div className="ap-page">
			<div className="ap-wrapper">

				{/* ── Header ── */}
				<div className="ap-header">
					<h1 className="ap-title">List a Product</h1>
					<p className="ap-subtitle">Fill in the details and publish your bike or accessory to the marketplace.</p>
				</div>

				{/* ── Step Progress ── */}
				<div className="ap-steps">
					{STEP_LABELS.map((label, i) => (
						<div key={i} className={`ap-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
							<div className="ap-step-dot">
								{i < step ? <svg width="12" height="10" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg> : i + 1}
							</div>
							<span>{label}</span>
						</div>
					))}
					<div className="ap-step-line">
						<div className="ap-step-fill" style={{ width: `${(step / 2) * 100}%` }} />
					</div>
				</div>

				{/* ── Form Card ── */}
				<div className="ap-card">

					{/* ════ STEP 0: Category & Type ════ */}
					{step === 0 && (
						<div className="ap-section">
							<h2 className="ap-section-title">What are you listing?</h2>

							<label className="ap-label">Bike / Product Type <span className="req">*</span></label>
							<div className="ap-type-grid">
								{TYPE_CARDS.map((t) => (
									<button
										key={t.value}
										type="button"
										className={`ap-type-card ${product.productType === t.value ? 'selected' : ''}`}
										onClick={() => set('productType', t.value)}
									>
										<span className="ap-type-emoji">{t.emoji}</span>
										<span className="ap-type-label">{t.label}</span>
									</button>
								))}
							</div>

							<label className="ap-label" style={{ marginTop: 28 }}>Condition <span className="req">*</span></label>
							<div className="ap-condition-grid">
								{CONDITION_CARDS.map((c) => (
									<button
										key={c.value}
										type="button"
										className={`ap-condition-card ${product.productCondition === c.value ? 'selected' : ''}`}
										style={{ '--c-color': c.color } as any}
										onClick={() => set('productCondition', c.value)}
									>
										<span className="ap-cond-label">{c.label}</span>
										<span className="ap-cond-desc">{c.desc}</span>
									</button>
								))}
							</div>

							<div className="ap-row" style={{ marginTop: 28 }}>
								<div className="ap-field">
									<label className="ap-label">Age Category <span className="req">*</span></label>
									<div className="ap-pills">
										{Object.values(ProductAgeCategory).map((a) => (
											<button
												key={a}
												type="button"
												className={`ap-pill ${product.productAgeCategory === a ? 'selected' : ''}`}
												onClick={() => set('productAgeCategory', a)}
											>
												{a.charAt(0) + a.slice(1).toLowerCase()}
											</button>
										))}
									</div>
								</div>
								<div className="ap-field">
									<label className="ap-label">Year</label>
									<input
										className="ap-input"
										type="number"
										min={1990}
										max={new Date().getFullYear()}
										value={product.productYear ?? ''}
										onChange={(e) => set('productYear', e.target.value ? parseInt(e.target.value) : undefined)}
										placeholder="e.g. 2022"
									/>
								</div>
							</div>
						</div>
					)}

					{/* ════ STEP 1: Details & Pricing ════ */}
					{step === 1 && (
						<div className="ap-section">
							<h2 className="ap-section-title">Product Details</h2>

							<div className="ap-row">
								<div className="ap-field flex-2">
									<label className="ap-label">Product Name <span className="req">*</span></label>
									<input
										className={`ap-input ${errors.productName ? 'error' : ''}`}
										type="text"
										placeholder="e.g. Trek Domane SL5 Road Bike"
										value={product.productName}
										onChange={(e) => set('productName', e.target.value)}
									/>
									{errors.productName && <span className="ap-error">{errors.productName}</span>}
								</div>
								<div className="ap-field">
									<label className="ap-label">Brand</label>
									<input
										className="ap-input"
										type="text"
										placeholder="e.g. Trek, Giant, Specialized"
										value={product.productBrand ?? ''}
										onChange={(e) => set('productBrand', e.target.value)}
									/>
								</div>
							</div>

							<div className="ap-row">
								<div className="ap-field">
									<label className="ap-label">Price ($) <span className="req">*</span></label>
									<div className="ap-input-prefix">
										<span className="prefix">$</span>
										<input
											className={`ap-input has-prefix ${errors.productPrice ? 'error' : ''}`}
											type="number"
											min={0}
											placeholder="0"
											value={product.productPrice || ''}
											onChange={(e) => set('productPrice', parseFloat(e.target.value) || 0)}
										/>
									</div>
									{errors.productPrice && <span className="ap-error">{errors.productPrice}</span>}
								</div>
								<div className="ap-field">
									<label className="ap-label">Size</label>
									<div className="ap-pills">
										{Object.values(ProductSize).map((s) => (
											<button
												key={s}
												type="button"
												className={`ap-pill ${product.productSize === s ? 'selected' : ''}`}
												onClick={() => set('productSize', s)}
											>
												{s}
											</button>
										))}
									</div>
								</div>
							</div>

							<label className="ap-label" style={{ marginTop: 8 }}>Color</label>
							<div className="ap-color-grid">
								{COLOR_SWATCHES.map(({ value, hex }) => (
									<button
										key={value}
										type="button"
										title={value.charAt(0) + value.slice(1).toLowerCase()}
										className={`ap-swatch ${product.productColor === value ? 'selected' : ''}`}
										style={{ background: hex }}
										onClick={() => set('productColor', value)}
									>
										{product.productColor === value && (
											<svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" stroke={value === ProductColor.WHITE ? '#333' : 'white'} strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
										)}
									</button>
								))}
							</div>

							<div className="ap-divider" />
							<h3 className="ap-sub-title">Technical Specs <span className="optional">(optional)</span></h3>

							<div className="ap-row">
								<div className="ap-field">
									<label className="ap-label">Brake Type</label>
									<select className="ap-select" value={product.productBrakeType ?? ''} onChange={(e) => set('productBrakeType', e.target.value || undefined)}>
										<option value="">— Select —</option>
										{Object.values(BrakeType).map((b) => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
									</select>
								</div>
								<div className="ap-field">
									<label className="ap-label">Suspension</label>
									<select className="ap-select" value={product.productSuspension ?? ''} onChange={(e) => set('productSuspension', e.target.value || undefined)}>
										<option value="">— Select —</option>
										{Object.values(SuspensionType).map((s) => <option key={s} value={s}>{s}</option>)}
									</select>
								</div>
								<div className="ap-field">
									<label className="ap-label">Gears</label>
									<input className="ap-input" type="number" min={1} max={40} placeholder="e.g. 21" value={product.productGearCount ?? ''} onChange={(e) => set('productGearCount', e.target.value ? parseInt(e.target.value) : undefined)} />
								</div>
							</div>

							<div className="ap-row">
								<div className="ap-field">
									<label className="ap-label">Wheel Size (in)</label>
									<input className="ap-input" type="number" step={0.5} placeholder="e.g. 29" value={product.productWheelSize ?? ''} onChange={(e) => set('productWheelSize', e.target.value ? parseFloat(e.target.value) : undefined)} />
								</div>
								<div className="ap-field">
									<label className="ap-label">Frame Size (cm)</label>
									<input className="ap-input" type="number" placeholder="e.g. 54" value={product.productFrameSize ?? ''} onChange={(e) => set('productFrameSize', e.target.value ? parseFloat(e.target.value) : undefined)} />
								</div>
								<div className="ap-field">
									<label className="ap-label">Weight (kg)</label>
									<input className="ap-input" type="number" step={0.1} placeholder="e.g. 8.5" value={product.productWeight ?? ''} onChange={(e) => set('productWeight', e.target.value ? parseFloat(e.target.value) : undefined)} />
								</div>
								<div className="ap-field">
									<label className="ap-label">Mileage (km)</label>
									<input className="ap-input" type="number" placeholder="e.g. 500" value={product.productMileage ?? ''} onChange={(e) => set('productMileage', e.target.value ? parseInt(e.target.value) : undefined)} />
								</div>
							</div>
						</div>
					)}

					{/* ════ STEP 2: Photos & Publish ════ */}
					{step === 2 && (
						<div className="ap-section">
							<h2 className="ap-section-title">Photos & Description</h2>

							<label className="ap-label">
								Product Images <span className="req">*</span>
								<span className="ap-count">{product.productImages.length} / 5</span>
							</label>

							{product.productImages.length < 5 && (
								<div
									ref={dropZoneRef}
									className={`ap-dropzone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
									onClick={() => !uploading && fileInputRef.current?.click()}
									onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }}
									onDragLeave={() => setIsDragging(false)}
									onDrop={handleDrop}
								>
									{uploading ? (
										<>
											<div className="ap-spinner" />
											<span>Uploading images…</span>
										</>
									) : (
										<>
											<div className="ap-upload-icon">
												<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
													<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
												</svg>
											</div>
											<p className="ap-dz-main">Drop photos here or <span className="ap-dz-link">browse</span></p>
											<p className="ap-dz-sub">JPEG or PNG · Max 5 images · Up to 10 MB each</p>
										</>
									)}
									<input ref={fileInputRef} type="file" hidden multiple accept="image/jpg,image/jpeg,image/png" onChange={handleFileInput} />
								</div>
							)}

							{errors.productImages && <span className="ap-error" style={{ display: 'block', marginTop: 6 }}>{errors.productImages}</span>}

							{product.productImages.length > 0 && (
								<div className="ap-img-grid">
									{product.productImages.map((img, i) => (
										<div key={i} className={`ap-img-item ${i === 0 ? 'primary' : ''}`}>
											<img src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`} alt={`Preview ${i + 1}`} />
											{i === 0 && <span className="ap-img-badge">Cover</span>}
											<button className="ap-img-remove" onClick={() => removeImage(i)} title="Remove">
												<svg width="10" height="10" viewBox="0 0 10 10"><line x1="1" y1="1" x2="9" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="1" x2="1" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
											</button>
										</div>
									))}
								</div>
							)}

							<label className="ap-label" style={{ marginTop: 28 }}>Description</label>
							<textarea
								className="ap-textarea"
								rows={5}
								placeholder="Describe the product — condition details, what's included, riding history, upgrades…"
								value={product.productDesc ?? ''}
								onChange={(e) => set('productDesc', e.target.value)}
							/>

							{/* Summary */}
							<div className="ap-summary">
								<h3 className="ap-summary-title">Summary</h3>
								<div className="ap-summary-grid">
									<div><span>Type</span><strong>{product.productType}</strong></div>
									<div><span>Condition</span><strong>{product.productCondition?.replace(/_/g, ' ')}</strong></div>
									<div><span>Name</span><strong>{product.productName || '—'}</strong></div>
									<div><span>Price</span><strong>${product.productPrice || 0}</strong></div>
									<div><span>Color</span><strong>{product.productColor}</strong></div>
									<div><span>Size</span><strong>{product.productSize}</strong></div>
								</div>
							</div>
						</div>
					)}

					{/* ── Navigation ── */}
					<div className="ap-nav">
						<button className="ap-btn-ghost" onClick={step === 0 ? () => router.back() : prevStep}>
							{step === 0 ? 'Cancel' : '← Back'}
						</button>
						<div className="ap-nav-right">
							{step < 2 ? (
								<button className="ap-btn-primary" onClick={nextStep}>
									Continue →
								</button>
							) : (
								<button className="ap-btn-primary ap-btn-publish" onClick={handleSubmit} disabled={uploading}>
									🚀 Publish Listing
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(AddProduct);
