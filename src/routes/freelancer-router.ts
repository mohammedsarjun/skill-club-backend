import express from 'express';

import { container } from 'tsyringe';
import { authMiddleware, roleGuard } from '../middlewares/auth-middleware';
import { Role } from '../enums/role.enum';
import { FreelancerController } from '../controllers/freelancer/freelancer-controller';
import { freelancerBlockMiddleware } from '../middlewares/freelancer-block-middleware';
import { FreelancerCategoryController } from '../controllers/freelancer/freelancer-category-controller';
import { FreelancerSpecialityController } from '../controllers/freelancer/freelancer-speciality-controller';
import { FreelancerJobController } from '../controllers/freelancer/freelancer-job-controller';
import { FreelancerProposalController } from '../controllers/freelancer/freelancer-proposal-controller';
import { FreelancerOfferController } from '../controllers/freelancer/freelancer-offer-controller';
import { FreelancerSavedJobController } from '../controllers/freelancer/freelancer-saved-job-controller';
import { FreelancerReportedJobController } from '../controllers/freelancer/freelancer-reported-job-controller';
import { FreelancerContractController } from '../controllers/freelancer/freelancer-contract-controller';
import { FreelancerChatController } from '../controllers/freelancer/freelancer-chat-controller';
import { FreelancerWorklogController } from '../controllers/freelancer/freelancer-worklog-controller';
import { FreelancerMeetingController } from '../controllers/freelancer/freelancer-meeting-controller';
import { FreelancerReviewController } from '../controllers/freelancer/freelancer-review-controller';
import { FreelancerDisputeController } from '../controllers/freelancer/freelancer-dispute-controller';
import { FreelancerEarningsController } from '../controllers/freelancer/freelancer-earnings-controller';
import { FreelancerFinanceController } from '../controllers/freelancer/freelancer-finance-controller';
import { FreelancerDashboardController } from '../controllers/freelancer/freelancer-dashboard-controller';
import { FreelancerNotificationController } from '../controllers/freelancer/freelancer-notification-controller';
const freelancerRouter = express.Router();

const freelancerController = container.resolve(FreelancerController);
const freelancerCategoryController = container.resolve(FreelancerCategoryController);
const freelancerSpecialityController = container.resolve(FreelancerSpecialityController);
const freelancerJobController = container.resolve(FreelancerJobController);
const freelancerProposalController = container.resolve(FreelancerProposalController);
const freelancerOfferController = container.resolve(FreelancerOfferController);
const freelancerSavedJobController = container.resolve(FreelancerSavedJobController);
const freelancerReportedJobController = container.resolve(FreelancerReportedJobController);
const freelancerContractController = container.resolve(FreelancerContractController);
const freelancerChatController = container.resolve(FreelancerChatController);
const freelancerWorklogController = container.resolve(FreelancerWorklogController);
const freelancerMeetingController = container.resolve(FreelancerMeetingController);
const freelancerReviewController = container.resolve(FreelancerReviewController);
const freelancerDisputeController = container.resolve(FreelancerDisputeController);
const freelancerEarningsController = container.resolve(FreelancerEarningsController);
const freelancerFinanceController = container.resolve(FreelancerFinanceController);
const freelancerDashboardController = container.resolve(FreelancerDashboardController);
const freelancerNotificationController = container.resolve(FreelancerNotificationController);
freelancerRouter.get(
  '/me',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.getFreelancerData.bind(freelancerController),
);
freelancerRouter.patch(
  '/profile/language',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerLanguage.bind(freelancerController),
);
freelancerRouter.delete(
  '/profile/language',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.deleteFreelancerLanguage.bind(freelancerController),
);
freelancerRouter.patch(
  '/profile/description',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerDescription.bind(freelancerController),
);

freelancerRouter.patch(
  '/profile/education',
  authMiddleware,

  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.addFreelancerEducation.bind(freelancerController),
);

freelancerRouter.patch(
  '/profile/hourlyRate',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerHourlyRate.bind(freelancerController),
);
freelancerRouter.patch(
  '/profile/professionalRole',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerProfessionalRole.bind(freelancerController),
);

freelancerRouter.delete(
  '/profile/education',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.deleteFreelancerEducation.bind(freelancerController),
);

freelancerRouter.delete(
  '/profile/portfolio',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.deleteFreelancerPortfolio.bind(freelancerController),
);

freelancerRouter.post(
  '/portfolio',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.createPortfolio.bind(freelancerController),
);

