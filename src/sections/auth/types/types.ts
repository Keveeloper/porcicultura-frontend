export interface GoogleLoginResponse {
  user: UserInterface;
  nestJsToken: string;
}

interface UserInterface {
    id: string;
    email: string;
    password: string;
}