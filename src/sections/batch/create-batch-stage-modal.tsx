import { useForm } from 'react-hook-form';

import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Box, Stack 
} from '@mui/material';

import api from 'src/services/axios-instance/api';

interface Props {
  batchId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateStageModal({ batchId, open, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      batchId,
      stage_type: 'growing',
      start_date: new Date().toISOString().split('T')[0],
      number_of_weeks: 1,
      initial_pigs: 0,
      initial_batch_weight: 0,
      initial_pig_weight: 0,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        batchId,
        number_of_weeks: Number(data.number_of_weeks),
        initial_pigs: Number(data.initial_pigs),
        initial_batch_weight: Number(data.initial_batch_weight),
        initial_pig_weight: Number(data.initial_pig_weight),
      };

      await api.post('/batch-stages', payload);
      reset();
      if (onSuccess) onSuccess();
      onClose();
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
              label="Tipo de Etapa"
              {...register('stage_type', { required: true })}
            >
              <MenuItem value="growing">Growing (Crecimiento)</MenuItem>
              <MenuItem value="finishing">Finishing (Engorde)</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="Fecha de Inicio" 
                type="date" 
                InputLabelProps={{ shrink: true }}
                {...register('start_date', { required: true })}
              />
              <TextField 
                fullWidth 
                label="Semanas" 
                type="number" 
                {...register('number_of_weeks', { required: true })}
              />
            </Box>

            <TextField 
              fullWidth 
              label="Cerdos Iniciales" 
              type="number" 
              {...register('initial_pigs', { required: true })}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="Peso Lote (kg)" 
                type="number" 
                inputProps={{ step: "0.01" }}
                {...register('initial_batch_weight', { required: true })}
              />
              <TextField 
                fullWidth 
                label="Peso Cerdo (kg)" 
                type="number" 
                inputProps={{ step: "0.01" }}
                {...register('initial_pig_weight', { required: true })}
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