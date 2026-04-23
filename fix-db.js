import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || "").then(async () => {
  console.log("Connected to MongoDB");
  const db = mongoose.connection.db;
  await db.collection('goals').updateOne({ _id: "default_goal" }, { $set: { payments: [] } });
  console.log("Cleared payments array");
  process.exit(0);
}).catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});
