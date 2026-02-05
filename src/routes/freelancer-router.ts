import express from 'express';

import { container } from 'tsyringe';
import { authMiddleware, roleGuard } from '../middlewares/auth-middleware';
import { FreelancerController } from '../controllers/freelancer/freelancer-controller';
import { freelancerBlockMiddleware } from '../middlewares/freelancer-block-middleware';
import { FreelancerCategoryController } from '../controllers/freelancer/freelancer-category-controller';
import { FreelancerSpecialityController } from '../controllers/freelancer/freelancer-speciality-controller';
import { FreelancerJobController } from '../controllers/freelancer/freelancer-job-controller';
import { FreelancerProposalController } from '../controllers/freelancer/freelancer-proposal-controller';
import { FreelancerOfferController } from '../controllers/freelancer/freelancer-offer-controller';
import { FreelancerSavedJobController } from '../controllers/freelancer/freelancer-saved-job-controller';
import { FreelancerContractController } from '../controllers/freelancer/freelancer-contract-controller';
import { FreelancerChatController } from '../controllers/freelancer/freelancer-chat-controller';
import { FreelancerWorklogController } from '../controllers/freelancer/freelancer-worklog-controller';
import { FreelancerMeetingController } from '../controllers/freelancer/freelancer-meeting-controller';
import { FreelancerReviewController } from '../controllers/freelancer/freelancer-review-controller';
import { FreelancerDisputeController } from '../controllers/freelancer/freelancer-dispute-controller';
import { FreelancerEarningsController } from '../controllers/freelancer/freelancer-earnings-controller';
import { FreelancerFinanceController } from '../controllers/freelancer/freelancer-finance-controller';
import { FreelancerDashboardController } from '../controllers/freelancer/freelancer-dashboard-controller';
const freelancerRouter = express.Router();

const freelancerController = container.resolve(FreelancerController);
const freelancerCategoryController = container.resolve(FreelancerCategoryController);
const freelancerSpecialityController = container.resolve(FreelancerSpecialityController);
const freelancerJobController = container.resolve(FreelancerJobController);
const freelancerProposalController = container.resolve(FreelancerProposalController);
const freelancerOfferController = container.resolve(FreelancerOfferController);
const freelancerSavedJobController = container.resolve(FreelancerSavedJobController);
const freelancerContractController = container.resolve(FreelancerContractController);
const freelancerChatController = container.resolve(FreelancerChatController);
const freelancerWorklogController = container.resolve(FreelancerWorklogController);
const freelancerMeetingController = container.resolve(FreelancerMeetingController);
const freelancerReviewController = container.resolve(FreelancerReviewController);
const freelancerDisputeController = container.resolve(FreelancerDisputeController);
const freelancerEarningsController = container.resolve(FreelancerEarningsController);
const freelancerFinanceController = container.resolve(FreelancerFinanceController);
const freelancerDashboardController = container.resolve(FreelancerDashboardController);
freelancerRouter.get(
  '/me',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.getFreelancerData.bind(freelancerController),
);
freelancerRouter.patch(
  '/profile/language',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerLanguage.bind(freelancerController),
);
freelancerRouter.delete(
  '/profile/language',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.deleteFreelancerLanguage.bind(freelancerController),
);
freelancerRouter.patch(
  '/profile/description',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerDescription.bind(freelancerController),
);

freelancerRouter.patch(
  '/profile/education',
  authMiddleware,

  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.addFreelancerEducation.bind(freelancerController),
);

freelancerRouter.patch(
  '/profile/hourlyRate',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerHourlyRate.bind(freelancerController),
);
freelancerRouter.patch(
  '/profile/professionalRole',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerProfessionalRole.bind(freelancerController),
);

freelancerRouter.delete(
  '/profile/education',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.deleteFreelancerEducation.bind(freelancerController),
);

freelancerRouter.delete(
  '/profile/portfolio',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.deleteFreelancerPortfolio.bind(freelancerController),
);

freelancerRouter.post(
  '/portfolio',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.createPortfolio.bind(freelancerController),
);

