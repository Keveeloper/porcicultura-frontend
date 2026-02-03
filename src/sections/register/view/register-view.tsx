import { useState, useCallback } from 'react';
import axios, { type AxiosError } from 'axios';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import api from 'src/services/axios-instance/api';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function RegisterView() {
  const router = useRouter();
  const [ companyName, setCompanyName ] = useState('');
  const [ nit, setNit ] = useState('');

  const handleRegister = useCallback(async () => {
    try {
      const response = await api.post('/companies', {
        name: companyName,
        nit
      }, {});
      console.log('Register response: ', response);
      if (response.data.company) {
        router.push('/');
      }

    } catch (e) {
      console.error('Error al registrar la empresa: ', e);
      if (axios.isAxiosError(e)) {
        const axiosError = e as AxiosError<{ message: string }>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message;
        console.log(errorMessage);
      }
    }
  }, [nit, companyName, router]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      <TextField
        fullWidth
        name="company_name"
        label="Nombre o razón social"
        placeholder='Ingrese el nombre de su empresa...'
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />
      <TextField
        fullWidth
        name="nit"
        label="NIT"
        placeholder='Ingrese el NIT de su empresa...'
        value={nit}
        onChange={(e) => setNit(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />
      <Button
        fullWidth
        startIcon={<Iconify icon="mingcute:add-line" width={20} />}
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleRegister}
      >
        Registrarse
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Registra tu empresa</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Vamos a registrar los datos de tu
          <Link variant="subtitle2" sx={{ ml: 0.5 }}>
            Granja
          </Link>
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}
