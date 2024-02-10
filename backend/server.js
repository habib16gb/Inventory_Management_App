import express from "express";
import { configDotenv } from "dotenv";
import colors from "colors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute.js";
import errorHandler from "./middlewares/errorMiddleware.js";
import cookieParser from "cookie-parser";

configDotenv();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).send("hello");
});

app.use("/api/users", userRoute);

app.use(errorHandler);

const start = async () => {
  try {
    app.listen(PORT, () =>
      console.log(`Server Startd Success on Port: ${PORT}`.bgGreen.bold)
    );
    mongoose
      .connect(process.env.MONGO_URI)
      .then((res) => console.log(`MongoDB Connected Success`.bgCyan.bold))
      .catch((err) =>
        console.error(`Error MongoDB: ${err.message}`.bgRed.bold)
      );
  } catch (error) {
    console.error(`Server Down: ${error.message}`.bgRed.bold);
  }
};

start();
