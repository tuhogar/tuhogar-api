import { HttpStatus } from "@nestjs/common";

export const HttpStatusDescriptions = {
    [HttpStatus.OK]: 'OK',
    [HttpStatus.CREATED]: 'Created',
    [HttpStatus.ACCEPTED]: 'Accepted',
    [HttpStatus.NO_CONTENT]: 'No Content',
    [HttpStatus.BAD_REQUEST]: 'Bad Request',
    [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
    [HttpStatus.FORBIDDEN]: 'Forbidden',
    [HttpStatus.NOT_FOUND]: 'Not Found',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [HttpStatus.NOT_IMPLEMENTED]: 'Not Implemented',
    [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
    [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
  };
  