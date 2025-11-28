import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderDetails, type UpdateOrderDetailsRequest } from '../server/db/order-entry.service';

export const useUpdateOrderDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: number; data: UpdateOrderDetailsRequest }) => 
            updateOrderDetails(orderId, data),
        onSuccess: () => {
            // Invalidar queries relacionadas para refrescar los datos
            queryClient.invalidateQueries({ queryKey: ['order-by-id-and-detail'] });
        },
    });
};
