import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, } from 'react';

import Box from '@mui/material/Box';
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

import { CreateBatchStageModal } from '../modals';
import { BatchStagesTableRow } from '../batch-stages-table-row';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { BatchStagesTableHead } from '../batch-stages-table-head';
import { BatchStagesTableNoData } from '../batch-stages-table-no-data';
import { BatchStagesTableToolbar } from '../batch-stages-table-toolbar';
import { BatchStagesTableEmptyRows } from '../batch-stages-table-empty-rows';

import type { BatchStagesResponse, BatchStagesInterface } from './types';



// ----------------------------------------------------------------------

export function BatcheStagesView() {

  const table = useTable();

  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [batches, setBatches] = useState<BatchStagesInterface[]>([]);
  const [filterName, setFilterName] = useState('');

  const dataFiltered: BatchStagesInterface[] = applyFilter({
    inputData: batches,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });
  // const dataFiltered: BatchProps[] = [];

  // const notFound = !dataFiltered.length && !!filterName;
  const notFound = dataFiltered.length === 0;

  const getAllBatchStages = useCallback(async () => {
    if (!batchId) return;
    try {
      const response = await api.get<BatchStagesResponse>(`/batch-stages/batch/${batchId}`);
      const batchData = response;
      console.log('batchData: ', batchData);

      setBatches(batchData);
    } catch (e) {
      console.error('Error al obtener los lotes:', e);
    }
  }, [batchId]);

  const handleOpenModal = () => setOpenModal(true);

  const allStagesCompleted =
    batches.length > 0 && batches.every((stage) => stage.status === 'completed');

  const handleGoToFinalReport = () =>
    navigate(`/batches/${batchId}/batch-stages/final-report`);



  useEffect(() => {
    getAllBatchStages();
  }, [getAllBatchStages]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Etapas de lotes"
        links={[
          { name: 'Lotes', href: '/batches' },
          { name: 'Etapas' },
        ]}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenModal}
            >
              Nuevo
            </Button>

            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleGoToFinalReport}
              disabled={!allStagesCompleted}
            >
              Reporte final
            </Button>
          </Box>
        }
      />

      <Card>
        <BatchStagesTableToolbar
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
              <BatchStagesTableHead
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
                  { id: 'initial_pigs', label: 'Cantidad de cerdos' },
                  { id: 'stage_type', label: 'Etapa' },
                  { id: 'status', label: 'Estado' },
                  // { id: 'start_date', label: 'Fecha inicial' },
                  // { id: 'end_date', label: 'Fecha final' },
                  // { id: 'number_of_weeks', label: 'Semanas' },
                  // { id: 'initial_batch_weight', label: 'Peso inicial lote' },
                  // { id: 'final_batch_weight', label: 'Peso final lote' },
                  // { id: 'initial_pig_weight', label: 'Peso inicial lechón' },
                  // { id: 'final_pig_weight', label: 'Peso final lechón' },
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
                    <BatchStagesTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                    />
                  ))}

                <BatchStagesTableEmptyRows
                  height={68}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, _users.length)}
                />

                {notFound && <BatchStagesTableNoData searchQuery={filterName} />}
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
      <CreateBatchStageModal
        batchId={batchId!}
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={getAllBatchStages}
      />
    </DashboardContent>
  );

}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('initial_pigs');
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
