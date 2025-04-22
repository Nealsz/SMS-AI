import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  age: integer("age"),
  course: text("course")
});
