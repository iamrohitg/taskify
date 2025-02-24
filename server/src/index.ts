import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
// import session from "cookie-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import projectRoutes from "./routes/project.route";
import memberRoutes from "./routes/member.route";
import { passportAutenticateJWT } from "./config/passport.config";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// app.use(
//   session({
//     name: "session",
//     keys: [config.SESSION_SECRET],
//     maxAge: 24 * 60 * 60 * 1000,
//     secure: config.NODE_ENV === "production",
//     httpOnly: true,
//     sameSite: "lax",
//   })
// );

app.use(passport.initialize());
// app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Incoming Request:");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Full URL:", req.originalUrl);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException(
      "This is a bad request",
      ErrorCodeEnum.AUTH_INVALID_TOKEN
    );
    return res.status(HTTPSTATUS.OK).json({
      message: "Hello from Server !!!",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);

app.use(`${BASE_PATH}/user`, passportAutenticateJWT, userRoutes);
app.use(`${BASE_PATH}/workspace`, passportAutenticateJWT, workspaceRoutes);
app.use(`${BASE_PATH}/member`, passportAutenticateJWT, memberRoutes);
app.use(`${BASE_PATH}/project`, passportAutenticateJWT, projectRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
