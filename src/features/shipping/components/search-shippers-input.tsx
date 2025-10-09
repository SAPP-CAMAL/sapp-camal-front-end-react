import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface InputData {
	label?: string;
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
}

interface Props {
	className?: React.HTMLAttributes<HTMLDivElement>['className'];
	fullName: InputData;
	identification: InputData;
	plate: InputData;
	showLabel?: boolean;
	showInputIcon?: boolean;
}

export const SearchShippersInput = ({ className = '', fullName, identification, plate, showLabel = true, showInputIcon = false }: Props) => {
	return (
		<div className={className}>
			<div>
				{showLabel && <Label htmlFor='Shipper-name'>{fullName.label ?? 'Buscar por nombres'}</Label>}

				<div className='relative'>
					{showInputIcon && <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />}
					<Input
						id='Shipper-name'
						type='text'
						placeholder={fullName.placeholder ?? 'Nombres del chofer...'}
						className={`bg-secondary ${showLabel && 'mt-2'} ${showInputIcon && 'pl-10'}`}
						value={fullName.value}
						onChange={e => fullName.onChange?.(e.target.value)}
					/>
				</div>
			</div>
			<div>
				{showLabel && <Label htmlFor='Shipper-identification'>{identification.label ?? 'Buscar por Identificación'}</Label>}
				<div className='relative'>
					{showInputIcon && <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />}
					<Input
						id='Shipper-identification'
						type='text'
						className={`bg-secondary ${showLabel && 'mt-2'} ${showInputIcon && 'pl-10'}`}
						value={identification.value}
						placeholder={identification.placeholder ?? 'Cédula o RUC...'}
						onChange={e => identification.onChange?.(e.target.value)}
					/>
				</div>
			</div>
			<div>
				{showLabel && <Label htmlFor='Shipper-plate'>{plate.label ?? 'Buscar por placa'}</Label>}

				<div className='relative'>
					{showInputIcon && <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />}
					<Input
						id='Shipper-plate'
						type='text'
						className={`bg-secondary ${showLabel && 'mt-2'} ${showInputIcon && 'pl-10'}`}
						placeholder={plate.placeholder ?? 'Placa del vehículo...'}
						value={plate.value}
						onChange={e => plate.onChange?.(e.target.value)}
					/>
				</div>
			</div>
		</div>
	);
};
