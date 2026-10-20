import { Hono } from "hono";
import { validator } from "hono/validator";
import { auth } from "../lib/auth.ts";
import { db } from "../../prisma/db.ts";

const createTask = new Hono();
const acceptedWorthNums = [1, 2, 4, 6, 8];

createTask.post(
  "/:id/tasks",
  validator("json", (value, c) => {
    let taskTitle = value["title"];
    if (!taskTitle || typeof taskTitle !== "string") {
      return c.text("Otillåten input", 400);
    }
    taskTitle = taskTitle.trim();
    if (taskTitle === "") {
      return c.text("Titel får inte vara tom", 400);
    }

    const taskDescription = value["description"];
    if (typeof taskDescription !== "string") {
      return c.text("Otillåten input", 400);
    }

    const taskReoccurInDays = value["reoccurInDays"];
    if (!taskReoccurInDays || typeof taskReoccurInDays !== "number") {
      return c.text("Otillåten input", 400);
    }
    if (taskReoccurInDays <= 0 || taskReoccurInDays > 31) {
      return c.text("Nummer måste vara mellan 1-31", 400);
    }
    if (!Number.isInteger(taskReoccurInDays)) {
      return c.text("Endast hela dagar kan väljas", 400);
    }

    const taskWorth = value["worth"];
    if (!taskWorth || typeof taskWorth !== "number") {
      return c.text("Otillåten input", 400);
    }
    if (!acceptedWorthNums.includes(taskWorth)) {
      return c.text("Endast 1,2,4,6,8 går att välja", 400);
    }
    return { taskTitle, taskDescription, taskReoccurInDays, taskWorth };
  }),
);

export default createTask;
