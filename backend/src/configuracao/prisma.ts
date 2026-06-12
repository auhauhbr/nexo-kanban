import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.js";
import { ambiente } from "./ambiente.js";

const adapter = new PrismaPg({
  connectionString: ambiente.DATABASE_URL
});

export const prisma = new PrismaClient({ adapter });
