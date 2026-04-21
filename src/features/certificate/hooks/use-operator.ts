import { useCatalogue } from '@/features/catalogues/hooks/use-catalogue';
import {
	createPersonService,
	getPeopleByFilterService,
	personValidateDocument,
	validateDocumentTypeService,
} from '@/features/people/server/db/people.service';
import { toCapitalize } from '@/lib/toCapitalize';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

export interface PersonData {
	id: number;
	fullName?: string;
	identification?: string;
	identificationType?: {
		id?: number;
		name: string;
		code: string;
		description: string;
	};
	identificationTypeId?: number;
	firstName?: string;
	lastName?: string;
	genderId?: number;
	mobileNumber?: string;
	address?: string;
	status?: boolean;
	authorizedTo?: string;
}

export interface UseOperatorProps {
	initialPerson?: PersonData | null;
	onPersonChange?: (person: PersonData | null) => void;
	onPersonCreate?: (person: PersonData) => void;
	onPersonSelect?: (person: PersonData) => void;
	onPersonRemove?: () => void;
	enableAutoComplete?: boolean;
	resetKey?: string;
}

export const useOperator = ({
	initialPerson = null,
	onPersonChange,
	onPersonCreate,
	onPersonSelect,
	onPersonRemove,
	enableAutoComplete = true,
	resetKey,
}: UseOperatorProps = {}) => {
	// Estados de búsqueda
	const [activeSearchField, setActiveSearchField] = useState<'name' | 'identification' | null>(null);
	const [searchName, setSearchName] = useState('');
	const [searchIdentification, setSearchIdentification] = useState('');
	const [nameInput, setNameInput] = useState('');
	const [idInput, setIdInput] = useState('');

	// Estados de persona
	const [selectedPerson, setSelectedPerson] = useState<PersonData | null>(initialPerson);
	const [isCreatingPerson, setIsCreatingPerson] = useState(false);
	const [isSubmittingPerson, setIsSubmittingPerson] = useState(false);

	// Reset operator state when resetKey changes (e.g., when scanning a new QR)
	useEffect(() => {
		if (resetKey) {
			setSelectedPerson(null);
			setIsCreatingPerson(false);
			// También limpiar campos de búsqueda
			setSearchName('');
			setSearchIdentification('');
			setNameInput('');
			setIdInput('');
			setActiveSearchField(null);
		}
	}, [resetKey]);

	// Effect to update selected person when initialPerson changes
	useEffect(() => {

		if (initialPerson?.id !== selectedPerson?.id &&
			!isSubmittingPerson &&
			!isCreatingPerson &&
			!(selectedPerson && !initialPerson)) {
			setSelectedPerson(initialPerson);
		}
	}, [initialPerson?.id, selectedPerson?.id, isSubmittingPerson, isCreatingPerson]);

	// Estado de los campos del formulario
	const [personForm, setPersonForm] = useState<Partial<PersonData>>({
		identification: '',
		identificationType: undefined,
		firstName: '',
		lastName: '',
		genderId: undefined,
		mobileNumber: '',
		address: '',
		status: true,
		authorizedTo: '',
	});

	// Callbacks debounced
	const debouncedName = useDebouncedCallback((value: string) => {
		setSearchName(value);
	}, 500);

	const debouncedIdentification = useDebouncedCallback((value: string) => {
		setSearchIdentification(value);
	}, 500);

	// Query para búsqueda de personas
	const peopleData = useQuery({
		queryKey: ['people-search-certificate', searchName, searchIdentification, activeSearchField],
		queryFn: () =>
			getPeopleByFilterService({
				page: 1,
				limit: 10,
				status: true,
				fullName: activeSearchField === 'name' && searchName.length > 0 ? searchName : '',
				identificacion: activeSearchField === 'identification' && searchIdentification.length > 0 ? searchIdentification : '',
			}),
		enabled: (activeSearchField === 'name' && searchName.length > 0) || (activeSearchField === 'identification' && searchIdentification.length > 0),
	});

	// Catálogo de tipos de identificación
	const catalogueIdentityTypes = useCatalogue('TID');

	// Auto-completado de datos de persona por cédula
	useEffect(() => {
		if (!enableAutoComplete) return;

		const fetchPersonDetails = async () => {
			const id = personForm.identification?.trim();
			if (!id || id.length !== 10) return;

			// Wait for catalogue to be ready
			if (!catalogueIdentityTypes.isSuccess) return;

			const identificationTypeCode = catalogueIdentityTypes.data.data.find(
				(data: any) => data.catalogueId === Number(personForm.identificationType),
			)?.code;

			if (identificationTypeCode !== 'CED') return;

			try {
				const validateResponse = await validateDocumentTypeService(identificationTypeCode, id);
				if (!validateResponse.data.isValid) return;

				const response = await personValidateDocument(id);
				const personData = response.data;

				if (personData.firstName || personData.lastName) {
					updatePersonForm({
						firstName: personData.firstName ? toCapitalize(personData.firstName, true) : personForm.firstName,
						lastName: personData.lastName ? toCapitalize(personData.lastName, true) : personForm.lastName,
					});
				}
			} catch (error) {
				console.error('Error fetching person details:', error);
			}
		};

		fetchPersonDetails();
	}, [personForm.identification, personForm.identificationType, catalogueIdentityTypes.isSuccess, enableAutoComplete]);

	// Efecto para notificar cambios de persona seleccionada
	useEffect(() => {
		onPersonChange?.(selectedPerson);
	}, [selectedPerson, onPersonChange]);

	// Función para actualizar el formulario de persona
	const updatePersonForm = useCallback((updates: Partial<PersonData>) => {
		setPersonForm(prev => ({ ...prev, ...updates }));
	}, []);

	// Función para limpiar los formularios
	const clearForms = useCallback(() => {
		setPersonForm({
			identification: '',
			identificationType: undefined,
			firstName: '',
			lastName: '',
			genderId: undefined,
			mobileNumber: '',
			address: '',
			status: true,
			authorizedTo: '',
		});
		setSearchName('');
		setSearchIdentification('');
		setNameInput('');
		setIdInput('');
		setActiveSearchField(null);
	}, []);

	const handleSelectPerson = useCallback(
		(person: any) => {
			const formattedPerson: PersonData = {
				id: person.id,
				fullName: person.fullName,
				identification: person.identification,
				identificationType: person.identificationType?.description || '',
				identificationTypeId: person.identificationTypeId,
				firstName: person.firstName || '',
				lastName: person.lastName || '',
				genderId: person.genderId?.toString() || '',
				mobileNumber: person.mobileNumber || '',
				address: person.address || '',
				status: person.status ?? true,
				authorizedTo: person.fullName || '',
			};

			setSelectedPerson(formattedPerson);
			setIsCreatingPerson(false);
			clearForms();
			onPersonSelect?.(formattedPerson);
		},
		[clearForms, onPersonSelect],
	);

	const handleRemovePerson = useCallback(() => {
		setSelectedPerson(null);
		setIsCreatingPerson(false);
		clearForms();
		onPersonRemove?.();
	}, [clearForms, onPersonRemove]);

	const handleCreatePerson = useCallback(async () => {
		// Validaciones básicas
		if (!personForm.identificationType || !personForm.identification || !personForm.firstName || !personForm.lastName || !personForm.genderId) {
			toast.error('Todos los campos obligatorios deben ser completados');
			return;
		}

		setIsSubmittingPerson(true);
		try {
			const response = await createPersonService({
				code: '',
				identification: personForm.identification!,
				identificationTypeId: Number(personForm.identificationType),
				genderId: Number(personForm.genderId),
				mobileNumber: personForm.mobileNumber || '',
				firstName: personForm.firstName!,
				lastName: personForm.lastName!,
				fullName: `${personForm.firstName} ${personForm.lastName}`,
				address: personForm.address || '',
				affiliationDate: new Date(),
				status: personForm.status ?? true,
			});

			toast.success('Persona creada exitosamente');

			const createdPerson: PersonData = {
				...response.data,
				identificationType: catalogueIdentityTypes.data?.data.find(
					(data: any) => data.catalogueId === response.data.identificationTypeId,
				),
				genderId: personForm.genderId!,
				status: response.data.status ?? true,
				authorizedTo: response.data.fullName,
			};

			console.log('🔧 Persona creada:', createdPerson);
			console.log('🔧 Antes de setSelectedPerson - isCreatingPerson:', isCreatingPerson);

			setSelectedPerson(createdPerson);
			setIsCreatingPerson(false);

			console.log('🔧 Después de setSelectedPerson');

			onPersonCreate?.(createdPerson);
		} catch (error: any) {
			console.error('Error al crear persona:', error);
			toast.error('Error al crear la persona');
		} finally {
			setIsSubmittingPerson(false);
		}
	}, [personForm, catalogueIdentityTypes.data, clearForms, onPersonCreate]);

	// Funciones para manejo de búsqueda
	const handleNameSearch = useCallback(
		(value: string) => {
			setNameInput(value);
			setIdInput('');
			debouncedName(value);
			setActiveSearchField('name');
			setSearchIdentification('');
		},
		[debouncedName],
	);

	const handleIdentificationSearch = useCallback(
		(value: string) => {
			setIdInput(value);
			setNameInput('');
			debouncedIdentification(value);
			setActiveSearchField('identification');
			setSearchName('');
		},
		[debouncedIdentification],
	);

	// Función para alternar entre crear y buscar
	const toggleCreateMode = useCallback(() => {
		setIsCreatingPerson(prev => !prev);
		if (isCreatingPerson) {
			clearForms();
		}
	}, [isCreatingPerson, clearForms]);

	// Función para reset completo
	const resetOperator = useCallback(() => {
		handleRemovePerson();
	}, [handleRemovePerson]);

	return {
		// Estados
		selectedPerson,
		isCreatingPerson,
		isSubmittingPerson,
		personForm,
		nameInput,
		idInput,
		activeSearchField,
		searchName,
		searchIdentification,

		// Datos de búsqueda
		peopleData,
		catalogueIdentityTypes,

		// Funciones de manejo
		updatePersonForm,
		handleSelectPerson,
		handleRemovePerson,
		handleCreatePerson,
		handleNameSearch,
		handleIdentificationSearch,
		toggleCreateMode,
		resetOperator,
		clearForms,

		// Estados calculados
		hasSearchResults: searchName.length > 0 || searchIdentification.length > 0,
		isSearching: peopleData.isLoading,
		searchResults: peopleData.data?.data?.items || [],
	};
};
