/**
 * This route is no longer used for AI responses.
 * The chat widget calls the NestJS GraphQL mutation `askAi` directly via Apollo Client.
 * Gemini API key lives only in the NestJS backend environment.
 */
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
	res.status(410).json({ message: 'Deprecated — use the askAi GraphQL mutation instead.' });
}
