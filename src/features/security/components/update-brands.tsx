'use client';

import { Button } from '@/components/ui/button';
import { Introducer, Specie } from '../domain';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save, Tag } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import { Input } from '@/components/ui/input';
import { createBrandService, updateBrandService } from '../server/db/security.queries';
import { BrandCreating } from './introductor-form-fields';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type UpdateBrandsForm = {
	name: string;
	description: string;
};

const defaultValues: UpdateBrandsForm = {
	name: '',
	description: '',
};

type NewIntroductorProps = {
	species: Specie[];
	introductor: Introducer;
	onRefresh: () => void;
};

export function UpdateBrands({ species, introductor, onRefresh }: NewIntroductorProps) {
	const form = useForm<UpdateBrandsForm>();
	const [open, setOpen] = useState(false);
	const [selectedSpecies, setSelectedSpecies] = useState<Record<number, Specie[]>>(() =>
		introductor.brands.reduce((acc, brand) => {
			acc[brand.id] = brand.species.map((s: any) => {
				if (typeof s === 'string') {
					// Buscar la especie completa en la lista de especies
					const foundSpecie = species.find(specie => specie.name === s);
					return foundSpecie || { id: 0, name: s };
				}
				return s;
			});
			return acc;
		}, {} as Record<number, Specie[]>)
	);
	const [newBrandSpecies, setNewBrandSpecies] = useState<Specie[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [brandNames, setBrandNames] = useState<Record<number, string>>(() =>
		introductor.brands.reduce((acc, brand) => {
			acc[brand.id] = brand.name;
			return acc;
		}, {} as Record<number, string>)
	);

	useEffect(() => {
		if (open) {
			(async () => {
				form.reset({
					...defaultValues,
				});
			})();
		}
	}, [open, form]);

	function handleCheckboxChange(brandId: number, specie: Specie, checked: boolean) {
		setSelectedSpecies(prev => {
			const current = prev[brandId] || [];
			return {
				...prev,
				[brandId]: checked ? [...current, specie] : current.filter(s => s.id !== specie.id),
			};
		});
	}

	function handleBrandNameChange(brandId: number, newName: string) {
		setBrandNames(prev => ({
			...prev,
			[brandId]: newName,
		}));
	}

	function handleNewBrandCheckboxChange(specie: Specie, checked: boolean) {
		setNewBrandSpecies(prev => (checked ? [...prev, specie] : prev.filter(s => s.id !== specie.id)));
	}

	const handleSaveBrands = async () => {
		const description = form.getValues('description');
		if (!description || description.trim() === '') {
			return toast.warning('El nombre de la marca es requerido');
		}

		if (newBrandSpecies.length === 0) {
			return toast.warning('Debe seleccionar al menos una especie');
		}

		setIsSubmitting(true);

		try {
			const brand = await createBrandService({
				introducerId: introductor.id,
				description: description.trim(),
				name: description.trim(),
				speciesIds: newBrandSpecies.map(specie => specie.id),
			});

			toast.success('Marca creada exitosamente');
			form.reset({ description: '' });
			setNewBrandSpecies([]);
		} catch (error) {
			toast.error('Error al crear la Marca');
		} finally {
			setIsSubmitting(false);
		}
	};
	const handleSaveBrand = async (brandId: number) => {
		const brandName = brandNames[brandId];
		const brandSpecies = selectedSpecies[brandId] || [];

		if (!brandName || brandName.trim() === '') {
			return toast.warning('El nombre de la marca es requerido');
		}

		if (brandSpecies.length === 0) {
			return toast.warning('Debe seleccionar al menos una especie para la marca');
		}

		setIsSubmitting(true);

		try {
			const updatedBrand = await updateBrandService(brandId, {
				description: brandName.trim(),
				name: brandName.trim(),
				species: brandSpecies.map(specie => ({
					id: specie.id,
					status: true,
				})),
			});

			toast.success(`Marca "${brandName}" actualizada exitosamente`);
		} catch (error) {
			toast.error('Error al actualizar la marca');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCloseModal = () => {
		setBrandNames({});
		setOpen(false);
		onRefresh();
	};
	return (
		<Dialog
			open={open}
			onOpenChange={isOpen => {
				setOpen(isOpen);
				if (!isOpen) {
					setBrandNames({});
					onRefresh();
				}
			}}
		>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button variant={'outline'}>
							<Tag />
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent side='top' align='center' sideOffset={5} avoidCollisions>
					Editar Marcas
				</TooltipContent>
			</Tooltip>

			<DialogContent className='min-w-5xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>{`${'Gestionar Marcas'} - ${introductor.fullName} `}</DialogTitle>
					<DialogDescription>Edita las marcas existentes y agrega nuevas marcas para este introductor.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form className='space-y-8'>
						<div className='space-y-4'>
							<label className='font-semibold'>Marcas Existentes:</label>
							{introductor.brands?.length > 0 ? (
								<div className='space-y-4'>
									{introductor.brands.map(brand => (
										<Card key={brand.id} className='w-full'>
											<CardHeader>
												<CardTitle className='flex gap-2 items-center justify-between'>
													Nombre de la Marca
													<Button
														type='button'
														size='sm'
														className='flex items-center gap-2'
														onClick={() => handleSaveBrand(brand.id)}
														disabled={isSubmitting}
													>
														<Save size={16} />
														Guardar
													</Button>
												</CardTitle>
											</CardHeader>
											<CardContent className='space-y-4'>
												<Input
													type='text'
													value={brandNames.hasOwnProperty(brand.id) ? brandNames[brand.id] : brand.name}
													className='w-full border border-gray-300 rounded-md shadow-sm bg-gray-100'
													onChange={e => handleBrandNameChange(brand.id, e.target.value)}
												/>

												<div>
													<label className='font-semibold block mb-2'>Especies *</label>
													<div className='flex flex-wrap gap-4'>
														{species.map(specie => (
															<Label key={specie.id} className='flex items-center gap-x-2 cursor-pointer'>
																<Checkbox
																	checked={selectedSpecies[brand.id]?.some(s => s.id === specie.id)}
																	onCheckedChange={(checked: boolean) => handleCheckboxChange(brand.id, specie, checked)}
																/>
																{specie.name}
															</Label>
														))}
													</div>
												</div>

												{selectedSpecies[brand.id] && selectedSpecies[brand.id].length > 0 && (
													<div className='p-3 bg-gray-50 rounded-lg border'>
														<span className='font-bold'>{brandNames[brand.id] || brand.name}:</span>
														<span className='ml-2'>[{selectedSpecies[brand.id].map(s => s.name?.toUpperCase()).join(', ')}]</span>
													</div>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<p className='text-gray-500'>No hay marcas registradas</p>
							)}
						</div>

						<Card className='w-full'>
							<CardHeader>
								<CardTitle className='flex gap-2 items-center'>
									<Plus />
									Nueva Marca
								</CardTitle>
								<CardDescription>Ingresa el nombre de la marca y selecciona las especies</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<label className='font-semibold block mb-2'>Nombre de la Marca *</label>
									<Input
										type='text'
										placeholder='Ej: Finca San José, Marca ABC, etc.'
										className='w-full border border-gray-300 rounded-md shadow-sm bg-gray-100'
										value={form.watch('description') ?? ''}
										onChange={e => {
											form.setValue('description', e.target.value, {
												shouldValidate: true,
											});
										}}
									/>
								</div>

								<div>
									<label className='font-semibold block mb-2'>Especies *</label>
									<div className='flex flex-wrap gap-4'>
										{species.map(specie => (
											<Label key={specie.id} className='flex items-center gap-x-2 cursor-pointer'>
												<Checkbox
													checked={newBrandSpecies.some(s => s.id === specie.id)}
													onCheckedChange={(checked: boolean) => {
														handleNewBrandCheckboxChange(specie, checked);
													}}
												/>
												{specie.name}
											</Label>
										))}
									</div>
								</div>

								{newBrandSpecies.length > 0 && (
									<div className='p-3 bg-gray-50 rounded-lg border'>
										<span className='font-bold'>Nueva marca:</span>
										<span className='ml-2'>[{newBrandSpecies.map(s => s.name?.toUpperCase()).join(', ')}]</span>
									</div>
								)}

								<Button type='button' className='w-full mt-4' onClick={() => handleSaveBrands()} disabled={isSubmitting}>
									{isSubmitting ? (
										'Guardando...'
									) : (
										<>
											<Save size={16} className='mr-2' />
											Guardar Marca
										</>
									)}
								</Button>
							</CardContent>
						</Card>

						<div className='flex justify-end gap-x-2'>
							<Button type='button' variant={'outline'} disabled={form.formState.isSubmitting} onClick={() => handleCloseModal()}>
								Cerrar
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
