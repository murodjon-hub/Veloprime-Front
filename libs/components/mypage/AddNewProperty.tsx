import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getImageUrl } from '../../utils';
import { ProductType, ProductAgeCategory, ProductColor, ProductSize } from '../../enums/product/product';
import { ProductInput } from '../../types/product/productInput';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../../apollo/user/mutation';

const AddProduct = ({ initialValues }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const inputRef = useRef<any>(null);
	const [formData, setFormData] = useState<ProductInput>(initialValues);
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	const [createProduct] = useMutation(CREATE_PRODUCT);
	const [updateProduct] = useMutation(UPDATE_PRODUCT);

	const uploadImages = async () => {
		try {
			const formDataUpload = new FormData();
			const selectedFiles = inputRef.current.files;

			if (selectedFiles.length === 0) return;
			if (selectedFiles.length > 5) throw new Error('Cannot upload more than 5 images!');

			formDataUpload.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }`,
					variables: { files: [null, null, null, null, null], target: 'product' },
				}),
			);
			formDataUpload.append(
				'map',
				JSON.stringify({ '0': ['variables.files.0'], '1': ['variables.files.1'], '2': ['variables.files.2'], '3': ['variables.files.3'], '4': ['variables.files.4'] }),
			);
			for (const key in selectedFiles) {
				if (/^\d+$/.test(key)) formDataUpload.append(`${key}`, selectedFiles[key]);
			}

			const response = await axios.post(`${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`, formDataUpload, {
				headers: { 'Content-Type': 'multipart/form-data', 'apollo-require-preflight': true, Authorization: `Bearer ${token}` },
			});

			setFormData({ ...formData, productImages: response.data.data.imagesUploader });
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	};

	const isDisabled = () =>
		!formData.productName ||
		!formData.productPrice ||
		!formData.productType ||
		!formData.productAgeCategory ||
		!formData.productColor ||
		!formData.productSize ||
		formData.productImages.length === 0;

	const saveHandler = useCallback(async () => {
		try {
			if (router.query.productId) {
				await updateProduct({ variables: { input: { ...formData, _id: router.query.productId } } });
				await sweetMixinSuccessAlert('Bike listing updated successfully.');
			} else {
				await createProduct({ variables: { input: formData } });
				await sweetMixinSuccessAlert('Bike listing created successfully.');
			}
			await router.push({ pathname: '/mypage', query: { category: 'myProducts' } });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [formData]);

	if (user?.memberType !== 'MEMBER') {
		router.back();
	}

	if (device === 'mobile') return <div>ADD BIKE LISTING MOBILE</div>;

	return (
		<div id="add-product-page">
			<Stack className="main-title-box">
				<Typography className="main-title">{router.query.productId ? 'Edit' : 'Add'} Bike Listing</Typography>
				<Typography className="sub-title">Fill in the details for your bike</Typography>
			</Stack>

			<div>
				<Stack className="config">
					<Stack className="description-box">
						<Stack className="config-column">
							<Typography className="title">Product Name</Typography>
							<input
								type="text"
								className="description-input"
								placeholder="e.g. Trek Domane SL 6"
								value={formData.productName}
								onChange={({ target: { value } }) => setFormData({ ...formData, productName: value })}
							/>
						</Stack>

						<Stack className="config-row">
							<Stack className="price-year-after-price">
								<Typography className="title">Price ($)</Typography>
								<input
									type="number"
									className="description-input"
									placeholder="Price"
									value={formData.productPrice || ''}
									onChange={({ target: { value } }) => setFormData({ ...formData, productPrice: value === '' ? 0 : parseInt(value, 10) })}
								/>
							</Stack>

							<Stack className="price-year-after-price">
								<Typography className="title">Type</Typography>
								<select
									className="select-description"
									value={formData.productType || ''}
									onChange={({ target: { value } }) => setFormData({ ...formData, productType: value as ProductType })}
								>
									<option value="" disabled>Select type</option>
									{Object.values(ProductType).map((t) => <option key={t} value={t}>{t}</option>)}
								</select>
								<div className="divider" />
								<img src="/img/icons/Vector.svg" className="arrow-down" alt="" />
							</Stack>
						</Stack>

						<Stack className="config-row">
							<Stack className="price-year-after-price">
								<Typography className="title">Size</Typography>
								<select
									className="select-description"
									value={formData.productSize || ''}
									onChange={({ target: { value } }) => setFormData({ ...formData, productSize: value as ProductSize })}
								>
									<option value="" disabled>Select size</option>
									{Object.values(ProductSize).map((s) => <option key={s} value={s}>{s}</option>)}
								</select>
								<div className="divider" />
								<img src="/img/icons/Vector.svg" className="arrow-down" alt="" />
							</Stack>

							<Stack className="price-year-after-price">
								<Typography className="title">Color</Typography>
								<select
									className="select-description"
									value={formData.productColor || ''}
									onChange={({ target: { value } }) => setFormData({ ...formData, productColor: value as ProductColor })}
								>
									<option value="" disabled>Select color</option>
									{Object.values(ProductColor).map((c) => <option key={c} value={c}>{c}</option>)}
								</select>
								<div className="divider" />
								<img src="/img/icons/Vector.svg" className="arrow-down" alt="" />
							</Stack>

							<Stack className="price-year-after-price">
								<Typography className="title">Age Category</Typography>
								<select
									className="select-description"
									value={formData.productAgeCategory || ''}
									onChange={({ target: { value } }) => setFormData({ ...formData, productAgeCategory: value as ProductAgeCategory })}
								>
									<option value="" disabled>Select category</option>
									{Object.values(ProductAgeCategory).map((a) => <option key={a} value={a}>{a}</option>)}
								</select>
								<div className="divider" />
								<img src="/img/icons/Vector.svg" className="arrow-down" alt="" />
							</Stack>
						</Stack>

						<Stack className="config-column">
							<Typography className="title">Description</Typography>
							<textarea
								className="description-text"
								value={formData.productDesc || ''}
								placeholder="Describe your bike..."
								onChange={({ target: { value } }) => setFormData({ ...formData, productDesc: value })}
							/>
						</Stack>
					</Stack>

					<Typography className="upload-title">Upload photos of your bike</Typography>
					<Stack className="images-box">
						<Stack className="upload-box">
							<Stack className="text-box">
								<Typography className="drag-title">Drag and drop images here</Typography>
								<Typography className="format-title">JPEG or PNG, max 5 photos</Typography>
							</Stack>
							<Button className="browse-button" onClick={() => inputRef.current.click()}>
								<Typography className="browse-button-text">Browse Files</Typography>
								<input ref={inputRef} type="file" hidden onChange={uploadImages} multiple accept="image/jpg,image/jpeg,image/png" />
							</Button>
						</Stack>
						<Stack className="gallery-box">
							{formData.productImages.map((img: string) => (
								<Stack key={img} className="image-box">
									<img src={getImageUrl(img, '/img/placeholder-bike.png')} alt="" />
								</Stack>
							))}
						</Stack>
					</Stack>

					<Stack className="buttons-row">
						<Button className="next-button" disabled={isDisabled()} onClick={saveHandler}>
							<Typography className="next-button-text">Save</Typography>
						</Button>
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

AddProduct.defaultProps = {
	initialValues: {
		productName: '',
		productPrice: 0,
		productType: '',
		productAgeCategory: '',
		productColor: '',
		productSize: '',
		productDesc: '',
		productImages: [],
	},
};

export default AddProduct;
