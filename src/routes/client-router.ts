import express from 'express';

import { container } from 'tsyringe';
import { authMiddleware, roleGuard } from '../middlewares/auth-middleware';

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
clientRouter.get(
  '/me',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientController.getClientData.bind(clientController),
);

clientRouter.get(
  '/dashboard',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientDashboardController.getDashboardData.bind(clientDashboardController),
);

clientRouter.get(
  '/finance',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientFinanceController.getFinanceData.bind(clientFinanceController),
);

clientRouter.post(
  '/finance/withdraw',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientFinanceController.requestWithdrawal.bind(clientFinanceController),
);

clientRouter.get(
  '/finance/withdrawals',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientFinanceController.getWithdrawals.bind(clientFinanceController),
);



clientRouter.patch(
  '/update',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientController.updateClient.bind(clientController),
);

clientRouter.post(
  '/jobs',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientJobController.createJob.bind(clientJobController),
);

clientRouter.get(
  '/categories',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientCategoryController.getAllCategories.bind(clientCategoryController),
);

clientRouter.get(
  '/specialities',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientSpecialityController.getSpecialityWithSkills.bind(clientSpecialityController),
);

clientRouter.get(
  '/jobs',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientJobController.getAllJobs.bind(clientJobController),
);

clientRouter.get(
  '/jobs/:jobId',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientJobController.getJobDetail.bind(clientJobController),
);

clientRouter.put(
  '/jobs/:jobId',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientJobController.updateJobDetail.bind(clientJobController),
);

clientRouter.patch(
  '/jobs/:jobId/close',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientJobController.closeJob.bind(clientJobController),
);

clientRouter.get(
  '/freelancers',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientFreelancerController.getAllFreelancers.bind(clientFreelancerController),
);

clientRouter.get(
  '/freelancers/:freelancerId',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientFreelancerController.getFreelancerDetail.bind(clientFreelancerController),
);

clientRouter.get(
  '/freelancers/:freelancerId/portfolio',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientFreelancerController.getFreelancerPortfolio.bind(clientFreelancerController),
);

clientRouter.get(
  '/freelancers/:freelancerId/reviews',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientFreelancerReviewController.getFreelancerReviews.bind(clientFreelancerReviewController),
);

clientRouter.get(
  '/jobs/:jobId/proposals',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientProposalController.getAllProposal.bind(clientProposalController),
);

clientRouter.get(
  '/proposals/:proposalId',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientProposalController.getProposalDetail.bind(clientProposalController),
);

clientRouter.post(
  '/proposals/:proposalId/reject',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientProposalController.rejectProposal.bind(clientProposalController),
);

// Offer routes
clientRouter.get(
  '/offers',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientOfferController.getAllOffers.bind(clientOfferController),
);

clientRouter.get(
  '/offers/:offerId',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientOfferController.getOfferDetail.bind(clientOfferController),
);

clientRouter.get(
  '/offers/:offerId',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientOfferController.getOfferDetail.bind(clientOfferController),
);

clientRouter.post(
  '/offers',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientOfferController.createOffer.bind(clientOfferController),
);

clientRouter.patch(
  '/offers/:offerId/withdraw',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientOfferController.withdrawOffer.bind(clientOfferController),
);

clientRouter.post(
  '/freelancers/:freelancerId/save',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientSavedFreelancerController.toggleSaveFreelancer.bind(clientSavedFreelancerController),
);

clientRouter.get(
  '/freelancers/:freelancerId/saved',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientSavedFreelancerController.isFreelancerSaved.bind(clientSavedFreelancerController),
);

clientRouter.get(
  '/saved-freelancers',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientSavedFreelancerController.getSavedFreelancers.bind(clientSavedFreelancerController),
);

clientRouter.get(
  '/contracts',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.getContracts.bind(clientContractController),
);

clientRouter.get(
  '/contracts/:contractId',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.getContractDetail.bind(clientContractController),
);

clientRouter.get(
  '/contracts/:contractId/milestones/:milestoneId',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.getMilestoneDetail.bind(clientContractController),
);


clientRouter.post(
  '/contracts/:contractId/cancel',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.cancelContract.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/cancellation-request',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.createCancellationRequest.bind(clientContractController),
);

clientRouter.get(
  '/contracts/:contractId/cancellation-request',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.getCancellationRequest.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/cancellation-request/accept',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.acceptCancellationRequest.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/cancellation-request/dispute',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.raiseCancellationDispute.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/cancel-with-dispute',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientDisputeController.cancelContractWithDispute.bind(clientDisputeController),
);

