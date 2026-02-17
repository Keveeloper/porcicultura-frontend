export interface RegisterResponse {
  message: string,
  company: Company;
}

interface Company {
  id: string;
  name: string;
  nit: string;
}