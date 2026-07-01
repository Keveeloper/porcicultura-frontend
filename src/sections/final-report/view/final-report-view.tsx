import type { PaletteColorKey } from 'src/theme/core';

import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';
import { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Grid,
  Stack,
  Divider,
  useTheme,
  Typography,
  CardHeader,
  CardContent,
  CircularProgress,
} from '@mui/material';

import api from 'src/services/axios-instance/api';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Chart, useChart } from 'src/components/chart';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { WeightPerStageRow, FeedConsumptionRow, FinalReportResponse } from './types';

// ----------------------------------------------------------------------

// El backend entrega las etapas en inglés; las mostramos con la nomenclatura del cliente.
const STAGE_LABELS: Record<string, string> = {
  'pre-nursery': 'Precebo',
  growing: 'Levante',
  finishing: 'Engorde',
};

// Orden cronológico de las etapas dentro de un lote.
const STAGE_ORDER = ['pre-nursery', 'growing', 'finishing'];

const stageLabel = (stage: string) => STAGE_LABELS[stage] ?? stage;

const formatDate = (value?: string) => (value ? dayjs(value).format('DD/MM/YYYY') : '—');

// ----------------------------------------------------------------------

export function FinalReportView() {
  const { batchId } = useParams<{ batchId: string }>();
  const theme = useTheme();

  const [report, setReport] = useState<FinalReportResponse>();
  const [loading, setLoading] = useState(true);

  const getFinalReport = useCallback(async () => {
    if (!batchId) return;
    try {
      setLoading(true);
      const response = await api.get<FinalReportResponse>(`/batches/${batchId}/final-report`);
      console.log('finalReport: ', response);

      setReport(response);
    } catch (e) {
      console.error('Error al obtener el reporte final:', e);
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    getFinalReport();
  }, [getFinalReport]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Reporte final"
        links={[
          { name: 'Lotes', href: '/batches' },
          { name: 'Etapas', href: `/batches/${batchId}/batch-stages` },
          { name: 'Reporte final' },
        ]}
      />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !report && (
        <Card>
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No se pudo cargar el reporte final de este lote.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && report && (
        <Grid container spacing={3}>
          {/* Banner resumen general */}
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                p: 4,
                boxShadow: 'none',
                position: 'relative',
                overflow: 'hidden',
                color: 'primary.darker',
                backgroundColor: 'common.white',
                backgroundImage: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette.primary.lightChannel, 0.48)})`,
              }}
            >
              <SvgColor
                src="/assets/background/shape-square.svg"
                sx={{
                  top: 0,
                  left: -20,
                  width: 240,
                  zIndex: -1,
                  height: 240,
                  opacity: 0.24,
                  position: 'absolute',
                  color: 'primary.main',
                }}
              />

              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 5 }}>
                  <Typography
                    variant="overline"
                    sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1.2 }}
                  >
                    RESULTADO FINAL LOTE PORCINO
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold' }}>
                    {report.farm_name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, opacity: 0.9 }}>
                    <Iconify icon="solar:tag-horizontal-bold-duotone" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">Lote #{report.batch_number}</Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={4}
                    justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                  >
                    <Box>
                      <Typography variant="overline" sx={{ opacity: 0.8 }}>
                        Ingreso
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {formatDate(report.entry_date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.24) }} />
                    <Box>
                      <Typography variant="overline" sx={{ opacity: 0.8 }}>
                        Salida
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {formatDate(report.exit_date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.24) }} />
                    <Box>
                      <Typography variant="overline" sx={{ opacity: 0.8 }}>
                        Días
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {report.days}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* KPIs de población y mortalidad */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              title="Cerdos iniciales"
              value={report.initial_pigs}
              icon="solar:users-group-rounded-bold-duotone"
              color="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              title="Cerdos finales"
              value={report.final_pigs}
              icon="solar:users-group-two-rounded-bold-duotone"
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              title="Mortalidad"
              value={report.mortality}
              icon="solar:danger-triangle-bold-duotone"
              color="error"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard
              title="% Mortalidad lote"
              value={`${report.mortality_percentage}%`}
              icon="solar:chart-square-bold-duotone"
              color="warning"
            />
          </Grid>

          {/* Consumo de alimento por etapa */}
          <Grid size={{ xs: 12 }}>
            <SectionTitle icon="solar:box-bold-duotone" title="Consumo de alimento" />
            <Grid container spacing={3}>
              {report.feed_consumption.map((row) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={row.stage}>
                  <StageCard title={stageLabel(row.stage)} subheader={`${row.days} días`}>
                    <RowLabel label="Consumo (kg)" value={row.kilos} icon="solar:box-bold-duotone" />
                    <RowLabel label="C / Cerdo" value={row.feed_per_pig} icon="solar:user-bold-duotone" />
                    <RowLabel label="C / Día" value={row.feed_per_day} icon="solar:calendar-bold-duotone" />
                    <RowLabel label="Conversión" value={row.conv} icon="solar:graph-up-bold-duotone" />
                  </StageCard>
                </Grid>
              ))}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StageCard title="Totales" subheader={`${report.feed_consumption_total.days} días`} highlight>
                  <RowLabel label="Consumo (kg)" value={report.feed_consumption_total.kilos} icon="solar:box-bold-duotone" />
                  <RowLabel label="C / Cerdo" value={report.feed_consumption_total.feed_per_pig} icon="solar:user-bold-duotone" />
                  <RowLabel label="C / Día" value={report.feed_consumption_total.feed_per_day} icon="solar:calendar-bold-duotone" />
                  <RowLabel label="Conversión" value={report.feed_consumption_total.conv} icon="solar:graph-up-bold-duotone" />
                </StageCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FeedConsumptionChart feedConsumption={report.feed_consumption} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FeedConversionChart feedConsumption={report.feed_consumption} />
              </Grid>
            </Grid>
          </Grid>

          {/* Peso promedio por etapa */}
          <Grid size={{ xs: 12 }}>
            <SectionTitle icon="solar:scale-bold-duotone" title="Peso promedio por etapa" />
            <Grid container spacing={3}>
              {report.weight_per_stage.map((row) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={row.stage}>
                  <StageCard title={stageLabel(row.stage)}>
                    <RowLabel label="Peso inicial (kg)" value={row.initial_weight} icon="solar:scale-bold-duotone" />
                    <RowLabel label="Peso final (kg)" value={row.final_weight} icon="solar:scale-bold-duotone" />
                    <RowLabel label="Ganancia (kg)" value={row.gain} icon="solar:star-fall-minimalistic-2-bold-duotone" color="success.main" />
                    <RowLabel label="Gan / Día (kg)" value={row.gain_per_day} icon="solar:graph-up-bold-duotone" />
                  </StageCard>
                </Grid>
              ))}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StageCard title="Totales" highlight>
                  <RowLabel label="Peso inicial (kg)" value={report.weight_per_stage_total.initial_weight} icon="solar:scale-bold-duotone" />
                  <RowLabel label="Peso final (kg)" value={report.weight_per_stage_total.final_weight} icon="solar:scale-bold-duotone" />
                  <RowLabel label="Ganancia (kg)" value={report.weight_per_stage_total.gain} icon="solar:star-fall-minimalistic-2-bold-duotone" color="success.main" />
                  <RowLabel label="Gan / Día (kg)" value={report.weight_per_stage_total.gain_per_day} icon="solar:graph-up-bold-duotone" />
                </StageCard>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <WeightPerStageChart weightPerStage={report.weight_per_stage} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <GainPerDayChart weightPerStage={report.weight_per_stage} />
              </Grid>
            </Grid>
          </Grid>

          {/* Pesos finales del lote */}
          <Grid size={{ xs: 12 }}>
            <SectionTitle icon="solar:scale-bold-duotone" title="Pesos finales del lote" />
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <KpiCard
                  title="Peso total en granja"
                  value={`${report.total_batch_weight_farm} kg`}
                  icon="solar:home-bold-duotone"
                  color="info"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <KpiCard
                  title="Peso total al sacrificio"
                  value={`${report.total_batch_weight_slaughter} kg`}
                  icon="solar:box-minimalistic-bold-duotone"
                  color="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <KpiCard
                  title="Promedio peso al sacrificio"
                  value={`${report.average_slaughter_weight} kg`}
                  icon="solar:scale-bold-duotone"
                  color="success"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
      <Iconify icon={icon} sx={{ mr: 1.5, color: 'primary.main', width: 28, height: 28 }} />
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
    </Box>
  );
}

function FeedConsumptionChart({ feedConsumption }: { feedConsumption: FeedConsumptionRow[] }) {
  const theme = useTheme();

  const sortedRows = useMemo(
    () =>
      [...feedConsumption].sort(
        (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
      ),
    [feedConsumption]
  );

  // Cada métrica tiene una unidad y magnitud distinta (kg totales vs. kg/cerdo vs.
  // conversión ~1-3), así que se normalizan a % del máximo entre etapas para
  // poder compararlas en un mismo eje; el valor real se muestra en el tooltip.
  const metrics = [
    { key: 'kilos', label: 'Consumo', unit: 'kg' },
    { key: 'feed_per_pig', label: 'C / Cerdo', unit: 'kg' },
    { key: 'feed_per_day', label: 'C / Día', unit: 'kg' },
    { key: 'conv', label: 'Conversión', unit: '' },
  ] as const;

  const categories = metrics.map((m) => m.label);
  const rawValues = sortedRows.map((row) => metrics.map((m) => row[m.key]));
  const metricMax = metrics.map((_, metricIndex) =>
    Math.max(...rawValues.map((values) => values[metricIndex]), 1)
  );

  const series = sortedRows.map((row, rowIndex) => ({
    name: stageLabel(row.stage),
    data: rawValues[rowIndex].map((value, metricIndex) =>
      Number(((value / metricMax[metricIndex]) * 100).toFixed(1))
    ),
  }));

  const chartColors = [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories },
    yaxis: { max: 100, labels: { formatter: (value: number) => `${value}%` } },
    legend: { show: true },
    markers: { size: 5, strokeWidth: 2 },
    tooltip: {
      y: {
        formatter: (
          _value: number,
          opts: { seriesIndex: number; dataPointIndex: number }
        ) => {
          const raw = rawValues[opts.seriesIndex][opts.dataPointIndex];
          const unit = metrics[opts.dataPointIndex].unit;
          return unit ? `${raw} ${unit}` : `${raw}`;
        },
      },
    },
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Comparativa de consumo por etapa"
        subheader="Valores normalizados como % del máximo entre etapas por métrica — pase el cursor para ver el valor real"
      />
      <Chart
        type="line"
        series={series}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{ pl: 1, py: 2.5, pr: 2.5, flexGrow: 1, minHeight: 364 }}
      />
    </Card>
  );
}

function FeedConversionChart({ feedConsumption }: { feedConsumption: FeedConsumptionRow[] }) {
  const theme = useTheme();

  const sortedRows = useMemo(
    () =>
      [...feedConsumption].sort(
        (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
      ),
    [feedConsumption]
  );

  const categories = sortedRows.map((row) => stageLabel(row.stage));
  const series = [{ name: 'Conversión', data: sortedRows.map((row) => row.conv) }];

  const chartOptions = useChart({
    colors: [theme.palette.primary.main],
    xaxis: { categories },
    legend: { show: false },
    markers: { size: 6, strokeWidth: 2 },
    tooltip: { y: { formatter: (value: number) => `${value} kg alimento / kg peso` } },
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Comparativa de conversión alimenticia"
        subheader="Precebo vs. Levante vs. Engorde"
      />
      <Chart
        type="line"
        series={series}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{ pl: 1, py: 2.5, pr: 2.5, flexGrow: 1, minHeight: 364 }}
      />
    </Card>
  );
}

function WeightPerStageChart({ weightPerStage }: { weightPerStage: WeightPerStageRow[] }) {
  const theme = useTheme();

  const sortedRows = useMemo(
    () =>
      [...weightPerStage].sort(
        (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
      ),
    [weightPerStage]
  );

  // Gan / Día se excluye: es una tasa (~0.3-1.1 kg/día) muy por debajo de los
  // totales acumulados (hasta ~110 kg), por lo que quedaría invisible en las
  // mismas barras. Tiene su propia gráfica en GainPerDayChart.
  const categories = ['Peso inicial (kg)', 'Peso final (kg)', 'Ganancia (kg)'];

  const series = sortedRows.map((row) => ({
    name: stageLabel(row.stage),
    data: [row.initial_weight, row.final_weight, row.gain],
  }));

  const chartColors = [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const chartOptions = useChart({
    colors: chartColors,
    xaxis: { categories },
    legend: { show: true },
    tooltip: { y: { formatter: (value: number) => `${value} kg` } },
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Comparativa de peso por etapa"
        subheader="Precebo vs. Levante vs. Engorde"
      />
      <Chart
        type="bar"
        series={series}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{ pl: 1, py: 2.5, pr: 2.5, flexGrow: 1, minHeight: 364 }}
      />
    </Card>
  );
}

function GainPerDayChart({ weightPerStage }: { weightPerStage: WeightPerStageRow[] }) {
  const theme = useTheme();

  const sortedRows = useMemo(
    () =>
      [...weightPerStage].sort(
        (a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage)
      ),
    [weightPerStage]
  );

  const categories = sortedRows.map((row) => stageLabel(row.stage));
  const series = [{ name: 'Gan / Día', data: sortedRows.map((row) => row.gain_per_day) }];

  const chartOptions = useChart({
    colors: [theme.palette.primary.main],
    xaxis: { categories },
    legend: { show: false },
    markers: { size: 6, strokeWidth: 2 },
    tooltip: { y: { formatter: (value: number) => `${value} kg/día` } },
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Comparativa de ganancia diaria"
        subheader="Precebo vs. Levante vs. Engorde"
      />
      <Chart
        type="line"
        series={series}
        options={chartOptions}
        slotProps={{ loading: { p: 2.5 } }}
        sx={{ pl: 1, py: 2.5, pr: 2.5, flexGrow: 1, minHeight: 364 }}
      />
    </Card>
  );
}

function StageCard({
  title,
  subheader,
  highlight = false,
  children,
}: {
  title: string;
  subheader?: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease-in-out',
        border: '1px solid',
        borderColor: highlight ? 'primary.main' : 'divider',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: theme.shadows[10],
          borderColor: 'primary.light',
        },
      }}
    >
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{
          pb: 2,
          bgcolor: highlight ? 'primary.lighter' : 'background.neutral',
          '& .MuiCardHeader-title': { typography: 'h6' },
          '& .MuiCardHeader-subheader': { fontWeight: 'bold', mt: 0.5 },
        }}
      />
      <Divider sx={{ borderStyle: 'dashed' }} />
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>{children}</Stack>
      </CardContent>
    </Card>
  );
}

function KpiCard({
  title,
  value,
  icon,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  icon: string;
  color?: PaletteColorKey;
}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 3,
        height: '100%',
        boxShadow: 'none',
        position: 'relative',
        color: `${color}.darker`,
        backgroundColor: 'common.white',
        backgroundImage: `linear-gradient(135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)})`,
      }}
    >
      <Box sx={{ width: 48, height: 48, mb: 3 }}>
        <Iconify icon={icon} width={48} sx={{ color: `${color}.dark` }} />
      </Box>

      <Box sx={{ typography: 'subtitle2', mb: 1 }}>{title}</Box>

      <Box sx={{ typography: 'h3' }}>{value}</Box>

      <SvgColor
        src="/assets/background/shape-square.svg"
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: 0.24,
          position: 'absolute',
          color: `${color}.main`,
        }}
      />
    </Card>
  );
}

function RowLabel({
  label,
  value,
  icon,
  color = 'text.primary',
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon={icon} width={20} sx={{ color: 'text.secondary', opacity: 0.8 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: '500' }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color }}>
        {value}
      </Typography>
    </Stack>
  );
}
