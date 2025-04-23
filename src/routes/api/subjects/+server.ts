import { db } from '$lib/server/db';
import { subjects } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm'; // Import the eq function

import type { RequestHandler } from '../subjects/$types';

// GET: Fetch all subjects
export const GET: RequestHandler = async () => {
    const data = await db.select().from(subjects);
    return json({ data: data });
};

// POST: Add a new subject
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { subjectCode, subjectName, instructorName, credits } = await request.json();

        await db.insert(subjects).values({
            subjectCode,
            subjectName,
            instructorName,
            credits
        });

        return json({ success: true, message: 'Subject added successfully' });
    } catch (error) {
        return json({ error: 'Failed to add subject' }, { status: 500 });
    }
};

// PUT: Update an existing subject
export const PUT: RequestHandler = async ({ request }) => {
    try {
        const { id, subjectCode, subjectName, instructorName, credits } = await request.json();

        if (!id || !subjectCode || !subjectName) {
            return json({ error: 'Missing required fields (id, subjectCode, subjectName)' }, { status: 400 });
        }

        // Perform the update operation
        const updatedSubject = await db
            .update(subjects)
            .set({
                subjectCode,
                subjectName,
                instructorName,
                credits,
            })
            .where(eq(subjects.id, id)); // Use eq to compare the id

        // Check if the update affected any rows
        if (updatedSubject?.rowsAffected === 0) {
            return json({ error: 'Subject not found' }, { status: 404 });
        }

        return json({ success: true, message: 'Subject updated successfully' });
    } catch (error) {
        return json({ error: 'Failed to update subject' }, { status: 500 });
    }
};

// DELETE: Delete a subject
export const DELETE: RequestHandler = async ({ request }) => {
    try {
        const { id } = await request.json();

        if (!id) {
            return json({ error: 'Missing subject ID' }, { status: 400 });
        }

        // Perform the delete operation
        const deletedSubject = await db
            .delete(subjects)
            .where(eq(subjects.id, id));

        // The `deletedSubject` will be an empty result if no rows matched
        if (!deletedSubject) {
            return json({ error: 'Subject not found' }, { status: 404 });
        }

        return json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        return json({ error: 'Failed to delete subject' }, { status: 500 });
    }
};
