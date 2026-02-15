import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { 
  Box, Card, Stack, Typography, Tabs, Tab, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, TextField, 
  Button, Divider 
} from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function BatchStageDetailsView() {
  const { batchId } = useParams();
  const [currentWeek, setCurrentWeek] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentWeek(newValue);
  };

  return (
    <DashboardContent>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Suministro de alimentación</Typography>
          <Typography variant="body2" color="text.secondary">
            Lot #{batchId} • 7-Week Cycle
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<Iconify icon="solar:home-angle-bold-duotone" />}>
          Save Changes
        </Button>
      </Stack>

      {/* Main Layout Container (Simulando Grid con Box) */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3 
      }}>
        
        {/* Lado Izquierdo: 66.6% (equivalente a md:8) */}
        <Box sx={{ flex: { md: '0 0 66.666%' }, width: '100%' }}>
          <Stack spacing={3}>
            
            {/* Progress Card */}
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Current Progress: Week {currentWeek + 1} of 7</Typography>
              <Box sx={{ width: '100%', bgcolor: 'background.neutral', height: 8, borderRadius: 1, position: 'relative', mb: 1 }}>
                <Box sx={{ 
                  width: `${((currentWeek + 1) / 7) * 100}%`, 
                  bgcolor: 'primary.main', 
                  height: '100%', 
                  borderRadius: 1,
                  transition: 'width 0.4s ease'
                }} />
              </Box>
              <Stack direction="row" justifyContent="space-between">
                {[1, 2, 3, 4, 5, 6, 7].map((w) => (
                  <Typography key={w} variant="caption" sx={{ color: w <= currentWeek + 1 ? 'primary.main' : 'text.disabled', fontWeight: 'bold' }}>
                    W{w}
                  </Typography>
                ))}
              </Stack>
            </Card>

            {/* Weekly Table Card */}
            <Card>
              <Tabs 
                value={currentWeek} 
                onChange={handleTabChange} 
                variant="scrollable"
                sx={{ px: 2, pt: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                {[...Array(7)].map((_, i) => <Tab key={i} label={`Week ${i + 1}`} />)}
              </Tabs>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Day</TableCell>
                      <TableCell align="center">Feed Supply (kg)</TableCell>
                      <TableCell align="center">Mortality</TableCell>
                      <TableCell align="right">Pig Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <TableRow key={day} hover>
                        <TableCell sx={{ color: 'text.secondary' }}>02/{index + 16}/2026</TableCell>
                        <TableCell sx={{ fontWeight: '600' }}>{day}</TableCell>
                        <TableCell align="center">
                          <TextField size="small" type="number" sx={{ width: 90 }} inputProps={{ style: { textAlign: 'center' } }} />
                        </TableCell>
                        <TableCell align="center">
                          <TextField size="small" type="number" sx={{ width: 70 }} inputProps={{ style: { textAlign: 'center' } }} />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>105</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Stack>
        </Box>

        {/* Lado Derecho: 33.3% (equivalente a md:4) */}
        <Box sx={{ flex: { md: '1 1 auto' }, width: '100%' }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:home-angle-bold-duotone" width={24} /> Stage Results
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              <ResultItem label="Final Total Weight" value="2,581 kg" trend="+102kg vs target" trendColor="success.main" />
              <ResultItem label="Avg Weight / Pig" value="24.58 kg" />
              
              <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 1.5, border: '1px dashed', borderColor: 'primary.main' }}>
                <Typography variant="overline" display="block" sx={{ color: 'primary.darker' }}>FCR (Feed Conversion)</Typography>
                <Typography variant="h4" sx={{ color: 'primary.dark' }}>1.42</Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Target: &lt; 1.45</Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1.5, border: '1px dashed', borderColor: 'error.main' }}>
                <Typography variant="overline" display="block" sx={{ color: 'error.darker' }}>Total Mortality %</Typography>
                <Typography variant="h4" sx={{ color: 'error.dark' }}>3.7%</Typography>
                <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold' }}>4 deaths total</Typography>
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