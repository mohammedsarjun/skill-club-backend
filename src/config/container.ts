import { container } from 'tsyringe';

//Week 1

//category,speacility,skills Repository
import { ICategoryRepository } from '../repositories/interfaces/category-repository.interface';
import { CategoryRepository } from '../repositories/category-repository';
import { ISpecialityRepository } from '../repositories/interfaces/speciality-repository.interface';
import { SpecialityRepository } from '../repositories/speciality-repository';
import { ISkillRepository } from '../repositories/interfaces/skill-repository.interface';
import { SkillRepository } from '../repositories/skill-repository';
import { IPortfolioRepository } from '../repositories/interfaces/portfolio-respository.interface';
import { PortfolioRepository } from '../repositories/portfolio-repository';
import { IActionVerificationRepository } from '../repositories/interfaces/action-verification-repository.interface';
import { ActionVerificationRepository } from '../repositories/action-verification-repository';
import { IJobRepository } from '../repositories/interfaces/job-repository.interface';
import { JobRepository } from '../repositories/job-repository';
import { IClientRepository } from '../repositories/interfaces/client-repository.interface';
import { ClientRepository } from '../repositories/client-repository';
import { IProposalRepository } from '../repositories/interfaces/proposal-repository.interface';
import { ProposalRepository } from '../repositories/proposal-repository';
import { IOfferRepository } from '../repositories/interfaces/offer-repository.interface';
import { OfferRepository } from '../repositories/offer-repository';
import { IContractRepository } from '../repositories/interfaces/contract-repository.interface';
import { ContractRepository } from '../repositories/contract-repository';
// import { IMeetingRepository } from 'src/repositories/interfaces/meeting-repository.interface';
// import { MeetingRepository } from 'src/repositories/meeting-repository';
import {
  IPaymentRepository,
  ITransactionRepository,
  IEscrowRepository,
} from '../repositories/interfaces/payment-repository.interface';
import {
  PaymentRepository,
  TransactionRepository,
  EscrowRepository,
} from '../repositories/payment-repository';
import { IContractTransactionRepository } from '../repositories/interfaces/contract-transaction-repository.interface';
import { ContractTransactionRepository } from '../repositories/contract-transaction-repository';
import { IClientWalletRepository } from '../repositories/interfaces/client-wallet-repository.interface';
import { ClientWalletRepository } from '../repositories/client-wallet-repository';
import { IFreelancerWalletRepository } from '../repositories/interfaces/freelancer-wallet-repository.interface';
import { FreelancerWalletRepository } from '../repositories/freelancer-wallet-repository';
import { IFileUploadService } from '../services/commonServices/interfaces/file-upload-service.interface';
import { FileUploadService } from '../services/commonServices/file-upload-service';
import { IGetRatesService } from '../services/commonServices/interfaces/get-rates-service.interface';
import { GetRatesService } from '../services/commonServices/get-rates-service';
import { IFileDownloadService } from '../services/commonServices/interfaces/file-download-service.interface';
import { FileDownloadService } from '../services/commonServices/file-download-service';
import { IMeetingStatusService } from '../services/commonServices/interfaces/meeting-status-service.interface';
import { MeetingStatusService } from '../services/commonServices/meeting-status-service';
import { IWorklogTransactionService } from '../services/commonServices/interfaces/worklog-transaction-service.interface';
import { WorklogTransactionService } from '../services/commonServices/worklog-transaction-service';
container.register<ICategoryRepository>('ICategoryRepository', { useClass: CategoryRepository });
container.register<ISpecialityRepository>('ISpecialityRepository', {
  useClass: SpecialityRepository,
});
container.register<ISkillRepository>('ISkillRepository', { useClass: SkillRepository });
container.register<IPortfolioRepository>('IPortfolioRepository', { useClass: PortfolioRepository });
container.register<IActionVerificationRepository>('IActionVerificationRepository', {
  useClass: ActionVerificationRepository,
});
container.register<IJobRepository>('IJobRepository', { useClass: JobRepository });
container.register<IClientRepository>('IClientRepository', { useClass: ClientRepository });
container.register<IProposalRepository>('IProposalRepository', { useClass: ProposalRepository });
container.register<IOfferRepository>('IOfferRepository', { useClass: OfferRepository });
container.register<IContractRepository>('IContractRepository', { useClass: ContractRepository });
import { IDisputeRepository } from '../repositories/interfaces/dispute-repository.interface';
import { DisputeRepository } from '../repositories/dispute-repository';
container.register<IDisputeRepository>('IDisputeRepository', { useClass: DisputeRepository });
import { ICancellationRequestRepository } from '../repositories/interfaces/cancellation-request-repository.interface';
import { CancellationRequestRepository } from '../repositories/cancellation-request-repository';
container.register<ICancellationRequestRepository>('ICancellationRequestRepository', { useClass: CancellationRequestRepository });
container.register<IPaymentRepository>('IPaymentRepository', { useClass: PaymentRepository });
container.register<ITransactionRepository>('ITransactionRepository', {
  useClass: TransactionRepository,
});
import { IMeetingRepository } from '../repositories/interfaces/meeting-repository.interface';
import { MeetingRepository } from '../repositories/meeting-repository';

