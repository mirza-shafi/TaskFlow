// Standardized API response structure
export class ApiResponse<T = any> {
  public success: boolean;
  public data?: T;
  public message?: string;
  public error?: string;

  constructor(success: boolean, data?: T, message?: string, error?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static error(error: string, message?: string): ApiResponse {
    return new ApiResponse(false, undefined, message, error);
  }
}
