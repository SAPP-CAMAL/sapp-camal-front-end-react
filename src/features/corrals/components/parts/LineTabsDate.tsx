'use client';
import React from 'react';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineaType, getLineaTypeFromId } from '../../domain';
import { useLines } from '../../hooks/use-lines';

interface Props {
	selectedTab: LineaType;
	onTabChange: (v: LineaType) => void;
	selectedDate: Date;
	onDateChange: (d: Date) => void;
}

const defaultStyles = 'px-2 py-1 text-sm text-gray-500 data-[state=active]:text-white data-[state=active]:bg-primary';

export function LineTabsDate({ selectedTab, onTabChange, selectedDate, onDateChange }: Props) {
	const { data: lines, isLoading } = useLines();

	// Mapear líneas de la API a valores de LineaType
	const activeLines = React.useMemo(() => {
		if (!lines || lines.length === 0) return [];
		return lines.map(line => ({
			id: line.id,
			value: getLineaTypeFromId(line.id),
			label: `${line.name} (${line.description})`,
		}));
	}, [lines]);

	return (
		<>
			{/* Mobile layout */}
			<div className='lg:hidden space-y-4'>
				{/* Line selector */}
				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-700'>Línea de producción:</label>
					<Select value={selectedTab} onValueChange={(value: LineaType) => onTabChange(value)} disabled={isLoading}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder={isLoading ? 'Cargando líneas...' : 'Selecciona una línea'} />
						</SelectTrigger>
						<SelectContent>
							{isLoading ? (
								<SelectItem value='loading' disabled>
									Cargando líneas...
								</SelectItem>
							) : activeLines.length > 0 ? (
								activeLines.map(line => (
									<SelectItem key={line.id} value={line.value}>
										{line.label}
									</SelectItem>
								))
							) : (
								<SelectItem value='no-lines' disabled>
									No hay líneas disponibles
								</SelectItem>
							)}
						</SelectContent>
					</Select>
				</div>

				{/* Date selector */}
				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-700'>Fecha:</label>
					{/* Hidden native input to keep native picker behavior */}
					{/* <Input
            ref={hiddenDateInputRef}
            type="date"
            value={formatForInput(selectedDate)}
            onChange={(e) => {
              const d = parseFromInput(e.target.value);
              if (d) onDateChange(d);
            }}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          /> */}
					{/* Pretty button showing formatted date in Spanish */}
					{/* <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
            onClick={openNativePicker}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>
              {format(selectedDate, "EEEE, d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </Button> */}
					<DatePicker inputClassName='bg-secondary' selected={selectedDate} onChange={date => onDateChange(date as Date)} />
				</div>
			</div>

			{/* Desktop layout */}
			<div className='hidden lg:flex items-center justify-center'>
				<div className='flex items-center gap-6'>
					{isLoading ? (
						<div className='text-sm text-muted-foreground'>Cargando líneas...</div>
					) : activeLines.length > 0 ? (
						<Tabs value={selectedTab} onValueChange={(value: string) => onTabChange(value as LineaType)}>
							<TabsList
								className={`grid w-fit h-14 gap-2`}
								style={{
									gridTemplateColumns: `repeat(${activeLines.length}, minmax(0, 1fr))`,
								}}
							>
								{activeLines.map(line => (
									<TabsTrigger key={line.id} value={line.value} className={defaultStyles}>
										{line.label}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					) : (
						<div className='text-sm text-muted-foreground'>No hay líneas disponibles</div>
					)}
					<div className='flex items-center gap-2'>
						<span className='text-sm text-muted-foreground'>Fecha:</span>
						{/* Hidden native input to keep native picker behavior */}
						{/* <Input
              ref={hiddenDateInputRef}
              type="date"
              value={formatForInput(selectedDate)}
              onChange={(e) => {
                const d = parseFromInput(e.target.value);
                if (d) onDateChange(d);
              }}
              className="sr-only"
              aria-hidden
              tabIndex={-1}
            />
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-1 text-sm"
              onClick={openNativePicker}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>
                {format(selectedDate, "EEEE, d 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </span>
            </Button> */}
						<DatePicker inputClassName='bg-secondary' selected={selectedDate} onChange={date => onDateChange(date as Date)} />
					</div>
				</div>
			</div>
		</>
	);
}