container.register<IMeetingRepository>('IMeetingRepository', {
  useClass: MeetingRepository,
});
container.register<IEscrowRepository>('IEscrowRepository', { useClass: EscrowRepository });
container.register<IContractTransactionRepository>('IContractTransactionRepository', {
  useClass: ContractTransactionRepository,
});
container.register<IClientWalletRepository>('IClientWalletRepository', {
  useClass: ClientWalletRepository,
});
container.register<IFreelancerWalletRepository>('IFreelancerWalletRepository', {
  useClass: FreelancerWalletRepository,
});
container.register<IFileUploadService>('IFileUploadService', { useClass: FileUploadService });
container.register<IGetRatesService>('IGetRatesService', { useClass: GetRatesService });
container.register<IFileDownloadService>('IFileDownloadService', { useClass: FileDownloadService });
container.register<IMeetingStatusService>('IMeetingStatusService', { useClass: MeetingStatusService });
container.register<IWorklogTransactionService>('IWorklogTransactionService', { useClass: WorklogTransactionService });
//Auth
import { AuthService } from '../services/authServices/auth-services';
import type { IAuthService } from '../services/authServices/interfaces/auth-services.interface';
import { OtpService } from '../services/authServices/otp-services';
import { IOtpServices } from '../services/authServices/interfaces/i-otp-services.interface';
import { UserRepository } from '../repositories/user-repository';
import { OtpRepository } from '../repositories/otp-repository';
import type { IUserRepository } from '../repositories/interfaces/user-repository.interface';
import type { IOtpRepository } from '../repositories/interfaces/otp-repository.interface';

// Register service
container.register<IAuthService>('IAuthService', { useClass: AuthService });
container.register<IOtpServices>('IOtpServices', { useClass: OtpService });
// Register Repository
container.register<IUserRepository>('IUserRepository', { useClass: UserRepository });
container.register<IOtpRepository>('IOtpRepository', { useClass: OtpRepository });

//GoogleAuth
import { IGoogleAuthService } from '../services/authServices/interfaces/google-auth-services.interface';
import GoogleAuthService from '../services/authServices/google-auth-services';
container.register<IGoogleAuthService>('IGoogleAuthService', { useClass: GoogleAuthService });

//User
import { userServices } from '../services/userServices/user-services';
import { IUserServices } from '../services/userServices/interfaces/user-services.interface';

container.register<IUserServices>('IUserServices', { useClass: userServices });

//Admin

