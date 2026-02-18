import BaseRepository from './baseRepositories/base-repository';
import { Payment } from '../models/payment.model';
import { Transaction } from '../models/transaction.model';
import { Escrow } from '../models/escrow.model';
import { IPayment } from '../models/interfaces/payment.model.interface';
import { ITransaction } from '../models/interfaces/transaction.model.interface';
import { IEscrow } from '../models/interfaces/escrow.model.interface';
import {
  IPaymentRepository,
  ITransactionRepository,
  IEscrowRepository,
} from './interfaces/payment-repository.interface';
import { Types, ClientSession } from 'mongoose';

export class PaymentRepository extends BaseRepository<IPayment> implements IPaymentRepository {
  constructor() {
    super(Payment);
  }

  async createPayment(data: Partial<IPayment>): Promise<IPayment> {
    return await this.create(data);
  }

  async findByPaymentId(paymentId: string): Promise<IPayment | null> {
    return await this.model.findOne({ paymentId }).exec();
  }

  async findByGatewayOrderId(gatewayOrderId: string): Promise<IPayment | null> {
    return await this.model.findOne({ gatewayOrderId }).exec();
  }

  async updatePaymentStatus(
    paymentId: string,
    status: IPayment['status'],
    gatewayResponse?: Record<string, unknown>,
    gatewayTransactionId?: string,
    session?: ClientSession,
  ): Promise<IPayment | null> {
    const updateData: Partial<IPayment> = { status };
    if (gatewayResponse) {
      updateData.gatewayResponse = gatewayResponse;
    }
    if (gatewayTransactionId) {
      updateData.gatewayTransactionId = gatewayTransactionId;
    }
    const query = this.model.findOneAndUpdate({ paymentId }, updateData, { new: true });
    if (session) {
      query.session(session);
    }
    return await query.exec();
  }
}

export class TransactionRepository
  extends BaseRepository<ITransaction>
  implements ITransactionRepository
{
  constructor() {
    super(Transaction);
  }

  async createTransaction(
    data: Partial<ITransaction>,
    session?: ClientSession,
  ): Promise<ITransaction> {
    return await this.create(data, session);
  }

  async findByContractId(contractId: string): Promise<ITransaction[]> {
    return await this.model.find({ contractId }).sort({ createdAt: -1 }).exec();
  }
}

export class EscrowRepository extends BaseRepository<IEscrow> implements IEscrowRepository {
  constructor() {
    super(Escrow);
  }

  async createEscrow(data: Partial<IEscrow>, session?: ClientSession): Promise<IEscrow> {
    return await this.create(data, session);
  }

  async findByContractId(contractId: string): Promise<IEscrow[]> {
    return await this.model.find({ contractId }).sort({ createdAt: -1 }).exec();
  }

  async findOneByContractIdAndStatus(
    contractId: string,
    status: IEscrow['status'],
  ): Promise<IEscrow | null> {
    return await this.model.findOne({ contractId, status }).exec();
  }

  async findByContractAndMilestone(
    contractId: string,
    milestoneId: string,
  ): Promise<IEscrow | null> {
    return await this.model
      .findOne({
        contractId: new Types.ObjectId(contractId),
        milestoneId: new Types.ObjectId(milestoneId),
      })
      .exec();
  }

  async updateEscrowStatus(escrowId: string, status: IEscrow['status']): Promise<IEscrow | null> {
    const updateData: Partial<IEscrow> = { status };

    if (status === 'released') {
      updateData.releasedAt = new Date();
    } else if (status === 'refunded') {
      updateData.refundedAt = new Date();
    }

    return await this.model.findOneAndUpdate({ escrowId }, updateData, { new: true }).exec();
  }

  async releaseEscrow(escrowId: string): Promise<IEscrow | null> {
    return await this.model
      .findOneAndUpdate({ escrowId }, { status: 'released', releasedAt: new Date() }, { new: true })
      .exec();
  }
}
