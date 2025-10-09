import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { setRegisterVehicleTimeOut } from '@/features/vehicles/server/db/detail-register-vehicle.service';
import { useQueryClient } from '@tanstack/react-query';
import { DETAIL_REGISTER_VEHICLE_TAG } from '@/features/vehicles/constants';

export const RegisterVehicleTimeOut = ({ id }: { id: number | string }) => {
	const queryClient = useQueryClient();

	const handleRegisterTimeOut = async (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();

		const toastId = toast.loading('Registrando hora de salida...');
		try {
			await setRegisterVehicleTimeOut(id);

			await queryClient.invalidateQueries({ queryKey: [DETAIL_REGISTER_VEHICLE_TAG] });
			toast.success('Hora de salida registrada correctamente');
		} catch (error) {
			toast.error('Error al registrar la hora de salida');
		} finally {
			toast.dismiss(toastId);
		}
	};

	return (
		<div className='flex items-center gap-2'>
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						className='flex items-center justify-center w-6 h-6 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200'
						type='button'
						onClick={handleRegisterTimeOut}
					>
						<Save className='w-3 h-3' />
					</button>
				</TooltipTrigger>
				<TooltipContent side='top' align='center'>
					Registrar hora de salida
				</TooltipContent>
			</Tooltip>
		</div>
	);
};