//AdminAuth
import { IAdminAuthServices } from '../services/adminServices/interfaces/admin-auth-services.interface';
import { AdminAuthServices } from '../services/adminServices/admin-auth-services';
container.register<IAdminAuthServices>('IAdminAuthServices', { useClass: AdminAuthServices });

//Category and skills
import { AdminCategoryServices } from '../services/adminServices/admin-category-services';
import { IAdminCategoryServices } from '../services/adminServices/interfaces/admin-category-services.interface';
import { AdminCategoryRepository } from '../repositories/adminRepositories/admin-category-repository';
import { IAdminCategoryRepository } from '../repositories/adminRepositories/interfaces/admin-category-repository.interface';
import { IAdminSpecialityServices } from '../services/adminServices/interfaces/admin-speciality-services.interface';
import { AdminSpecialityServices } from '../services/adminServices/admin-speciality-services';
import { IAdminSpecialityRepository } from '../repositories/adminRepositories/interfaces/admin-speciality-repository.interface';
import { AdminSpecialityRepository } from '../repositories/adminRepositories/admin-speciality-repository';

import { IAdminSkillServices } from '../services/adminServices/interfaces/admin-skill-services.interface';
import { AdminSkillServices } from '../services/adminServices/admin-skill-services';
import { IAdminSkillRepository } from '../repositories/adminRepositories/interfaces/admin-skill-repository.interface';
import { AdminSkillRepository } from '../repositories/adminRepositories/admin-skill-repository';

//add category
container.register<IAdminCategoryServices>('IAdminCategoryServices', {
  useClass: AdminCategoryServices,
});
container.register<IAdminCategoryRepository>('IAdminCategoryRepository', {
  useClass: AdminCategoryRepository,
});

//Speciality
container.register<IAdminSpecialityServices>('IAdminSpecialityServices', {
  useClass: AdminSpecialityServices,
});
container.register<IAdminSpecialityRepository>('IAdminSpecialityRepository', {
  useClass: AdminSpecialityRepository,
});

//Skills
container.register<IAdminSkillServices>('IAdminSkillServices', { useClass: AdminSkillServices });
container.register<IAdminSkillRepository>('IAdminSkillRepository', {
  useClass: AdminSkillRepository,
});
//AdminUser
import { AdminUserServices } from '../services/adminServices/admin-user-services';
import { IAdminUserServices } from '../services/adminServices/interfaces/admin-user-services.interface';

container.register<IAdminUserServices>('IAdminUserServices', { useClass: AdminUserServices });

import { AdminDashboardServices } from '../services/adminServices/admin-dashboard-service';
import { IAdminDashboardServices } from '../services/adminServices/interfaces/admin-dashboard-services.interface';

container.register<IAdminDashboardServices>('IAdminDashboardServices', {
  useClass: AdminDashboardServices,
});

//Freelancer
import { IFreelancerRepository } from '../repositories/interfaces/freelancer-repository.interface';
import { FreelancerRepository } from '../repositories/freelancer-repository';
import { IFreelancerService } from '../services/freelancerServices/interfaces/freelancer-services.interface';
import { FreelancerService } from '../services/freelancerServices/freelancer-services';

container.registerSingleton<IFreelancerService>('IFreelancerService', FreelancerService);
container.register<IFreelancerRepository>('IFreelancerRepository', FreelancerRepository);

import { IFreelancerDashboardServices } from '../services/freelancerServices/interfaces/freelancer-dashboard-services.interface';
import { FreelancerDashboardServices } from '../services/freelancerServices/freelancer-dashboard-service';

container.register<IFreelancerDashboardServices>('IFreelancerDashboardServices', {
  useClass: FreelancerDashboardServices,
});

//Client

import { IClientService } from '../services/clientServices/interfaces/client-services.interface';
import { ClientService } from '../services/clientServices/client-services';

container.register<IClientService>('IClientService', { useClass: ClientService });

import { IClientDashboardService } from '../services/clientServices/interfaces/client-dashboard-service.interface';
import { ClientDashboardService } from '../services/clientServices/client-dashboard-service';

