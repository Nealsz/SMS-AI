import { db } from '$lib/server/db';
import { enrollmentHistory } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm'; // Import the eq function

import type { RequestHandler } from '../enrollment/$types';

// GET: Fetch all enrollment histories
export const GET: RequestHandler = async () => {
    const data = await db.select().from(enrollmentHistory);
    return json({ data: data });
};

// POST: Add a new enrollment entry
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { studentId, subjectId, semester, year, status } = await request.json();

        await db.insert(enrollmentHistory).values({
            studentId,
            subjectId,
            semester,
            year,
            status
        });

        return json({ success: true, message: 'Enrollment added successfully' });
    } catch (error) {
        return json({ error: 'Failed to add enrollment' }, { status: 500 });
    }
};

// PUT: Update an existing enrollment entry
export const PUT: RequestHandler = async ({ request }) => {
    try {
        const { id, studentId, subjectId, semester, year, status } = await request.json();

        if (!id || !studentId || !subjectId) {
            return json({ error: 'Missing required fields (id, studentId, subjectId)' }, { status: 400 });
        }

        // Perform the update operation
        const updatedEnrollment = await db
            .update(enrollmentHistory)
            .set({
                studentId,
                subjectId,
                semester,
                year,
                status
            })
            .where(eq(enrollmentHistory.id, id)); // Use eq to compare the id

        // Check if the update affected any rows
        if (updatedEnrollment?.rowsAffected === 0) {
            return json({ error: 'Enrollment not found' }, { status: 404 });
        }

        return json({ success: true, message: 'Enrollment updated successfully' });
    } catch (error) {
        return json({ error: 'Failed to update enrollment' }, { status: 500 });
    }
};

// DELETE: Delete an enrollment entry
export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const { id } = await request.json();

        if (!id) {
            return json({ error: 'Missing enrollment ID' }, { status: 400 });
        }

        // Perform the delete operation
        const deletedEnrollment = await db
            .delete(enrollmentHistory)
            .where(eq(enrollmentHistory.id, id));

        // The `deletedEnrollment` will be an empty result if no rows matched
        if (!deletedEnrollment) {
            return json({ error: 'Enrollment not found' }, { status: 404 });
        }

        return json({ success: true, message: 'Enrollment deleted successfully' });
    } catch (error) {
        return json({ error: 'Failed to delete enrollment' }, { status: 500 });
    }
};
