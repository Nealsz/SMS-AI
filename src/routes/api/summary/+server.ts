import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {

    const data = await db.select().from(user);

    // Implement Ollama Here

    return json({ responses: 'The summary of the data provided...'});
}
