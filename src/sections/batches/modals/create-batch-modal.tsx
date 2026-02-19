import { useForm } from 'react-hook-form';

import { 
  Box, 
  Stack,
  Dialog, 
  Button,
  TextField, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
} from '@mui/material';

import api from 'src/services/axios-instance/api';

import type { BatchResponse } from '../view';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateBatchModal({ open, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      batch_number: '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        batch_number: data.batch_number,
      };

      const response = await api.post<BatchResponse>('/batches', payload);
      if (response) {
        reset();
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error al crear el lote:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Creación de lote o cochera</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                fullWidth 
                label="Código del lote" 
                type="text" 
                {...register('batch_number', { required: true })}
              />
            </Box>
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