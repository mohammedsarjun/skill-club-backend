import { IBankDetails } from '../../models/interfaces/bank-details.model.interface';
import {  UserBankDTO } from '../../dto/commonDTO/user-bank.dto';

export const mapBankToDTO = (bank: IBankDetails): UserBankDTO => ({
  userId: bank.userId.toString(),
  accountHolderName: bank.accountHolderName,
  bankName: bank.bankName,
  accountNumber: bank.accountNumber,
  ifscCode: bank.ifscCode,
  accountType: bank.accountType,
  verified: !!bank.verified,
});
