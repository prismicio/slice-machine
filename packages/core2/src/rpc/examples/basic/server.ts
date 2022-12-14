import express from "express";
import { middleware } from "./rpc-middleware";

const app = express();

// Provide the RPC middleware created using `createRPCMiddleware()`.
app.use("/rpc", middleware);

app.listen(3000);
