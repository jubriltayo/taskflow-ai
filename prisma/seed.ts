import { PrismaClient, TaskStatus, TaskPriority } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create user
  const user = await prisma.user.create({
    data: {
      email: "demo@taskflow.dev",
      name: "Demo User",
    },
  });

  // Create categories
  await prisma.category.createMany({
    data: [
      { name: "Work", color: "#f59e0b", userId: user.id },
      { name: "Personal", color: "#10b981", userId: user.id },
      { name: "Urgent", color: "#ef4444", userId: user.id },
    ],
  });

  const categoryRecords = await prisma.category.findMany({
    where: { userId: user.id },
  });

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Finish project proposal",
        description: "Draft and submit the proposal for Q4 initiative",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        userId: user.id,
        categoryId: categoryRecords.find((c) => c.name === "Work")?.id,
      },
      {
        title: "Buy groceries",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        userId: user.id,
        categoryId: categoryRecords.find((c) => c.name === "Personal")?.id,
      },
      {
        title: "Renew passport",
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.LOW,
        userId: user.id,
        categoryId: categoryRecords.find((c) => c.name === "Urgent")?.id,
      },
    ],
  });

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
