export interface GoogleLoginResponse {
  accessToken: string;
  userResponse: UserResponseInterface;
}

interface UserResponseInterface {
  id: string;
  email: string
  company: CompanyInterface | null; 
  googleId: string;
  createdAt: string;
  updatedAt: string;
  profile: ProfileInterface;
}

interface CompanyInterface {
  id: string;
  name: string;
  nit: string;
}

interface ProfileInterface {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

