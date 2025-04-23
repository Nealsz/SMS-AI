import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const students = sqliteTable("students", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    birthdate: text("birthdate"),
    email: text("email"),
    gender: text("gender"),
    course: text("course"),     // e.g., BSCS, BSIT
    year: integer("year"),      // e.g., 1, 2, 3, 4sss
    block: text("block"),       // e.g., A, B, C
  });

  export const subjects = sqliteTable("subject", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subjectCode: text("subject_code").notNull(),
    subjectName: text("subject_name").notNull(),
    instructorName: text("instructor_name"),
    credits: integer("credits"),
  });
  
export const grades = sqliteTable("grade", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").references(() => students.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  midtermGrade: integer("midterm_grade"),
  finalGrade: integer("final_grade"),
  semester: text("semester"),
  year: integer("year"),
});

export const enrollmentHistory = sqliteTable("enrollment_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").references(() => students.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  semester: text("semester"),
  year: integer("year"),
  status: text("status"), // "enrolled", "dropped", "completed"
});