import { db } from '$lib/server/db';
import { grades } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm'; 

import type { RequestHandler } from '../grades/$types';

// GET: Fetch all grades
export const GET: RequestHandler = async () => {
    const data = await db.select().from(grades);
    return json({ data: data });
};

// POST: Add a new grade entry
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { studentId, subjectId, midtermGrade, finalGrade, semester, year } = await request.json();

        await db.insert(grades).values({
            studentId,
            subjectId,
            midtermGrade,
            finalGrade,
            semester,
            year
        });

        return json({ success: true, message: 'Grade added successfully' });
    } catch (error) {
        return json({ error: 'Failed to add grade' }, { status: 500 });
    }
};

// PUT: Update an existing grade entry
export const PUT: RequestHandler = async ({ request }) => {
    try {
        const { id, studentId, subjectId, midtermGrade, finalGrade, semester, year } = await request.json();

        if (!id || !studentId || !subjectId) {
            return json({ error: 'Missing required fields (id, studentId, subjectId)' }, { status: 400 });
        }

        // Perform the update operation
        const updatedGrade = await db
            .update(grades)
            .set({
                studentId,
                subjectId,
                midtermGrade,
                finalGrade,
                semester,
                year,
            })
            .where(eq(grades.id, id)); // Use eq to compare the id

        // Check if the update affected any rows
        if (updatedGrade?.rowsAffected === 0) {
            return json({ error: 'Grade not found' }, { status: 404 });
        }

        return json({ success: true, message: 'Grade updated successfully' });
    } catch (error) {
        return json({ error: 'Failed to update grade' }, { status: 500 });
    }
};

// DELETE: Delete a grade entry
export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const { id } = await request.json();

        if (!id) {
            return json({ error: 'Missing grade ID' }, { status: 400 });
        }

        // Perform the delete operation
        const deletedGrade = await db
            .delete(grades)
            .where(eq(grades.id, id));

        // The `deletedGrade` will be an empty result if no rows matched
        if (!deletedGrade) {
            return json({ error: 'Grade not found' }, { status: 404 });
        }

        return json({ success: true, message: 'Grade deleted successfully' });
    } catch (error) {
        return json({ error: 'Failed to delete grade' }, { status: 500 });
    }
};
