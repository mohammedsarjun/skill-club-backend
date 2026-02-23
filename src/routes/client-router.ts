import express from 'express';

import { container } from 'tsyringe';
import { authMiddleware, roleGuard } from '../middlewares/auth-middleware';
import { Role } from '../enums/role.enum';

import { ClientController } from '../controllers/client/client-controller';
import { clientBlockMiddleware } from '../middlewares/client-block-middleware';
import { ClientJobController } from '../controllers/client/client-job-controller';
import { ClientCategoryController } from '../controllers/client/client-category-controller';
import { ClientSpecialityController } from '../controllers/client/client-speciality-controller';
import { ClientFreelancerController } from '../controllers/client/client-freelancer-controller';
import { ClientProposalController } from '../controllers/client/client-proposal-controller';
import { ClientOfferController } from '../controllers/client/client-offer-controller';
import { ClientSavedFreelancerController } from '../controllers/client/client-saved-freelancer-controller';
import { ClientContractController } from '../controllers/client/client-contract-controller';
import { ClientPaymentController } from '../controllers/client/client-payment-controller';
import { ClientChatController } from '../controllers/client/client-chat-controller';
import { ClientWorklogController } from '../controllers/client/client-worklog-controller';
import { ClientMeetingController } from '../controllers/client/client-meeting-controller';
import { ClientReviewController } from '../controllers/client/client-review-controller';
import { ClientFreelancerReviewController } from '../controllers/client/client-freelancer-review-controller';
import { ClientDashboardController } from '../controllers/client/client-dashboard-controller';
import { ClientFinanceController } from '../controllers/client/client-finance-controller';
import { ClientDisputeController } from '../controllers/client/client-dispute-controller';
import { ClientNotificationController } from '../controllers/client/client-notification-controller';
const clientRouter = express.Router();

const clientController = container.resolve(ClientController);
const clientDashboardController = container.resolve(ClientDashboardController);
const clientFinanceController = container.resolve(ClientFinanceController);

const clientJobController = container.resolve(ClientJobController);
const clientCategoryController = container.resolve(ClientCategoryController);
const clientSpecialityController = container.resolve(ClientSpecialityController);
const clientFreelancerController = container.resolve(ClientFreelancerController);
const clientProposalController = container.resolve(ClientProposalController);
const clientOfferController = container.resolve(ClientOfferController);
const clientSavedFreelancerController = container.resolve(ClientSavedFreelancerController);
const clientContractController = container.resolve(ClientContractController);
const clientPaymentController = container.resolve(ClientPaymentController);
const clientChatController = container.resolve(ClientChatController);
const clientWorklogController = container.resolve(ClientWorklogController);
const clientMeetingController = container.resolve(ClientMeetingController);
const clientReviewController = container.resolve(ClientReviewController);
const clientFreelancerReviewController = container.resolve(ClientFreelancerReviewController);
const clientDisputeController = container.resolve(ClientDisputeController);
const clientNotificationController = container.resolve(ClientNotificationController);
clientRouter.get(
  '/me',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientController.getClientData.bind(clientController),
);

clientRouter.get(
  '/dashboard',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientDashboardController.getDashboardData.bind(clientDashboardController),
);

clientRouter.get(
  '/finance',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientFinanceController.getFinanceData.bind(clientFinanceController),
);

clientRouter.post(
  '/finance/withdraw',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientFinanceController.requestWithdrawal.bind(clientFinanceController),
);

clientRouter.get(
  '/finance/withdrawals',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientFinanceController.getWithdrawals.bind(clientFinanceController),
);

clientRouter.patch(
  '/update',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientController.updateClient.bind(clientController),
);

clientRouter.post(
  '/jobs',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientJobController.createJob.bind(clientJobController),
);

clientRouter.get(
  '/categories',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientCategoryController.getAllCategories.bind(clientCategoryController),
);

clientRouter.get(
  '/specialities',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientSpecialityController.getSpecialityWithSkills.bind(clientSpecialityController),
);

clientRouter.get(
  '/jobs',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientJobController.getAllJobs.bind(clientJobController),
);

