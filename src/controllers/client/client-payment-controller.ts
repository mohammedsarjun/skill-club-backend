import { Request, Response, NextFunction } from 'express';
import { IClientPaymentService } from '../../services/clientServices/interfaces/client-payment-service.interface';
import { inject, injectable } from 'tsyringe';
import { HttpStatus } from '../../enums/http-status.enum';
import { InitiatePaymentDTO, PaymentCallbackDTO } from '../../dto/clientDTO/client-payment.dto';

@injectable()
export class ClientPaymentController {
  constructor(@inject('IClientPaymentService') private paymentService: IClientPaymentService) {}

  initiatePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const clientId = req.user?.userId;
      if (!clientId) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }

      const data: InitiatePaymentDTO = req.body;
      const result = await this.paymentService.initiatePayment(clientId, data);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Payment initiated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  handleCallback = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const data: PaymentCallbackDTO = req.body;
      console.log(data);
      // Log callback data for debugging
      // console.log('PayU Callback received:', {
      //   status: data.status,
      //   txnid: data.txnid,
      //   mihpayid: data.mihpayid,
      //   udf1: data.udf1,
      // });

      // Process the payment callback (verify hash, update DB, activate contract if success)
      const result = await this.paymentService.handlePaymentCallback(data);

      console.log('Payment processed:', result);

      // Redirect based on payment result
      const paymentStatus = result.status === 'success' ? 'success' : 'failed';
      const redirectUrl = `${frontendUrl}/client/contracts/${result.contractId}?payment=${paymentStatus}`;

      console.log('Redirecting to (sending 303 + HTML fallback):', redirectUrl);

      // Prefer HTTP 303 See Other so user agents follow with GET.
      // Some gateways correctly respect 303 and will perform a GET to the Location.
      // We also include an HTML fallback (meta-refresh + JS) for clients that
      // don't follow 303 in the way we expect.
      res.status(303).setHeader('Location', redirectUrl).contentType('text/html')
        .send(`<!doctype html>
            <html>
              <head>
                <meta charset="utf-8" />
                <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
                <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
                <title>Redirecting...</title>
              </head>
              <body>
                If you are not redirected automatically, <a href="${redirectUrl}">click here</a>.
              </body>
            </html>
          `);
    } catch (error) {
      // On any error (invalid hash, payment not found, etc.), redirect with failed status
      console.error('Payment callback error:', error);

      // Try to get contractId from udf1 or txnid (fallback)
      const contractId = req.body.udf1 || '';

      if (contractId) {
        const redirectUrl = `${frontendUrl}/client/contracts/${contractId}?payment=failed`;
        console.log('Error redirect to (sending 303 + HTML fallback):', redirectUrl);
        res.status(303).setHeader('Location', redirectUrl).contentType('text/html')
          .send(`<!doctype html>
              <html>
                <head>
                  <meta charset="utf-8" />
                  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
                  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
                  <title>Redirecting...</title>
                </head>
                <body>
                  If you are not redirected automatically, <a href="${redirectUrl}">click here</a>.
                </body>
              </html>
            `);
      } else {
        // If no contractId found, redirect to contracts list
        const redirectUrl = `${frontendUrl}/client/contracts?payment=failed`;
        console.log('Fallback redirect to contracts list (sending 303 + HTML fallback)');
        res.status(303).setHeader('Location', redirectUrl).contentType('text/html')
          .send(`<!doctype html>
              <html>
                <head>
                  <meta charset="utf-8" />
                  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
                  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
                  <title>Redirecting...</title>
                </head>
                <body>
                  If you are not redirected automatically, <a href="${redirectUrl}">click here</a>.
                </body>
              </html>
            `);
      }
    }
  };
}
