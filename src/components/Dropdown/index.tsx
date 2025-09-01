import { useEffect, useRef, useState } from 'react';
import styles from './Dropdown.module.scss';
import { SVG } from '../SVGLibrary';

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
	const dropdownBGRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	function onClick(_e: React.MouseEvent<HTMLElement> | null = null)
	{
		if (dropdownBGRef.current) dropdownBGRef.current.classList.toggle('displayNone');
		if (dropdownRef.current) dropdownRef.current.classList.toggle(styles.open);
		props.onClick?.();
	};

	function onOptionClick(e: React.MouseEvent<HTMLElement>)
	{
		e.stopPropagation();
		const target = e.target as HTMLElement;

		target.parentElement!.children[currentOptionIndex].classList.remove(styles.current);
		target.classList.add(styles.current);
		setCurrentOptionIndex(Array.from(target.parentElement!.children).indexOf(target));
		onClick();
	};

	useEffect(() => { if (props.onOptionClick) props.onOptionClick(props.options[currentOptionIndex].value); }, [currentOptionIndex]);

	return (
		<>
			<span ref={dropdownBGRef} className='displayNone' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'all', zIndex: 10 }} onClick={onClick}/>
			<div ref={dropdownRef} className={`${styles.dropdown} fontMedium`} onClick={onClick}>
				<p>{props.options[currentOptionIndex].title}</p>
				<SVG name='arrowDown'/>
				<div className={styles.options} onClick={e => e.stopPropagation()}>
					{props.options.map((option, index) => <div key={index} className={`${styles.option} ${index == currentOptionIndex ? styles.current : ''} fontRegular`} onClick={onOptionClick}>{option.title}</div>)}
				</div>
			</div>
		</>
	);
}