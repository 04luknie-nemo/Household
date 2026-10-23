import { Hono } from "hono";
import { validator } from "hono/validator";
import { auth } from "../lib/auth.ts";
import { db } from "../../prisma/db.ts";

const tasksEdit = new Hono();
const acceptedWorthNums = [1, 2, 4, 6, 8];

tasksEdit.get("/:id/tasks/:taskId", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.text("Inte inloggad", 401);
  }

  const household = await db.household.findUnique({
    where: { id: c.req.param("id") },
    select: {
      id: true,
      members: {
        where: { userId: session.user.id },
        select: { status: true },
      },
    },
  });

  if (!household) {
    return c.text("Hushållet finns inte", 404);
  }

  const me = household.members[0];
  if (!me || me.status !== "active") {
    return c.text("Inte medlem", 403);
  }

  const task = await db.task.findUnique({
    where: { id: c.req.param("taskId") },
    select: {
      id: true,
      householdId: true,
      title: true,
      description: true,
      reoccurInDays: true,
      worth: true,
      isArchived: true,
    },
  });

  if (!task || task.householdId !== household.id || task.isArchived) {
    return c.text("Sysslan finns inte", 404);
  }

  return c.json({
    id: task.id,
    title: task.title,
    description: task.description,
    reoccurInDays: task.reoccurInDays,
    worth: task.worth,
  });
});

tasksEdit.patch(
  "/:id/tasks/:taskId",
  validator("json", (value, c) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return c.text("Otillåten input", 400);
    }

    const data: {
      title?: string;
      description?: string;
      reoccurInDays?: number;
      worth?: number;
    } = {};

    if ("title" in value && value["title"] !== undefined) {
      let taskTitle = value["title"];
      if (typeof taskTitle !== "string") {
        return c.text("Otillåten input", 400);
      }
      taskTitle = taskTitle.trim();
      if (taskTitle === "") {
        return c.text("Titel får inte vara tom", 400);
      }
      data.title = taskTitle;
    }

    if ("description" in value && value["description"] !== undefined) {
      const taskDescription = value["description"];
      if (typeof taskDescription !== "string") {
        return c.text("Otillåten input", 400);
      }
      data.description = taskDescription;
    }

    if ("reoccurInDays" in value && value["reoccurInDays"] !== undefined) {
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
      data.reoccurInDays = taskReoccurInDays;
    }

    if ("worth" in value && value["worth"] !== undefined) {
      const taskWorth = value["worth"];
      if (
        typeof taskWorth !== "number" ||
        !acceptedWorthNums.includes(taskWorth)
      ) {
        return c.text("Endast 1,2,4,6,8 går att välja", 400);
      }
      data.worth = taskWorth;
    }

    if (Object.keys(data).length === 0) {
      return c.text("Otillåten input", 400);
    }

    return data;
  }),
  async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return c.text("Inte inloggad", 401);
    }

    const data = c.req.valid("json");

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

    if (!household) {
      return c.text("Hushållet finns inte", 404);
    }

    const me = household.members[0];
    if (!me || me.status !== "active") {
      return c.text("Inte medlem", 403);
    }
    if (!me.isOwner) {
      return c.text("Endast ägaren får redigera", 403);
    }

    const existingTask = await db.task.findUnique({
      where: { id: c.req.param("taskId") },
      select: {
        id: true,
        householdId: true,
        isArchived: true,
      },
    });

    if (
      !existingTask ||
      existingTask.householdId !== household.id ||
      existingTask.isArchived
    ) {
      return c.text("Sysslan finns inte", 404);
    }

    const updatedTask = await db.task.update({
      where: { id: existingTask.id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        reoccurInDays: true,
        worth: true,
      },
    });

    return c.json(updatedTask);
  },
);

export default tasksEdit;
