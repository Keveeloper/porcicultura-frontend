import { sileo } from "sileo";
import { useParams } from 'react-router-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { 
  Box, 
  Tab, 
  Card, 
  Tabs, 
  Stack, 
  Table, 
  Button, 
  Divider, 
  TableRow, 
  TableBody, 
  TableCell, 
  TableHead, 
  TextField, 
  Typography, 
  TableContainer,
  Chip, 
} from '@mui/material';

import api from 'src/services/axios-instance/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { CreateBatchStageDetailsModal } from "../modal/create-batch-stage-details-modal";

import type { BatchStageResponse } from './types';

// Helper para nombres de días
const DAYS_NAME = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function BatchStageDetailsView() {
  const { batchId, batchStageId } = useParams();
  const [ openModal, setOpenModal] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [batchStageInfo, setBatchStageInfo] = useState<any>();
  const [formData, setFormData] = useState<Record<string, { feed_kg: number; mortality: number }>>({});

  // 1. Determinar si la etapa está finalizada
  const isCompleted = batchStageInfo?.status === 'completed';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentWeek(newValue);
  };

  const getOneBatchStage = useCallback(async () => {
    if (!batchId || !batchStageId) return;
    try {
      const response = await api.get<BatchStageResponse>(`/batch-stages/batch/${batchId}/batch-stage/${batchStageId}`);
      const data = response;
      console.log('Response: ', response);
      
      console.log('BatchStage data: ', data);
      
      setBatchStageInfo(data);

      const initialForm: any = {};
      data.dailyMeals.forEach((meal: any) => {
        initialForm[meal.date] = {
          feed_kg: Number(meal.feed_kg),
          mortality: meal.mortality,
        };
      });
      setFormData(initialForm);
    } catch (e) {
      console.error('Error al obtener los detalles:', e);
    }
  }, [batchId, batchStageId]);

  useEffect(() => {
    getOneBatchStage();
  }, [getOneBatchStage]);

  const weekDays = useMemo(() => {
    if (!batchStageInfo?.start_date) return [];
    const [year, month, day] = batchStageInfo.start_date.split('-').map(Number);
    const start = new Date(year, month - 1, day);

    return [...Array(7)].map((_, index) => {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + (currentWeek * 7) + index);
      const y = currentDate.getFullYear();
      const m = String(currentDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      return {
        dateStr,
        dayLabel: DAYS_NAME[currentDate.getDay()],
        displayDate: `${d}/${m}/${y}`
      };
    });
  }, [batchStageInfo?.start_date, currentWeek]);

  // 2. Validación para mostrar botón de finalizar
  const canFinishStage = useMemo(() => {
    const isLastWeek = currentWeek === (batchStageInfo?.number_of_weeks || 7) - 1;
    const hasAllData = Object.keys(formData).length >= (batchStageInfo?.number_of_weeks || 7) * 7;
    return isLastWeek && hasAllData && !isCompleted;
  }, [currentWeek, formData, batchStageInfo?.number_of_weeks, isCompleted]);

  const handleInputChange = (date: string, field: 'feed_kg' | 'mortality', value: string) => {
    if (isCompleted) return;
    setFormData((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value === '' ? 0 : Number(value)
      }
    }));
  };

  const handleSave = async () => {
    const recordsToSave = weekDays.map((day) => {
      const rowData = formData[day.dateStr] || { feed_kg: 0, mortality: 0 };
      return {
        date: day.dateStr,
        feed_kg: rowData.feed_kg,
        mortality: rowData.mortality,
      };
    });

    try {
      const response = await api.post<BatchStageResponse>(`/daily-meals/batch/${batchId}/batch-stage/${batchStageId}`, recordsToSave);
      console.log('Response: ', response);
      
      if (response) {
        getOneBatchStage();
        sileo.success({
          styles: {
            title: "text-white!",
          },
          title: "Cambios guardados",
          fill: "black",
          description: (
            <span style={{color: "white"}}>
              Se han guardado los datos de la semana correctamente.
            </span>
          ),
        });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  // const handleFinishStage = async () => {
  //   try {
  //     // Endpoint que deberás crear en NestJS para cambiar status a 'completed'
  //     // await api.patch(`/batch-stages/${batchStageId}/status`, { status: 'completed' });
  //     alert('Etapa finalizada exitosamente. Los datos ahora son de solo lectura.');
  //     getOneBatchStage();
  //   } catch (error) {
  //     console.error('Error al finalizar etapa:', error);
  //   }
  // };

  const handleOpenModal = () => setOpenModal(true);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[
          { name: 'Lotes', href: '/batches' },
          { name: 'Etapas', href: `/batches/${batchId}/batch-stages` },
          { name: 'Detalles' },
        ]}
      />
      <Stack spacing={3} sx={{ mb: 2 }}>
        <Card sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h4">Suministro de alimentación</Typography>
              <Typography variant="body2" color="text.secondary">
                {batchStageInfo?.batch?.batch_number} • {batchStageInfo?.stage_type?.toUpperCase()}
              </Typography>
            </Box>            
            {/* Botón superior dinámico */}
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleOpenModal}
              startIcon={<Iconify icon="eva:checkmark-fill" />}
              disabled={!canFinishStage}
            >
              Finalizar Etapa
            </Button>
          </Stack>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Progreso Ciclo: {isCompleted ? '100%' : `Semana ${currentWeek + 1} de ${batchStageInfo?.number_of_weeks}`}
          </Typography>
          
          <Box sx={{ width: '100%', bgcolor: 'background.neutral', height: 8, borderRadius: 1, mb: 1 }}>
            <Box sx={{ 
              width: isCompleted ? '100%' : `${((currentWeek + 1) / (batchStageInfo?.number_of_weeks || 7)) * 100}%`, 
              bgcolor: isCompleted ? 'success.main' : 'primary.main', 
              height: '100%', borderRadius: 1, transition: 'width 0.4s ease'
            }} />
          </Box>
        </Card>
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* <Box sx={{ flex: { md: '0 0 66.666%' }, width: '100%' }}> */}
        <Box sx={{ flex: { md: '0 0 60%' }, width: '100%' }}>
          <Stack spacing={3}>
            <Card>
              <Tabs value={currentWeek} onChange={handleTabChange} variant="scrollable" sx={{ px: 0.5, pt: 2, borderBottom: 1, borderColor: 'divider' }}>
                {[...Array(batchStageInfo?.number_of_weeks || 7)].map((_, i) => (
                  <Tab key={i} label={`Semana ${i + 1}`} />
                ))}
              </Tabs>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{
                      height: '10px', // Set the desired height
                      '& .MuiTableCell-root': {
                        padding: '14px 20px', // Adjust padding to fit the new height
                      },
                    }}>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Día</TableCell>
                      <TableCell align="center">Alimento (kg)</TableCell>
                      <TableCell align="center">Muertes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {weekDays.map((day) => {
                      const rowData = formData[day.dateStr] || { feed_kg: 0, mortality: 0 };
                      return (
                        <TableRow key={day.dateStr} hover sx={{
                          height: '10px', // Set the desired height
                          '& .MuiTableCell-root': {
                            padding: '10px 20px', // Adjust padding to fit the new height
                          },
                        }}>
                          <TableCell sx={{ color: 'text.secondary' }}>{day.displayDate}</TableCell>
                          <TableCell sx={{ fontWeight: '600' }}>{day.dayLabel}</TableCell>
                          <TableCell align="center">
                            <TextField 
                              size="small" 
                              type="number"
                              disabled={isCompleted}
                              value={rowData.feed_kg === 0 ? '' : rowData.feed_kg}
                              onChange={(e) => handleInputChange(day.dateStr, 'feed_kg', e.target.value)}
                              sx={{ width: 90 }} 
                              slotProps={{ htmlInput: { style: { textAlign: 'center' } } }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <TextField 
                              size="small" 
                              type="number"
                              disabled={isCompleted}
                              value={rowData.mortality === 0 ? '' : rowData.mortality}
                              onChange={(e) => handleInputChange(day.dateStr, 'mortality', e.target.value)}
                              sx={{ width: 70 }} 
                              slotProps={{ htmlInput: { style: { textAlign: 'center' } } }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Botón de guardar abajo para mejor accesibilidad */}
              {!isCompleted && (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSave}
                    startIcon={<Iconify icon="eva:checkmark-fill" />}
                  >
                    Guardar Semana {currentWeek + 1}
                  </Button>
                </Box>
              )}
            </Card>
          </Stack>
        </Box>

        <Box sx={{ flex: { md: '1 1 auto' }, width: '100%' }}>
          {/* Sidebar igual que antes */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="eva:checkmark-fill" width={24} /> Resultados de Etapa
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={2}>
              <Box sx={{height: '100px', display: 'flex', gap: 2}}>
                <ResultItem label="Consumo Acumulado" value={`${batchStageInfo?.metrics?.cumulative_feed} kg`}/>
                <ResultItem label="Mortalidad Total" value={batchStageInfo?.metrics?.cumulative_mortality} trend={`${batchStageInfo?.metrics?.mortality_percentage}%`} trendColor="error.main" />
                <ResultItem label="Consumo acumulado cerdo" value={batchStageInfo?.metrics?.cumulative_feed_pig} />
              </Box>
              <Box sx={{height: '100px', display: 'flex', gap: 2}}>
                <ResultItem label="Ganancia peso" value={`${batchStageInfo?.metrics?.weight_gain} kg`}/>
                <ResultItem label="Peso final lote" value={`${batchStageInfo?.final_batch_weight} kg`}/>
                <ResultItem label="Peso final lechón" value={`${batchStageInfo?.metrics?.final_pig_weight} kg`}/>
              </Box>
              <Box sx={{height: '100px', display: 'flex', gap: 2}}>
                <ResultItem label="cantidad de cerdos" value={`${batchStageInfo?.initial_pigs}`}/>
                <ResultItem label="Peso inicial del lote" value={`${batchStageInfo?.initial_batch_weight}`}/>
                <ResultItem label="Peso por lechón" value={`${batchStageInfo?.initial_pig_weight}`}/>
              </Box>
              <Box sx={{height: '80px', display: 'flex', gap: 2}}>
                <Box sx={{ p: 2, width: 1/3, height: '100%', bgcolor: 'background.neutral', borderRadius: '8px', display: 'flex', justifyContent: 'start', flexDirection: 'column'}}>
                  <Typography variant="overline" display="block">Inventario Actual</Typography>
                  <Typography variant="h4">{batchStageInfo?.metrics?.current_pig_balance}</Typography>
                </Box>
                <Box sx={{width: 1/3, p: 2, bgcolor: isCompleted ? 'success.lighter' : 'primary.lighter', borderRadius: 1.5, border: '1px dashed', borderColor: isCompleted ? 'success.main' : 'primary.main' }}>
                  <Typography variant="overline" display="block">FCR (Conversión)</Typography>
                  <Typography variant="h4">{batchStageInfo?.metrics?.fcr}</Typography>
                </Box>
                <ResultItem label="Ganancia diaria cerdo" value={`${batchStageInfo?.metrics?.daily_pig_gain}`}/>
              </Box>
              <Box sx={{height: '80px', display: 'flex', gap: 2}}>
                <ResultItem label="Consumo diario por cerdo" value={`${batchStageInfo?.metrics?.daily_feed_pig} kg`}/>
              </Box>
            </Stack>
          </Card>
        </Box>
      </Box>
      <CreateBatchStageDetailsModal 
        batchId={batchId || ''}
        batchStageId={batchStageId || ''}
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        onSuccess={getOneBatchStage}
      />
    </DashboardContent>
  );
}

function ResultItem({ label, value, trend, trendColor }: any) {
  return (
    <Box sx={{p: 2, width: 1/3, border: '1px solid rgba(145 158 171 / 0.12)', borderRadius: '8px', display: 'flex', justifyContent: 'start', flexDirection: 'column', gap: 0.5}}>
      <Typography variant="caption" sx={{color: 'text.disabled', textTransform: 'uppercase', fontWeight: 'bold' }}>{label}</Typography>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1}}>
        <Typography variant="h5">{value}</Typography>
        {trend && <Typography sx={{ color: trendColor, fontWeight: 'bold' }}>{trend}</Typography>}
      </Box>
    </Box>
  );
}