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
	'size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none';

export const QuantitySelector = ({ quantity, onQuantityChanged, className = '', title, subtitle = '', subtitleClassName, titleClassName }: Props) => {
	const handleQuantity = (value: number) => {
		if (value === 0) return onQuantityChanged(0);

		const newValue = quantity + value;

		if (newValue < 0) return;

		onQuantityChanged(newValue);
	};

	return (
		<div className={cn('py-2 px-3 bg-white border border-gray-200 rounded-lg min-w-0', className)} data-hs-input-number=''>
			<div className='flex justify-between items-center gap-x-3 min-w-0'>
				<div className='flex-shrink-0 min-w-0'>
					<span className={cn('block font-medium text-sm truncate', titleClassName)}>{title}</span>
					<span className={cn('block text-xs truncate', subtitleClassName)}>{subtitle}</span>
				</div>
				<div className='flex items-center gap-x-1.5'>
					<button type='button' className={defaultBtnStyle} aria-label='Decrease' onClick={() => handleQuantity(-1)}>
						<Minus className='w-3 h-3' />
					</button>
					<input
						className='p-0 w-10 md:w-14 bg-transparent border-0 text-gray-800 text-center focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
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
						<Plus className='w-3 h-3' />
					</button>
				</div>
			</div>
		</div>
	);
};
