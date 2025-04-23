import { db } from '$lib/server/db';
import { students, subjects, grades, enrollmentHistory } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type OllamaRequest = {
    model: string;
    prompt: string;
    stream?: boolean;
};

type OllamaResponse = {
    response: string;
    done: boolean;
};

const generateSummary = async (input: string): Promise<string> => {
    const body: OllamaRequest = {
        model: 'llama3',
        prompt: input,
        stream: false // absolutely no streaming
    };

    const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok || !res.body) {
        console.error('Failed to connect to Ollama');
        return 'Summary generation failed.';
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // handle possible multiple lines/chunks in one read
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            try {
                const json = JSON.parse(line);
                fullText += json.response || '';
                if (json.done) break;
            } catch (err) {
                console.warn('Failed to parse chunk:', line);
            }
        }
    }

    return fullText.trim();
};

export const GET: RequestHandler = async () => {
    // Fetch data from the database
    const studentList = await db.select().from(students);
    const subjectList = await db.select().from(subjects);
    const gradeList = await db.select().from(grades);
    const enrollmentList = await db.select().from(enrollmentHistory);

    // Convert data into string format
    const studentString = studentList
        .map((s, i) => `${i + 1}. Name: ${s.firstName} ${s.lastName}, ID: ${s.id}, Course: ${s.course}, Year: ${s.year}, Block: ${s.block}`)
        .join('\n');

    const subjectString = subjectList
        .map((s, i) => `${i + 1}. ${s.subjectName} (${s.subjectCode}), Instructor: ${s.instructorName || 'N/A'}, Credits: ${s.credits ?? 'N/A'}`)
        .join('\n');

    const gradeString = gradeList
        .map((g, i) => `${i + 1}. Student ID: ${g.studentId}, Subject ID: ${g.subjectId}, Midterm: ${g.midtermGrade ?? 'N/A'}, Final: ${g.finalGrade ?? 'N/A'}, Year: ${g.year}, Semester: ${g.semester}`)
        .join('\n');

    const enrollmentString = enrollmentList
        .map((e, i) => `${i + 1}. Student ID: ${e.studentId}, Subject ID: ${e.subjectId}, Semester: ${e.semester}, Year: ${e.year}, Status: ${e.status}`)
        .join('\n');

    // Combine all data into a single input for summary generation
    const combinedInput = [
        '--- Students ---',
        studentString,
        '--- Subjects ---',
        subjectString,
        '--- Grades ---',
        gradeString,
        '--- Enrollment History ---',
        enrollmentString
    ].join('\n\n');

    // Generate summary using the external API (Ollama)
    const summary = await generateSummary(combinedInput);

    // Return the summary as JSON response
    return json({ summary });
};