freelancerRouter.get(
  '/portfolio',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.getPortfolio.bind(freelancerController),
);
freelancerRouter.get(
  '/portfolio/detail',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.getPortfolioDetail.bind(freelancerController),
);
freelancerRouter.patch(
  '/profile/workHistory',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerWorkHistory.bind(freelancerController),
);

freelancerRouter.delete(
  '/profile/workHistory',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.deleteFreelancerWorkHistory.bind(freelancerController),
);

freelancerRouter.patch(
  '/profile/expertise',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerController.updateFreelancerExpertise.bind(freelancerController),
);

freelancerRouter.get(
  '/categories',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerCategoryController.getAllCategories.bind(freelancerCategoryController),
);

freelancerRouter.get(
  '/specialities',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerSpecialityController.getSpecialityWithSkills.bind(freelancerSpecialityController),
);

freelancerRouter.get(
  '/jobs',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerJobController.getAllJobs.bind(freelancerJobController),
);

freelancerRouter.get(
  '/jobs/:jobId',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerJobController.getJobDetail.bind(freelancerJobController),
);

freelancerRouter.post(
  '/proposals',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerProposalController.createProposal.bind(freelancerProposalController),
);

freelancerRouter.get(
  '/jobs/:jobId/proposals',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerProposalController.getAllProposal.bind(freelancerProposalController),
);
// Offer routes
freelancerRouter.get(
  '/offers',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerOfferController.getAllOffers.bind(freelancerOfferController),
);
freelancerRouter.get(
  '/offers/:offerId',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerOfferController.getOfferDetail.bind(freelancerOfferController),
);

freelancerRouter.post(
  '/offers/:offerId/reject',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerOfferController.rejectOffer.bind(freelancerOfferController),
);

freelancerRouter.post(
  '/offers/:offerId/accept',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerOfferController.acceptOffer.bind(freelancerOfferController),
);

freelancerRouter.post(
  '/jobs/:jobId/save',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerSavedJobController.toggleSaveJob.bind(freelancerSavedJobController),
);

freelancerRouter.get(
  '/jobs/:jobId/saved',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerSavedJobController.isJobSaved.bind(freelancerSavedJobController),
);

freelancerRouter.get(
  '/saved-jobs',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerSavedJobController.getSavedJobs.bind(freelancerSavedJobController),
);

freelancerRouter.get(
  '/contracts',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.getContracts.bind(freelancerContractController),
);

freelancerRouter.get(
  '/contracts/:contractId',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.getContractDetail.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/deliverables',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.submitDeliverable.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/deliverables/:deliverableId/approve-change',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.approveChangeRequest.bind(freelancerContractController),
);



freelancerRouter.post(
  '/contracts/:contractId/milestones/deliverables',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.submitMilestoneDeliverable.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/milestones/extension',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.requestMilestoneExtension.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/extension',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.requestContractExtension.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/cancel',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.cancelContract.bind(freelancerContractController),
);

freelancerRouter.get(
  '/contracts/:contractId/cancellation-request',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.getCancellationRequest.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/cancellation-request/accept',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.acceptCancellationRequest.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/cancellation-request/raise-dispute',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.raiseCancellationDispute.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/cancellation-request',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.createCancellationRequest.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/end',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerContractController.endHourlyContract.bind(freelancerContractController),
);

freelancerRouter.post(
  '/contracts/:contractId/cancel-with-dispute',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerDisputeController.cancelContractWithDispute.bind(freelancerDisputeController),
);

freelancerRouter.post(
  '/disputes',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerDisputeController.createDispute.bind(freelancerDisputeController),
);

freelancerRouter.get(
  '/disputes/:disputeId',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerDisputeController.getDisputeById.bind(freelancerDisputeController),
);

freelancerRouter.get(
  '/contracts/:contractId/disputes',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerDisputeController.getDisputesByContract.bind(freelancerDisputeController),
);

