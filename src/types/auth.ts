export interface SignUpFormData {
  fullName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
}
