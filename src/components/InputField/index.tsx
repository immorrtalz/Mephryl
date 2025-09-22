import { ChangeEvent } from 'react';
import styles from './InputField.module.scss';

interface Props
{
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	onChange?: (...args: any[]) => any;
}

export function InputField(props: Props)
{
	const onChange = (e: ChangeEvent<HTMLInputElement>) => props.onChange?.(e);
	return <input name="input-field" type="text" className={styles.inputField} onChange={onChange} placeholder={props.placeholder} value={props.value} disabled={props.disabled}/>;
}