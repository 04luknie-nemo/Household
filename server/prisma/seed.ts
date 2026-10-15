import { db } from "./db.ts";

async function main() {
  // Eventuell testdata för medlemmar, hushåll, sysslor
  console.log("Seed completed!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
