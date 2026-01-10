import express from 'express';

import { UserController } from '../controllers/user/user-controller';
import { container } from 'tsyringe';
import { authMiddleware } from '../middlewares/auth-middleware';
import { UserCategoryController } from '../controllers/user/user-category-controller';
import { UserSpecialityController } from '../controllers/user/user-speciality-controller';
import { UserSkillController } from '../controllers/user/user-skill-controller';
const userRouter = express.Router();

const userController = container.resolve(UserController);
const userCategoryController = container.resolve(UserCategoryController);
const userSpecialityController = container.resolve(UserSpecialityController);
const userSkillController = container.resolve(UserSkillController);
userRouter.post('/role', authMiddleware, userController.selectRole.bind(userController));
userRouter.get('/me', authMiddleware, userController.me.bind(userController));
userRouter.get('/profile', authMiddleware, userController.getProfile.bind(userController));
userRouter.patch('/profile', authMiddleware, userController.updateProfile.bind(userController));
userRouter.get('/address', authMiddleware, userController.getAddress.bind(userController));
userRouter.post('/address', authMiddleware, userController.updateAddress.bind(userController));
userRouter.post(
  '/freelancer',
  authMiddleware,
  userController.createFreelancerProfile.bind(userController),
);
userRouter.post('/client', authMiddleware, userController.createClientProfile.bind(userController));
userRouter.get('/switch-role', authMiddleware, userController.switchRole.bind(userController));
userRouter.get(
  '/categories',
  authMiddleware,
  userCategoryController.getAllCategory.bind(userCategoryController),
);
userRouter.get(
  '/specialities',
  authMiddleware,
  userSpecialityController.getSpecialities.bind(userSpecialityController),
);
userRouter.get(
  '/suggest-skill',
  authMiddleware,
  userSkillController.getSuggestedSkills.bind(userSkillController),
);

export default userRouter;
