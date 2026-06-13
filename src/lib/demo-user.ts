import { db } from "@/lib/db";

export const DEMO_USER_EMAIL = "demo@echive.app";

export async function getDemoUser() {
  return db.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: { name: "Demo User" },
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
    },
  });
}
