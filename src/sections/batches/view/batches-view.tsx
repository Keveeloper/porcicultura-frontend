import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { _users } from 'src/_mock';
import api from 'src/services/axios-instance/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { BatchTableRow } from '../batch-table-row';
import { BatchTableHead } from '../batch-table-head';
import { BatchTableNoData } from '../batch-table-no-data';
import { BatchTableToolbar } from '../batch-table-toolbar';
import { BatchTableEmptyRows } from '../batch-table-empty-rows';
import { CreateBatchModal } from '../modals/create-batch-modal';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { BatchResponse, BatchInterface } from './types';

// ----------------------------------------------------------------------

export function BatchesView() {

  const table = useTable();

  const [openModal, setOpenModal] = useState(false);
  const [batches, setBatches] = useState<BatchInterface[]>([]);
  const [filterName, setFilterName] = useState('');

  const dataFiltered: BatchInterface[] = applyFilter({
    inputData: batches,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });
  // const dataFiltered: BatchProps[] = [];

  // const notFound = !dataFiltered.length && !!filterName;
  const notFound = dataFiltered.length === 0;

  const getAllBatches = useCallback(async () => {
    try {
      const response = await api.get<BatchResponse>('/batches');
      const batchData = response;
      console.log('batchData: ', batchData);

      setBatches(batchData);
    } catch (e) {
      console.error('Error al obtener los lotes:', e);
    }
  }, []);

  const handleOpenModal = () => setOpenModal(true);
  useEffect(() => {
    getAllBatches();
  }, [getAllBatches]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Lotes"
        links={[{ name: 'Lotes' }]}
        action={
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenModal}
          >
            Nuevo
          </Button>
        }
      />

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
                  { id: 'createdAt', label: 'Fecha de creación' },
                  { id: 'updatedAt', label: 'Fecha de modificación' },
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
          count={batches.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
      <CreateBatchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={getAllBatches}
      />
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
