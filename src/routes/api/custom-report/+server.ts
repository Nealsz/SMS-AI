import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { students, subjects, attendance } from '$lib/server/db/schema';
import { spawn } from 'child_process';

export async function POST({ request }) {
	const { type } = await request.json();

	// Query database based on type
	let data = '';
	if (type === 'summary') {
		const allStudents = await db.select().from(students);
		const allSubjects = await db.select().from(subjects);
		const allAttendance = await db.select().from(attendance);
		data = JSON.stringify({ students: allStudents, subjects: allSubjects, attendance: allAttendance });
	} else {
		return json({ error: 'Invalid report type' }, { status: 400 });
	}

	// Use Ollama to summarize
	const prompt = `Generate a concise, readable summary of the following student data:\n${data}`;

	const result = await runOllama(prompt);
	return json({ summary: result });
}

function runOllama(prompt: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const process = spawn('ollama', ['run', 'llama3.1:latest'], {
			stdio: ['pipe', 'pipe', 'inherit']
		});

		let output = '';
		process.stdout.on('data', (data) => (output += data.toString()));
		process.stdin.write(prompt);
		process.stdin.end();

		process.on('close', () => resolve(output));
		process.on('error', reject);
	});
}
