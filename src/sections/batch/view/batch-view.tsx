import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { _users } from 'src/_mock';
import api from 'src/services/axios-instance/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// import { TableNoData } from '../batch-table-no-data';
import { BatchTableRow } from '../batch-table-row'; 
import { BatchTableHead } from '../batch-table-head';
import { BatchTableNoData } from '../batch-table-no-data';
import { BatchTableToolbar } from '../batch-table-toolbar';
import { BatchTableEmptyRows } from '../batch-table-empty-rows'; 
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { BatchResponse, BatchInterface } from './types';

// ----------------------------------------------------------------------

const _batches: any = [
  {
    id: "1",
    batch_number: "22",
    created_at: "2026-02-03 11:58:10.970 -0500",
    updated_at: "2026-02-03 11:58:10.970 -0500",
  },
  {
    id: "2",
    batch_number: "23",
    created_at: "2026-02-03 11:58:10.970 -0500",
    updated_at: "2026-02-03 11:58:10.970 -0500",
  },
  {
    id: "3",
    batch_number: "24",
    created_at: "2026-02-03 11:58:10.970 -0500",
    updated_at: "2026-02-03 11:58:10.970 -0500",
  },

]

export function BatchView() {

  const table = useTable();

  const [ batches, setBatches ] = useState<BatchInterface[]>([]);
  const [filterName, setFilterName] = useState('');

  const dataFiltered: BatchInterface[] = applyFilter({
    inputData: batches || [{
      id: "",
      batch_number: "",
      createdAt: "",
      updatedAt: "",
    }],
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });
  // const dataFiltered: BatchProps[] = [];

  // const notFound = !dataFiltered.length && !!filterName;
  const notFound = dataFiltered.length === 0;

  const getAllBatches = useCallback(async () => {
    try {
      const response = await api.get<BatchResponse>('/batches');
      const batchData = response.data;
      console.log('batchData: ', batchData);
      
      setBatches(batchData.data);
    } catch (e) {
      console.error('Error al obtener los lotes:', e);
    }
  }, []);

  useEffect(() => {
    getAllBatches();
  }, [getAllBatches]);

   return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Lotes
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New user
        </Button>
      </Box>

      <Card>
        <BatchTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <BatchTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={_users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    _users.map((user) => user.id)
                  )
                }
                headLabel={[
                  { id: 'batch_number', label: 'No. lote' },
                  { id: 'created_at', label: 'Fecha de creación' },
                  { id: 'updated_at', label: 'Fecha de modificación' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row) => (
                    <BatchTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                    />
                  ))}

                <BatchTableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, _users.length)}
                />

                {notFound && <BatchTableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={_users.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
  
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('batch_number');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