freelancerRouter.get(
  '/portfolio',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.getPortfolio.bind(freelancerController),
);
freelancerRouter.get(
  '/portfolio/detail',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.getPortfolioDetail.bind(freelancerController),
);
freelancerRouter.patch(
  '/profile/workHistory',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerWorkHistory.bind(freelancerController),
);

freelancerRouter.delete(
  '/profile/workHistory',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.deleteFreelancerWorkHistory.bind(freelancerController),
);

freelancerRouter.patch(
  '/profile/expertise',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerExpertise.bind(freelancerController),
);

freelancerRouter.get(
  '/categories',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerCategoryController.getAllCategories.bind(freelancerCategoryController),
);

freelancerRouter.get(
  '/specialities',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerSpecialityController.getSpecialityWithSkills.bind(freelancerSpecialityController),
);

freelancerRouter.get(
  '/jobs',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerJobController.getAllJobs.bind(freelancerJobController),
);

freelancerRouter.get(
  '/jobs/:jobId',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerJobController.getJobDetail.bind(freelancerJobController),
);

freelancerRouter.get(
  '/proposals',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerProposalController.getMyProposals.bind(freelancerProposalController),
);

freelancerRouter.post(
  '/proposals',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerProposalController.createProposal.bind(freelancerProposalController),
);

freelancerRouter.get(
  '/jobs/:jobId/proposals',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerProposalController.getAllProposal.bind(freelancerProposalController),
);

// Offer routes
freelancerRouter.get(
  '/offers',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerOfferController.getAllOffers.bind(freelancerOfferController),
);
freelancerRouter.get(
  '/offers/:offerId',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerOfferController.getOfferDetail.bind(freelancerOfferController),
);

freelancerRouter.post(
  '/offers/:offerId/reject',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerOfferController.rejectOffer.bind(freelancerOfferController),
);

freelancerRouter.post(
  '/offers/:offerId/accept',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerOfferController.acceptOffer.bind(freelancerOfferController),
);

freelancerRouter.post(
  '/jobs/:jobId/save',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerSavedJobController.toggleSaveJob.bind(freelancerSavedJobController),
);

freelancerRouter.get(
  '/jobs/:jobId/saved',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerSavedJobController.isJobSaved.bind(freelancerSavedJobController),
);

freelancerRouter.get(
  '/saved-jobs',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerSavedJobController.getSavedJobs.bind(freelancerSavedJobController),
);

freelancerRouter.post(
  '/jobs/:jobId/report',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerReportedJobController.reportJob.bind(freelancerReportedJobController),
);

freelancerRouter.get(
  '/jobs/:jobId/reported',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerReportedJobController.isJobReported.bind(freelancerReportedJobController),
);

freelancerRouter.get(
  '/contracts',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.getContracts.bind(freelancerContractController),
);

freelancerRouter.get(
  '/contracts/:contractId',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.getContractDetail.bind(freelancerContractController),
);

freelancerRouter.get(
  '/contracts/:contractId/timeline',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.getContractTimeline.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/deliverables',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.submitDeliverable.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/deliverables/:deliverableId/approve-change',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.approveChangeRequest.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/milestones/deliverables',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.submitMilestoneDeliverable.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/milestones/extension',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.requestMilestoneExtension.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/extension',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.requestContractExtension.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/cancel',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.cancelContract.bind(freelancerContractController),
);

freelancerRouter.get(
  '/contracts/:contractId/cancellation-request',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.getCancellationRequest.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/cancellation-request/accept',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.acceptCancellationRequest.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/cancellation-request/raise-dispute',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.raiseCancellationDispute.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/cancellation-request',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.createCancellationRequest.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/end',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.endHourlyContract.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/cancel-with-dispute',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerDisputeController.cancelContractWithDispute.bind(freelancerDisputeController),
);

freelancerRouter.post(
  '/disputes',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerDisputeController.createDispute.bind(freelancerDisputeController),
);

freelancerRouter.get(
  '/disputes/:disputeId',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerDisputeController.getDisputeById.bind(freelancerDisputeController),
);

freelancerRouter.get(
  '/contracts/:contractId/disputes',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerDisputeController.getDisputesByContract.bind(freelancerDisputeController),
);

freelancerRouter.post(
  '/contracts/:contractId/raise-dispute',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerDisputeController.raiseDisputeForCancelledContract.bind(freelancerDisputeController),
);

freelancerRouter.post(
  '/worklogs',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerWorklogController.submitWorklog.bind(freelancerWorklogController),
);

freelancerRouter.get(
  '/contracts/:contractId/worklogs',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerWorklogController.getWorklogsByContract.bind(freelancerWorklogController),
);