container.register<IClientDashboardService>('IClientDashboardService', {
  useClass: ClientDashboardService,
});

import { IClientFinanceService } from '../services/clientServices/interfaces/client-finance-service.interface';
import { ClientFinanceService } from '../services/clientServices/client-finance-service';

container.register<IClientFinanceService>('IClientFinanceService', {
  useClass: ClientFinanceService,
});

import { IBankDetailsRepository } from '../repositories/interfaces/bank-details-repository.interface';
import { BankDetailsRepository } from '../repositories/bank-details-repository';
import { IClientBankService } from '../services/clientServices/interfaces/client-bank-service.interface';
import { ClientBankService } from '../services/clientServices/client-bank-service';

container.register<IBankDetailsRepository>('IBankDetailsRepository', { useClass: BankDetailsRepository });
container.register<IClientBankService>('IClientBankService', { useClass: ClientBankService });

//user category ,speciality,skills
import { IUserCategoryServices } from '../services/userServices/interfaces/user-category-services.interface';
import { userCategoryServices } from '../services/userServices/user-category-services';
import { IUserSpecialityServices } from '../services/userServices/interfaces/user-speciality-services.interface';
import { userSpecialityServices } from '../services/userServices/user-speciality-services';
import { IUserSkillServices } from '../services/userServices/interfaces/user-skill-services.interface';
import { UserSkillServices } from '../services/userServices/user-skill-services';

container.register<IUserCategoryServices>('IUserCategoryServices', {
  useClass: userCategoryServices,
});
container.register<IUserSpecialityServices>('IUserSpecialityServices', {
  useClass: userSpecialityServices,
});
container.register<IUserSkillServices>('IUserSkillServices', { useClass: UserSkillServices });

//Week 2

//admin
//admin job management
import { IAdminJobService } from '../services/adminServices/interfaces/admin-job-service.interface';
import { AdminJobService } from '../services/adminServices/admin-job-service';

container.register<IAdminJobService>('IAdminJobService', {
  useClass: AdminJobService,
});

//admin contract management
import { IAdminContractService } from '../services/adminServices/interfaces/admin-contract-service.interface';
import { AdminContractService } from '../services/adminServices/admin-contract-service';

container.register<IAdminContractService>('IAdminContractService', {
  useClass: AdminContractService,
});

import { IAdminDisputeService } from '../services/adminServices/interfaces/admin-dispute-service.interface';
import { AdminDisputeService } from '../services/adminServices/admin-dispute-service';

container.register<IAdminDisputeService>('IAdminDisputeService', {
  useClass: AdminDisputeService,
});

import { IAdminReviewService } from '../services/interfaces/admin-review-service.interface';
import { AdminReviewService } from '../services/adminServices/admin-review-service';

container.register<IAdminReviewService>('IAdminReviewService', {
  useClass: AdminReviewService,
});

//client job management
import { IClientJobService } from '../services/clientServices/interfaces/client-job-service.interface';
import { ClientJobService } from '../services/clientServices/client-job-service';

container.register<IClientJobService>('IClientJobService', {
  useClass: ClientJobService,
});

//client category management
import { IClientCategoryService } from '../services/clientServices/interfaces/client-category-service.interface';
import { ClientCategoryService } from '../services/clientServices/client-category-service';

container.register<IClientCategoryService>('IClientCategoryService', {
  useClass: ClientCategoryService,
});

//client speciality management
import { IClientSpecialityService } from '../services/clientServices/interfaces/client-speciality-service.interface';
import { ClientSpecialityService } from '../services/clientServices/client-speciality-service';

container.register<IClientSpecialityService>('IClientSpecialityService', {
  useClass: ClientSpecialityService,
});

//client freelancer management
import { IClientFreelancerService } from '../services/clientServices/interfaces/client-freelancer-service.interface';
import { ClientFreelancerService } from '../services/clientServices/client-freelancer-service';

