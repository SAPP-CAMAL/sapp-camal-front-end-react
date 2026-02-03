import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCatalogue } from '@/features/catalogues/hooks/use-catalogue';
import { PersonData } from '../hooks/use-operator';

interface PersonFormWrapperProps {
	personData: Partial<PersonData>;
	onPersonChange: (updates: Partial<PersonData>) => void;
	isUpdateVisitorLog?: boolean;
}

export const PersonFormWrapper: React.FC<PersonFormWrapperProps> = ({ personData, onPersonChange, isUpdateVisitorLog = false }) => {
	const catalogueIdentityTypes = useCatalogue('TID');
	const catalogueGenders = useCatalogue('GEN');

	const handleInputChange = (field: keyof PersonData, value: string | number) => {
		onPersonChange({ [field]: value });
	};

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
			{/* Tipo de Identificación */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium'>
					Tipo de identificación <span className='text-red-500'>*</span>
				</Label>
				<Select value={personData.identificationType?.toString() || ''} onValueChange={value => handleInputChange('identificationType', value)}>
					<SelectTrigger className='w-full'>
						<SelectValue placeholder='Seleccionar tipo' />
					</SelectTrigger>
					<SelectContent>
						{catalogueIdentityTypes.data?.data?.map((item: any) => (
							<SelectItem key={item.catalogueId} value={item.catalogueId.toString()}>
								{item.description}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Identificación */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium'>
					Identificación <span className='text-red-500'>*</span>
				</Label>
				<Input
					type='text'
					placeholder='Ingrese identificación'
					value={personData.identification || ''}
					onChange={e => handleInputChange('identification', e.target.value)}
					className='w-full'
				/>
			</div>

			{/* Nombres */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium'>
					Nombres <span className='text-red-500'>*</span>
				</Label>
				<Input
					type='text'
					placeholder='Ingrese nombres'
					value={personData.firstName || ''}
					onChange={e => handleInputChange('firstName', e.target.value)}
					className='w-full'
				/>
			</div>

			{/* Apellidos */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium'>
					Apellidos <span className='text-red-500'>*</span>
				</Label>
				<Input
					type='text'
					placeholder='Ingrese apellidos'
					value={personData.lastName || ''}
					onChange={e => handleInputChange('lastName', e.target.value)}
					className='w-full'
				/>
			</div>

			{/* Género */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium'>
					Género <span className='text-red-500'>*</span>
				</Label>
				<Select value={personData.genderId?.toString() || ''} onValueChange={value => handleInputChange('genderId', Number(value))}>
					<SelectTrigger className='w-full'>
						<SelectValue placeholder='Seleccionar género' />
					</SelectTrigger>
					<SelectContent>
						{catalogueGenders.data?.data?.map((item: any) => (
							<SelectItem key={item.catalogueId} value={item.catalogueId.toString()}>
								{item.description}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Número de celular */}
			<div className='space-y-2'>
				<Label className='text-sm font-medium'>
					Número de celular <span className='text-red-500'>*</span>
				</Label>
				<Input
					type='tel'
					placeholder='Ingrese número de celular'
					value={personData.mobileNumber || ''}
					onChange={e => handleInputChange('mobileNumber', e.target.value)}
					className='w-full'
				/>
			</div>

			{/* Dirección */}
			<div className='space-y-2 md:col-span-2'>
				<Label className='text-sm font-medium'>Dirección</Label>
				<Textarea
					placeholder='Ingrese dirección'
					value={personData.address || ''}
					onChange={e => handleInputChange('address', e.target.value)}
					className='w-full'
					rows={3}
				/>
			</div>
		</div>
	);
};