freelancerRouter.get(
  '/contracts/:contractId/worklog-validation',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerWorklogController.checkWorklogValidation.bind(freelancerWorklogController),
);

freelancerRouter.post(
  '/chat/send',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerChatController.sendMessage.bind(freelancerChatController),
);

freelancerRouter.get(
  '/chat/:contractId/messages',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerChatController.getMessages.bind(freelancerChatController),
);

freelancerRouter.put(
  '/chat/read',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerChatController.markAsRead.bind(freelancerChatController),
);

freelancerRouter.get(
  '/chat/:contractId/unread-count',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerChatController.getUnreadCount.bind(freelancerChatController),
);

freelancerRouter.get(
  '/meetings',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.getMeetings.bind(freelancerMeetingController),
);

freelancerRouter.get(
  '/meetings/:meetingId',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.getMeetingDetail.bind(freelancerMeetingController),
);

freelancerRouter.get(
  '/contracts/:contractId/meetings',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.getContractMeetings.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/accept',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.acceptMeeting.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/reschedule',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.requestReschedule.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/reject',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.rejectMeeting.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/reschedule/approve',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.approveReschedule.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/reschedule/decline',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.declineReschedule.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/reschedule/counter',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.counterReschedule.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/contracts/:contractId/meetings',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.proposeMeeting.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/:meetingId/join',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerMeetingController.joinMeeting.bind(freelancerMeetingController),
);

freelancerRouter.get(
  '/contracts/:contractId/worklogs/list',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerWorklogController.getWorklogsList.bind(freelancerWorklogController),
);

freelancerRouter.get(
  '/contracts/:contractId/worklogs/:worklogId',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerWorklogController.getWorklogDetail.bind(freelancerWorklogController),
);

freelancerRouter.post(
  '/contracts/:contractId/worklogs/raise-dispute',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerWorklogController.raiseWorklogDispute.bind(freelancerWorklogController),
);

freelancerRouter.post(
  '/contracts/:contractId/review',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerReviewController.submitReview.bind(freelancerReviewController),
);

freelancerRouter.get(
  '/contracts/:contractId/review/status',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerReviewController.getReviewStatus.bind(freelancerReviewController),
);

freelancerRouter.get(
  '/reviews',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerReviewController.getMyReviews.bind(freelancerReviewController),
);

freelancerRouter.get(
  '/earnings/overview',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerEarningsController.getEarningsOverview.bind(freelancerEarningsController),
);

freelancerRouter.get(
  '/earnings/transactions',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerEarningsController.getTransactions.bind(freelancerEarningsController),
);

freelancerRouter.post(
  '/finance/withdraw',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerFinanceController.requestWithdrawal.bind(freelancerFinanceController),
);

freelancerRouter.get(
  '/finance/withdrawals',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerFinanceController.getWithdrawals.bind(freelancerFinanceController),
);

freelancerRouter.get(
  '/finance/withdrawals/:withdrawalId',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerFinanceController.getWithdrawalDetail.bind(freelancerFinanceController),
);

freelancerRouter.get(
  '/dashboard/contract-stats',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerDashboardController.getContractStats.bind(freelancerDashboardController),
);

freelancerRouter.get(
  '/dashboard/earnings',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerDashboardController.getEarnings.bind(freelancerDashboardController),
);

freelancerRouter.get(
  '/dashboard/meetings',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerDashboardController.getMeetings.bind(freelancerDashboardController),
);

freelancerRouter.get(
  '/dashboard/review-stats',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerDashboardController.getReviewStats.bind(freelancerDashboardController),
);

freelancerRouter.get(
  '/notifications',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerNotificationController.getNotifications.bind(freelancerNotificationController),
);

freelancerRouter.patch(
  '/notifications/:notificationId/read',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerNotificationController.markNotificationAsRead.bind(freelancerNotificationController),
);

freelancerRouter.patch(
  '/notifications/read-all',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerNotificationController.markAllNotificationsAsRead.bind(
    freelancerNotificationController,
  ),
);

freelancerRouter.post(
  '/contracts/:contractId/workspace/files',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.uploadWorkspaceFile.bind(freelancerContractController),
);

freelancerRouter.delete(
  '/contracts/:contractId/workspace/files/:fileId',
  authMiddleware,
  roleGuard(Role.FREELANCER),
  freelancerBlockMiddleware,
  freelancerContractController.deleteWorkspaceFile.bind(freelancerContractController),
);

export default freelancerRouter;
