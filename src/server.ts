import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from 'http';
import { connectDB } from './config/db';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error-handlers-middleware';
import qs from 'qs';
//Importing routes
import authRouter from './routes/auth-router';
import adminRouter from './routes/admin-router';
import userRouter from './routes/user-router';
import freelancerRouter from './routes/freelancer-router';
import clientRouter from './routes/client-router';
import uploadRouter from './routes/upload-router';
import morgan from 'morgan';
import { appLogger, accessLogStream } from './utils/logger';
import currencyRouter from './routes/currency-router';
import { initializeSocket } from './config/socket';
import './schedulers/auto-approve-contract-deliverables.cron';
import './schedulers/auto-pay-work-lok.cron';
import './schedulers/process-contract-refunds.cron';
import './schedulers/meeting-status-change.cron';
import './schedulers/midnight-jobs';
const PORT = process.env.PORT;

connectDB();
const app = express();
const httpServer = createServer(app);
initializeSocket(httpServer);

// HTTP request logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  app.use(morgan('dev'));
}
app.use(express.urlencoded({ extended: true }));
app.set('query parser', (str: string) => qs.parse(str));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);


app.use('/api/auth', authRouter);

app.use('/api/admin', adminRouter);

app.use('/api/user', userRouter);

app.use('/api/freelancer', freelancerRouter);

app.use('/api/client', clientRouter);

app.use('/api/uploads', uploadRouter);

app.use('/api/currency', currencyRouter);

app.use(errorHandler);

httpServer.listen(PORT, () => {
  appLogger.info(`Server is running on port: ${PORT}`);
});
