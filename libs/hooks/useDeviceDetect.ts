import { useEffect, useState } from 'react';

const useDeviceDetect = (): 'mobile' | 'desktop' => {
	const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');

	useEffect(() => {
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		setDevice(isMobile ? 'mobile' : 'desktop');
	}, []);

	return device;
};

export default useDeviceDetect;
