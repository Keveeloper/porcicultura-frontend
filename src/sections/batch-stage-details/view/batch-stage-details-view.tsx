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
} from '@mui/material';

import api from 'src/services/axios-instance/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import type { BatchStageResponse } from './types';

// Helper para nombres de días
const DAYS_NAME = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function BatchStageDetailsView() {
  const { batchId, batchStageId } = useParams();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [batchStageInfo, setBatchStageInfo] = useState<BatchStageResponse>();
  
  // Estado local para los inputs de la tabla (Alimento y Muertes)
  // Usamos un objeto donde la llave es la fecha YYYY-MM-DD
  const [formData, setFormData] = useState<Record<string, { feed_kg: number; mortality: number }>>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentWeek(newValue);
  };

  const getOneBatchStage = useCallback(async () => {
    if (!batchId || !batchStageId) return;
    try {
      const response = await api.get<BatchStageResponse>(`/batch-stages/batch/${batchId}/batch-stage/${batchStageId}`);
      const data = response.data;
      setBatchStageInfo(data);

      // Sincronizar datos existentes de la API al estado del formulario
      const initialForm: any = {};
      data.dailyMeals.forEach((meal) => {
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

  // Generar los 7 días de la semana actual basados en start_date
  const weekDays = useMemo(() => {
    if (!batchStageInfo?.start_date) return [];
    
    const start = new Date(batchStageInfo.start_date);
    // Ajuste por zona horaria para evitar desfases de un día
    start.setMinutes(start.getMinutes() + start.getTimezoneOffset());

    return [...Array(7)].map((_, index) => {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + (currentWeek * 7) + index);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      return {
        dateStr,
        dayLabel: DAYS_NAME[currentDate.getDay()],
        displayDate: currentDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      };
    });
  }, [batchStageInfo?.start_date, currentWeek]);

  const handleInputChange = (date: string, field: 'feed_kg' | 'mortality', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: Number(value)
      }
    }));
  };

  const handleSave = async () => {
    // Aquí construirías el array para enviar al endpoint POST /daily-meals
    const recordsToSave = Object.entries(formData).map(([date, values]) => ({
      batch_stage_id: batchStageId,
      date,
      ...values
    }));
    
    try {
      await api.post(`/daily-meals/batch/${batchId}/batch-stage/${batchStageId}`, recordsToSave);
      alert('Cambios guardados exitosamente');
      getOneBatchStage(); // Refrescar métricas del sidebar
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <DashboardContent>
      {/* Header con Progreso */}
      <Stack spacing={3} sx={{ mb: 3 }}>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
                <Typography variant="h4">Suministro de alimentación</Typography>
                <Typography variant="body2" color="text.secondary">
                    Lote #{batchStageInfo?.batch.batch_number} • {batchStageInfo?.stage_type.toUpperCase()}
                </Typography>
            </Box>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSave}
                startIcon={<Iconify icon="socials:twitter" />}
            >
                Guardar cambios
            </Button>
          </Stack>

          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Progreso Ciclo: Semana {currentWeek + 1} de {batchStageInfo?.number_of_weeks}
          </Typography>
          
          <Box sx={{ width: '100%', bgcolor: 'background.neutral', height: 8, borderRadius: 1, mb: 1 }}>
            <Box sx={{ 
              width: `${((currentWeek + 1) / (batchStageInfo?.number_of_weeks || 7)) * 100}%`, 
              bgcolor: 'primary.main', height: '100%', borderRadius: 1, transition: 'width 0.4s ease'
            }} />
          </Box>
          <Stack direction="row" justifyContent="space-between">
            {[...Array(batchStageInfo?.number_of_weeks || 7)].map((_, i) => (
              <Typography key={i} variant="caption" sx={{ 
                color: i <= currentWeek ? 'primary.main' : 'text.disabled', 
                fontWeight: 'bold' 
              }}>
                S{i + 1}
              </Typography>
            ))}
          </Stack>
        </Card>
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: { md: '0 0 66.666%' }, width: '100%' }}>
          <Card>
            <Tabs value={currentWeek} onChange={handleTabChange} variant="scrollable" sx={{ px: 2, pt: 2, borderBottom: 1, borderColor: 'divider' }}>
              {[...Array(batchStageInfo?.number_of_weeks || 7)].map((_, i) => (
                <Tab key={i} label={`Semana ${i + 1}`} />
              ))}
            </Tabs>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Día</TableCell>
                    <TableCell align="center">Alimento (kg)</TableCell>
                    <TableCell align="center">Muertes</TableCell>
                    <TableCell align="right">Saldo Cerdos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weekDays.map((day) => {
                    const rowData = formData[day.dateStr] || { feed_kg: 0, mortality: 0 };
                    return (
                      <TableRow key={day.dateStr} hover>
                        <TableCell sx={{ color: 'text.secondary' }}>{day.displayDate}</TableCell>
                        <TableCell sx={{ fontWeight: '600' }}>{day.dayLabel}</TableCell>
                        <TableCell align="center">
                          <TextField 
                            size="small" 
                            type="number" 
                            value={rowData.feed_kg}
                            onChange={(e) => handleInputChange(day.dateStr, 'feed_kg', e.target.value)}
                            sx={{ width: 90 }} 
                            inputProps={{ style: { textAlign: 'center' } }} 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField 
                            size="small" 
                            type="number" 
                            value={rowData.mortality}
                            onChange={(e) => handleInputChange(day.dateStr, 'mortality', e.target.value)}
                            sx={{ width: 70 }} 
                            inputProps={{ style: { textAlign: 'center' } }} 
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {/* Cálculo simple de balance visual */}
                            {batchStageInfo?.initial_pigs}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        {/* Sidebar con Métricas Reales de la API */}
        <Box sx={{ flex: { md: '1 1 auto' }, width: '100%' }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="socials:twitter" width={24} /> Resultados de Etapa
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <ResultItem label="Consumo Acumulado" value={`${batchStageInfo?.metrics?.cumulative_feed} kg`} />
              <ResultItem label="Mortalidad Total" value={batchStageInfo?.metrics?.cumulative_mortality} trend={`${batchStageInfo?.metrics?.mortality_percentage}%`} trendColor="error.main" />
              
              <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 1.5, border: '1px dashed', borderColor: 'primary.main' }}>
                <Typography variant="overline" display="block" sx={{ color: 'primary.darker' }}>FCR (Conversión)</Typography>
                <Typography variant="h4" sx={{ color: 'primary.dark' }}>{batchStageInfo?.metrics?.fcr}</Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Objetivo: &lt; 1.45</Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                <Typography variant="overline" display="block">Inventario Actual</Typography>
                <Typography variant="h4">{batchStageInfo?.metrics?.current_pig_balance} Cerdos</Typography>
              </Box>
            </Stack>
          </Card>
        </Box>
      </Box>
    </DashboardContent>
  );
}

function ResultItem({ label, value, trend, trendColor }: any) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'uppercase', fontWeight: 'bold' }}>{label}</Typography>
      <Typography variant="h5">{value}</Typography>
      {trend && <Typography variant="caption" sx={{ color: trendColor, fontWeight: 'bold' }}>{trend}</Typography>}
    </Box>
  );
}