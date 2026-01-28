export interface User {
  id: string;
  email: string;
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

