import { auth } from "../src/lib/auth.ts";
import { db } from "./db.ts";

const msPerDay = 24 * 60 * 60 * 1000;

function daysAgo(days: number) {
  return new Date(Date.now() - days * msPerDay);
}

const testUsers = [
  { name: "Anna", email: "anna@test.se", password: "test1234" },
  { name: "Erik", email: "erik@test.se", password: "test1234" },
  { name: "Sara", email: "sara@test.se", password: "test1234" },
  { name: "Johan", email: "johan@test.se", password: "test1234" },
  { name: "Maja", email: "maja@test.se", password: "test1234" },
];

const testHouseholds = [
  {
    name: "Familjen",
    inviteCode: "ABC234",
    members: [
      {
        email: "anna@test.se",
        nickname: "Anna",
        avatarId: 1,
        isOwner: true,
        status: "active" as const,
      },
      {
        email: "erik@test.se",
        nickname: "Erik",
        avatarId: 2,
        isOwner: false,
        status: "active" as const,
      },
      {
        email: "sara@test.se",
        nickname: "Sara",
        avatarId: 3,
        isOwner: false,
        status: "active" as const,
      },
    ],
    tasks: [
      {
        title: "Diska",
        description: "Plocka i och ur diskmaskinen",
        reoccurInDays: 1,
        worth: 2,
        isArchived: false,
        completions: [
          { email: "anna@test.se", daysAgo: 0 },
          { email: "erik@test.se", daysAgo: 0 },
        ],
      },
      {
        title: "Dammsuga",
        description: "Dammsug alla rum",
        reoccurInDays: 7,
        worth: 4,
        isArchived: false,
        completions: [{ email: "sara@test.se", daysAgo: 3 }],
      },
      {
        title: "Vattna blommor",
        description: "Vattna krukväxterna i fönstren",
        reoccurInDays: 3,
        worth: 1,
        isArchived: false,
        completions: [{ email: "erik@test.se", daysAgo: 5 }],
      },
      {
        title: "Tvätta",
        description: "Tvätta och häng upp tvätten",
        reoccurInDays: 7,
        worth: 6,
        isArchived: false,
        completions: [],
      },
      {
        title: "Laga mat",
        description: "Laga middag till familjen",
        reoccurInDays: 1,
        worth: 8,
        isArchived: false,
        completions: [
          { email: "anna@test.se", daysAgo: 1 },
          { email: "sara@test.se", daysAgo: 2 },
        ],
      },
      {
        title: "Rensa kylskåpet",
        description: "Släng gammal mat och torka hyllor",
        reoccurInDays: 14,
        worth: 4,
        isArchived: true,
        completions: [{ email: "anna@test.se", daysAgo: 8 }],
      },
    ],
  },
  {
    name: "Kompisar",
    inviteCode: "DEF567",
    members: [
      {
        email: "erik@test.se",
        nickname: "Erik",
        avatarId: 1,
        isOwner: true,
        status: "active" as const,
      },
      {
        email: "johan@test.se",
        nickname: "Johan",
        avatarId: 2,
        isOwner: false,
        status: "active" as const,
      },
      {
        email: "maja@test.se",
        nickname: "Maja",
        avatarId: 3,
        isOwner: false,
        status: "pending" as const,
      },
    ],
    tasks: [
      {
        title: "Handla",
        description: "Handla mat inför veckan",
        reoccurInDays: 7,
        worth: 4,
        isArchived: false,
        completions: [{ email: "erik@test.se", daysAgo: 0 }],
      },
      {
        title: "Ta ut soporna",
        description: "Gå ut med sopor och återvinning",
        reoccurInDays: 3,
        worth: 2,
        isArchived: false,
        completions: [{ email: "johan@test.se", daysAgo: 2 }],
      },
    ],
  },
  {
    name: "Kollektivet",
    inviteCode: "ACE247",
    members: [
      {
        email: "sara@test.se",
        nickname: "Sara",
        avatarId: 1,
        isOwner: true,
        status: "active" as const,
      },
      {
        email: "anna@test.se",
        nickname: "Anna",
        avatarId: 2,
        isOwner: false,
        status: "active" as const,
      },
      {
        email: "johan@test.se",
        nickname: "Johan",
        avatarId: 3,
        isOwner: false,
        status: "active" as const,
      },
    ],
    tasks: [],
  },
];

async function main() {
  const users = new Map<string, string>();

  for (const testUser of testUsers) {
    let user = await db.user.findUnique({
      where: { email: testUser.email },
    });

    if (!user) {
      const result = await auth.api.signUpEmail({
        body: {
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        },
      });

      user = await db.user.findUnique({
        where: { email: testUser.email },
      });

      if (!user) {
        throw new Error(
          `Kunde inte hitta användaren efter registrering: ${testUser.email}`,
        );
      }

      if (result.user.id !== user.id) {
        throw new Error(`Användar-ID stämmer inte för ${testUser.email}`);
      }
    }

    users.set(testUser.email, user.id);
  }

  for (const householdData of testHouseholds) {
    const household = await db.household.upsert({
      where: { inviteCode: householdData.inviteCode },
      create: {
        name: householdData.name,
        inviteCode: householdData.inviteCode,
      },
      update: {
        name: householdData.name,
      },
    });

    const membersByEmail = new Map<string, string>();

    for (const memberData of householdData.members) {
      const userId = users.get(memberData.email);

      if (!userId) {
        throw new Error(`Användaren saknas: ${memberData.email}`);
      }

      const member = await db.householdMember.upsert({
        where: {
          userId_householdId: {
            userId,
            householdId: household.id,
          },
        },
        create: {
          userId,
          householdId: household.id,
          nickname: memberData.nickname,
          avatarId: memberData.avatarId,
          isOwner: memberData.isOwner,
          status: memberData.status,
        },
        update: {
          nickname: memberData.nickname,
          avatarId: memberData.avatarId,
          isOwner: memberData.isOwner,
          status: memberData.status,
        },
      });

      membersByEmail.set(memberData.email, member.id);
    }

    for (const taskData of householdData.tasks) {
      const existingTask = await db.task.findFirst({
        where: {
          householdId: household.id,
          title: taskData.title,
        },
      });

      const task = existingTask
        ? await db.task.update({
            where: { id: existingTask.id },
            data: {
              description: taskData.description,
              reoccurInDays: taskData.reoccurInDays,
              worth: taskData.worth,
              isArchived: taskData.isArchived,
              createdAt: new Date(),
            },
          })
        : await db.task.create({
            data: {
              householdId: household.id,
              title: taskData.title,
              description: taskData.description,
              reoccurInDays: taskData.reoccurInDays,
              worth: taskData.worth,
              isArchived: taskData.isArchived,
            },
          });

      await db.completedTask.deleteMany({
        where: { taskId: task.id },
      });

      for (const completion of taskData.completions) {
        const memberId = membersByEmail.get(completion.email);

        if (!memberId) {
          throw new Error(
            `Medlem saknas i ${householdData.name}: ${completion.email}`,
          );
        }

        await db.completedTask.create({
          data: {
            taskId: task.id,
            memberId,
            createdAt: daysAgo(completion.daysAgo),
          },
        });
      }
    }
  }

  console.log(
    "Seed completed! 5 testanvändare, 3 hushåll, sysslor och markeringar är redo.",
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
