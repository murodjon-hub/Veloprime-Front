import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { Messages } from '../../config';
import { getImageUrl } from '../../utils';
import { getJwtToken, setJwtToken, updateUserInfo } from '../../auth';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';

interface MyProfileProps {
	initialValues?: MemberUpdate;
}

const MyProfile = ({ initialValues }: MyProfileProps) => {
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(
		initialValues ?? { _id: '', memberImage: '', memberNick: '', memberPhone: '', memberAddress: '' },
	);

	const [updateMember] = useMutation(UPDATE_MEMBER);

	useEffect(() => {
		const rawImage = (() => {
			const img = user.memberImage ?? '';
			if (!img || img.startsWith('/img/')) return '';
			if (img.startsWith('http')) return img.replace(/^https?:\/\/[^/]+\//, '');
			return img.replace(/^\//, '');
		})();
		setUpdateData((prev) => ({
			...prev,
			memberNick:     user.memberNick     ?? '',
			memberPhone:    user.memberPhone    ?? '',
			memberAddress:  user.memberAddress  ?? '',
			memberImage:    rawImage,
		}));
	}, [user]);

	const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const image = e.target.files?.[0];
			if (!image) return;

			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) { imageUploader(file: $file, target: $target) }`,
					variables: { file: null, target: 'member' },
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', image);

			const response = await axios.post(
				process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://127.0.0.1:3009/graphql',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data',
						'apollo-require-preflight': true,
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const responseImage = response.data.data.imageUploader;
			setUpdateData((prev) => ({ ...prev, memberImage: responseImage }));
		} catch (err) {
			sweetErrorHandling(err).then();
		}
	};

	const updateProfileHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			const result = await updateMember({ variables: { input: { ...updateData, _id: user._id } } });
			const jwtToken = result.data?.updateMember?.accessToken;
			if (jwtToken) { setJwtToken(jwtToken); updateUserInfo(jwtToken); }
			await sweetMixinSuccessAlert('Profile updated successfully.');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData, user._id]);

	const isDisabled =
		!updateData.memberNick?.trim() ||
		!updateData.memberPhone?.trim() ||
		!updateData.memberAddress?.trim();

	return (
		<Box component="div" id="my-profile-page">
			{/* Page header */}
			<Box component="div" className="mpp-header">
				<Typography className="mpp-header__title">Profile Settings</Typography>
				<Typography className="mpp-header__sub">Manage your public cyclist profile</Typography>
			</Box>

			{/* Avatar card */}
			<Box component="div" className="mpp-card">
				<Typography className="mpp-card__title">Profile Photo</Typography>
				<Box component="div" className="mpp-card__body">
					<Box component="div" className="mpp-avatar-row">
						<Box component="div" className="mpp-avatar-preview">
							<img
								src={getImageUrl(updateData.memberImage, '/img/profile/defaultUser.svg')}
								alt="profile"
							/>
						</Box>
						<Box component="div" className="mpp-avatar-upload">
							<input
								type="file"
								hidden
								id="profile-img-input"
								onChange={uploadImage}
								accept="image/jpg,image/jpeg,image/png"
							/>
							<label htmlFor="profile-img-input" className="mpp-avatar-upload__label">
								<PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
								Upload Photo
							</label>
							<Typography className="mpp-avatar-upload__hint">
								JPG, JPEG or PNG · Max 5 MB
							</Typography>
						</Box>
					</Box>
				</Box>
			</Box>

			{/* Info card */}
			<Box component="div" className="mpp-card">
				<Typography className="mpp-card__title">Personal Info</Typography>
				<Box component="div" className="mpp-card__body">
					<Box component="div" className="mpp-fields">
						<Box component="div" className="mpp-field">
							<Typography className="mpp-field__label">Username</Typography>
							<input
								className="mpp-field__input"
								type="text"
								placeholder="Your username"
								value={updateData.memberNick ?? ''}
								onChange={(e) => setUpdateData((p) => ({ ...p, memberNick: e.target.value }))}
							/>
						</Box>
						<Box component="div" className="mpp-field">
							<Typography className="mpp-field__label">Phone</Typography>
							<input
								className="mpp-field__input"
								type="text"
								placeholder="Your phone number"
								value={updateData.memberPhone ?? ''}
								onChange={(e) => setUpdateData((p) => ({ ...p, memberPhone: e.target.value }))}
							/>
						</Box>
					</Box>

					<Box component="div" className="mpp-fields mpp-fields--full">
						<Box component="div" className="mpp-field">
							<Typography className="mpp-field__label">Location</Typography>
							<input
								className="mpp-field__input"
								type="text"
								placeholder="Your city or region"
								value={updateData.memberAddress ?? ''}
								onChange={(e) => setUpdateData((p) => ({ ...p, memberAddress: e.target.value }))}
							/>
						</Box>
					</Box>

					<Button
						className="mpp-save-btn"
						onClick={updateProfileHandler}
						disabled={isDisabled}
					>
						Save Changes
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
	},
};

export default MyProfile;