container.register<IClientFreelancerService>('IClientFreelancerService', {
  useClass: ClientFreelancerService,
});

//freelancer category
import { IFreelancerCategoryService } from '../services/freelancerServices/interfaces/freelancer-category-service.interface';
import { FreelancerCategoryService } from '../services/freelancerServices/freelancer-category-service';

container.register<IFreelancerCategoryService>('IFreelancerCategoryService', {
  useClass: FreelancerCategoryService,
});

//freelancer speciality
import { IFreelancerSpecialityService } from '../services/freelancerServices/interfaces/freelancer-speciality-service.interface';
import { FreelancerSpecialityService } from '../services/freelancerServices/freelancer-speciality-service';

container.register<IFreelancerSpecialityService>('IFreelancerSpecialityService', {
  useClass: FreelancerSpecialityService,
});

//freelancer Job
import { IFreelancerJobService } from '../services/freelancerServices/interfaces/freelancer-job-service.interface';
import { FreelancerJobService } from '../services/freelancerServices/freelancer-job-service';

container.register<IFreelancerJobService>('IFreelancerJobService', {
  useClass: FreelancerJobService,
});

//freelancer Offer Service
import { IFreelancerOfferService } from '../services/freelancerServices/interfaces/freelancer-offer-service.interface';
import { FreelancerOfferService } from '../services/freelancerServices/freelancer-offer-service';

container.register<IFreelancerOfferService>('IFreelancerOfferService', {
  useClass: FreelancerOfferService,
});

//freelancer proposal Service
import { IFreelancerProposalService } from '../services/freelancerServices/interfaces/freelancer-proposal-service.interface';
import { FreelancerProposalService } from '../services/freelancerServices/freelancer-proposal-service';

container.register<IFreelancerProposalService>('IFreelancerProposalService', {
  useClass: FreelancerProposalService,
});

// Freelancer Saved Job
import { ISavedJobRepository } from '../repositories/interfaces/saved-job-repository.interface';
import { SavedJobRepository } from '../repositories/saved-job-repository';
import { IFreelancerSavedJobService } from '../services/freelancerServices/interfaces/freelancer-saved-job-service.interface';
import { FreelancerSavedJobService } from '../services/freelancerServices/freelancer-saved-job-service';

container.register<ISavedJobRepository>('ISavedJobRepository', { useClass: SavedJobRepository });
container.register<IFreelancerSavedJobService>('IFreelancerSavedJobService', {
  useClass: FreelancerSavedJobService,
});

import { IReportedJobRepository } from '../repositories/interfaces/reported-job-repository.interface';
import { ReportedJobRepository } from '../repositories/reported-job-repository';
import { IFreelancerReportedJobService } from '../services/freelancerServices/interfaces/freelancer-reported-job-service.interface';
import { FreelancerReportedJobService } from '../services/freelancerServices/freelancer-reported-job-service';

container.register<IReportedJobRepository>('IReportedJobRepository', {
  useClass: ReportedJobRepository,
});
container.register<IFreelancerReportedJobService>('IFreelancerReportedJobService', {
  useClass: FreelancerReportedJobService,
});

import { IAdminReportedJobService } from '../services/adminServices/interfaces/admin-reported-job-service.interface';
import { AdminReportedJobService } from '../services/adminServices/admin-reported-job-service';

container.register<IAdminReportedJobService>('IAdminReportedJobService', {
  useClass: AdminReportedJobService,
});

// Freelancer finance (withdrawals)
import { IFreelancerFinanceService } from '../services/freelancerServices/interfaces/freelancer-finance-service.interface';
import { FreelancerFinanceService } from '../services/freelancerServices/freelancer-finance-service';

container.register<IFreelancerFinanceService>('IFreelancerFinanceService', {
  useClass: FreelancerFinanceService,
});

