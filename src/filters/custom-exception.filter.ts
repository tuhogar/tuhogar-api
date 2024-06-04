import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { HttpStatusDescriptions } from './http-status-descriptions';


@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    
    let message = exception?.response?.message || exception.message || '';

    let customStatus = status;

    // Defina seus status code personalizados aqui
    if (typeof message === 'string') {
      const messageType = message.split('.')[0];

      switch (messageType) {
        case 'invalid':
          customStatus = HttpStatus.BAD_REQUEST; // 400
          break;
          case 'donotexists':
            customStatus = HttpStatus.NOT_FOUND; // 404
            break;
        default:
          customStatus = status;
          break;
      }

      message = [message];
    }

    const statusDescription = HttpStatusDescriptions[customStatus] || 'Unknown Status';

    response.status(customStatus).json({
      message: message,
      error: statusDescription,
      statusCode: customStatus,
    });
  }
}