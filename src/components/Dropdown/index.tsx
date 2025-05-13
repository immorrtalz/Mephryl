import { useEffect, useState } from 'react';
import styles from './Dropdown.module.scss';
import { ArrowDownSVG } from '../SVGLibrary';

class DropdownOption
{
	title: string;
	value: string;

	constructor(title: string, value: string)
	{
		this.title = title;
		this.value = value;
	}
}

interface Props
{
	options: DropdownOption[];
	disabled?: boolean;
	onClick?: (...args: any[]) => any;
	onOptionClick?: (...args: any[]) => any;
}

export function Dropdown(props: Props)
{
	if (props.options.length == 0) return (<></>);

	const [currentOptionIndex, setCurrentOptionIndex] = useState(0);

	function onClick(e: React.MouseEvent<HTMLElement>)
	{
		(e.target as HTMLElement).classList.toggle(styles.open);
		props.onClick?.();
	};

	function onOptionClick(e: React.MouseEvent<HTMLElement>)
	{
		const target = e.target as HTMLElement;

		target.parentElement!.children[currentOptionIndex].classList.remove(styles.current);
		target.classList.add(styles.current);
		setCurrentOptionIndex(Array.from(target.parentElement!.children).indexOf(target));
		target.parentElement!.parentElement!.classList.remove(styles.open);
	};

	useEffect(() => { if (props.onOptionClick) props.onOptionClick(props.options[currentOptionIndex].value); }, [currentOptionIndex]);

	return (
		<div className={`${styles.dropdown} fontMedium`} onClick={onClick}>
			<p>{props.options[currentOptionIndex].title}</p>
			<ArrowDownSVG/>
			<div className={styles.options}>
				{props.options.map((option, index) => <div key={index} className={`${styles.option} ${index == currentOptionIndex ? styles.current : ''} fontRegular`} onClick={onOptionClick}>{option.title}</div>)}
			</div>
		</div>
	);
}