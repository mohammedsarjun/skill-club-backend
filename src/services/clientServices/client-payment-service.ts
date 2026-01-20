import { injectable, inject } from 'tsyringe';
import mongoose, { Types } from 'mongoose';
import { IClientPaymentService } from './interfaces/client-payment-service.interface';
import {
  InitiatePaymentDTO,
  PaymentResponseDTO,
  PaymentCallbackDTO,
  PaymentVerificationDTO,
} from '../../dto/clientDTO/client-payment.dto';
import { IContractRepository } from '../../repositories/interfaces/contract-repository.interface';
import { IPaymentRepository } from '../../repositories/interfaces/payment-repository.interface';
import { IContractTransactionRepository } from '../../repositories/interfaces/contract-transaction-repository.interface';
import { IClientWalletRepository } from '../../repositories/interfaces/client-wallet-repository.interface';
import { PayUService } from '../../utils/payu.service';
import AppError from '../../utils/app-error';
import { HttpStatus } from '../../enums/http-status.enum';
import { mapPaymentToResponseDTO } from '../../mapper/clientMapper/client-payment.mapper';
import { PaymentAmountStrategyFactory } from './factories/paymentFactories/PaymentAmountStrategyFactory';
@injectable()
export class ClientPaymentService implements IClientPaymentService {
  constructor(
    @inject('IContractRepository') private contractRepository: IContractRepository,
    @inject('IPaymentRepository') private paymentRepository: IPaymentRepository,
    @inject('IContractTransactionRepository')
    private contractTransactionRepository: IContractTransactionRepository,
    @inject('IClientWalletRepository') private clientWalletRepository: IClientWalletRepository,
    @inject('PaymentAmountStrategyFactory')
    private paymentAmountStrategyFactory: PaymentAmountStrategyFactory,
    private payuService: PayUService,
  ) {}

