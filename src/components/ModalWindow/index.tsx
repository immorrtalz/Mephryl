import { Button, ButtonType } from '../Button';
import { SVG } from '../SVGLibrary';
import styles from './ModalWindow.module.scss';
import { motion } from "motion/react";
import { useReducedMotion } from '../useReducedMotion';
import { DialogBg } from '../DialogBg';

interface Props
{
	title: string;
	buttons?: 0 | 1 | 2;
	cancelTitle?: string;
	okTitle?: string;
	cancelSvg?: string;
	okSvg?: string;
	children?: React.ReactNode;
	onCancel?: (...args: any[]) => any;
	onOK?: (...args: any[]) => any | null;
}

export function ModalWindow(props: Props)
{
	const isReducedMotion = useReducedMotion();
	const onCancel = (_e: React.MouseEvent<HTMLElement>) => props.onCancel?.();
	const onOK = (_e: React.MouseEvent<HTMLElement>) => props.onOK?.();

	return (
		<>
			<DialogBg/>

			<motion.div
				className={styles.modalWindow}
				onClick={onCancel}
				{... !isReducedMotion &&
					{
						initial: { opacity: 0, pointerEvents: "none", visibility: "hidden" },
						animate: { opacity: 1, pointerEvents: "all", visibility: "visible" },
						exit: { opacity: 0, pointerEvents: "none", visibility: "hidden" },
						transition: { duration: 0.2, ease: [0.78, 0, 0.22, 1] }
					}
				}
				style={isReducedMotion ? { opacity: 1, pointerEvents: "all", visibility: "visible" } : undefined}>

				<motion.div
						className={styles.container}
						onClick={e => e.stopPropagation()}
						{... !isReducedMotion &&
							{
								initial: { pointerEvents: "none", height: 50, opacity: 0 },
								animate: { pointerEvents: "all", height: "fit-content", opacity: 1 },
								exit: { pointerEvents: "none", height: 50, opacity: 0 },
								transition: { duration: 0.2, ease: [0.78, 0, 0.22, 1] }
							}
						}
						style={isReducedMotion ? { pointerEvents: "all", height: "fit-content", opacity: 1 } : undefined}>

					<h1 className='fontSemibold'>{props.title}</h1>
						<div className={styles.childrenContainer} style={props.buttons === 0 ? { marginBottom: 0 } : {}}>
							{props.children}
						</div>

					{
						props.buttons !== 0 && <div className={styles.buttons}>
							{
								props.buttons === 1 ?
									(props.okTitle ?
										<Button
											title={props.okTitle ?? 'OK'}
											svg={<SVG name={props.okSvg ?? 'checkmark'}/>}
											onClick={onOK}
											disabled={props.onOK === undefined}/> :
										<Button
											type={ButtonType.Secondary}
											title={props.cancelTitle ?? 'Cancel'}
											svg={<SVG name={props.cancelSvg ?? 'cancel'}/>}
											onClick={onCancel}/>) :
								<>
									<Button
										type={ButtonType.Secondary}
										title={props.cancelTitle ?? 'Cancel'}
										svg={<SVG name={props.cancelSvg ?? 'cancel'}/>}
										onClick={onCancel}/>

									<Button
										title={props.okTitle ?? 'OK'}
										svg={<SVG name={props.okSvg ?? 'checkmark'}/>}
										onClick={onOK}
										disabled={props.onOK === undefined}/>
								</>
							}
						</div>
					}

				</motion.div>
			</motion.div>
		</>
	);
}