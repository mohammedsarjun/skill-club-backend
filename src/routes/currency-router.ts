import { GetRatesController } from '../controllers/common/get-rates-controller';
import express from 'express';

import { container } from 'tsyringe';

const currencyRouter = express.Router();

const getRatesController = container.resolve(GetRatesController);

currencyRouter.get('/rates', getRatesController.getRatesController.bind(getRatesController));
export default currencyRouter;
