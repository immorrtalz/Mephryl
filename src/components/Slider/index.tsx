import { ChangeEvent } from 'react';
import styles from './Slider.module.scss';

interface Props
{
	min: number;
	max: number;
	step: number;
	value: number;
	disabled?: boolean;
	onInput?: (...args: any[]) => any;
}

export function Slider(props: Props)
{
	const onInput = (e: ChangeEvent<HTMLInputElement>) => props.onInput?.(e);

	return (
		<div className={styles.sliderContainer}>
			<input className={styles.slider} type='range' min={props.min} max={props.max} step={props.step}
				value={props.value} onInput={onInput} disabled={props.disabled}/>
			<div className={styles.thumb} style={{left: `${(props.value - props.min) / (props.max - props.min) * (145 - 5) + 5}px`}}/>
		</div>
	);
}