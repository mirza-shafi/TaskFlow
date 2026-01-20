export declare class ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    constructor(success: boolean, data?: T, message?: string, error?: string);
    static success<T>(data: T, message?: string): ApiResponse<T>;
    static error(error: string, message?: string): ApiResponse;
}
//# sourceMappingURL=ApiResponse.d.ts.map