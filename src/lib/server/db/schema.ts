// src/lib/server/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const students = sqliteTable("students", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthdate: text("birthdate"),
  email: text("email"),
  gender: text("gender"),
});

export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subjectCode: text("subject_code").notNull(),
  subjectName: text("subject_name").notNull(),
  instructorName: text("instructor_name"),
  credits: integer("credits"),
});

export const grades = sqliteTable("grades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").references(() => students.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  grade: integer("grade"),
  semester: text("semester"),
  year: integer("year"), 
});

export const attendance = sqliteTable("attendance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").references(() => students.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  date: text("date"),
  status: text("status"), // "present" or "absent"
});

export const remarks = sqliteTable("remarks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").references(() => students.id),
  author: text("author"),
  note: text("note"),
  date: text("date"),
});

export const enrollment = sqliteTable("enrollment", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").references(() => students.id),
  semester: text("semester"),
  year: integer("year"),
  status: text("status"), // e.g., "active", "dropped"
});
