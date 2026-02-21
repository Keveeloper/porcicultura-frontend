import { useForm } from 'react-hook-form';

import { 
  Box, 
  Stack,
  Dialog, 
  Button, 
  MenuItem, 
  TextField, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
} from '@mui/material';

import api from 'src/services/axios-instance/api';

import type { BatchStageResponse } from './types';

interface Props {
  batchId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateBatchStageModal({ batchId, open, onClose, onSuccess }: Props) {
    
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    formState: { errors }, 
  } = useForm({
    defaultValues: {
      batchId,
      stage_type: '',
      start_date: new Date().toISOString().split('T')[0],
      number_of_weeks: 7,
      initial_pigs: null,
      initial_batch_weight: null,
      initial_pig_weight: null,
    }
  });

  const watchInitialPigs = watch('initial_pigs');
  const watchInitialBatchWeight = watch('initial_batch_weight');
  const calculatedInitialPigWeight = (watchInitialPigs && watchInitialBatchWeight && watchInitialPigs > 0 && watchInitialBatchWeight > 0) 
    ? (watchInitialBatchWeight / watchInitialPigs).toFixed(2)
    : 0;

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        batchId,
        number_of_weeks: Number(data.number_of_weeks),
        initial_pigs: Number(data.initial_pigs),
        initial_batch_weight: Number(data.initial_batch_weight),
        initial_pig_weight: Number(calculatedInitialPigWeight),
      };
      console.log('Payload: ', payload);
      
      const response = await api.post<BatchStageResponse>('/batch-stages', payload);
      if (response) {
        reset();
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error al crear la etapa:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Crear Nueva Etapa</DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            
            <TextField
              select
              fullWidth
              label="Etapa"
              {...register('stage_type', { required: 'La etapa es obligatoria' })}
              error={!!errors.stage_type}
              helperText={errors.stage_type?.message}
            >
              <MenuItem value="pre-nursery">Precebo</MenuItem>
              <MenuItem value="growing">Levante</MenuItem>
              <MenuItem value="finishing">Engorde</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="Fecha de Inicio" 
                type="date" 
                InputLabelProps={{ shrink: true }}
                {...register('start_date', { required: 'Elija una fecha de inicio' })}
                error={!!errors.start_date}
                helperText={errors.start_date?.message}
              />
              <TextField 
                fullWidth 
                label="Semanas" 
                type="number" 
                {...register('number_of_weeks', { required: 'Las semanas son obligatorias' })}
                error={!!errors.number_of_weeks}
                helperText={errors.number_of_weeks?.message}
              />
            </Box>

            <TextField 
              fullWidth 
              label="Cerdos Iniciales" 
              type="number" 
              {...register('initial_pigs', { required: 'El número cerdos iniciales son obligatorios' })}
              error={!!errors.initial_pigs}
              helperText={errors.initial_pigs?.message}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="Peso Lote (kg)" 
                type="number" 
                inputProps={{ step: "0.01" }}
                {...register('initial_batch_weight', { required: 'El peso inicial del lote es obligatorio' })}
                error={!!errors.initial_batch_weight}
                helperText={errors.initial_batch_weight?.message}
              />
              <TextField 
                fullWidth 
                label="Peso Cerdo (kg)" 
                type="number" 
                value={calculatedInitialPigWeight}
                inputProps={{ step: "0.01", readOnly: true }}
                variant='filled'
                // {...register('initial_pig_weight', { required: true })}
              />
            </Box>

          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Guardar Etapa
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}