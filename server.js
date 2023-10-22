const express = require("express");
const app = express();
const PORT = process.env.PORT || 3500;
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { logger } = require("./middleware/logger");
const { logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

// connecting to DB
connectDB();

//middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(logger);

//router
const rootRouter = require("./routes/root");

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", rootRouter);
app.use("/users", userRoutes);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "The requested resources are not found" });
  } else if (req.accepts("txt")) {
    res.type("txt").send("404 not found");
  }
});
app.use(errorHandler);
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`server running on port ${PORT}`));
});
