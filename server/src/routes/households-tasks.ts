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
    if (
      typeof taskReoccurInDays !== "number" ||
      !Number.isInteger(taskReoccurInDays)
    ) {
      return c.text("Återkommer måste vara ett heltal", 400);
    }
    if (taskReoccurInDays === 0) {
      return c.text("Antal återkommande dagar får inte vara noll", 400);
    }
    if (taskReoccurInDays < 1 || taskReoccurInDays > 31) {
      return c.text("Nummer måste vara mellan 1-31", 400);
    }

    const taskWorth = value["worth"];
    if (
      typeof taskWorth !== "number" ||
      !acceptedWorthNums.includes(taskWorth)
    ) {
      return c.text("Endast 1,2,4,6,8 går att välja", 400);
    }
    return { taskTitle, taskDescription, taskReoccurInDays, taskWorth };
  }),
  async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.text("Inte inloggad", 401);
    }
    const { taskTitle, taskDescription, taskReoccurInDays, taskWorth } =
      await c.req.valid("json");

    const task = {
      title: taskTitle,
      description: taskDescription,
      reoccurInDays: taskReoccurInDays,
      worth: taskWorth,
    };
    const household = await db.household.findUnique({
      where: { id: c.req.param("id") },
      select: {
        id: true,
        members: {
          where: { userId: session.user.id },
          select: { isOwner: true, status: true },
        },
      },
    });

    if (!household) return c.text("Hushållet finns inte", 404);

    const me = household.members[0];
    if (!me || me.status !== "active") {
      return c.text("Inte medlem", 403);
    }
    if (!me.isOwner) {
      return c.text("Endast ägaren får skapa", 403);
    }
    const taskData = await db.task.create({
      data: { ...task, householdId: household.id },
    });
    return c.json(taskData, 201);
  },
);

export default createTask;
