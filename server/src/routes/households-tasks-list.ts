import { Hono } from "hono";
import { auth } from "../lib/auth.ts";
import { db } from "../../prisma/db.ts";

const taskList = new Hono();

// Räknar i serverns tidszon (Europe/Stockholm för lokalt)
function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
const msPerDag = 24 * 60 * 60 * 1000;

taskList.get("/:id/tasks", async (c) => {
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
    return c.text("Användaren är inte medlem", 403);
  }
  const tasks = await db.task.findMany({
    where: {
      householdId: household.id,
      isArchived: false,
    },
    select: {
      id: true,
      title: true,
      description: true,
      reoccurInDays: true,
      worth: true,
      createdAt: true,
      completedTasks: {
        orderBy: { createdAt: "desc" },
        select: {
          createdAt: true,
          member: { select: { avatarId: true } },
        },
      },
    },
  });

  const today = startOfDay(new Date());

  const response = tasks.map((t) => {
    const doneToday = t.completedTasks.filter(
      (ct) => startOfDay(ct.createdAt).getTime() === today.getTime(),
    );
    const listOfAvatars = doneToday.map((ct) => ct.member.avatarId);
    const refinedAvatarList = [...new Set(listOfAvatars)];

    // datum för när den gjordes, annars när den skapades
    const last = t.completedTasks[0]?.createdAt ?? t.createdAt;
    // dagar sen senast gjord
    const daysSinceLast = Math.round(
      (today.getTime() - startOfDay(last).getTime()) / msPerDag,
    );

    const isOverdue = daysSinceLast > t.reoccurInDays;

    return {
      id: t.id,
      title: t.title,
      description: t.description,
      reoccurInDays: t.reoccurInDays,
      worth: t.worth,
      doneTodayBy: refinedAvatarList,
      daysSinceLast,
      isOverdue,
    };
  });
  return c.json(response);
});

export default taskList;
