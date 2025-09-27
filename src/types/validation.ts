export interface ZodError {
  errors?: Array<{
    path: (string | number)[];
    message: string;
  }>;
  issues?: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

export interface FieldErrors {
  [key: string]: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}
