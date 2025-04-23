import { db } from '$lib/server/db';
import { students, subjects, grades, enrollmentHistory } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const OLLAMA_MODEL = 'llama3.2:latest'; // Updated to match your installed model
const SYSTEM_PROMPT = `You are a highly capable AI assistant specialized in summarizing information. 
Follow these guidelines:
- Focus on key insights and important patterns
- Use clear, concise language
- Organize information logically
- Highlight notable trends or anomalies
- Keep the tone professional and objective`;

type OllamaRequest = {
    model: string;
    prompt: string;
    system?: string;
    stream?: boolean;
};

type OllamaResponse = {
    response: string;
    done: boolean;
};

const generateSummary = async (input: string): Promise<string> => {
    try {
        const body: OllamaRequest = {
            model: OLLAMA_MODEL,
            system: SYSTEM_PROMPT,
            prompt: `Please analyze and summarize the following information:\n\n${input}\n\nProvide a well-structured summary that captures the essential information and any notable patterns or insights.`,
            stream: false
        };

        const res = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            throw new Error(`Failed to connect to Ollama: ${res.statusText}`);
        }

        const reader = res.body?.getReader();
        if (!reader) {
            throw new Error('No response body from Ollama');
        }

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
                try {
                    const json = JSON.parse(line) as OllamaResponse;
                    fullText += json.response || '';
                    if (json.done) break;
                } catch (err) {
                    console.warn('Failed to parse chunk:', line);
                }
            }
        }

        return fullText.trim() || 'Unable to generate a meaningful summary.';
    } catch (error) {
        console.error('Error in generateSummary:', error);
        throw new Error('Failed to generate summary');
    }
};

export const GET: RequestHandler = async () => {
    try {
        // Fetch data from the database
        const studentList = await db.select().from(students);
        const subjectList = await db.select().from(subjects);
        const gradeList = await db.select().from(grades);
        const enrollmentList = await db.select().from(enrollmentHistory);

        // Calculate enrollment statistics
        const totalEnrollments = enrollmentList.length;
        const statusCounts = enrollmentList.reduce((acc, curr) => {
            const status = curr.status ?? 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const semesterCounts = enrollmentList.reduce((acc, curr) => {
            const key = `${curr.semester ?? 'Unknown'} ${curr.year ?? 'N/A'}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Convert data into string format with statistics
        const studentString = studentList.length > 0 
            ? studentList.map((s, i) => `${i + 1}. Name: ${s.firstName} ${s.lastName}, ID: ${s.id}, Course: ${s.course}, Year: ${s.year}, Block: ${s.block}`).join('\n')
            : 'No students found';

        const subjectString = subjectList.length > 0
            ? subjectList.map((s, i) => `${i + 1}. ${s.subjectName} (${s.subjectCode}), Instructor: ${s.instructorName || 'N/A'}, Credits: ${s.credits ?? 'N/A'}`).join('\n')
            : 'No subjects found';

        const gradeString = gradeList.length > 0
            ? gradeList.map((g, i) => `${i + 1}. Student ID: ${g.studentId}, Subject ID: ${g.subjectId}, Midterm: ${g.midtermGrade ?? 'N/A'}, Final: ${g.finalGrade ?? 'N/A'}, Year: ${g.year}, Semester: ${g.semester}`).join('\n')
            : 'No grades found';

        const enrollmentStats = [
            `Total Enrollments: ${totalEnrollments}`,
            '\nStatus Distribution:',
            ...Object.entries(statusCounts).map(([status, count]) => 
                `- ${status}: ${count} (${((count/totalEnrollments) * 100).toFixed(1)}%)`
            ),
            '\nSemester Distribution:',
            ...Object.entries(semesterCounts).map(([semester, count]) => 
                `- ${semester}: ${count} enrollments`
            )
        ].join('\n');

        const enrollmentString = enrollmentList.length > 0
            ? [
                enrollmentStats,
                '\nDetailed Enrollment Records:',
                ...enrollmentList.map((e, i) => 
                    `${i + 1}. Student ID: ${e.studentId}, Subject ID: ${e.subjectId}, ${e.semester} ${e.year}, Status: ${e.status}`
                )
              ].join('\n')
            : 'No enrollments found';

        // Combine all data into a single input for summary generation
        const combinedInput = [
            '=== Database Summary ===\n',
            '--- Enrollment Statistics and History ---',
            enrollmentString,
            '\n--- Students ---',
            studentString,
            '\n--- Subjects ---',
            subjectString,
            '\n--- Grades ---',
            gradeString,
        ].join('\n');

        // Generate summary using Ollama
        const summary = await generateSummary(combinedInput);
        return json({ summary });
    } catch (error) {
        console.error('Error fetching database summary:', error);
        return new Response('Error fetching database summary', { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { text } = await request.json();
        if (!text) {
            return new Response('No text provided', { status: 400 });
        }

        const summary = await generateSummary(text);
        return json({ summary });
    } catch (error) {
        console.error('Error processing summary:', error);
        return new Response('Error processing request', { status: 500 });
    }
};
