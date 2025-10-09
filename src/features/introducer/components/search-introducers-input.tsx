import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '../../../lib/utils';

interface InputData {
	label?: string;
	placeholder?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
}

interface Props {
	className?: React.HTMLAttributes<HTMLDivElement>['className'];
	fullName: InputData;
	identification: InputData;
	brand: InputData;
	showLabel?: boolean;
	showInputIcon?: boolean;
	disabled?: boolean;
}

const defaultStyles = 'grid md:grid-cols-2 lg:grid-cols-3 gap-3';

export const SearchIntroducersInput = ({
	className = '',
	fullName,
	identification,
	brand,
	showLabel = true,
	showInputIcon = false,
	disabled = false,
}: Props) => {
	return (
		<div className={cn(defaultStyles, className)}>
			{/* brand */}
			<div>
				{showLabel && <Label htmlFor='introducer-brand'>{brand.label ?? 'Buscar por marca'}</Label>}

				<div className='relative'>
					{showInputIcon && <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />}
					<Input
						id='introducer-brand'
						type='text'
						className={`bg-secondary ${showLabel && 'mt-2'} ${showInputIcon && 'pl-10'}`}
						placeholder={brand.placeholder ?? 'Buscar por marca...'}
						defaultValue={brand.defaultValue}
						onChange={e => brand.onChange?.(e.target.value.trim())}
						disabled={disabled}
					/>
				</div>
			</div>

			{/* identification */}
			<div>
				{showLabel && <Label htmlFor='introducer-identification'>{identification.label ?? 'Buscar por Identificación'}</Label>}
				<div className='relative'>
					{showInputIcon && <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />}
					<Input
						id='introducer-identification'
						type='text'
						className={`bg-secondary ${showLabel && 'mt-2'} ${showInputIcon && 'pl-10'}`}
						defaultValue={identification.defaultValue}
						placeholder={identification.placeholder ?? 'Buscar por identificación...'}
						onChange={e => identification.onChange?.(e.target.value.trim())}
						disabled={disabled}
					/>
				</div>
			</div>

			{/* fullname */}
			<div>
				{showLabel && <Label htmlFor='introducer-fullname'>{fullName.label ?? 'Buscar por nombres'}</Label>}

				<div className='relative'>
					{showInputIcon && <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />}
					<Input
						id='introducer-fullname'
						type='text'
						placeholder={fullName.placeholder ?? 'Buscar por nombres...'}
						className={`bg-secondary ${showLabel && 'mt-2'} ${showInputIcon && 'pl-10'}`}
						defaultValue={fullName.defaultValue}
						onChange={e => fullName.onChange?.(e.target.value.trim())}
						disabled={disabled}
					/>
				</div>
			</div>
		</div>
	);
};
