import { useMutation, useQueryClient } from '@tanstack/react-query';
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
		onError: async (error: any) => {
			try {
				const errorData = await error?.response?.json();
				toast.error(errorData?.data || errorData?.message || 'Error al eliminar el producto');
			} catch {
				toast.error('Error al eliminar el producto');
			}
		},
	});
}
