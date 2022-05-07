import 'dotenv/config';
import mongoose from 'mongoose';

export const conn = mongoose.createConnection(process.env.DB_URI!);
