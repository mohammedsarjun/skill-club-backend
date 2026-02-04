import { IBankDetails } from '../../models/interfaces/bank-details.model.interface';
import { ClientBankDTO } from '../../dto/clientDTO/client-bank.dto';

export const mapBankToDTO = (bank: IBankDetails): ClientBankDTO => ({
  userId: bank.userId.toString(),
  accountHolderName: bank.accountHolderName,
  bankName: bank.bankName,
  accountNumber: bank.accountNumber,
  ifscCode: bank.ifscCode,
  accountType: bank.accountType,
  verified: !!bank.verified,
});
