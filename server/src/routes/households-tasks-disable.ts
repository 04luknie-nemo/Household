import { Hono } from "hono";
import { auth } from "../lib/auth.ts";
import { db } from "../../prisma/db.ts";

const tasksDisable = new Hono();

tasksDisable.post("/:id/tasks/:taskId/archive", async (c) => {
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
        select: { status: true, isOwner: true },
      },
    },
  });

  if (!household) {
    return c.text("Hushållet finns inte!", 404);
  }

  const me = household.members[0];
  if (!me || me.status !== "active") {
    return c.text("Du är inte medlem!", 403);
  }
  if (!me.isOwner) {
    return c.text("Du är inte en ägare!", 403);
  }

  const task = await db.task.findUnique({
    where: { id: c.req.param("taskId") },
    select: {
      id: true,
      householdId: true,
      isArchived: true,
    },
  });

  if (!task || task.householdId !== household.id || task.isArchived) {
    return c.text("Sysslan finns inte", 404);
  }

  const taskData = await db.task.update({
    where: { id: task.id },
    select: {
      id: true,
      isArchived: true,
    },
    data: { isArchived: true },
  });
  return c.json(taskData, 200);
});

tasksDisable.delete("/:id/tasks/:taskId", async (c) => {
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
        select: { status: true, isOwner: true },
      },
    },
  });

  if (!household) {
    return c.text("Hushållet finns inte!", 404);
  }

  const me = household.members[0];
  if (!me || me.status !== "active") {
    return c.text("Du är inte medlem!", 403);
  }
  if (!me.isOwner) {
    return c.text("Du är inte en ägare!", 403);
  }

  const task = await db.task.findUnique({
    where: { id: c.req.param("taskId") },
    select: {
      id: true,
      householdId: true,
      isArchived: true,
    },
  });

  if (!task || task.householdId !== household.id || task.isArchived) {
    return c.text("Sysslan finns inte", 404);
  }

  await db.$transaction([
    db.completedTask.deleteMany({ where: { taskId: task.id } }),
    db.task.delete({ where: { id: task.id } }),
  ]);
  return c.json({ id: task.id }, 200);
});

export default tasksDisable;
