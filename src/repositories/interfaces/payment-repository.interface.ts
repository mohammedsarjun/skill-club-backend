import BaseRepository from '../baseRepositories/base-repository';
import { IPayment } from '../../models/interfaces/payment.model.interface';
import { ITransaction } from '../../models/interfaces/transaction.model.interface';
import { IEscrow } from '../../models/interfaces/escrow.model.interface';
import { ClientSession } from 'mongoose';

export interface IPaymentRepository extends BaseRepository<IPayment> {
  createPayment(data: Partial<IPayment>): Promise<IPayment>;
  findByPaymentId(paymentId: string): Promise<IPayment | null>;
  findByGatewayOrderId(gatewayOrderId: string): Promise<IPayment | null>;
  updatePaymentStatus(
    paymentId: string,
    status: IPayment['status'],
    gatewayResponse?: Record<string, unknown>,
    gatewayTransactionId?: string,
    session?: ClientSession,
  ): Promise<IPayment | null>;
}

export interface ITransactionRepository extends BaseRepository<ITransaction> {
  createTransaction(data: Partial<ITransaction>, session?: ClientSession): Promise<ITransaction>;
  findByContractId(contractId: string): Promise<ITransaction[]>;
}

export interface IEscrowRepository extends BaseRepository<IEscrow> {
  createEscrow(data: Partial<IEscrow>, session?: ClientSession): Promise<IEscrow>;
  findByContractId(contractId: string): Promise<IEscrow[]>;
  findOneByContractIdAndStatus(contractId: string, status: IEscrow['status']): Promise<IEscrow | null>;
  findByContractAndMilestone(contractId: string, milestoneId: string): Promise<IEscrow | null>;
  updateEscrowStatus(escrowId: string, status: IEscrow['status']): Promise<IEscrow | null>;
  releaseEscrow(escrowId: string): Promise<IEscrow | null>;
}
