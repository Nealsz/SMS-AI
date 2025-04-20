<script lang="ts">
    import { onMount } from 'svelte';

    export let studentId: number;

    interface Subject {
        id: number;
        name: string;
        code: string;
        description: string | null;
    }

    interface AttendanceRecord {
        subjectId: number;
        date: string;
        status: 'Present' | 'Absent' | 'Late';
    }

    let subjects: Subject[] = [];
    let attendanceInputs: { [key: number]: 'Present' | 'Absent' | 'Late' | '' } = {};
    let attendanceSummary = { total: 0, present: 0, absent: 0, late: 0 };

    const today = new Date().toISOString().split('T')[0]; // e.g. '2025-04-20'

    onMount(async () => {
        await loadSubjects();
        await loadAttendance();
    });

    async function loadSubjects() {
        const res = await fetch('/api/subjects');
        const data = await res.json();
        subjects = data.data;
    }

    async function loadAttendance() {
        const res = await fetch(`/api/attendance?studentId=${studentId}&date=${today}`);
        const data = await res.json();
        const records: AttendanceRecord[] = data.data;

        attendanceInputs = Object.fromEntries(
            records.map(r => [r.subjectId, r.status])
        );

        updateSummary();
    }

    function handleStatusChange(subjectId: number, status: 'Present' | 'Absent' | 'Late') {
        attendanceInputs[subjectId] = status;
        updateSummary();
    }

    function updateSummary() {
        const statuses = Object.values(attendanceInputs);
        attendanceSummary = {
            total: statuses.length,
            present: statuses.filter(s => s === 'Present').length,
            absent: statuses.filter(s => s === 'Absent').length,
            late: statuses.filter(s => s === 'Late').length
        };
    }

    async function saveAttendance() {
        const payload = Object.entries(attendanceInputs).map(([subjectId, status]) => ({
            studentId,
            subjectId: Number(subjectId),
            date: today,
            status
        }));

        await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        await loadAttendance(); // Reload to reflect saved state
    }
</script>

<div class="attendance-panel">
    <div class="panel-header">
        <h3>Attendance for {today}</h3>
        <div class="summary">
            <span>Total: {attendanceSummary.total}</span>
            <span>Present: {attendanceSummary.present}</span>
            <span>Absent: {attendanceSummary.absent}</span>
            <span>Late: {attendanceSummary.late}</span>
        </div>
    </div>

    <div class="subjects-grid">
        {#each subjects as subject (subject.id)}
            <div class="subject-card">
                <div class="subject-name">{subject.name} ({subject.code})</div>
                <div class="attendance-options">
                    {#each ['Present', 'Absent', 'Late'] as status}
                        <label>
                            <input
                                type="radio"
                                name="status-{subject.id}"
                                value={status}
                                checked={attendanceInputs[subject.id] === status}
                                on:change={() => handleStatusChange(subject.id, status as 'Present' | 'Absent' | 'Late')}
                            />
                            {status}
                        </label>
                    {/each}
                </div>
            </div>
        {/each}
    </div>

    <div class="panel-footer">
        <button class="btn btn-primary" on:click={saveAttendance}>
            Save Attendance
        </button>
    </div>
</div>

<style>
    .attendance-panel {
        background: var(--card-background);
        border-radius: 0.5rem;
        padding: 1.5rem;
        margin-top: 1rem;
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .summary span {
        margin-right: 1rem;
        font-weight: 500;
    }

    .subjects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .subject-card {
        background: var(--background-color);
        padding: 1rem;
        border-radius: 0.375rem;
    }

    .subject-name {
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    .attendance-options label {
        display: inline-block;
        margin-right: 1rem;
    }

    .panel-footer {
        display: flex;
        justify-content: flex-end;
    }

    button {
        padding: 0.5rem 1.25rem;
    }
</style>
