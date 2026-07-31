export interface ValidationDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: ValidationDetail[],
  ) {
    super(message);
  }
}
