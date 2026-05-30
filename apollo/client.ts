import { useMemo } from 'react';
import {
	ApolloClient,
	ApolloLink,
	InMemoryCache,
	NormalizedCacheObject,
	from,
	split,
} from '@apollo/client';
import { RetryLink } from '@apollo/client/link/retry';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { sweetErrorHandlerDefault } from '../libs/utils/errorHandler';
import { socketVar } from './store';

/* ─────────────────────────────────────────────
   Singleton
───────────────────────────────────────────── */
let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

/* ─────────────────────────────────────────────
   Token helpers — read from localStorage only
   (no import from libs/auth to avoid circular deps)
───────────────────────────────────────────── */
function getToken(): string {
	if (typeof window === 'undefined') return '';
	return localStorage.getItem('accessToken') ?? '';
}

function authHeaders(): Record<string, string> {
	const token = getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ─────────────────────────────────────────────
   1. Auth link
───────────────────────────────────────────── */
const authLink = new ApolloLink((operation, forward) => {
	operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
		headers: { ...headers, ...authHeaders() },
	}));
	return forward(operation);
});

/* ─────────────────────────────────────────────
   2. Retry link (queries only, not mutations)
───────────────────────────────────────────── */
const retryLink = new RetryLink({
	delay: { initial: 500, max: 3000, jitter: true },
	attempts: {
		max: 3,
		retryIf: (error, operation) => {
			const isMutation = operation.query.definitions.some(
				(def: any) => def.kind === 'OperationDefinition' && def.operation === 'mutation',
			);
			return !!error && !isMutation;
		},
	},
});

/* ─────────────────────────────────────────────
   3. Error link
───────────────────────────────────────────── */
const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors) {
		for (const { message } of graphQLErrors) {
			if (message.includes('not authenticated') || message.includes('NOT_AUTHENTICATED')) {
				// Token expired — clear storage and soft-redirect to login
				if (typeof window !== 'undefined') {
					localStorage.removeItem('accessToken');
					window.dispatchEvent(new Event('veloprime:session-expired'));
				}
				return;
			}
			if (!message.toLowerCase().includes('input')) {
				sweetErrorHandlerDefault(message);
			}
		}
	}

	if (networkError) {
		console.error('[Network error]', networkError);
		const status = (networkError as any).statusCode;
		if (status >= 500) sweetErrorHandlerDefault('Server error — please try again shortly.');
	}
});

/* ─────────────────────────────────────────────
   4. Upload / HTTP link
───────────────────────────────────────────── */
const uploadLink = createUploadLink({
	uri: process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://localhost:3009/graphql',
	credentials: 'include',
}) as unknown as ApolloLink;

/* ─────────────────────────────────────────────
   5. WebSocket link with keep-alive
───────────────────────────────────────────── */
class ManagedSocket {
	private ws: WebSocket;
	private heartbeat: ReturnType<typeof setInterval> | null = null;

	constructor(url: string) {
		const token = getToken();
		this.ws = new WebSocket(token ? `${url}?token=${token}` : url);
		socketVar(this.ws);

		this.ws.onopen = () => {
			console.info('[WS] connected');
			this.heartbeat = setInterval(() => {
				if (this.ws.readyState === WebSocket.OPEN) {
					this.ws.send(JSON.stringify({ event: 'ping' }));
				}
			}, 25_000);
		};

		this.ws.onclose = () => {
			if (this.heartbeat) clearInterval(this.heartbeat);
			console.info('[WS] disconnected');
		};

		this.ws.onerror = (e) => console.error('[WS] error', e);
	}

	send(data: string | Blob | ArrayBuffer) {
		if (this.ws.readyState === WebSocket.OPEN) this.ws.send(data);
	}

	close() {
		this.ws.close();
	}
}

function makeWsLink(): WebSocketLink {
	return new WebSocketLink({
		uri: process.env.NEXT_PUBLIC_API_WS ?? 'ws://localhost:3009',
		options: {
			reconnect: true,
			reconnectionAttempts: 5,
			timeout: 30_000,
			connectionParams: () => ({ headers: authHeaders() }),
		},
		webSocketImpl: ManagedSocket,
	});
}

/* ─────────────────────────────────────────────
   6. Split link
───────────────────────────────────────────── */
function makeSplitLink(): ApolloLink {
	const wsLink = makeWsLink();
	const httpChain = authLink.concat(uploadLink);

	return split(
		({ query }) => {
			const def = getMainDefinition(query);
			return def.kind === 'OperationDefinition' && def.operation === 'subscription';
		},
		wsLink,
		httpChain,
	);
}

/* ─────────────────────────────────────────────
   7. Cache with merge policies
───────────────────────────────────────────── */
const cache = new InMemoryCache({
	typePolicies: {
		Query: {
			fields: {
				getProducts: {
					keyArgs: ['input', ['search', 'sort', 'direction']],
					merge(existing, incoming, { args }) {
						const merged = existing ? [...existing.list] : [];
						const page: number = args?.input?.page ?? 1;
						const limit: number = args?.input?.limit ?? 10;
						const offset = (page - 1) * limit;
						for (let i = 0; i < (incoming.list?.length ?? 0); i++) {
							merged[offset + i] = incoming.list[i];
						}
						return { ...incoming, list: merged };
					},
					read: (existing) => existing,
				},
			},
		},
		Product: { keyFields: ['_id'] },
		Member:  { keyFields: ['_id'] },
		Review:  { keyFields: ['_id'] },
		Event:   { keyFields: ['_id'] },
	},
});

/* ─────────────────────────────────────────────
   8. Factory
───────────────────────────────────────────── */
function createApolloClient(): ApolloClient<NormalizedCacheObject> {
	const isServer = typeof window === 'undefined';

	const link = isServer
		? from([authLink, uploadLink])
		: from([errorLink, retryLink, makeSplitLink()]);

	return new ApolloClient({
		ssrMode: isServer,
		link,
		cache,
		defaultOptions: {
			watchQuery: { fetchPolicy: 'cache-and-network', errorPolicy: 'all' },
			query:      { fetchPolicy: 'network-only',      errorPolicy: 'all' },
			mutate:     { errorPolicy: 'all' },
		},
		connectToDevTools: process.env.NODE_ENV !== 'production',
	});
}

/* ─────────────────────────────────────────────
   9. Public API
───────────────────────────────────────────── */
export function initializeApollo(
	initialState: NormalizedCacheObject | null = null,
): ApolloClient<NormalizedCacheObject> {
	const client = apolloClient ?? createApolloClient();

	if (initialState) {
		client.cache.restore({ ...client.extract(), ...initialState });
	}

	if (typeof window === 'undefined') return client;
	if (!apolloClient) apolloClient = client;
	return apolloClient;
}

export function useApollo(initialState: NormalizedCacheObject | null) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}

/** Call on logout to purge all cached data */
export function resetApolloStore(): void {
	apolloClient?.clearStore();
}
