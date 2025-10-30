import express from "express"
import cors from "cors"
import morgan from "morgan";
import helmet from "helmet";
import { errorHandler } from "./middleware/auth.middleware";
import {authRoutes} from './routes/auth.routes';
import {userRoutes} from './routes/user.routes';
import {eventRoutes} from './routes/event.routes';
import {ticketRoutes} from './routes/ticket.routes';
import {paymentRoutes} from './routes/payment.routes';
import {reviewRoutes} from './routes/review.routes'
import {notificationRoutes} from './routes/notification.routes';
import {bookmarkRoutes} from './routes/bookmark.routes';
import {reminderRoutes} from './routes/reminder.routes';
import {chatRoutes} from './routes/chat.routes';


export const app = express()


app.use(cors({origin:process.env.CORS}));
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));


//callAPI
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/chat', chatRoutes);

app.use(errorHandler)
//call api