import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack, Typography } from '@mui/material';
export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);

	const viewChangeHandler = (state: boolean) => setLoginView(state);

	const checkUserTypeHandler = (e: any) => {
		const checked = e.target.checked;
		handleInput('type', checked ? e.target.name : 'USER');
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	}, []);

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	}

	return (
		<Stack className="join-page">
			{/* Background overlay */}
			<Box component="div" className="join-bg-overlay" />

			<Stack className="join-container">
				{/* Left: Image Side */}
				<Box component="div" className="join-left">
					<Box component="div" className="join-left-content">
						<img src="/img/rachel-martin-YZEGtY07jG0-unsplash.jpg" alt="" />
						<Typography className="join-brand">VELOPRIME</Typography>
						<Typography className="join-tagline">
							Ride beyond limits. <br /> Built for champions.
						</Typography>
					</Box>
				</Box>

				{/* Right: Form Side */}
				<Box component="div" className="join-right">
					<Box component="div" className="join-form-box">
						{/* Tabs */}
						<Box component="div" className="join-tabs">
							<button className={`join-tab ${loginView ? 'active' : ''}`} onClick={() => viewChangeHandler(true)}>
								Login
							</button>
							<button className={`join-tab ${!loginView ? 'active' : ''}`} onClick={() => viewChangeHandler(false)}>
								Sign Up
							</button>
						</Box>

						{/* Title */}
						<Box component="div" className="join-title-box">
							<Typography className="join-title">{loginView ? 'Welcome Back 👋' : 'Create Account 🚴'}</Typography>
							<Typography className="join-subtitle">
								{loginView ? 'Login to your Veloprime account' : 'Join thousands of riders today'}
							</Typography>
						</Box>

						{/* Inputs */}
						<Box component="div" className="join-inputs">
							<Box component="div" className="join-input-box">
								<span>Nickname</span>
								<input
									type="text"
									placeholder="Enter nickname"
									onChange={(e) => handleInput('nick', e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') loginView ? doLogin() : doSignUp();
									}}
								/>
							</Box>

							<Box component="div" className="join-input-box">
								<span>Password</span>
								<input
									type="password"
									placeholder="Enter password"
									onChange={(e) => handleInput('password', e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') loginView ? doLogin() : doSignUp();
									}}
								/>
							</Box>

							{!loginView && (
								<Box component="div" className="join-input-box">
									<span>Phone</span>
									<input
										type="text"
										placeholder="Enter phone number"
										onChange={(e) => handleInput('phone', e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') doSignUp();
										}}
									/>
								</Box>
							)}
						</Box>

						{/* Options */}
						<Box component="div" className="join-options">
							{loginView ? (
								<Box component="div" className="join-remember">
									<FormGroup>
										<FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Remember me" />
									</FormGroup>
									<a className="join-forgot">Forgot password?</a>
								</Box>
							) : (
								<Box component="div" className="join-type">
									<span>Register as:</span>
									<Box component="div" className="join-type-options">
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														name="USER"
														onChange={checkUserTypeHandler}
														checked={input.type === 'USER'}
													/>
												}
												label="User"
											/>
										</FormGroup>
										<FormGroup>
											<FormControlLabel
												control={
													<Checkbox
														size="small"
														name="MEMBER"
														onChange={checkUserTypeHandler}
														checked={input.type === 'MEMBER'}
													/>
												}
												label="Member"
											/>
										</FormGroup>
									</Box>
								</Box>
							)}
						</Box>

						{/* Submit Button */}
						{loginView ? (
							<Button
								className="join-submit-btn"
								variant="contained"
								disabled={input.nick === '' || input.password === ''}
								onClick={doLogin}
							>
								LOGIN
							</Button>
						) : (
							<Button
								className="join-submit-btn"
								variant="contained"
								disabled={input.nick === '' || input.password === '' || input.phone === '' || input.type === ''}
								onClick={doSignUp}
							>
								SIGN UP
							</Button>
						)}

						{/* Switch */}
						<Box component="div" className="join-switch">
							{loginView ? (
								<p>
									Not registered yet? <b onClick={() => viewChangeHandler(false)}>SIGN UP</b>
								</p>
							) : (
								<p>
									Already have an account? <b onClick={() => viewChangeHandler(true)}>LOGIN</b>
								</p>
							)}
						</Box>
					</Box>
				</Box>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(Join);
