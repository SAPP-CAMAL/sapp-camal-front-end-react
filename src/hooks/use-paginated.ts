import { useState } from 'react';
import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	SortingState,
	PaginationState,
} from '@tanstack/react-table';

interface Props<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pageIndex?: number;
	pageSize?: number;
	enableMultiRowSelection?: boolean;
	getRowId?: (row: TData) => string;
}

export const usePaginated = <TData extends { id: string | number }, TValue>({
	columns,
	data,
	pageIndex = 0,
	pageSize = 10,
	enableMultiRowSelection = false,
	getRowId = row => row.id.toString(),
}: Props<TData, TValue>) => {
	const [filtering, setFiltering] = useState('');
	const [rowSelected, setRowSelected] = useState({});
	const [sorting, setSorting] = useState<SortingState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex,
		pageSize,
	});

	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: { sorting, globalFilter: filtering, rowSelection: rowSelected, pagination },
		onSortingChange: setSorting,
		onGlobalFilterChange: setFiltering,
		onRowSelectionChange: setRowSelected,
		onPaginationChange: setPagination,
		enableRowSelection: true,
		enableMultiRowSelection,
		getRowId,
	});

	return {
		table,
		filtering,
		rowSelected,
		pagination,

		setFiltering,
		setPagination,
	};
};
