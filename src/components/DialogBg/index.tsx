import styles from './DialogBg.module.scss';
import { motion } from "motion/react";
import { useReducedMotion } from '../useReducedMotion';

export function DialogBg()
{
	const isReducedMotion = useReducedMotion();

	return (
		<motion.div
			className={styles.dialogBg}
			{... !isReducedMotion &&
				{
					initial: { backgroundColor: "rgba(0, 0, 0, 0)", opacity: 0, backdropFilter: "blur(0px)" },
					animate: { backgroundColor: "rgba(0, 0, 0, 0.5)", opacity: 1, backdropFilter: "blur(calc(var(--blur-bg) * 0.5))" },
					exit: { backgroundColor: "rgba(0, 0, 0, 0)", opacity: 0, backdropFilter: "blur(0px)" },
					transition: { duration: 0.2, ease: [0.78, 0, 0.22, 1] }
				}
			}
			style={isReducedMotion ? { backgroundColor: "rgba(0, 0, 0, 0.5)", opacity: 1, backdropFilter: "blur(calc(var(--blur-bg) * 0.5))" } : undefined}>
		</motion.div>
	);
}