clientRouter.get(
  '/jobs/:jobId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientJobController.getJobDetail.bind(clientJobController),
);

clientRouter.put(
  '/jobs/:jobId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientJobController.updateJobDetail.bind(clientJobController),
);

clientRouter.patch(
  '/jobs/:jobId/close',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientJobController.closeJob.bind(clientJobController),
);

clientRouter.get(
  '/freelancers',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientFreelancerController.getAllFreelancers.bind(clientFreelancerController),
);

clientRouter.get(
  '/freelancers/:freelancerId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientFreelancerController.getFreelancerDetail.bind(clientFreelancerController),
);

clientRouter.get(
  '/freelancers/:freelancerId/portfolio',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientFreelancerController.getFreelancerPortfolio.bind(clientFreelancerController),
);

clientRouter.get(
  '/freelancers/:freelancerId/reviews',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientFreelancerReviewController.getFreelancerReviews.bind(clientFreelancerReviewController),
);

clientRouter.get(
  '/jobs/:jobId/proposals',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientProposalController.getAllProposal.bind(clientProposalController),
);

clientRouter.get(
  '/proposals/:proposalId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientProposalController.getProposalDetail.bind(clientProposalController),
);

clientRouter.post(
  '/proposals/:proposalId/reject',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientProposalController.rejectProposal.bind(clientProposalController),
);

// Offer routes
clientRouter.get(
  '/offers',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientOfferController.getAllOffers.bind(clientOfferController),
);

clientRouter.get(
  '/offers/:offerId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientOfferController.getOfferDetail.bind(clientOfferController),
);

clientRouter.get(
  '/offers/:offerId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientOfferController.getOfferDetail.bind(clientOfferController),
);

clientRouter.post(
  '/offers',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientOfferController.createOffer.bind(clientOfferController),
);

clientRouter.patch(
  '/offers/:offerId/withdraw',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientOfferController.withdrawOffer.bind(clientOfferController),
);

clientRouter.post(
  '/freelancers/:freelancerId/save',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientSavedFreelancerController.toggleSaveFreelancer.bind(clientSavedFreelancerController),
);

clientRouter.get(
  '/freelancers/:freelancerId/saved',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientSavedFreelancerController.isFreelancerSaved.bind(clientSavedFreelancerController),
);

clientRouter.get(
  '/saved-freelancers',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientSavedFreelancerController.getSavedFreelancers.bind(clientSavedFreelancerController),
);

clientRouter.get(
  '/contracts',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.getContracts.bind(clientContractController),
);

clientRouter.get(
  '/contracts/:contractId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.getContractDetail.bind(clientContractController),
);

clientRouter.get(
  '/contracts/:contractId/timeline',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.getContractTimeline.bind(clientContractController),
);

clientRouter.get(
  '/contracts/:contractId/milestones/:milestoneId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.getMilestoneDetail.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/cancel',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.cancelContract.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/cancellation-request',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.createCancellationRequest.bind(clientContractController),
);

clientRouter.get(
  '/contracts/:contractId/cancellation-request',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.getCancellationRequest.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/cancellation-request/accept',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.acceptCancellationRequest.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/cancellation-request/dispute',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.raiseCancellationDispute.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/cancel-with-dispute',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientDisputeController.cancelContractWithDispute.bind(clientDisputeController),
);

clientRouter.post(
  '/disputes',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientDisputeController.createDispute.bind(clientDisputeController),
);

clientRouter.get(
  '/disputes/:disputeId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientDisputeController.getDisputeById.bind(clientDisputeController),
);

clientRouter.get(
  '/contracts/:contractId/disputes',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientDisputeController.getDisputesByContract.bind(clientDisputeController),
);

clientRouter.put(
  '/contracts/:contractId/deliverables/approve',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.approveDeliverable.bind(clientContractController),
);

clientRouter.put(
  '/contracts/:contractId/deliverables/request-changes',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.requestDeliverableChanges.bind(clientContractController),
);

clientRouter.put(
  '/contracts/:contractId/milestones/deliverables/approve',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.approveMilestoneDeliverable.bind(clientContractController),
);