//client proposal Service
import { IClientProposalService } from '../services/clientServices/interfaces/client-proposal-service.interface';
import { ClientProposalService } from '../services/clientServices/client-proposal-service';
container.register<IClientProposalService>('IClientProposalService', {
  useClass: ClientProposalService,
});
import { IClientOfferService } from '../services/clientServices/interfaces/client-offer-service.interface';
import { ClientOfferService } from '../services/clientServices/client-offer-service';
container.register<IClientOfferService>('IClientOfferService', { useClass: ClientOfferService });

import { IClientContractService } from '../services/clientServices/interfaces/client-contract-service.interface';
import { ClientContractService } from '../services/clientServices/client-contract-service';
import { IClientPaymentService } from '../services/clientServices/interfaces/client-payment-service.interface';
import { ClientPaymentService } from '../services/clientServices/client-payment-service';
import { PayUService } from '../utils/payu.service';
import { IClientReviewService } from '../services/clientServices/interfaces/client-review-service.interface';
import { ClientReviewService } from '../services/clientServices/client-review-service';
import { IClientFreelancerReviewService } from '../services/clientServices/interfaces/client-freelancer-review-service.interface';
import { ClientFreelancerReviewService } from '../services/clientServices/client-freelancer-review-service';
import { IReviewRepository } from '../repositories/interfaces/review-repository.interface';
import { ReviewRepository } from '../repositories/review-repository';
container.register<IClientContractService>('IClientContractService', {
  useClass: ClientContractService,
});
import { IClientDisputeService } from '../services/clientServices/interfaces/client-dispute-service.interface';
import { ClientDisputeService } from '../services/clientServices/client-dispute-service';
container.register<IClientDisputeService>('IClientDisputeService', {
  useClass: ClientDisputeService,
});
container.register<IClientPaymentService>('IClientPaymentService', {
  useClass: ClientPaymentService,
});
container.register<IClientReviewService>('IClientReviewService', {
  useClass: ClientReviewService,
});
container.register<IClientFreelancerReviewService>('IClientFreelancerReviewService', {
  useClass: ClientFreelancerReviewService,
});
container.register<IReviewRepository>('IReviewRepository', {
  useClass: ReviewRepository,
});
container.registerSingleton<PayUService>(PayUService);

import { IFreelancerContractService } from '../services/freelancerServices/interfaces/freelancer-contract-service.interface';
import { FreelancerContractService } from '../services/freelancerServices/freelancer-contract-service';
import { IFreelancerReviewService } from '../services/interfaces/freelancer-review-service.interface';
import { FreelancerReviewService } from '../services/freelancerServices/freelancer-review-service';
container.register<IFreelancerContractService>('IFreelancerContractService', {
  useClass: FreelancerContractService,
});
import { IFreelancerDisputeService } from '../services/freelancerServices/interfaces/freelancer-dispute-service.interface';
import { FreelancerDisputeService } from '../services/freelancerServices/freelancer-dispute-service';
container.register<IFreelancerDisputeService>('IFreelancerDisputeService', {
  useClass: FreelancerDisputeService,
});
container.register<IFreelancerReviewService>('IFreelancerReviewService', {
  useClass: FreelancerReviewService,
});

import { IFreelancerEarningsService } from '../services/freelancerServices/interfaces/freelancer-earnings-service.interface';
import { FreelancerEarningsService } from '../services/freelancerServices/freelancer-earnings-service';
container.register<IFreelancerEarningsService>('IFreelancerEarningsService', {
  useClass: FreelancerEarningsService,
});

import { IWorklogRepository } from '../repositories/interfaces/worklog-repository.interface';
import { WorklogRepository } from '../repositories/worklog-repository';
import { IFreelancerWorklogService } from '../services/freelancerServices/interfaces/freelancer-worklog-service.interface';
import { FreelancerWorklogService } from '../services/freelancerServices/freelancer-worklog-service';
container.register<IWorklogRepository>('IWorklogRepository', {
  useClass: WorklogRepository,
});
container.register<IFreelancerWorklogService>('IFreelancerWorklogService', {
  useClass: FreelancerWorklogService,
});

