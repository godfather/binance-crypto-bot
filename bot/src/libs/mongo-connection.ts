import 'dotenv/config';
import mongoose from 'mongoose';

export const conn = mongoose.connect(process.env.DB_URI!);
