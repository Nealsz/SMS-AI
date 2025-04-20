import { json } from '@sveltejs/kit';

// Mock data for grades and finals
const grades = [
    { studentId: 1, name: 'Alice', grade: 85 },
    { studentId: 2, name: 'Bob', grade: 90 },
    { studentId: 3, name: 'Charlie', grade: 78 }
];

const finals = [
    { studentId: 1, name: 'Alice', finalGrade: 88 },
    { studentId: 2, name: 'Bob', finalGrade: 92 },
    { studentId: 3, name: 'Charlie', finalGrade: 80 }
];

// GET handler for grades and finals
export async function GET({ url }) {
    const type = url.searchParams.get('type');

    if (type === 'grades') {
        return json({ data: grades });
    } else if (type === 'finals') {
        return json({ data: finals });
    } else {
        return json({ error: 'Invalid type parameter. Use "grades" or "finals".' }, { status: 400 });
    }
}