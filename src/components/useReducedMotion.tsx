import { useIsMobile } from "./useIsMobile";

export function useReducedMotion()
{
	const isMobile = useIsMobile();
	return isMobile || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;
}