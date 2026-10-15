import { db } from "./db.ts";

async function main() {
  const statuses = ["pending", "active", "left"];

  for (const name of statuses) {
    const existingStatus = await db.status.findFirst({
      where: { name },
    });

    if (!existingStatus) {
      await db.status.create({
        data: { name },
      });
    }
  }

  console.log("Status seed completed!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
