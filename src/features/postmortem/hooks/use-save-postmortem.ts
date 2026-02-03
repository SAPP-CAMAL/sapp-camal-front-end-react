'use client';

import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { savePostmortemService, updatePostmortemService } from '../server/db/postmortem.service';
import type { SavePostmortemRequest } from '../domain/save-postmortem.types';

export function useSavePostmortem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: SavePostmortemRequest) => savePostmortemService(request),
		onSuccess: () => {
			// Invalidar queries para recargar datos
			queryClient.invalidateQueries({ queryKey: ['postmortem-by-brand'] });
			queryClient.invalidateQueries({ queryKey: ['postmortem-by-filters'] });
			queryClient.invalidateQueries({ queryKey: ['animals-by-brand'] });
		},
		onError: async (error: any) => {
			try {
				const errorBody = await error.response.json();

				if (errorBody?.message) toast.error(errorBody.message);
				else toast.error('Error al crear el registro de postmortem');
			} catch (error) {
				toast.error('Error al crear el registro de postmortem');
			}
		},
	});
}

export function useUpdatePostmortem() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, request }: { id: number; request: Omit<SavePostmortemRequest, 'idDetailsSpeciesCertificate'> }) =>
			updatePostmortemService(id, request),
		onSuccess: () => {
			// Invalidar queries para recargar datos
			queryClient.invalidateQueries({ queryKey: ['postmortem-by-brand'] });
			queryClient.invalidateQueries({ queryKey: ['postmortem-by-filters'] });
			queryClient.invalidateQueries({ queryKey: ['animals-by-brand'] });
		},
		onError: async (error: any) => {
			try {
				const errorBody = await error.response.json();

				if (errorBody?.message) toast.error(errorBody.message);
				else toast.error('Error al actualizar el registro de postmortem');
			} catch (error) {
				toast.error('Error al actualizar el registro de postmortem');
			}
		},
	});
}