clientRouter.put(
  '/contracts/:contractId/milestones/deliverables/request-changes',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.requestMilestoneChanges.bind(clientContractController),
);

clientRouter.put(
  '/contracts/:contractId/milestones/extension/respond',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.respondToMilestoneExtension.bind(clientContractController),
);

clientRouter.put(
  '/contracts/:contractId/extension/respond',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.respondToContractExtension.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/deliverables/download',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.downloadDeliverableFiles.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/milestones/:milestoneId/deliverables/download',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.downloadMilestoneDeliverableFiles.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/activate',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.activateHourlyContract.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/end',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.endHourlyContract.bind(clientContractController),
);

clientRouter.get(
  '/contracts/:contractId/worklogs',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientWorklogController.getWorklogsByContract.bind(clientWorklogController),
);

clientRouter.get(
  '/contracts/:contractId/worklogs/:worklogId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientWorklogController.getWorklogDetail.bind(clientWorklogController),
);

clientRouter.post(
  '/contracts/:contractId/worklogs/approve',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientWorklogController.approveWorklog.bind(clientWorklogController),
);

clientRouter.post(
  '/contracts/:contractId/worklogs/reject',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientWorklogController.rejectWorklog.bind(clientWorklogController),
);

clientRouter.post(
  '/payments/initiate',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientPaymentController.initiatePayment.bind(clientPaymentController),
);

clientRouter.post(
  '/payments/callback',
  clientPaymentController.handleCallback.bind(clientPaymentController),
);

clientRouter.post(
  '/chat/send',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientChatController.sendMessage.bind(clientChatController),
);

clientRouter.get(
  '/chat/:contractId/messages',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientChatController.getMessages.bind(clientChatController),
);

clientRouter.put(
  '/chat/read',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientChatController.markAsRead.bind(clientChatController),
);

clientRouter.get(
  '/chat/:contractId/unread-count',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientChatController.getUnreadCount.bind(clientChatController),
);

clientRouter.get(
  '/chat/:contractId/messages',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientChatController.getMessages.bind(clientChatController),
);

clientRouter.post(
  '/freelancers/:freelancerId/meetings',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientMeetingController.proposePreContractMeeting.bind(clientMeetingController),
);

clientRouter.post(
  '/contracts/:contractId/meetings',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientMeetingController.proposeMeeting.bind(clientMeetingController),
);

clientRouter.get(
  '/contracts/:contractId/meetings',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientMeetingController.getContractMeetings.bind(clientMeetingController),
);

clientRouter.get(
  '/meetings',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientMeetingController.getAllMeetings.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/accept',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientMeetingController.acceptMeeting.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/reject',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientMeetingController.rejectMeeting.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/reschedule/approve',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientMeetingController.approveReschedule.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/reschedule/decline',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientMeetingController.declineReschedule.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/reschedule',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientMeetingController.requestReschedule.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/:meetingId/join',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientMeetingController.joinMeeting.bind(clientMeetingController),
);

clientRouter.post(
  '/contracts/:contractId/review',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientReviewController.submitReview.bind(clientReviewController),
);

clientRouter.get(
  '/contracts/:contractId/review/status',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientReviewController.getReviewStatus.bind(clientReviewController),
);

clientRouter.get(
  '/notifications',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientNotificationController.getNotifications.bind(clientNotificationController),
);

clientRouter.patch(
  '/notifications/:notificationId/read',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientNotificationController.markNotificationAsRead.bind(clientNotificationController),
);

clientRouter.patch(
  '/notifications/read-all',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientNotificationController.markAllNotificationsAsRead.bind(clientNotificationController),
);

clientRouter.post(
  '/contracts/:contractId/workspace/files',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.uploadWorkspaceFile.bind(clientContractController),
);

clientRouter.delete(
  '/contracts/:contractId/workspace/files/:fileId',
  authMiddleware,
  roleGuard(Role.CLIENT),
  clientBlockMiddleware,
  clientContractController.deleteWorkspaceFile.bind(clientContractController),
);

export default clientRouter;
