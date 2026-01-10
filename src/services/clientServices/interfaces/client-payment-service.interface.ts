import {
  InitiatePaymentDTO,
  PaymentResponseDTO,
  PaymentCallbackDTO,
  PaymentVerificationDTO,
} from '../../../dto/clientDTO/client-payment.dto';

export interface IClientPaymentService {
  initiatePayment(clientId: string, data: InitiatePaymentDTO): Promise<PaymentResponseDTO>;
  handlePaymentCallback(data: PaymentCallbackDTO): Promise<PaymentVerificationDTO>;
}
