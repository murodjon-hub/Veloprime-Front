import { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const Article: NextPage = () => {
	const router = useRouter();
	useEffect(() => {
		router.replace('/community/write');
	}, []);
	return null;
};

export default Article;
