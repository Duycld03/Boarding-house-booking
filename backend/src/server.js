import dotenv from "dotenv";
import express from "express";
import connect from "./config/dbConnect.js";
import route from "./routes/index.js";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import setupSwagger from "./config/swagger.js";
import cron from "node-cron";
import {
  deactivateExcessResources,
  startSubscriptionJob,
} from "./jobs/subscriptionJob.js";
import { migrateSubscription, rollbackMigration } from './scripts/migrateSubscription.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const shortHfilePath = (fileUlR) => {
  return path.join(__dirname, "../public", fileUlR);
};

dotenv.config();

const app = express();

app.use(cors());

// Setup Swagger
setupSwagger(app);

// Kết nối đến MongoDB
connect();


// Cấu hình express để phân tích body của request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public/images/boardingHouse", express.static(path.join(__dirname, "../public/images/boardingHouse")));

app.use(express.static("public"));
app.set("view engine", "ejs");

// Start subscription jobs
startSubscriptionJob();


// Thêm job để sync tất cả owners mỗi ngày (để đảm bảo consistency)
cron.schedule('0 12 * * *', async () => {
  console.log('Running daily resource sync for all owners...');
  try {
    const { Owner } = await import('./models/account.js');
    const allOwners = await Owner.find({});

    for (const owner of allOwners) {
      await syncResourcesWithSubscription(owner._id);
    }

    console.log('Daily resource sync completed');
  } catch (error) {
    console.error('Error in daily resource sync:', error);
  }
});

// Define routes
route(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Validate environment variables
const hostname = process.env.APP_HOST || "localhost";
const port = process.env.APP_PORT || 3000;

app.listen(port, hostname, () => {
  console.log(`Server is running at http://${hostname}:${port}/`);
  console.log("Swagger Docs available at http://localhost:3000/api-docs");
});

