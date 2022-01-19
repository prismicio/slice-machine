import cors from "cors";

require("@babel/register");

console.log("\nLaunching server...");

import os from "os";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import moduleAlias from "module-alias";
import serveStatic from "serve-static";
import formData from "express-form-data";
import proxy from "express-http-proxy";

declare let global: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetch: any;
  appRoot: string;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
global.fetch = require("node-fetch");
global.appRoot = path.join(__dirname, "../../../");

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const pkg = require(global.appRoot + "package.json");
const LIB_PATH = path.join(global.appRoot, "build", "lib");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
Object.entries(pkg._moduleAliases).forEach(([key]) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore As the 2.1 typing is not available yet and solve this problem
  moduleAlias.addAlias(key, (fromPath: string) => {
    return path.join(path.relative(path.dirname(fromPath), LIB_PATH));
  });
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
const api = require("./api");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "64mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const out = path.join(__dirname, "../../..", "out");

const formDataOptions = {
  uploadDir: os.tmpdir(),
};

app.use(formData.parse(formDataOptions));

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
app.use("/api", api);

// For local env (SM), all the requests are forwarded to the next dev server
// For production, all the requests are forwarded to the next build directory
if (process.env.ENV === "SM") {
  app.use(proxy("localhost:3000"));
} else {
  app.use(serveStatic(out));
}

app.use("/migration", (_, res) => {
  res.sendFile(path.join(out, "migration.html"));
});

app.use("/changelog", (_, res) => {
  res.sendFile(path.join(out, "changelog.html"));
});

app.use("/warnings", (_, res) => {
  res.sendFile(path.join(out, "warnings.html"));
});

app.use("/:lib/:sliceName/:variation/preview", (_, res) => {
  res.sendFile(path.join(out, "[lib]/[sliceName]/[variation]/preview.html"));
});

app.use("/:lib/:sliceName/:variation", (_, res) => {
  res.sendFile(path.join(out, "[lib]/[sliceName]/[variation].html"));
});

app.use("/:cts/:id", (_, res) => {
  res.sendFile(path.join(out, "cts/[ct].html"));
});

app.use("/slices", (_, res) => {
  res.sendFile(path.join(out, "slices.html"));
});

app.use("/onboarding", (_, res) => {
  res.sendFile(path.join(out, "onboarding.html"));
});

const PORT = process.env.PORT || "9999";
app.listen(PORT, () => {
  const p = `http://localhost:${PORT}`;
  console.log(`Server running : ${p}`);
});

process.on("SIGINT", () => {
  console.log("\nServer killed manually. Exiting...");
  process.exit();
});
