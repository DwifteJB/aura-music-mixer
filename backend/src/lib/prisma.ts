import { PrismaClient } from "../../generated/prisma";

let prisma;

prisma = new PrismaClient();

prisma.$connect().then(() => {
  console.log("logged into prisma!");
});

export default prisma as PrismaClient;
