import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';
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
		onError: async (error: unknown) => {
			if (!(error instanceof HTTPError)) {
				toast.error('Error al guardar la orden');
				return;
			}

			try {
				const errorData = await error.response.json<{ data?: string; message?: string }>();
				toast.error(errorData?.data || errorData?.message || 'Error al guardar la orden');
			} catch {
				toast.error('Error al guardar la orden');
			}
		},
	});
}
