import express from 'express';
import { AdminCategoryController } from '../controllers/admin/admin-category-controller';
import { AdminSpecialityController } from '../controllers/admin/admin-speciality-controller';
import { container } from 'tsyringe';
import { categoryValidationSchema } from '../utils/validationSchemas/category-validation';
import { specialityValidationSchema } from '../utils/validationSchemas/speciality-validations';
import { validate } from '../middlewares/validation-middleware';
import { authMiddleware, roleGuard } from '../middlewares/auth-middleware';
import { Role } from '../enums/role.enum';
import { AdminAuthController } from '../controllers/admin/admin-auth-controller';
import { AdminUserController } from '../controllers/admin/admin-user-controller';
import { AdminSkillController } from '../controllers/admin/admin-skill-controller';
import { skillSchema } from '../utils/validationSchemas/skill-validation';
import { AdminJobController } from '../controllers/admin/admin-jobs-controller';
import { AdminContractController } from '../controllers/admin/admin-contract-controller';
import { AdminReviewController } from '../controllers/admin/admin-review-controller';
import { AdminDashboardController } from '../controllers/admin/admin-dashboard-controller';
import { AdminDisputeController } from '../controllers/admin/admin-dispute-controller';
import { AdminWithdrawalController } from '../controllers/admin/admin-withdrawal-controller';
import { AdminRevenueController } from '../controllers/admin/admin-revenue-controller';
import { AdminNotificationController } from '../controllers/admin/admin-notification-controller';

const adminRouter = express.Router();

const categoryController = container.resolve(AdminCategoryController);
const adminAuthController = container.resolve(AdminAuthController);
const adminJobController = container.resolve(AdminJobController);
const adminContractController = container.resolve(AdminContractController);
const adminReviewController = container.resolve(AdminReviewController);
const adminDashboardController = container.resolve(AdminDashboardController);
const adminDisputeController = container.resolve(AdminDisputeController);
const adminWithdrawalController = container.resolve(AdminWithdrawalController);
const adminRevenueController = container.resolve(AdminRevenueController);
const adminNotificationController = container.resolve(AdminNotificationController);

import { AdminReportedJobController } from '../controllers/admin/admin-reported-job-controller';
const adminReportedJobController = container.resolve(AdminReportedJobController);
//auth
adminRouter.post('/login', adminAuthController.login.bind(adminAuthController));
adminRouter.get(
  '/me',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminAuthController.me.bind(adminAuthController),
);
adminRouter.post('/logout', adminAuthController.logout.bind(adminAuthController));
//category
adminRouter.get(
  '/categories',
  authMiddleware,
  roleGuard(Role.ADMIN),
  categoryController.getAllCategory.bind(categoryController),
);
adminRouter.post(
  '/categories',
  authMiddleware,
  roleGuard(Role.ADMIN),
  validate(categoryValidationSchema),
  categoryController.addCategory.bind(categoryController),
);
adminRouter.patch(
  '/categories',
  authMiddleware,
  roleGuard(Role.ADMIN),
  categoryController.editCategory.bind(categoryController),
);

//specialty
const specialityController = container.resolve(AdminSpecialityController);
adminRouter.post(
  '/speciality',
  authMiddleware,
  roleGuard(Role.ADMIN),
  validate(specialityValidationSchema),
  specialityController.addSpeciality.bind(specialityController),
);
adminRouter.get(
  '/speciality',
  authMiddleware,
  roleGuard(Role.ADMIN),
  specialityController.getAllSpeciality.bind(specialityController),
);
adminRouter.patch(
  '/speciality',
  authMiddleware,
  roleGuard(Role.ADMIN),
  specialityController.editSpeciality.bind(specialityController),
);

//skills
const skillController = container.resolve(AdminSkillController);
adminRouter.post(
  '/skill',
  authMiddleware,
  roleGuard(Role.ADMIN),
  validate(skillSchema),
  skillController.addSkill.bind(skillController),
);
adminRouter.get(
  '/skill',
  authMiddleware,
  roleGuard(Role.ADMIN),
  skillController.getSkills.bind(skillController),
);
adminRouter.patch(
  '/skill',
  authMiddleware,
  roleGuard(Role.ADMIN),
  skillController.editSkill.bind(skillController),
);
//users,
const adminUserController = container.resolve(AdminUserController);
adminRouter.get('/users-stats', adminUserController.getUserStats.bind(adminUserController));
adminRouter.get('/users', adminUserController.getUsers.bind(adminUserController));
adminRouter.get('/user', adminUserController.getUserDetail.bind(adminUserController));
adminRouter.patch(
  '/user/updateStatus',
  adminUserController.updateUserStatus.bind(adminUserController),
);

//jobs

adminRouter.get('/jobs-stats', adminJobController.getJobStats.bind(adminJobController));

