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
export declare const validateLoginDto: (data: any) => data is LoginDto;
export declare const validateRegisterDto: (data: any) => data is RegisterDto;
//# sourceMappingURL=auth.dto.d.ts.map