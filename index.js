import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB  from './utils/db.js'; // Adjust the path as necessary
import dotenv from 'dotenv';
import userRoutes from './routes/userRoute.js'; // Adjust the path as necessary
import companyRoute from './routes/companyRoute.js'; // Adjust the path as necessary
import jobRoute from './routes/jobRoute.js'
import applicationRoute from './routes/ApplicationRoute.js' // Adjust the path as necessary
dotenv.config({});

const app = express();

const PORT = process.env.PORT || 3000;
// mongodb+srv://naveen:naveen@cluster0.t9ibdw0.mongodb.net/

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Adjust this to your frontend URL
  credentials: true // Allow cookies to be sent
}));

//api's
app.use('/api/v1/user', userRoutes);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute); // Ensure this is imported correctly




app.listen(PORT, () => {
  // Connect to the database
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});