freelancerRouter.post(
  '/contracts/:contractId/raise-dispute',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerDisputeController.raiseDisputeForCancelledContract.bind(freelancerDisputeController),
);

freelancerRouter.post(
  '/worklogs',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerWorklogController.submitWorklog.bind(freelancerWorklogController),
);

freelancerRouter.get(
  '/contracts/:contractId/worklogs',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerWorklogController.getWorklogsByContract.bind(freelancerWorklogController),
);

freelancerRouter.get(
  '/contracts/:contractId/worklog-validation',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerWorklogController.checkWorklogValidation.bind(freelancerWorklogController),
);

freelancerRouter.post(
  '/chat/send',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerChatController.sendMessage.bind(freelancerChatController),
);

freelancerRouter.get(
  '/chat/:contractId/messages',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerChatController.getMessages.bind(freelancerChatController),
);

freelancerRouter.put(
  '/chat/read',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerChatController.markAsRead.bind(freelancerChatController),
);

freelancerRouter.get(
  '/chat/:contractId/unread-count',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerChatController.getUnreadCount.bind(freelancerChatController),
);

freelancerRouter.get(
  '/meetings',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.getMeetings.bind(freelancerMeetingController),
);

freelancerRouter.get(
  '/meetings/:meetingId',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.getMeetingDetail.bind(freelancerMeetingController),
);

freelancerRouter.get(
  '/contracts/:contractId/meetings',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.getContractMeetings.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/accept',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.acceptMeeting.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/reschedule',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.requestReschedule.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/reject',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.rejectMeeting.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/reschedule/approve',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.approveReschedule.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/reschedule/decline',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.declineReschedule.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/reschedule/counter',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.counterReschedule.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/contracts/:contractId/meetings',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.proposeMeeting.bind(freelancerMeetingController),
);

freelancerRouter.post(
  '/meetings/:meetingId/join',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerMeetingController.joinMeeting.bind(freelancerMeetingController),
);

freelancerRouter.get(
  '/contracts/:contractId/worklogs/list',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerWorklogController.getWorklogsList.bind(freelancerWorklogController),
);

freelancerRouter.get(
  '/contracts/:contractId/worklogs/:worklogId',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerWorklogController.getWorklogDetail.bind(freelancerWorklogController),
);

freelancerRouter.post(
  '/contracts/:contractId/worklogs/raise-dispute',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerWorklogController.raiseWorklogDispute.bind(freelancerWorklogController),
);

freelancerRouter.post(
  '/contracts/:contractId/review',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerReviewController.submitReview.bind(freelancerReviewController),
);

freelancerRouter.get(
  '/contracts/:contractId/review/status',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerReviewController.getReviewStatus.bind(freelancerReviewController),
);

freelancerRouter.get(
  '/reviews',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerReviewController.getMyReviews.bind(freelancerReviewController),
);

freelancerRouter.get(
  '/earnings/overview',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerEarningsController.getEarningsOverview.bind(freelancerEarningsController),
);

freelancerRouter.get(
  '/earnings/transactions',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerEarningsController.getTransactions.bind(freelancerEarningsController),
);

freelancerRouter.post(
  '/finance/withdraw',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerFinanceController.requestWithdrawal.bind(freelancerFinanceController),
);

freelancerRouter.get(
  '/finance/withdrawals',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerFinanceController.getWithdrawals.bind(freelancerFinanceController),
);

freelancerRouter.get(
  '/dashboard/contract-stats',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerDashboardController.getContractStats.bind(freelancerDashboardController),
);

freelancerRouter.get(
  '/dashboard/earnings',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerDashboardController.getEarnings.bind(freelancerDashboardController),
);

freelancerRouter.get(
  '/dashboard/meetings',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerDashboardController.getMeetings.bind(freelancerDashboardController),
);

freelancerRouter.get(
  '/dashboard/review-stats',
  authMiddleware,
  roleGuard('freelancer'),
  freelancerBlockMiddleware,
  freelancerDashboardController.getReviewStats.bind(freelancerDashboardController),
);

export default freelancerRouter;
