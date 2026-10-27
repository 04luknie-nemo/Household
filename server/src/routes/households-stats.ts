import { Hono } from "hono";
import { auth } from "../lib/auth.ts";
import { db } from "../../prisma/db.ts";

const stats = new Hono();

function periodRange(period: string | undefined) {
  // Samma lokala tidszon som dagsvyn. Kalenderdagar hanterar sommartid.
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return { from: monday, to: now}
}

stats.get("/:id/stats", async (c) => {
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
  if (household.members[0]?.status !== "active") {
    return c.text("Inte medlem", 403);
  }

  const range = periodRange(c.req.query("period"));
  if (!range) {
    return c.text("Ogiltig period", 400);
  }

  // Samma lokala tidszon som dagsvyn. Kalenderdagar hanterar sommartid.
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const completedTasks = await db.completedTask.findMany({
    where: {
      task: { householdId: household.id },
      member: { householdId: household.id },
      createdAt: { gte: range.from, lte: range.to },
    },
    select: {
      task: { select: { id: true, title: true, worth: true } },
      member: { select: { avatarId: true, nickname: true } },
    },
  });

  const total = new Map<
    number,
    { avatarId: number; nickname: string; points: number }
  >();
  const perTask = new Map<
    string,
    { taskId: string; title: string; members: Map<number, number> }
  >();

  for (const { task, member } of completedTasks) {
    const memberTotal = total.get(member.avatarId) ?? { ...member, points: 0 };
    memberTotal.points += task.worth;
    total.set(member.avatarId, memberTotal);

    const taskTotal = perTask.get(task.id) ?? {
      taskId: task.id,
      title: task.title,
      members: new Map<number, number>(),
    };
    taskTotal.members.set(
      member.avatarId,
      (taskTotal.members.get(member.avatarId) ?? 0) + task.worth,
    );
    perTask.set(task.id, taskTotal);
  }

  return c.json({
    total: [...total.values()].sort((a, b) => a.avatarId - b.avatarId),
    perTask: [...perTask.values()]
      .sort((a, b) => a.taskId.localeCompare(b.taskId))
      .map(({ taskId, title, members }) => ({
        taskId,
        title,
        members: [...members.entries()]
          .map(([avatarId, points]) => ({ avatarId, points }))
          .sort((a, b) => a.avatarId - b.avatarId),
      })),
  });
});

export default stats;
