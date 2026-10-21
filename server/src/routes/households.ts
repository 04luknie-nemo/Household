import { Hono } from "hono";
import join from "./households-join.ts";
import list from "./households-list.ts";
import createTask from "./households-tasks.ts";
import taskList from "./households-tasks-list.ts";
import detail from "./households-detail.ts";
import create from "./households-create.ts";

const households = new Hono();

households.route("/", create);
households.route("/", detail);
households.route("/", join);
households.route("/", list);

households.route("/", createTask);
households.route("/", taskList);
export default households;
