import { useCallback } from 'react';
import { FirebaseError } from 'firebase/app';
import axios, { type AxiosError } from 'axios';
import { signInWithPopup } from 'firebase/auth';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import api from 'src/services/axios-instance/api';
// import firebaseConfig from 'src/firebase-config/firebase-config';
import { auth, googleProvider } from 'src/firebase-config/firebase-config';

import { Iconify } from 'src/components/iconify';

import { useAuthStore } from 'src/auth/auth-store';

import type { User } from './types/types';


// ----------------------------------------------------------------------
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const googleProvider = new GoogleAuthProvider();
// googleProvider.setCustomParameters({
//   prompt: 'select_account',
// });

export function SignInView() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleSignIn = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseIdToken = await result.user.getIdToken();
      const userData = await api.post<User>('/auth/google/login', {}, {
        headers: { 'Authorization': `Bearer ${firebaseIdToken}` },
      });
      console.log('userData: ', userData);
      console.log('firebaseIdToken: ', firebaseIdToken);
      
      setUser(userData);      
      if (userData?.company !== null && userData?.company !== undefined) {        
        router.push('/');
      }else{
        router.push('/register');
      }
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
  }, [router, setUser]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      {/* <TextField
        fullWidth
        name="email"
        label="Email address"
        defaultValue="hello@gmail.com"
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      /> */}

      {/* <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
        Forgot password?
      </Link> */}

      {/* <TextField
        fullWidth
        name="password"
        label="Password"
        defaultValue="@demo1234"
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      /> */}

      <Button
        fullWidth
        startIcon={<Iconify icon="socials:google" width={20} />}
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
      >
        Iniciar con google
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
        <Typography variant="h5">Iniciar sesión</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Vamos a iniciar sesión con
          <Link variant="subtitle2" sx={{ ml: 0.5 }}>
            Google
          </Link>
        </Typography>
      </Box>
      {renderForm}
      {/* <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider> */}
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
