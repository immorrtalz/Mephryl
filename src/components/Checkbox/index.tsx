import { ChangeEvent } from 'react';
import styles from './Checkbox.module.scss';
import { SVG } from '../SVGLibrary';

interface Props
{
	checked: boolean;
	disabled?: boolean;
	onChange?: (...args: any[]) => any;
}

export function Checkbox(props: Props)
{
	const onChange = (e: ChangeEvent<HTMLInputElement>) => props.onChange?.(e);
	return (
		<div className={`${styles.checkbox} ${props.disabled ? styles.disabled : ''}`}>
			<input type="checkbox" checked={props.checked} onChange={onChange} disabled={props.disabled}/>
			{ props.checked && <SVG name='checkmark'/> }
		</div>
	);
}