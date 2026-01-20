import { LoginDto, RegisterDto, AuthResponseDto } from '@/dto/auth.dto';
export declare class AuthService {
    registerUser(data: RegisterDto): Promise<AuthResponseDto>;
    loginUser(data: LoginDto): Promise<AuthResponseDto>;
    private generateToken;
    verifyToken(token: string): any;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map