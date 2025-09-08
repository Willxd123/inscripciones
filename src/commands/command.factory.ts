import { ICommand } from './interfaces/command.interface';
import { v4 as uuidv4 } from 'uuid';

export class CommandFactory {
  static create(resource: string, operation: string, data: any, requestId: string): ICommand {
    return {
      // type: `${resource}.${operation}`, // Eliminar esta línea
      resource,
      operation, 
      data,
      requestId,
      timestamp: new Date(),
    };
  }
}