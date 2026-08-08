import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Yo'l", slug: "road", icon: "road" },
  { name: "Yoritish", slug: "lighting", icon: "lamp" },
  { name: "Chiqindi", slug: "trash", icon: "trash" },
  { name: "Suv", slug: "water", icon: "water" },
  { name: "Elektr", slug: "electricity", icon: "bolt" },
  { name: "Bog' va park", slug: "park", icon: "tree" },
  { name: "Transport", slug: "transport", icon: "bus" },
  { name: "Boshqa", slug: "other", icon: "dots" },
];

async function main() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL || "superadmin@fixmycity.uz";
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || "SuperAdmin123!";

  const passwordHash = await bcrypt.hash(password, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      firstName: process.env.SEED_SUPER_ADMIN_FIRST_NAME || "Super",
      lastName: process.env.SEED_SUPER_ADMIN_LAST_NAME || "Admin",
      email,
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log(`Super admin ready: ${superAdmin.email} (${superAdmin.role})`);

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: cat,
    });
  }
  console.log(`Categories ready: ${CATEGORIES.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
