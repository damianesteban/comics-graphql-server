import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Alice",
    email: "alice@prisma.io",
    comics: {
      create: [
        {
          title: "Batman",
          publisher: "DC",
          issueNumber: 10
        },
      ],
    },
  },
  {
    name: "Nilu",
    email: "nilu@prisma.io",
    comics: {
      create: [
        {
          title: "Aquaman",
          publisher: "Marvel",
          issueNumber: 42,
        },
      ],
    },
  },
  {
    name: "Mahmoud",
    email: "mahmoud@prisma.io",
    comics: {
      create: [
        {
          title: "Batman",
          publisher: "DC",
          issueNumber: 111
        },
        {
          title: "Superman",
          publisher: "DC",
          issueNumber: 111
        },
      ],
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
