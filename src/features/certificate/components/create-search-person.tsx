import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Search, Loader2 } from 'lucide-react';
import { useOperator, UseOperatorProps } from '../hooks/use-operator';
import { PersonFormWrapper } from './person-form-wrapper';
import { BasicResultsCard } from '@/features/reception/components';

interface CreateSearchPersonProps extends UseOperatorProps {
	title?: string;
	description?: string;
	showToggleButton?: boolean;
	className?: string;
	// Props for sharing operator state
	selectedPerson?: any;
	isCreatingPerson?: boolean;
	isSubmittingPerson?: boolean;
	personForm?: any;
	nameInput?: string;
	idInput?: string;
	activeSearchField?: string | null;
	searchName?: string;
	searchIdentification?: string;
	peopleData?: any;
	updatePersonForm?: any;
	handleSelectPerson?: any;
	handleRemovePerson?: any;
	handleCreatePerson?: any;
	handleNameSearch?: any;
	handleIdentificationSearch?: any;
	toggleCreateMode?: any;
	hasSearchResults?: boolean;
	isSearching?: boolean;
	searchResults?: any[];
}

export const CreateSearchPerson: FC<CreateSearchPersonProps> = ({
	title = 'Asignar operador al certificado',
	description = 'Indique la persona autorizada por este certificado.',
	showToggleButton = true,
	className = '',
	// Operator props from parent
	selectedPerson: externalSelectedPerson,
	isCreatingPerson: externalIsCreatingPerson,
	isSubmittingPerson: externalIsSubmittingPerson,
	personForm: externalPersonForm,
	nameInput: externalNameInput,
	idInput: externalIdInput,
	activeSearchField: externalActiveSearchField,
	searchName: externalSearchName,
	searchIdentification: externalSearchIdentification,
	peopleData: externalPeopleData,
	updatePersonForm: externalUpdatePersonForm,
	handleSelectPerson: externalHandleSelectPerson,
	handleRemovePerson: externalHandleRemovePerson,
	handleCreatePerson: externalHandleCreatePerson,
	handleNameSearch: externalHandleNameSearch,
	handleIdentificationSearch: externalHandleIdentificationSearch,
	toggleCreateMode: externalToggleCreateMode,
	hasSearchResults: externalHasSearchResults,
	isSearching: externalIsSearching,
	searchResults: externalSearchResults,
	...operatorProps
}) => {
	// Use external state if provided, otherwise use internal hook
	const internalHook = useOperator(operatorProps);

	const {
		selectedPerson,
		isCreatingPerson,
		isSubmittingPerson,
		personForm,
		nameInput,
		idInput,
		activeSearchField,
		searchName,
		searchIdentification,
		peopleData,
		updatePersonForm,
		handleSelectPerson,
		handleRemovePerson,
		handleCreatePerson,
		handleNameSearch,
		handleIdentificationSearch,
		toggleCreateMode,
		hasSearchResults,
		isSearching,
		searchResults,
	} = externalSelectedPerson !== undefined ? {
		selectedPerson: externalSelectedPerson,
		isCreatingPerson: externalIsCreatingPerson,
		isSubmittingPerson: externalIsSubmittingPerson,
		personForm: externalPersonForm,
		nameInput: externalNameInput,
		idInput: externalIdInput,
		activeSearchField: externalActiveSearchField,
		searchName: externalSearchName,
		searchIdentification: externalSearchIdentification,
		peopleData: externalPeopleData,
		updatePersonForm: externalUpdatePersonForm,
		handleSelectPerson: externalHandleSelectPerson,
		handleRemovePerson: externalHandleRemovePerson,
		handleCreatePerson: externalHandleCreatePerson,
		handleNameSearch: externalHandleNameSearch,
		handleIdentificationSearch: externalHandleIdentificationSearch,
		toggleCreateMode: externalToggleCreateMode,
		hasSearchResults: externalHasSearchResults,
		isSearching: externalIsSearching,
		searchResults: externalSearchResults,
	} : internalHook;


	return (
		<Card className={`border-l-4 border-l-primary ${className}`}>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-center'>
					<CardTitle className='text-md flex items-center gap-2'>
						<User size={18} />
						{title}
					</CardTitle>
					{showToggleButton && !selectedPerson && (
						<Button type='button' variant='outline' size='sm' onClick={toggleCreateMode}>
							{isCreatingPerson ? 'Buscar Existente' : '+ Nueva Persona'}
						</Button>
					)}
				</div>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				{isCreatingPerson ? (
					<div className='space-y-4'>
						<PersonFormWrapper personData={personForm} onPersonChange={updatePersonForm} isUpdateVisitorLog={true} />
						<div className='flex justify-end gap-2 mt-4'>
							<Button type='button' variant='outline' onClick={toggleCreateMode}>
								Cancelar
							</Button>
							<Button type='button' onClick={handleCreatePerson} disabled={isSubmittingPerson}>
								{isSubmittingPerson ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Guardando...
									</>
								) : (
									'Guardar Persona'
								)}
							</Button>
						</div>
					</div>
				) : !selectedPerson ? (
					<div className='space-y-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label>Buscar por Nombre</Label>
								<div className='relative'>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
									<Input
										type='text'
										placeholder='Escriba un nombre...'
										className='w-full border border-gray-300 rounded-md shadow-sm h-10 bg-secondary pl-10'
										value={nameInput}
										onChange={e => handleNameSearch(e.target.value)}
									/>
								</div>
							</div>

							<div className='space-y-2'>
								<Label>Buscar por Identificación</Label>
								<div className='relative'>
									<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
									<Input
										type='text'
										placeholder='Escriba un número...'
										className='w-full border border-gray-300 rounded-md shadow-sm h-10 bg-secondary pl-10'
										value={idInput}
										onChange={e => handleIdentificationSearch(e.target.value)}
									/>
								</div>
							</div>
						</div>

						{/* Search Results */}
						{hasSearchResults && (
							<div className='space-y-2'>
								<Separator />
								<div className='flex items-center justify-between'>
									<span className='text-sm font-semibold text-gray-500'>Resultados de búsqueda {peopleData.isFetching && '(Buscando...)'}</span>
								</div>
								<div className='grid gap-2 max-h-60 overflow-y-auto pr-1'>
									{isSearching ? (
										<div className='p-4 text-center text-gray-500'>Buscando personas...</div>
									) : !searchResults || searchResults.length === 0 ? (
										<div className='p-4 text-center text-gray-500 border rounded-lg border-dashed'>
											No se encontraron resultados para &quot;{activeSearchField === 'name' ? searchName : searchIdentification}&quot;
										</div>
									) : (
										searchResults?.map((person: any) => (
											<BasicResultsCard
												key={person.id}
												title={person.fullName}
												paragraph={`${person.identificationType?.description || 'DNI'}: ${person.identification}`}
												leftBlockClass='flex items-center justify-start gap-4'
												onSelect={() => handleSelectPerson(person)}
											/>
										))
									)}
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="w-full">
						<div>
							<label className="font-semibold text-sm">Persona Seleccionada</label>
							<div className="rounded-xl px-3 py-2 bg-muted border mt-2 flex items-center justify-between">
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
										<User size={16} />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-semibold truncate">{selectedPerson.fullName}</p>
										{selectedPerson.identification && (
											<p className="text-sm text-muted-foreground truncate">
												{selectedPerson.identificationType?.description || 'DNI'}: {selectedPerson.identification}
											</p>
										)}
									</div>
								</div>
								<button
									onClick={handleRemovePerson}
									className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
									aria-label="Remover persona seleccionada"
								>
									✕
								</button>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
