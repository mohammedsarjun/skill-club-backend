import express from 'express';
import { AdminCategoryController } from '../controllers/admin/admin-category-controller';
import { AdminSpecialityController } from '../controllers/admin/admin-speciality-controller';
import { container } from 'tsyringe';
import { categoryValidationSchema } from '../utils/validationSchemas/category-validation';
import { specialityValidationSchema } from '../utils/validationSchemas/speciality-validations';
import { validate } from '../middlewares/validation-middleware';
import { authMiddleware, roleGuard } from '../middlewares/auth-middleware';
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

const adminRouter = express.Router();

const categoryController = container.resolve(AdminCategoryController);
const adminAuthController = container.resolve(AdminAuthController);
const adminJobController = container.resolve(AdminJobController);
const adminContractController = container.resolve(AdminContractController);
const adminReviewController = container.resolve(AdminReviewController);
const adminDashboardController = container.resolve(AdminDashboardController);
const adminDisputeController = container.resolve(AdminDisputeController);
const adminWithdrawalController=container.resolve(AdminWithdrawalController)
//auth
adminRouter.post('/login', adminAuthController.login.bind(adminAuthController));
adminRouter.get(
  '/me',
  authMiddleware,
  roleGuard('admin'),
  adminAuthController.me.bind(adminAuthController),
);
adminRouter.post('/logout', adminAuthController.logout.bind(adminAuthController));
//category
adminRouter.get(
  '/categories',
  authMiddleware,
  roleGuard('admin'),
  categoryController.getAllCategory.bind(categoryController),
);
adminRouter.post(
  '/categories',
  authMiddleware,
  roleGuard('admin'),
  validate(categoryValidationSchema),
  categoryController.addCategory.bind(categoryController),
);
adminRouter.patch(
  '/categories',
  authMiddleware,
  roleGuard('admin'),
  categoryController.editCategory.bind(categoryController),
);

//specialty
const specialityController = container.resolve(AdminSpecialityController);
adminRouter.post(
  '/speciality',
  authMiddleware,
  roleGuard('admin'),
  validate(specialityValidationSchema),
  specialityController.addSpeciality.bind(specialityController),
);
adminRouter.get(
  '/speciality',
  authMiddleware,
  roleGuard('admin'),
  specialityController.getAllSpeciality.bind(specialityController),
);
adminRouter.patch(
  '/speciality',
  authMiddleware,
  roleGuard('admin'),
  specialityController.editSpeciality.bind(specialityController),
);

//skills
const skillController = container.resolve(AdminSkillController);
adminRouter.post(
  '/skill',
  authMiddleware,
  roleGuard('admin'),
  validate(skillSchema),
  skillController.addSkill.bind(skillController),
);
adminRouter.get(
  '/skill',
  authMiddleware,
  roleGuard('admin'),
  skillController.getSkills.bind(skillController),
);
adminRouter.patch(
  '/skill',
  authMiddleware,
  roleGuard('admin'),
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
  roleGuard('admin'),
  adminJobController.getAllJobs.bind(adminJobController),
);

adminRouter.get(
  '/jobs/:jobId',
  authMiddleware,
  roleGuard('admin'),
  adminJobController.getJobDetail.bind(adminJobController),
);

adminRouter.patch(
  '/jobs/:jobId/approve',
  authMiddleware,
  roleGuard('admin'),
  adminJobController.approveJob.bind(adminJobController),
);

adminRouter.patch(
  '/jobs/:jobId/reject',
  authMiddleware,
  roleGuard('admin'),
  adminJobController.rejectJob.bind(adminJobController),
);

adminRouter.patch(
  '/jobs/:jobId/reject',
  authMiddleware,
  roleGuard('admin'),
  adminJobController.rejectJob.bind(adminJobController),
);

adminRouter.patch(
  '/jobs/:jobId/suspend',
  authMiddleware,
  roleGuard('admin'),
  adminJobController.suspendJob.bind(adminJobController),
);

adminRouter.get(
  '/contracts',
  authMiddleware,
  roleGuard('admin'),
  adminContractController.getContracts.bind(adminContractController),
);

adminRouter.get(
  '/contracts/:contractId',
  authMiddleware,
  roleGuard('admin'),
  adminContractController.getContractDetail.bind(adminContractController),
);

adminRouter.get(
  '/reviews',
  authMiddleware,
  roleGuard('admin'),
  adminReviewController.getReviews.bind(adminReviewController),
);

adminRouter.patch(
  '/reviews/:reviewId/hide',
  authMiddleware,
  roleGuard('admin'),
  adminReviewController.toggleHideReview.bind(adminReviewController),
);

adminRouter.get(
  '/dashboard/stats',
  authMiddleware,
  roleGuard('admin'),
  adminDashboardController.getDashboardStats.bind(adminDashboardController),
);

adminRouter.get(
  '/dashboard/revenue',
  authMiddleware,
  roleGuard('admin'),
  adminDashboardController.getRevenueData.bind(adminDashboardController),
);

adminRouter.get(
  '/dashboard/user-growth',
  authMiddleware,
  roleGuard('admin'),
  adminDashboardController.getUserGrowthData.bind(adminDashboardController),
);

adminRouter.get(
  '/dashboard/recent-contracts',
  authMiddleware,
  roleGuard('admin'),
  adminDashboardController.getRecentContracts.bind(adminDashboardController),
);

adminRouter.get(
  '/dashboard/recent-reviews',
  authMiddleware,
  roleGuard('admin'),
  adminDashboardController.getRecentReviews.bind(adminDashboardController),
);

adminRouter.get(
  '/disputes',
  authMiddleware,
  roleGuard('admin'),
  adminDisputeController.getDisputes.bind(adminDisputeController),
);

adminRouter.get(
  '/disputes/:disputeId',
  authMiddleware,
  roleGuard('admin'),
  adminDisputeController.getDisputeById.bind(adminDisputeController),
);

adminRouter.post(
  '/disputes/:disputeId/split',
  authMiddleware,
  roleGuard('admin'),
  adminDisputeController.splitDisputeFunds.bind(adminDisputeController),
);

adminRouter.post(
  '/disputes/:disputeId/release-hold/hourly',
  authMiddleware,
  roleGuard('admin'),
  adminDisputeController.releaseHoldHourly.bind(adminDisputeController),
);

adminRouter.get('/withdraws/stats',
  authMiddleware,roleGuard("admin"),
  adminWithdrawalController.getWithdrawStats.bind(adminWithdrawalController)
)

adminRouter.get('/withdraws',
  authMiddleware,roleGuard("admin"),
  adminWithdrawalController.getWithdrawals.bind(adminWithdrawalController)
)

adminRouter.get('/withdraws/:withdrawalId',
  authMiddleware,roleGuard("admin"),
  adminWithdrawalController.getWithdrawalDetail.bind(adminWithdrawalController)
)

adminRouter.post('/withdraws/:withdrawalId/approve',
  authMiddleware,roleGuard("admin"),
  adminWithdrawalController.approveWithdrawal.bind(adminWithdrawalController)
)

adminRouter.post('/withdraws/:withdrawalId/reject',
  authMiddleware,roleGuard("admin"),
  adminWithdrawalController.rejectWithdrawal.bind(adminWithdrawalController)
)

export default adminRouter;
