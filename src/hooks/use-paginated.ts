import { useState } from 'react';
import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	SortingState,
} from '@tanstack/react-table';

interface Props<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	enableMultiRowSelection?: boolean;
	getRowId?: (row: TData) => string;
}

export const usePaginated = <TData extends { id: string | number }, TValue>({
	columns,
	data,
	enableMultiRowSelection = false,
	getRowId = row => row.id.toString(),
}: Props<TData, TValue>) => {
	const [filtering, setFiltering] = useState('');
	const [rowSelected, setRowSelected] = useState({});
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: { sorting, globalFilter: filtering, rowSelection: rowSelected },
		onSortingChange: setSorting,
		onGlobalFilterChange: setFiltering,
		onRowSelectionChange: setRowSelected,
		enableRowSelection: true,
		enableMultiRowSelection,
		getRowId,
	});

	return {
		table,
		filtering,
		rowSelected,

		setFiltering,
	};
};
