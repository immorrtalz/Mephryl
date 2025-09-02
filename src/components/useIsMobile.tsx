import { isMobile } from 'react-device-detect';
import { useEffect, useState } from 'react';

export function useIsMobile()
{
    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
    const handleWindowSizeChange = () => setScreenWidth(window.innerWidth);

    useEffect(() =>
    {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => window.removeEventListener('resize', handleWindowSizeChange);
    }, []);

    const IsMobile = screenWidth <= 768 || isMobile;
    return IsMobile;
}