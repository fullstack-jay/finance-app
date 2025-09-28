import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

// Extended user profile information
export const userProfile = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()  // Only one profile per user
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
  }),
}));