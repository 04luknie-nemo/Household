import { auth } from "../src/lib/auth.ts";
import { db } from "./db.ts";

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

    for (const memberData of householdData.members) {
      const userId = users.get(memberData.email);

      if (!userId) {
        throw new Error(`Användaren saknas: ${memberData.email}`);
      }

      await db.householdMember.upsert({
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
    }
  }

  console.log("Seed completed! 5 testanvändare och 3 hushåll är redo.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
