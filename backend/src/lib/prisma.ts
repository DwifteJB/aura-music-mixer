import { PrismaClient } from "../../generated/prisma";

let prisma;

prisma = new PrismaClient();

prisma.$connect().then(() => {});

export default prisma as PrismaClient;
