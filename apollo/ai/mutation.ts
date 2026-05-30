import { gql } from '@apollo/client';

export const ASK_AI = gql`
	mutation AskAi($input: AskAiInput!) {
		askAi(input: $input) {
			success
			reply
		}
	}
`;
