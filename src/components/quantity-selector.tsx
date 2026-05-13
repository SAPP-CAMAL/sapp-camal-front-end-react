'use client';

import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';

interface Props {
	quantity: number;
	className?: string;
	titleClassName?: string;
	subtitleClassName?: string;
	title: string;
	subtitle?: string;

	onQuantityChanged: (quantity: number) => void;
}

const defaultBtnStyle =
	'size-8 inline-flex justify-center items-center rounded-md border-2 border-emerald-600 bg-white text-emerald-700 shadow-sm hover:bg-emerald-50 focus:outline-hidden focus:bg-emerald-50 disabled:opacity-50 disabled:pointer-events-none';

export const QuantitySelector = ({ quantity, onQuantityChanged, className = '', title, subtitle = '', subtitleClassName, titleClassName }: Props) => {
	const handleQuantity = (value: number) => {
		if (value === 0) return onQuantityChanged(0);

		const newValue = quantity + value;

		if (newValue < 0) return;

		onQuantityChanged(newValue);
	};

	return (
		<div className={cn('py-2 px-2 bg-white border border-gray-200 rounded-lg min-w-0', className)} data-hs-input-number=''>
			<div className='flex justify-between items-center gap-x-2 min-w-0'>
				<div className='flex-1 min-w-0 pr-1'>
					<span className={cn('block font-semibold text-xs sm:text-sm truncate', titleClassName)}>{title}</span>
					<span className={cn('block text-[11px] sm:text-xs truncate', subtitleClassName)}>{subtitle}</span>
				</div>
				<div className='flex items-center gap-x-1.5 shrink-0'>
					<button type='button' className={defaultBtnStyle} aria-label='Decrease' onClick={() => handleQuantity(-1)}>
						<span className='text-xl font-extrabold leading-none'>−</span>
					</button>
					<input
						className='p-0 w-9 sm:w-12 bg-transparent border-0 text-gray-800 text-center text-sm sm:text-base font-semibold focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
						type='number'
						aria-roledescription='Number field'
						value={quantity}
						onChange={e => {
							const value = +e.target.value;
							if (isNaN(value) || value < 0) return;
							if (value === 0) return onQuantityChanged(0);
							onQuantityChanged(value);
						}}
					/>
					<button type='button' className={defaultBtnStyle} aria-label='Increase' onClick={() => handleQuantity(1)}>
						<span className='text-xl font-extrabold leading-none'>+</span>
					</button>
				</div>
			</div>
		</div>
	);
};
