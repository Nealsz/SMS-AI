// import { db } from '$lib/server/db';
// import { attendance, students } from '$lib/server/db/schema';
// import { redirect, fail } from '@sveltejs/kit';
// import { eq } from 'drizzle-orm';

// export const load = async () => {
// const allAttendance = await db
//     .select({
//         id: attendance.id,
//         date: attendance.date,
//         status: attendance.status,
//         student: students.Name,
//         studentId: attendance.studentId,
//     })
//     .from(attendance)
//     .leftJoin(students, eq(attendance.studentId, students.id));

//   const allStudents = await db.select().from(students);

//   return { attendance: allAttendance, students: allStudents };
// };

// export const actions = {
//   default: async ({ request }: { request: Request }) => {
//     const formData = await request.formData();
//     const studentId = Number(formData.get('studentId'));
//     const date = formData.get('date') as string;
//     const status = formData.get('status') as string;

//     if (!studentId || !date || !status) {
//       return fail(400, { error: 'Missing fields' });
//     }

//     await db.insert(attendance).values({ studentId, date, status });
//     throw redirect(303, '/attendance');
//   },
// };