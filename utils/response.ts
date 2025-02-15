export class Response<T> {
  message: string;
  data: T;
  statusCode: number;

  constructor(message: string, data: T, statusCode: number) {
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}