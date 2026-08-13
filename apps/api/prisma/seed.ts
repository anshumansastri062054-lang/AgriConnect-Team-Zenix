import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const roleNames = ["FARMER","LAND_OWNER","EQUIPMENT_OWNER","DIGITAL_MITRA","PROCUREMENT_OFFICER","ORGANIZATION_ADMIN","ADMIN"];
  for (const name of roleNames) await prisma.role.upsert({ where: { name }, update: {}, create: { name } });

  const farmerRole = await prisma.role.findUniqueOrThrow({ where: { name: "FARMER" } });
  const farmer = await prisma.user.upsert({
    where: { farmerId: "DEMO-FARMER-001" },
    update: {},
    create: { farmerId: "DEMO-FARMER-001", name: "Ramesh Kumar", mobile: "9000000001", roles: { create: [{ roleId: farmerRole.id }] } }
  });

  await prisma.farmerProfile.upsert({
    where: { userId: farmer.id },
    update: {},
    create: { userId: farmer.id, location: "Ganjam, Odisha", reliabilityScore: 86 }
  });

  await prisma.crop.createMany({
    data: [
      { name: "Paddy", season: ["Kharif"] },
      { name: "Maize", season: ["Kharif","Rabi"] },
      { name: "Groundnut", season: ["Kharif"] }
    ],
    skipDuplicates: true
  });

  console.log("AgriConnect demo seed complete.");
}
main().finally(() => prisma.$disconnect());
