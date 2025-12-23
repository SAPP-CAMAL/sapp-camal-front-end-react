import { toast } from 'sonner';
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
	commentary?: string;
};

const defaultValues: AnimalTransportForm = {
	ownMedium: 'si',
};

export const useStep3Transport = () => {
	const { isCompleted } = useStep2Animals();
	const { step3Accordion, animalTransportData, selectedCertificate, handleSetAccordionState, handleResetState } = useReceptionContext();

	const form = useForm<AnimalTransportForm>({ 
		defaultValues,
		values: animalTransportData ? { ...defaultValues, ...animalTransportData } : defaultValues,
	});

	// El useEffect ya no es necesario porque usamos 'values' en useForm
	// que se actualiza automáticamente cuando cambia animalTransportData

	const bedTypeQuery = useAllBedType();
	const arrivalConditionsQuery = useAllArrivalConditions();

	const bedTypes = bedTypeQuery.data.data.filter(bed => bed.status);
	const arrivalConditions = arrivalConditionsQuery.data.data.filter(condition => condition.status);

	const handleSaveTransport = async (data: AnimalTransportForm) => {
		if (!selectedCertificate) {
			toast.error('No se encontró el certificado seleccionado');
			return;
		}

		if (!isCompleted) {
			toast.error('Debe completar el paso 2 (registro de animales) antes de finalizar.');
			return;
		}

		let { id } = data;

		const request: ConditionTransportRequest = {
			idCertificate: selectedCertificate.id,
			idBedType: data.bedTypeId ?? NaN,
			idConditionsArrival: data.arrivalConditionId ?? NaN,
			ownMedium: data.ownMedium === 'si',
			commentary: data.commentary || undefined,
			status: true,
		};

		try {
			if (id) await updateConditionTransport(id.toString(), request);
			else id = (await saveConditionTransport(request)).data.id;

			handleSetAccordionState({ name: 'step3Accordion', accordionState: { isOpen: false, state: 'completed' } });

			form.reset(defaultValues);

			toast.success('¡Ingreso de animales completado exitosamente!');
			
			// Resetear el estado después de un breve delay para que el usuario vea el mensaje de éxito
			setTimeout(() => {
				handleResetState();
			}, 1500);
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
