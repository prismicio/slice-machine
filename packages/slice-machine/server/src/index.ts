/* eslint-disable */
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

declare let global: {
  fetch: any;
  appRoot: string;
};

global.fetch = require("node-fetch");
global.appRoot = path.join(__dirname, "../../../");

const pkg = require(global.appRoot + "package.json");
const LIB_PATH = path.join(global.appRoot, "build", "lib");

Object.entries(pkg._moduleAliases).forEach(([key]) => {
  // @ts-ignore As the 2.1 typing is not available yet and solve this problem
  moduleAlias.addAlias(key, (fromPath: string) => {
    return path.join(path.relative(path.dirname(fromPath), LIB_PATH));
  });
});

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
app.use(serveStatic(out));

app.use("/api", api);

app.use("/migration", async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, "migration.html"));
});

app.use("/changelog", async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, "changelog.html"));
});

app.use("/warnings", async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, "warnings.html"));
});

app.use("/:lib/:sliceName/:variation", async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, "[lib]/[sliceName]/[variation].html"));
});

app.use("/:cts/:id", async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, "cts/[ct].html"));
});

app.use("/slices", async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, "slices.html"));
});

app.use("/onboarding", async function sliceRoute(_, res) {
  return res.sendFile(path.join(out, "onboarding.html"));
});

const PORT = process.env.PORT || "9999";
app.listen(PORT, () => {
  const p = `http://localhost:${PORT}`;
  console.log(`p=${p}`);
});

process.on("SIGINT", () => {
  console.log("\nServer killed manually. Exiting...");
  process.exit();
});
