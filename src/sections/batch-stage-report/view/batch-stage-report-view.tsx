import { useParams } from 'react-router-dom';

import {
  Box,
  Card,
  Grid,
  Stack,
  Divider,
  useTheme,
  Typography,
  CardHeader,
  CardContent
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// Mock Data from Excel Image
const MOCK_REPORT_DATA = {
  batch_number: '22',
  stage_name: 'PRECEBO',
  start_date: '24-Jan',
  end_date: '13-Mar',
  initial_pigs: 85,
  weaning_total_weight: 550.0,
  weaning_avg_weight: 6.47,
  final_total_weight: 2400.0,
  final_avg_weight: 29.27,
  total_mortality: 3,
  total_mortality_percentage: '3.53%',
  total_gain: 0.465,
  total_conversion: 1.54,
  weeks: [
    { week: 1, product: 'PRE-INICIO 2', kilos: 157, mortality: 1, cdc: 0.267, cac: 1.87 },
    { week: 2, product: 'PRE-INICIO 3', kilos: 192, mortality: 0, cdc: 0.327, cac: 4.15 },
    { week: 3, product: 'PRE-INICIO 3', kilos: 261, mortality: 1, cdc: 0.444, cac: 7.35 },
    { week: 4, product: 'INICIO', kilos: 355, mortality: 0, cdc: 0.611, cac: 11.63 },
    { week: 5, product: 'INICIO', kilos: 525, mortality: 0, cdc: 0.904, cac: 17.95 },
    { week: 6, product: 'INICIO', kilos: 650, mortality: 0, cdc: 1.119, cac: 25.78 },
    { week: 7, product: 'INICIO', kilos: 735, mortality: 1, cdc: 1.265, cac: 35.06 },
  ]
};

export function BatchStageReportView() {
  const { batchId, batchStageId } = useParams();
  const theme = useTheme();

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[
          { name: 'Lotes', href: '/batches' },
          { name: 'Etapas', href: `/batches/${batchId}/batch-stages` },
          { name: 'Detalles', href: `/batches/${batchId}/batch-stages/${batchStageId}` },
          { name: 'Informe' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Resumen General Banner */}
        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              p: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              color: 'primary.contrastText',
              boxShadow: theme.shadows[8]
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1.2 }}>
                  EVALUACIÓN CONSUMO DE ALIMENTO
                </Typography>
                <Typography variant="h3" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Etapa {MOCK_REPORT_DATA.stage_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, opacity: 0.9 }}>
                  <Iconify icon="solar:tag-horizontal-bold-duotone" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Lote #{MOCK_REPORT_DATA.batch_number}</Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.8 }}>Fechas</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{MOCK_REPORT_DATA.start_date} - {MOCK_REPORT_DATA.end_date}</Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.8 }}>No. Cerdos</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{MOCK_REPORT_DATA.initial_pigs}</Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, width: '1px', bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.8 }}>Mortalidad Total</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {MOCK_REPORT_DATA.total_mortality} <Typography component="span" variant="body2" sx={{ opacity: 0.8 }}>({MOCK_REPORT_DATA.total_mortality_percentage})</Typography>
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* KPIs Principales */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Peso Total Destete" value={`${MOCK_REPORT_DATA.weaning_total_weight} kg`} icon="solar:weight-bold-duotone" color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Peso Promedio Destete" value={`${MOCK_REPORT_DATA.weaning_avg_weight} kg`} icon="solar:chart-square-bold-duotone" color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Ganancia" value={MOCK_REPORT_DATA.total_gain} icon="solar:star-fall-minimalistic-2-bold-duotone" color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard title="Conversión" value={MOCK_REPORT_DATA.total_conversion} icon="solar:graph-up-bold-duotone" color="warning" />
        </Grid>

        {/* Desglose Semanal */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 2 }}>
            <Iconify icon="solar:calendar-date-bold-duotone" sx={{ mr: 1.5, color: 'primary.main', width: 28, height: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Desglose Semanal de Consumo</Typography>
          </Box>
          <Grid container spacing={3}>
            {MOCK_REPORT_DATA.weeks.map((week) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={week.week}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: theme.shadows[10],
                      borderColor: 'primary.light'
                    }
                  }}
                >
                  <CardHeader
                    title={`Semana ${week.week}`}
                    subheader={week.product}
                    sx={{
                      pb: 2,
                      bgcolor: 'background.neutral',
                      '& .MuiCardHeader-title': { typography: 'h6' },
                      '& .MuiCardHeader-subheader': {
                        color: week.product.includes('PRE-INICIO') ? 'secondary.main' : 'warning.main',
                        fontWeight: 'bold',
                        mt: 0.5
                      }
                    }}
                  />
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2.5}>
                      <RowLabel value={`${week.kilos} kg`} label="Consumo (Kilos)" icon="solar:box-bold-duotone" />
                      <RowLabel value={week.mortality} label="Mortalidad Cerdos" icon="solar:danger-triangle-bold-duotone" color={week.mortality > 0 ? 'error.main' : 'text.primary'} />
                      <RowLabel value={week.cdc} label="C / D / C" icon="solar:calculator-bold-duotone" />
                      <RowLabel value={week.cac} label="C / A / C" icon="solar:chart-square-bold-duotone" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function KpiCard({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' }) {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, fontWeight: '600' }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${color}.lighter`,
          color: `${color}.dark`
        }}
      >
        <Iconify icon={icon} width={32} />
      </Box>
    </Card>
  );
}

function RowLabel({ label, value, icon, color = 'text.primary' }: { label: string, value: string | number, icon: string, color?: string }) {
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
