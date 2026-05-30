import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

const useDeviceDetect = (): 'mobile' | 'desktop' => {
	const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');

	useEffect(() => {
		const check = () =>
			setDevice(window.innerWidth <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop');

		check();
		window.addEventListener('resize', check, { passive: true });
		return () => window.removeEventListener('resize', check);
	}, []);

	return device;
};

export default useDeviceDetect;
