import { useState, useCallback } from 'react';
import axios, { type AxiosError } from 'axios';
import { FirebaseError, initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import api from 'src/services/axios-instance/api';
import firebaseConfig from 'src/firebase-config/firebase-config';

import { Iconify } from 'src/components/iconify';

// import { GoogleLoginResponse } from 'src/sections/auth';

// ----------------------------------------------------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export function RegisterView() {
  const router = useRouter();  

  const handleSignIn = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseIdToken = await result.user.getIdToken();
      console.log('Login con Google exitoso. ID Token:', firebaseIdToken);

      // const response = await api.post<GoogleLoginResponse>('/auth/google/login', {}, {
      //   headers: {
      //     'Authorization': `Bearer ${firebaseIdToken}`, 
      //   },
      // });
      // console.log('response: ', response);

      // router.push('/');

    } catch (e) {
      console.error('Error durante el inicio de sesión con Google:', e);
      // --- Manejo de errores de Firebase ---
      if (e instanceof FirebaseError) {
        if (e.code === 'auth/popup-closed-by-user') {
          console.log('Proceso de inicio de sesión cancelado.');
        } else {
          console.log(`Error de Firebase: ${e.message}`);
        }
        return; // Salir del catch
      }

      // --- Manejo de errores de Axios (Errores HTTP del Backend) ---
      // Usamos type guards de Axios para verificar si es un error HTTP
      if (axios.isAxiosError(e)) {
        const axiosError = e as AxiosError;
        if (axiosError.response) {
          // El backend respondió con un estado fuera de 2xx (ej. 401 Unauthorized)
          const errorMessage = axiosError.message || `Error del Servidor (${axiosError.response.status}).`;
          console.log(errorMessage);
          return;
        }
      }
    }
  }, [router]);

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
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />      
      {/* <Divider sx={{ mb: 3, width: '100%', '&::before, &::after': { borderTopStyle: 'dashed' } }}/> */}
      <Button
        fullWidth
        startIcon={<Iconify icon="mingcute:add-line" width={20} />}
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
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
      {/* <Box
        sx={{
          gap: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:google" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:github" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:twitter" />
        </IconButton>
      </Box> */}
    </>
  );
}
