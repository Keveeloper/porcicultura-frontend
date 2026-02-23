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

// import type { BatchStageResponse } from './types';

interface Props {
  batchId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateBatchStageDetailsModal({ batchId, open, onClose, onSuccess }: Props) {
    
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    formState: { errors }, 
  } = useForm({
    defaultValues: {
      final_batch_weight: '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        final_batch_weight: Number(data.final_batch_weight),
      };
      console.log('Payload: ', payload);
      
    //   const response = await api.post<BatchStageResponse>('/batch-stages', payload);
    //   if (response) {
    //     reset();
    //     if (onSuccess) onSuccess();
    //     onClose();
    //   }
    } catch (error) {
      console.error('Error al crear la etapa:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Finalización de Etapa</DialogTitle>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField 
                fullWidth 
                label="Peso final de lote (kg)" 
                type="number" 
                {...register('final_batch_weight', { required: 'El peso final del lote es obligatorio' })}
                error={!!errors.final_batch_weight}
                helperText={errors.final_batch_weight?.message}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}