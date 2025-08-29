import { Button, ButtonType } from '../Button';
import { SVG } from '../SVGLibrary';
import styles from './ModalWindow.module.scss';

interface Props
{
	open: boolean;
	title: string;
	isOneButton?: boolean;
	cancelTitle?: string;
	okTitle?: string;
	children?: React.ReactNode;
	onCancel?: (...args: any[]) => any;
	onOK?: (...args: any[]) => any;
}

export function ModalWindow(props: Props)
{
	const onCancel = (e: React.MouseEvent<HTMLElement>) => props.onCancel?.();
	const onOK = (e: React.MouseEvent<HTMLElement>) => props.onOK?.();

	return (
		<div className={`${styles.modalWindow} ${props.open ? styles.open : ''}`} onClick={onCancel}>
			<div className={styles.container} onClick={e => e.stopPropagation()}>
				<h1 className='fontSemibold'>{props.title}</h1>
					<div className={styles.childrenContainer}>
						{props.children}
					</div>

				<div className={styles.buttons}>
					{
						props.isOneButton ? <></> :
							<Button
								type={ButtonType.Secondary}
								title={props.cancelTitle ? props.cancelTitle : 'Cancel'}
								svg={<SVG name='cancel'/>}
								onClick={onCancel}/>
					}

					<Button
						title={props.okTitle ? props.okTitle : 'OK'}
						svg={<SVG name='checkmark'/>}
						onClick={onOK}/>
				</div>
			</div>
		</div>
	);
}