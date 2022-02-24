import type { Migration } from "../migrate";
import migration0041 from "./0.0.41";
import migration010 from "./0.1.0";

// list of the migrations to execute.
const Migrations: Migration[] = [migration0041, migration010];
export default Migrations;