adminRouter.get(
  '/jobs',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminJobController.getAllJobs.bind(adminJobController),
);

adminRouter.get(
  '/jobs/:jobId',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminJobController.getJobDetail.bind(adminJobController),
);

adminRouter.patch(
  '/jobs/:jobId/approve',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminJobController.approveJob.bind(adminJobController),
);

adminRouter.patch(
  '/jobs/:jobId/reject',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminJobController.rejectJob.bind(adminJobController),
);

adminRouter.patch(
  '/jobs/:jobId/reject',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminJobController.rejectJob.bind(adminJobController),
);

adminRouter.patch(
  '/jobs/:jobId/suspend',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminJobController.suspendJob.bind(adminJobController),
);

adminRouter.get(
  '/reports',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminReportedJobController.getAllReportedJobs.bind(adminReportedJobController),
);

adminRouter.get(
  '/jobs/:jobId/reports',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminReportedJobController.getReportsByJobId.bind(adminReportedJobController),
);

adminRouter.get(
  '/contracts',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminContractController.getContracts.bind(adminContractController),
);

adminRouter.get(
  '/contracts/:contractId',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminContractController.getContractDetail.bind(adminContractController),
);

adminRouter.get(
  '/contracts/:contractId/timeline',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminContractController.getContractTimeline.bind(adminContractController),
);

adminRouter.get(
  '/reviews',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminReviewController.getReviews.bind(adminReviewController),
);

adminRouter.patch(
  '/reviews/:reviewId/hide',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminReviewController.toggleHideReview.bind(adminReviewController),
);

adminRouter.get(
  '/dashboard/stats',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminDashboardController.getDashboardStats.bind(adminDashboardController),
);

adminRouter.get(
  '/dashboard/revenue',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminDashboardController.getRevenueData.bind(adminDashboardController),
);

adminRouter.get(
  '/dashboard/user-growth',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminDashboardController.getUserGrowthData.bind(adminDashboardController),
);

adminRouter.get(
  '/dashboard/recent-contracts',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminDashboardController.getRecentContracts.bind(adminDashboardController),
);

adminRouter.get(
  '/dashboard/recent-reviews',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminDashboardController.getRecentReviews.bind(adminDashboardController),
);

adminRouter.get(
  '/disputes',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminDisputeController.getDisputes.bind(adminDisputeController),
);

adminRouter.get(
  '/disputes/:disputeId',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminDisputeController.getDisputeById.bind(adminDisputeController),
);

adminRouter.post(
  '/disputes/:disputeId/split',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminDisputeController.splitDisputeFunds.bind(adminDisputeController),
);

adminRouter.post(
  '/disputes/:disputeId/release-hold/hourly',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminDisputeController.releaseHoldHourly.bind(adminDisputeController),
);

adminRouter.get(
  '/withdraws/stats',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminWithdrawalController.getWithdrawStats.bind(adminWithdrawalController),
);

adminRouter.get(
  '/withdraws',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminWithdrawalController.getWithdrawals.bind(adminWithdrawalController),
);

adminRouter.get(
  '/withdraws/:withdrawalId',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminWithdrawalController.getWithdrawalDetail.bind(adminWithdrawalController),
);

adminRouter.post(
  '/withdraws/:withdrawalId/approve',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminWithdrawalController.approveWithdrawal.bind(adminWithdrawalController),
);

adminRouter.post(
  '/withdraws/:withdrawalId/reject',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminWithdrawalController.rejectWithdrawal.bind(adminWithdrawalController),
);

adminRouter.get(
  '/revenue',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminRevenueController.getRevenueData.bind(adminRevenueController),
);

adminRouter.get(
  '/notifications',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminNotificationController.getNotifications.bind(adminNotificationController),
);

adminRouter.patch(
  '/notifications/:notificationId/read',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminNotificationController.markNotificationAsRead.bind(adminNotificationController),
);

adminRouter.patch(
  '/notifications/read-all',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminNotificationController.markAllNotificationsAsRead.bind(adminNotificationController),
);

import { AdminContentController } from '../controllers/admin/admin-content-controller';
const adminContentController = container.resolve(AdminContentController);

adminRouter.get(
  '/contents',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminContentController.getAllContents.bind(adminContentController),
);

adminRouter.get(
  '/contents/:slug',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminContentController.getContentBySlug.bind(adminContentController),
);

adminRouter.patch(
  '/contents/:slug',
  authMiddleware,
  roleGuard(Role.ADMIN),
  adminContentController.updateContent.bind(adminContentController),
);

adminRouter.get(
  '/public/contents',
  adminContentController.getAllPublishedContents.bind(adminContentController),
);

adminRouter.get(
  '/public/contents/:slug',
  adminContentController.getPublishedContentBySlug.bind(adminContentController),
);

export default adminRouter;

