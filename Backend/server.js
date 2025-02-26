import express from "express";
import dotenv from "dotenv";
import path from "path";
import { dbConnection } from "./db_config/dbConnection.js";
import projectRoute from  "./routes/portfolio.route.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.json());

app.use("/api",projectRoute);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/Frontend/dist")));
  app.get("*",(req, res) =>{
    res.sendFile
    (path.resolve(__dirname, "Frontend", "dist", "index.html"));
  })
  
}

app.use(express.json({ limit: '100mb', extended: true }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use((req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});
app.listen(PORT, () => {
  dbConnection();
  console.log("Server running on port: " + PORT);
});
