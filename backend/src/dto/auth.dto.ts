// Data Transfer Objects for Authentication

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  name: string;
  email: string;
}

// Runtime validation helpers
export const validateLoginDto = (data: any): data is LoginDto => {
  return (
    typeof data.email === 'string' &&
    typeof data.password === 'string' &&
    data.email.length > 0 &&
    data.password.length > 0
  );
};

export const validateRegisterDto = (data: any): data is RegisterDto => {
  return (
    typeof data.name === 'string' &&
    typeof data.email === 'string' &&
    typeof data.password === 'string' &&
    data.name.length > 0 &&
    data.email.length > 0 &&
    data.password.length > 0
  );
};
