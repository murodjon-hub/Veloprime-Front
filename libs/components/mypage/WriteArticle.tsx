import { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const WriteArticle: NextPage = () => {
	const router = useRouter();

	useEffect(() => {
		router.replace('/community/write');
	}, []);

	return null;
};

export default WriteArticle;
