import { Hono } from "hono";
import { auth } from "../lib/auth.ts";
import { db } from "../../prisma/db.ts";

const tasksComplete = new Hono();

tasksComplete.post("/:id/tasks/:taskId/complete", async (c) => {
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
        select: { id: true, status: true },
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
      isArchived: true,
    },
  });

  if (!task || task.householdId !== household.id || task.isArchived) {
    return c.text("Sysslan finns inte", 404);
  }

  const completedTask = await db.completedTask.create({
    data: {
      memberId: me.id,
      taskId: task.id,
    },
  });

  return c.json(completedTask, 201);
});

export default tasksComplete;