import { IClientWorklogService } from '../services/clientServices/interfaces/client-worklog-service.interface';
import { ClientWorklogService } from '../services/clientServices/client-worklog-service';
container.register<IClientWorklogService>('IClientWorklogService', {
  useClass: ClientWorklogService,
});

// Client Saved Freelancer
import { ISavedFreelancerRepository } from '../repositories/interfaces/saved-freelancer-repository.interface';
import { SavedFreelancerRepository } from '../repositories/saved-freelancer-repository';
import { IClientSavedFreelancerService } from '../services/clientServices/interfaces/client-saved-freelancer-service.interface';
import { ClientSavedFreelancerService } from '../services/clientServices/client-saved-freelancer-service';
import { ClientSavedFreelancerController } from '../controllers/client/client-saved-freelancer-controller';
import { IChatRepository } from '../repositories/chat-repository.interface';
import { ChatRepository } from '../repositories/chat-repository';
import { IClientChatService } from '../services/clientServices/interfaces/client-chat-service.interface';
import { ClientChatService } from '../services/clientServices/client-chat-service';
import { IFreelancerChatService } from '../services/freelancerServices/interfaces/freelancer-chat-service.interface';
import { FreelancerChatService } from '../services/freelancerServices/freelancer-chat-service';


container.register<ISavedFreelancerRepository>('ISavedFreelancerRepository', {
  useClass: SavedFreelancerRepository,
});
container.register<IClientSavedFreelancerService>('IClientSavedFreelancerService', {
  useClass: ClientSavedFreelancerService,
});
container.register<ClientSavedFreelancerController>(ClientSavedFreelancerController, {
  useClass: ClientSavedFreelancerController,
});
container.register<IChatRepository>('IChatRepository', { useClass: ChatRepository });
container.register<IClientChatService>('IClientChatService', { useClass: ClientChatService });
container.register<IFreelancerChatService>('IFreelancerChatService', {
  useClass: FreelancerChatService,
});


// payment strategies
import { HourlyPaymentStrategy } from '../services/clientServices/strategies/paymentStrategies/HourlyPaymentStrategy';
import { FixedPaymentStrategy } from '../services/clientServices/strategies/paymentStrategies/FixedPaymentStrategy';

import { IPaymentAmountStrategy } from '../services/clientServices/strategies/paymentStrategies/interfaces/IPaymentAmountStrategy';
import { MilestonePaymentStrategy } from '../services/clientServices/strategies/paymentStrategies/MIlestonePaymentStrategy';

container.register<IPaymentAmountStrategy>("IPaymentAmountStrategy", {
  useClass: HourlyPaymentStrategy,
});

container.register<IPaymentAmountStrategy>("IPaymentAmountStrategy", {
  useClass: FixedPaymentStrategy,
});
container.register<IPaymentAmountStrategy>("IPaymentAmountStrategy", {
  useClass: MilestonePaymentStrategy,
});

//payment factory
import { PaymentAmountStrategyFactory } from '../services/clientServices/factories/paymentFactories/PaymentAmountStrategyFactory';
container.register("PaymentAmountStrategyFactory", {
  useClass: PaymentAmountStrategyFactory,
});

// deliverable change strategies
import { MilestoneDeliverableChangeStrategy } from '../services/clientServices/strategies/deliverableStrategies/MilestoneDeliverableChangeStrategy';
import { DefaultDeliverableChangeStrategy } from '../services/clientServices/strategies/deliverableStrategies/DefaultDeliverableChangeStrategy';
import { IDeliverableChangeStrategy } from '../services/clientServices/strategies/deliverableStrategies/IDeliverableChangeStrategy';
container.register<IDeliverableChangeStrategy>("IDeliverableChangeStrategy", {
  useClass: MilestoneDeliverableChangeStrategy,
});
container.register<IDeliverableChangeStrategy>("IDeliverableChangeStrategy", {
  useClass: DefaultDeliverableChangeStrategy,
});

