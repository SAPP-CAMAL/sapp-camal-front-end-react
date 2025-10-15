import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useReceptionContext } from './use-reception-context';
import { useAllBedType } from '@/features/bed-type/hooks';
import { useAllArrivalConditions } from '@/features/arrival-conditions/hooks';
import { ConditionTransportRequest } from '@/features/condition-transport/domain';
import { saveConditionTransport, updateConditionTransport } from '@/features/condition-transport/server/db/condition-transport.service';
import { useStep2Animals } from './use-step-2-animals';

export type AnimalTransportForm = {
	id?: number | string;
	bedTypeId?: number;
	arrivalConditionId?: number;
	ownMedium?: 'si' | 'no';
	description?: string;
};

const defaultValues: AnimalTransportForm = {};

export const useStep3Transport = () => {
	const { isCompleted } = useStep2Animals();
	const { step3Accordion, animalTransportData, selectedCertificate, handleSetAccordionState, handleResetState } = useReceptionContext();

	const form = useForm<AnimalTransportForm>({ defaultValues });

	useEffect(() => {
		if (animalTransportData) form.reset(animalTransportData);
	}, [animalTransportData]);

	const bedTypeQuery = useAllBedType();
	const arrivalConditionsQuery = useAllArrivalConditions();

	const bedTypes = bedTypeQuery.data.data.filter(bed => bed.status);
	const arrivalConditions = arrivalConditionsQuery.data.data.filter(condition => condition.status);

	const handleSaveTransport = async (data: AnimalTransportForm) => {
		if (!selectedCertificate) return toast.error('No se encontró el certificado seleccionado');

		let { id } = data;

		const request: ConditionTransportRequest = {
			idCertificate: selectedCertificate.id,
			idBedType: data.bedTypeId ?? NaN,
			idConditionsArrival: data.arrivalConditionId ?? NaN,
			ownMedium: data.ownMedium === 'si',
			description: data.description || undefined,
			status: true,
		};

		try {
			if (id) await updateConditionTransport(id.toString(), request);
			else id = (await saveConditionTransport(request)).data.id;

			handleSetAccordionState({ name: 'step3Accordion', accordionState: { isOpen: true, state: 'completed' } });

			form.reset(defaultValues);

			if (!isCompleted) toast.error('Debe completar el paso 2 para finalizar el ingreso.');
			else handleResetState();

			toast.success('Información de transporte guardada');
		} catch (error) {
			toast.error('Error al guardar la información de transporte');
		}
	};

	const handleChangeStep3 = () =>
		handleSetAccordionState({
			name: 'step3Accordion',
			accordionState: { isOpen: !step3Accordion.isOpen, state: step3Accordion.state === 'completed' ? 'completed' : 'enabled' },
		});

	return {
		// data
		form,
		step3Accordion,
		bedTypes,
		arrivalConditions,

		// actions - state
		handleChangeStep3,
		// action to save data
		handleSaveTransport,
	};
};
