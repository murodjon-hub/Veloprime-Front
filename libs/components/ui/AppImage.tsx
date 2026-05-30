import React, { useState } from 'react';
import { getImageUrl, FALLBACK_IMAGE } from '../../utils';

interface AppImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
	src?: string | null;
	alt: string;
	fallback?: string;
}

const AppImage = ({ src, alt, fallback = FALLBACK_IMAGE, ...rest }: AppImageProps) => {
	const [errored, setErrored] = useState(false);

	return (
		<img
			{...rest}
			src={errored ? fallback : getImageUrl(src, fallback)}
			alt={alt}
			onError={() => setErrored(true)}
		/>
	);
};

export default AppImage;
