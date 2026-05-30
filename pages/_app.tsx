import type { AppProps } from 'next/app';
import React, { useEffect } from 'react';
import { AiLauncher } from '../libs/components/ai/AiLauncher';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ApolloProvider } from '@apollo/client';
import { useReactiveVar } from '@apollo/client';
import { appWithTranslation } from 'next-i18next';
import { light } from '../scss/MaterialTheme';
import { useApollo } from '../apollo/client';
import { rehydrateAuth, initMultiTabSync } from '../libs/auth';
import { userVar } from '../apollo/store';
import { openSocket } from '../libs/hooks/useSocket';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	const theme  = createTheme(light);
	const client = useApollo(pageProps.initialApolloState ?? null);
	const user   = useReactiveVar(userVar);

	useEffect(() => {
		rehydrateAuth();
		const stopSync = initMultiTabSync();
		return stopSync;
	}, []);

	// Open WebSocket whenever the user becomes authenticated
	useEffect(() => {
		if (user?._id) openSocket();
	}, [user?._id]);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
				<AiLauncher />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
