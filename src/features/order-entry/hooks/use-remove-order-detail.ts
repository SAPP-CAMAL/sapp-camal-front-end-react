import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { removeOrderDetail } from '../server/db/order-entry.service';
import { toast } from 'sonner';

export function useRemoveOrderDetail() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (idAnimalProduct: number) => removeOrderDetail(idAnimalProduct),
		onSuccess: () => {
			toast.success('Producto eliminado exitosamente');
			queryClient.invalidateQueries({ queryKey: ['orders'] });
			queryClient.invalidateQueries({ queryKey: ['order-by-id-and-detail'] });
		},
		onError: async (error: unknown) => {
			if (!(error instanceof HTTPError)) {
				toast.error('Error al eliminar el producto');
				return;
			}

			try {
				const errorData = await error.response.json<{ data?: string; message?: string }>();
				toast.error(errorData?.data || errorData?.message || 'Error al eliminar el producto');
			} catch {
				toast.error('Error al eliminar el producto');
			}
		},
	});
}