  async initiatePayment(clientId: string, data: InitiatePaymentDTO): Promise<PaymentResponseDTO> {
    const contract = await this.contractRepository.findById(data.contractId);

    if (!contract) {
      throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
    }

    if (contract.clientId.toString() !== clientId) {
      throw new AppError('Unauthorized to fund this contract', HttpStatus.FORBIDDEN);
    }

    if (contract.status !== 'pending_funding' && contract.paymentType === 'fixed') {
      throw new AppError('Contract is not in pending_funding state', HttpStatus.BAD_REQUEST);
    }

    let expectedAmount = 0;
    const expectedAmountCalculateStrategy = this.paymentAmountStrategyFactory.getStrategy(
      contract.paymentType,
    );
    if (contract.paymentType === 'hourly') {
      if (!(data.amount > 0)) {
        throw new AppError('Invalid payment amount', HttpStatus.BAD_REQUEST);
      }
      expectedAmount = data.amount;
    } else if (contract.paymentType === 'fixed_with_milestones') {
      if (data.purpose === 'milestone_funding') {
        expectedAmount = expectedAmountCalculateStrategy.calculate({
          contract,
          milestoneId: data.milestoneId,
        });
      } else {
        expectedAmount = contract.budget || 0;
      }
      if (Math.abs(data.amount - expectedAmount) > 0.01) {
        throw new AppError(
          `Invalid payment amount. Expected: ${expectedAmount}, Received: ${data.amount}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      expectedAmount = expectedAmountCalculateStrategy.calculate({ contract });
      if (Math.abs(data.amount - expectedAmount) > 0.01) {
        throw new AppError(
          `Invalid payment amount. Expected: ${expectedAmount}, Received: ${data.amount}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    console.log(contract.paymentType, expectedAmount);

    const gatewayOrderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const payment = await this.paymentRepository.createPayment({
      contractId: contract._id as Types.ObjectId,
      isMilestonePayment: data.purpose === 'milestone_funding',
      milestoneId:
        data.purpose === 'milestone_funding' && data.milestoneId
          ? (new Types.ObjectId(data.milestoneId) as Types.ObjectId)
          : undefined,
      clientId: new Types.ObjectId(clientId),
      freelancerId: contract.freelancerId as Types.ObjectId,
      amount: data.amount,
      gateway: 'payu',
      purpose: data.purpose,
      status: 'pending',
      gatewayOrderId,
    });

    const backendBaseRaw =
      process.env.BACKEND_URL ||
      process.env.API_URL ||
      `http://localhost:${process.env.PORT || 5000}`;
    const backendBase = String(backendBaseRaw || `http://localhost:${process.env.PORT || 5000}`);
    const callbackEndpoint = `${backendBase.replace(/\/$/, '')}/api/client/payments/callback`;

    const payuConfig = {
      key: this.payuService.getMerchantKey(),
      txnid: payment.paymentId,
      amount: payment.amount.toString(),
      productinfo: `${contract.paymentType} contract funding`,
      firstname: 'Client',
      email: 'client@example.com',
      phone: '9999999999',
      surl: callbackEndpoint,
      furl: callbackEndpoint,
      notify_url: callbackEndpoint,
      hash: '',
      udf1: contract?._id?.toString() as string,
      udf2: '',
      udf3: '',
      udf4: '',
      udf5: '',
    };

    const hashParams = {
      key: payuConfig.key,
      txnid: payuConfig.txnid,
      amount: payuConfig.amount,
      productinfo: payuConfig.productinfo,
      firstname: payuConfig.firstname,
      email: payuConfig.email,
      udf1: payuConfig.udf1,
      udf2: payuConfig.udf2,
      udf3: payuConfig.udf3,
      udf4: payuConfig.udf4,
      udf5: payuConfig.udf5,
      udf6: '',
      udf7: '',
      udf8: '',
      udf9: '',
      udf10: '',
    };

    payuConfig.hash = this.payuService.generateHash(hashParams);
    return mapPaymentToResponseDTO(payment, payuConfig, this.payuService.getPayUUrl());
  }
  async handlePaymentCallback(data: PaymentCallbackDTO): Promise<PaymentVerificationDTO> {
    // -------------------------------
    // 1. Basic validation
    // ------------------------------

    if (!data.status || !data.txnid || !data.mihpayid) {
      throw new AppError('Invalid payment callback data', HttpStatus.BAD_REQUEST);
    }

    if (
      !data.key ||
      !data.amount ||
      !data.productinfo ||
      !data.firstname ||
      !data.email ||
      !data.hash
    ) {
      throw new AppError(
        'Invalid payment callback data (missing verification fields)',
        HttpStatus.BAD_REQUEST,
      );
    }

    // -------------------------------
    // 2. Verify PayU hash (OUTSIDE TX)
    // -------------------------------
    const isValid = this.payuService.verifyHash({
      status: data.status,
      key: data.key,
      txnid: data.txnid,
      amount: data.amount,
      productinfo: data.productinfo,
      firstname: data.firstname,
      email: data.email,
      udf1: data.udf1,
      udf2: data.udf2,
      udf3: data.udf3,
      udf4: data.udf4,
      udf5: data.udf5,
      hash: data.hash,
    });

    if (!isValid) {
      throw new AppError('Invalid payment hash', HttpStatus.BAD_REQUEST);
    }

    // -------------------------------
    // 3. Fetch payment
    // -------------------------------
    const payment = await this.paymentRepository.findByPaymentId(data.txnid);
    if (!payment) {
      throw new AppError('Payment not found', HttpStatus.NOT_FOUND);
    }

    const paymentStatus = data.status === 'success' ? 'success' : 'failed';

    // -------------------------------
    // 4. Start MongoDB transaction
    // -------------------------------

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // -------------------------------
      // 5. Update payment status
      // -------------------------------
      await this.paymentRepository.updatePaymentStatus(
        payment.paymentId,
        paymentStatus,
        data as unknown as Record<string, unknown>,
        data.mihpayid,
        session,
      );

      // -------------------------------
      // 6. SUCCESS FLOW
      // -------------------------------
      if (paymentStatus === 'success') {
        const contract = await this.contractRepository.findById(
          payment.contractId.toString(),
          session,
        );

        if (!contract) {
          throw new AppError('Contract not found', HttpStatus.NOT_FOUND);
        }

        // Update funded amount
        const updateData: Partial<{ fundedAmount: number; balance: number; isFunded: boolean }> = {
          fundedAmount: (contract.fundedAmount || 0) + payment.amount,
          balance: (contract.balance || 0) + payment.amount,
        };

        if (contract.paymentType === 'fixed') {
          updateData.isFunded = true;
        }

        const updateContract = await this.contractRepository.updateById(
          payment.contractId.toString(),
          updateData,
          session,
        );

        if (updateContract?.paymentType === 'hourly') {
          console.log(updateContract.estimatedHoursPerWeek, updateContract.hourlyRate, updateContract.balance);
          if (
            updateContract.estimatedHoursPerWeek! * (updateContract.hourlyRate || 0) >
            (updateContract.balance || 0)
          ) {
      
            await this.contractRepository.updateStatusById(
              payment.contractId.toString(),
              'held',
              session,
            );
          } else {
       
            // Activate contract
            await this.contractRepository.updateStatusById(
              payment.contractId.toString(),
              'active',
              session,
            );
          }
        } else {
          // Activate contract
          await this.contractRepository.updateStatusById(
            payment.contractId.toString(),
            'active',
            session,
          );
        }

        // Milestone handling
        if (payment.purpose === 'milestone_funding' && payment.milestoneId) {
          await this.contractRepository.updateMilestoneStatus(
            payment.contractId.toString(),
            payment.milestoneId.toString(),
            'funded',
            session,
          );

          await this.contractRepository.updateMilestoneFundedAmount(
            payment.contractId.toString(),
            payment.milestoneId.toString(),
            session,
        
          );
        }



        // -------------------------------
        // 7. Contract transaction creation (replaces escrow + transaction)
        // -------------------------------
        await this.contractTransactionRepository.createTransaction(
          {
            contractId: payment.contractId as Types.ObjectId,
            paymentId: payment._id as Types.ObjectId,
            milestoneId: payment.milestoneId,
            clientId: payment.clientId as Types.ObjectId,
            freelancerId: payment.freelancerId as Types.ObjectId,
            amount: payment.amount,
            purpose: 'funding',
            description: `Funding for ${payment.purpose}`,
          },
          session,
        );

        // -------------------------------
        // 8. Update/Create client wallet
        // -------------------------------
        const existingWallet = await this.clientWalletRepository.findByClientId(
          payment.clientId.toString(),
        );

        if (existingWallet) {
          await this.clientWalletRepository.updateBalance(
            payment.clientId.toString(),
            payment.amount,
            session,
          );
          await this.clientWalletRepository.incrementTotalFunded(
            payment.clientId.toString(),
            payment.amount,
            session,
          );
        } else {
          await this.clientWalletRepository.createWallet(payment.clientId.toString(), session);
          await this.clientWalletRepository.updateBalance(
            payment.clientId.toString(),
            payment.amount,
            session,
          );
          await this.clientWalletRepository.incrementTotalFunded(
            payment.clientId.toString(),
            payment.amount,
            session,
          );
        }
      }

      // -------------------------------
      // 9. Commit transaction
      // -------------------------------
      await session.commitTransaction();

      return {
        paymentId: payment.paymentId,
        status: paymentStatus,
        gatewayTransactionId: data.mihpayid,
        contractId: payment.contractId.toString(),
      };
    } catch (error) {
      // -------------------------------
      // 10. Rollback
      // -------------------------------
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
