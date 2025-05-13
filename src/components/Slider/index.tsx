import { ChangeEvent, useState } from 'react';
import styles from './Slider.module.scss';

interface Props
{
	min: number;
	max: number;
	defaultValue: number;
	step: number;
	disabled?: boolean;
	onInput?: (...args: any[]) => any;
}

export function Slider(props: Props)
{
	const [inputValue, setInputValue] = useState(props.defaultValue);

	function onInput(e: ChangeEvent<HTMLInputElement>)
	{
		setInputValue(Number(e.target.value))
		props.onInput?.(e);
	}

	return (
		<div className={styles.sliderContainer}>
			<input className={styles.slider} type='range' min={props.min} max={props.max} defaultValue={props.defaultValue} step={props.step} onInput={onInput} disabled={props.disabled}/>
			<div className={styles.thumb} style={{left: `${(inputValue - props.min) / (props.max - props.min) * (145 - 5) + 5}px`}}/>
		</div>
	);
}