import { DeliverableChangeStrategyFactory } from '../services/clientServices/factories/deliverableFactories/DeliverableChangeStrategyFactory';
container.register("DeliverableChangeStrategyFactory", {
  useClass: DeliverableChangeStrategyFactory,
});

import { IContractCancellationStrategy } from '../services/clientServices/strategies/cancellationStrategies/IContractCancellationStrategy';
import { FixedContractCancellationStrategy } from '../services/clientServices/strategies/cancellationStrategies/fixedContractCancellationStrategy';
import { HourlyContractCancellationStrategy } from '../services/clientServices/strategies/cancellationStrategies/hourlyContractCancellationStrategy';
import { MilestoneContractCancellationStrategy } from '../services/clientServices/strategies/cancellationStrategies/milestoneContractCancellationStrategy';
container.register<IContractCancellationStrategy>("IContractCancellationStrategy", {
  useClass: FixedContractCancellationStrategy,
});
container.register<IContractCancellationStrategy>("IContractCancellationStrategy", {
  useClass: HourlyContractCancellationStrategy,
});
container.register<IContractCancellationStrategy>("IContractCancellationStrategy", {
  useClass: MilestoneContractCancellationStrategy,
});

import { ContractCancellationStrategyFactory } from '../services/clientServices/factories/cancellationFactories/ContractCancellationStrategyFactory';
container.register("ContractCancellationStrategyFactory", {
  useClass: ContractCancellationStrategyFactory,
});


//meeting service
import { IClientMeetingService } from '../services/clientServices/interfaces/client-meeting-service.interface';
import { ClientMeetingService } from '../services/clientServices/client-meeting-service';

container.register<IClientMeetingService>('IClientMeetingService', {
  useClass: ClientMeetingService,
});

import { IFreelancerMeetingService } from '../services/freelancerServices/interfaces/freelancer-meeting-service.interface';
import { FreelancerMeetingService } from '../services/freelancerServices/freelancer-meeting-service';

container.register<IFreelancerMeetingService>('IFreelancerMeetingService', {
  useClass: FreelancerMeetingService,
});

//deliverables change query stategies
import { IDeliverablesChangeQueryStrategy } from '../repositories/strategies/interfaces/deliverables-changes.strategy.interface';
import { FixedDeliverablesChangeQueryStrategy } from '../repositories/strategies/fixed-deliverables-changes.strategy';
import { MilestoneDeliverablesChangeQueryStrategy } from '../repositories/strategies/milestone-deliverables-changes.strategy';

container.register<IDeliverablesChangeQueryStrategy>('IDeliverablesChangeQueryStrategy', {
  useClass: FixedDeliverablesChangeQueryStrategy,
});
container.register<IDeliverablesChangeQueryStrategy>('IDeliverablesChangeQueryStrategy', {
  useClass: MilestoneDeliverablesChangeQueryStrategy,
});

// deliverable change strategy factory (repository-level)
import { DeliverableChangeQueryStrategyFactory } from '../repositories/factories/interfaces/deliverable-change.strategy.interface';

container.register("DeliverableChangeQueryStrategyFactory", {
  useClass: DeliverableChangeQueryStrategyFactory,
});



//withdrawal
import { AdminWithdrawalServices } from '../services/adminServices/admin-withdrawal-service';
container.register("IAdminWithdrawalServices",
  {useClass:AdminWithdrawalServices}
)

import { IAdminRevenueService } from '../services/adminServices/interfaces/admin-revenue-service.interface';
import { AdminRevenueService } from '../services/adminServices/admin-revenue-service';

container.register<IAdminRevenueService>('IAdminRevenueService', {
  useClass: AdminRevenueService,
});
