import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveOrder, SaveOrderRequest } from '../server/db/order-entry.service';
import { toast } from 'sonner';

export function useSaveOrder() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: SaveOrderRequest) => saveOrder(data),
		onSuccess: () => {
			toast.success('Orden guardada exitosamente');
			queryClient.invalidateQueries({ queryKey: ['orders'] });
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Error al guardar la orden');
		},
	});
}
