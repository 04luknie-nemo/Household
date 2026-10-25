import { Hono } from "hono";
import create from "./households-create.ts";
import detail from "./households-detail.ts";
import join from "./households-join.ts";
import list from "./households-list.ts";
import profile from "./households-profile.ts";
import taskList from "./households-tasks-list.ts";
import tasksEdit from "./households-tasks-edit.ts";
import createTask from "./households-tasks.ts";
import tasksComplete from "./households-tasks-complete.ts";
import stats from "./households-stats.ts";

const households = new Hono();

households.route("/", stats);
households.route("/", create);
households.route("/", detail);
households.route("/", join);
households.route("/", list);
households.route("/", createTask);
households.route("/", taskList);
households.route("/", tasksEdit);
households.route("/", profile);
households.route("/", tasksComplete);

export default households;
