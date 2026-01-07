import { useState } from 'react';
import { toast } from 'sonner';
import { Introducer } from '../domain';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, SquarePenIcon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { updateIntroducerStatus } from '@/features/introducer/server/db/introducer.service';

type updateIntroductorProps = {
	introductor: Introducer;
	onRefresh: () => void;
	introducerRolId?: number;
};
type UpdateIntroductorForm = {
	name: string;
	description: string;
	identification: string;
	email: string;
	status: string;
};
export function UpdateIntroductor({ introductor, onRefresh, introducerRolId }: updateIntroductorProps) {
	const [open, setOpen] = useState(false);
	const [isActive, setIsActive] = useState(introductor?.status);
	const form = useForm<UpdateIntroductorForm>();

	const handleToggleStatus = () => {
		setIsActive(!isActive);
	};

	const onSubmit = form.handleSubmit(async data => {
		try {
			// await updateUserService(introductor.userId, {
			// 	email: data.email,
			// 	status: data.status === 'true' ? true : false,
			// 	roles: [
			// 		{
			// 			id: introducerRolId,
			// 			status: data.status === 'true' ? true : false,
			// 		},
			// 	],
			// });

			await updateIntroducerStatus(introductor.id, isActive);

			form.reset(form.formState.defaultValues);
			toast.success('Introductor actualizado exitosamente');
			onRefresh();
			setOpen(false);
		} catch (error: any) {
			console.error("Error al actualizar introductor:", error);
			if (error.response) {
				try {
					const { data } = await error.response.json();
					toast.error(data || 'Error al actualizar introductor');
				} catch {
					toast.error('Error al actualizar introductor');
				}
			} else {
				toast.error('Error de conexión. Por favor, intente nuevamente.');
			}
		}
	});
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button variant='outline'>
							<SquarePenIcon />
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent side='top' align='center' sideOffset={5} avoidCollisions>
					Editar Introductor
				</TooltipContent>
			</Tooltip>

			<DialogContent className='w-[95vw] md:max-w-4xl max-h-[95vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Editar Introductor</DialogTitle>
					<DialogDescription>Actualiza la información del introductor seleccionado.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem className='col-span-1'>
									<label className='font-semibold'>Nombres Completos *</label>
									<FormControl>
										<Input
											type='text'
											placeholder='Buscar por nombre'
											defaultValue={introductor.fullName}
											disabled
											className='w-full border border-gray-300 rounded-md shadow-sm'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='identification'
							render={({ field }) => (
								<FormItem className='col-span-1'>
									<label className='font-semibold'>Número de Identificación *</label>
									<FormControl>
										<Input
											type='text'
											disabled
											placeholder='Número de Identificación'
											defaultValue={introductor.identification}
											className='w-full border border-gray-300 rounded-md shadow-sm'
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='email'
							disabled
							render={({ field }) => (
								<FormItem className='col-span-2'>
									<label className='font-semibold text-sm'>Email del Usuario *</label>
									<FormControl>
										<Input
											type='email'
											placeholder='usuario@correo.com'
											defaultValue={introductor.email}
											className='w-full border border-gray-300 rounded-md shadow-sm'
											disabled
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='col-span-2'>
							<label className='font-semibold text-sm'>Roles del sistema</label>
							<div className='rounded-xl px-3 py-2 bg-muted border mt-2'>
								<p className='flex items-center gap-2 text-sm text-muted-foreground truncate'>
									<span className='flex items-center justify-center w-4 h-4 rounded-sm bg-primary text-primary-foreground'>
										<Check className='w-3 h-3' />
									</span>
									Introductor
								</p>
							</div>
						</div>

						<div className='col-span-2'>
							<label className='font-semibold text-sm'>Estado del Usuario</label>
							<div className='rounded-xl px-3 py-2 bg-muted border mt-2'>
								<button
									type='button'
									onClick={handleToggleStatus}
									className='flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors w-full justify-between'
								>
									<span className={isActive ? 'font-bold' : 'text-gray-400'}>{isActive ? 'Activo' : 'Inactivo'}</span>
									{isActive ? <ToggleRightIcon className='w-8 h-8 text-primary' /> : <ToggleLeftIcon className='w-8 h-8 text-gray-500' />}
								</button>
							</div>
						</div>

						<div className='col-span-2 flex justify-end gap-2 pt-4'>
							<Button type='button' variant='outline' disabled={form.formState.isSubmitting} onClick={() => setOpen(false)}>
								Cancelar
							</Button>
							<Button type='submit' disabled={form.formState.isSubmitting || form.formState.isLoading}>
								{form.formState.isSubmitting ? 'Actualizando...' : 'Actualizar Introductor'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
