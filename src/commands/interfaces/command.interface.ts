export interface ICommand {
  requestId: string;
  resource: string;
  operation: string;
  data: any;           // Consistente con AsyncWrapperService
  timestamp: Date;
}