clientRouter.post(
  '/disputes',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientDisputeController.createDispute.bind(clientDisputeController),
);

clientRouter.get(
  '/disputes/:disputeId',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientDisputeController.getDisputeById.bind(clientDisputeController),
);

clientRouter.get(
  '/contracts/:contractId/disputes',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientDisputeController.getDisputesByContract.bind(clientDisputeController),
);

clientRouter.put(
  '/contracts/:contractId/deliverables/approve',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.approveDeliverable.bind(clientContractController),
);

clientRouter.put(
  '/contracts/:contractId/deliverables/request-changes',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.requestDeliverableChanges.bind(clientContractController),
);

clientRouter.put(
  '/contracts/:contractId/milestones/deliverables/approve',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.approveMilestoneDeliverable.bind(clientContractController),
);

clientRouter.put(
  '/contracts/:contractId/milestones/deliverables/request-changes',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.requestMilestoneChanges.bind(clientContractController),
);

clientRouter.put(
  '/contracts/:contractId/milestones/extension/respond',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.respondToMilestoneExtension.bind(clientContractController),
);

clientRouter.put(
  '/contracts/:contractId/extension/respond',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.respondToContractExtension.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/deliverables/download',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.downloadDeliverableFiles.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/milestones/:milestoneId/deliverables/download',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.downloadMilestoneDeliverableFiles.bind(clientContractController),
);

clientRouter.post(
  '/contracts/:contractId/activate',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.activateHourlyContract.bind(clientContractController),
);

clientRouter.post('/contracts/:contractId/end',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientContractController.endHourlyContract.bind(clientContractController),
);

clientRouter.get(
  '/contracts/:contractId/worklogs',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientWorklogController.getWorklogsByContract.bind(clientWorklogController),
);

clientRouter.get(
  '/contracts/:contractId/worklogs/:worklogId',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientWorklogController.getWorklogDetail.bind(clientWorklogController),
);

clientRouter.post(
  '/contracts/:contractId/worklogs/approve',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientWorklogController.approveWorklog.bind(clientWorklogController),
);

clientRouter.post(
  '/contracts/:contractId/worklogs/reject',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientWorklogController.rejectWorklog.bind(clientWorklogController),
);

clientRouter.post(
  '/payments/initiate',
  authMiddleware,
  roleGuard('client'),
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
  roleGuard('client'),
  clientBlockMiddleware,
  clientChatController.sendMessage.bind(clientChatController),
);

clientRouter.get(
  '/chat/:contractId/messages',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientChatController.getMessages.bind(clientChatController),
);

clientRouter.put(
  '/chat/read',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientChatController.markAsRead.bind(clientChatController),
);

clientRouter.get(
  '/chat/:contractId/unread-count',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientChatController.getUnreadCount.bind(clientChatController),
);

clientRouter.get(
  '/chat/:contractId/messages',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientChatController.getMessages.bind(clientChatController),
);

clientRouter.post(
  '/freelancers/:freelancerId/meetings',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientMeetingController.proposePreContractMeeting.bind(clientMeetingController),
);

clientRouter.post(
  '/contracts/:contractId/meetings',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientMeetingController.proposeMeeting.bind(clientMeetingController),
);

clientRouter.get(
  '/contracts/:contractId/meetings',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientMeetingController.getContractMeetings.bind(clientMeetingController),
);

clientRouter.get(
  '/meetings',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientMeetingController.getAllMeetings.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/accept',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientMeetingController.acceptMeeting.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/reject',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientMeetingController.rejectMeeting.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/reschedule/approve',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientMeetingController.approveReschedule.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/reschedule/decline',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientMeetingController.declineReschedule.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/reschedule',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientMeetingController.requestReschedule.bind(clientMeetingController),
);

clientRouter.post(
  '/meetings/:meetingId/join',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientMeetingController.joinMeeting.bind(clientMeetingController),
);

clientRouter.post(
  '/contracts/:contractId/review',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientReviewController.submitReview.bind(clientReviewController),
);

clientRouter.get(
  '/contracts/:contractId/review/status',
  authMiddleware,
  roleGuard('client'),
  clientBlockMiddleware,
  clientReviewController.getReviewStatus.bind(clientReviewController),
);


export default clientRouter;
