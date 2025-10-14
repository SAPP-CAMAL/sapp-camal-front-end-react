'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineaType, ProcessType, CorralGroup, getEspecialesGroupIdByLine } from '../../domain';

interface Props {
	selectedTab: LineaType;
	processFilter: ProcessType;
	onChange: (v: ProcessType) => void;
	counts?: Record<number, number>; // Changed to use group ID as key
	lineGroups?: CorralGroup[];
	isLoadingGroups?: boolean;
}

export function ProcessFilterTabs({ selectedTab, processFilter, onChange, counts = {}, lineGroups = [], isLoadingGroups = false }: Props) {
	// Previously, line 3 (ovinos-caprinos) had a special layout. We now want all lines to behave the same.
	if (false && selectedTab === 'ovinos-caprinos') {
		const especialesGroupId = getEspecialesGroupIdByLine(selectedTab);
		const generalGroupId = 5; // Corrales Generales for ovinos-caprinos

		return (
			<>
				{/* Mobile select */}
				<div className='sm:hidden'>
					<div className='space-y-2'>
						<label className='text-sm font-medium text-gray-700'>Filtrar corrales:</label>
						<Select
							value={processFilter.toString()}
							onValueChange={value => {
								const newValue = value === 'todos' ? 'todos' : parseInt(value);
								onChange(newValue as ProcessType);
							}}
						>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Selecciona un filtro' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='todos'>Todos ({(counts[generalGroupId] || 0) + (counts[especialesGroupId] || 0)})</SelectItem>
								{/* <SelectItem value={especialesGroupId.toString()}>
                  Especiales ({counts[especialesGroupId] || 0})
                </SelectItem> */}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Tablet and Desktop tabs */}
				<div className='hidden sm:block'>
					<Tabs
						value={processFilter.toString()}
						onValueChange={value => {
							const newValue = value === 'todos' ? 'todos' : parseInt(value);
							onChange(newValue as ProcessType);
						}}
					>
						<TabsList className='gap-1'>
							<TabsTrigger value='todos' className='px-3 py-1 text-sm'>
								TODOS ({(counts[generalGroupId] || 0) + (counts[especialesGroupId] || 0)})
							</TabsTrigger>
							{/* <TabsTrigger
                value={especialesGroupId.toString()}
                className="px-3 py-1 text-sm"
              >
                ESPECIALES ({counts[especialesGroupId] || 0})
              </TabsTrigger> */}
						</TabsList>
					</Tabs>
				</div>
			</>
		);
	}

	// Don't show tabs if no groups available
	if (lineGroups.length === 0) {
		return null;
	}

	// Generate tabs dynamically from API groups with safety checks
	const validGroups = lineGroups.filter(group => group && group.id && group.name && typeof group.name === 'string' && group.name.trim() !== '');

	if (validGroups.length === 0) return null;

	// Add "Todos" tab if there are multiple groups, plus always add "Especiales"
	const hasMultipleGroups = validGroups.length > 1;
	const especialesGroupId = getEspecialesGroupIdByLine(selectedTab);

	// Calculate total count for "Todos" tab based ONLY on the groups actually rendered
	// This avoids double-counting when "Especiales" is not shown separately
	const todosCount = validGroups.reduce((sum, group) => sum + (counts[group.id] || 0), 0);

	return (
		<>
			{/* Mobile & Tablet Select (<= lg) */}
			<div className='lg:hidden'>
				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-700'>Filtrar corrales:</label>
					<div className='relative'>
						{isLoadingGroups && (
							<div className='absolute -top-1 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-teal-500/60 to-transparent animate-pulse' />
						)}
						<Select
							value={processFilter.toString()}
							onValueChange={value => {
								const newValue = value === 'todos' ? 'todos' : parseInt(value);
								onChange(newValue as ProcessType);
							}}
						>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Selecciona un filtro' />
							</SelectTrigger>
							<SelectContent>
								{hasMultipleGroups && <SelectItem value='todos'>Todos ({todosCount})</SelectItem>}
								{validGroups.map(group => (
									<SelectItem key={group.id} value={group.id.toString()}>
										{group.name} ({counts[group.id] || 0})
									</SelectItem>
								))}
								{/* <SelectItem value={especialesGroupId.toString()}>
                  Especiales ({counts[especialesGroupId] || 0})
                </SelectItem> */}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Desktop Tabs (lg and up) */}
			<div className='hidden lg:block'>
				<Tabs
					value={processFilter.toString()}
					onValueChange={value => {
						const newValue = value === 'todos' ? 'todos' : parseInt(value);
						onChange(newValue as ProcessType);
					}}
				>
					<div className='relative'>
						{isLoadingGroups && (
							<div className='absolute -top-1 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-teal-500/60 to-transparent animate-pulse' />
						)}
						<TabsList className='w-full justify-start'>
							<div className='space-x-1'>
								{hasMultipleGroups && (
									<TabsTrigger value='todos' className='px-3 py-1 text-sm whitespace-nowrap'>
										TODOS ({todosCount})
									</TabsTrigger>
								)}
								{validGroups.map(group => (
									<TabsTrigger key={group.id} value={group.id.toString()} className='px-3 py-1 text-sm whitespace-nowrap'>
										{group.name} ({counts[group.id] || 0})
									</TabsTrigger>
								))}
								{/* Always add "Especiales" tab for each line */}
								{/* <TabsTrigger
                value={especialesGroupId.toString()}
                className="px-3 py-1 text-sm whitespace-nowrap"
                >
                ESPECIALES ({counts[especialesGroupId] || 0})
                </TabsTrigger> */}
							</div>
						</TabsList>
					</div>
				</Tabs>
			</div>
		</>
	);
}
