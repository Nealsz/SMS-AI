<script lang="ts">
    import { onMount } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import Chart from 'chart.js/auto';

    interface Student {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        major: string;
        enrollmentDate: string;
        gender: string;
        age: number;
        attendance: number;
    }

    let students: Student[] = [];
    let showChatbot = false;
    let summary = '';
    let formData = {
        firstName: '',
        lastName: '',
        email: '',
        major: '',
        enrollmentDate: '',
        gender: '',
        age: 0,
        attendance: 0
    };
    let genderChart: Chart;
    let majorChart: Chart;
    let attendanceChart: Chart;

    onMount(() => {
        loadStudents();
    });

    async function loadStudents() {
        const studentsResponse = await fetch('/api/students');
        const studentsData = await studentsResponse.json();
        students = studentsData.data;
        createCharts();
    }

    async function getSummary() {
        const response = await fetch('/api/summary');
        const data = await response.json();
        summary = data.response;
    }

    async function handleSubmit() {
        await fetch('/api/students', {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { 'Content-Type': 'application/json' }
        });
        await loadStudents();
        formData = {
            firstName: '',
            lastName: '',
            email: '',
            major: '',
            enrollmentDate: '',
            gender: '',
            age: 0,
            attendance: 0
        };
    }

    async function deleteStudent(id: number) {
        await fetch('/api/students', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
            headers: { 'Content-Type': 'application/json' }
        });
        await loadStudents();
    }

    function createCharts() {
        const getCSS = (prop: string) => getComputedStyle(document.documentElement).getPropertyValue(prop);

        const genderData = students.reduce((acc: Record<string, number>, s) => {
            acc[s.gender] = (acc[s.gender] || 0) + 1;
            return acc;
        }, {});

        const genderCtx = document.getElementById('genderChart') as HTMLCanvasElement;
        if (genderChart) genderChart.destroy();
        genderChart = new Chart(genderCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(genderData),
                datasets: [{
                    data: Object.values(genderData),
                    backgroundColor: ['#4D869C', '#CDE8E5', '#7AB2B2']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Gender Distribution',
                        color: getCSS('--text-primary')
                    },
                    legend: {
                        labels: {
                            color: getCSS('--text-primary')
                        }
                    }
                }
            }
        });

        const majorData = students.reduce((acc: Record<string, number>, s) => {
            acc[s.major] = (acc[s.major] || 0) + 1;
            return acc;
        }, {});

        const majorCtx = document.getElementById('majorChart') as HTMLCanvasElement;
        if (majorChart) majorChart.destroy();
        majorChart = new Chart(majorCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(majorData),
                datasets: [{
                    label: 'Students per Major',
                    data: Object.values(majorData),
                    backgroundColor: getCSS('--primary-color'),
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Students per Major',
                        color: getCSS('--text-primary')
                    },
                    legend: {
                        labels: {
                            color: getCSS('--text-primary')
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: getCSS('--text-primary') },
                        grid: { color: getCSS('--border-color') }
                    },
                    y: {
                        ticks: { color: getCSS('--text-primary') },
                        grid: { color: getCSS('--border-color') }
                    }
                }
            }
        });

        const attendanceRanges = {
            '90-100%': 0,
            '80-89%': 0,
            '70-79%': 0,
            '60-69%': 0,
            'Below 60%': 0
        };

        students.forEach(s => {
            const att = s.attendance;
            if (att >= 90) attendanceRanges['90-100%']++;
            else if (att >= 80) attendanceRanges['80-89%']++;
            else if (att >= 70) attendanceRanges['70-79%']++;
            else if (att >= 60) attendanceRanges['60-69%']++;
            else attendanceRanges['Below 60%']++;
        });

        const attCtx = document.getElementById('attendanceChart') as HTMLCanvasElement;
        if (attendanceChart) attendanceChart.destroy();
        attendanceChart = new Chart(attCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(attendanceRanges),
                datasets: [{
                    label: 'Number of Students',
                    data: Object.values(attendanceRanges),
                    backgroundColor: getCSS('--primary-color'),
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Attendance Rate Distribution',
                        color: getCSS('--text-primary')
                    },
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: getCSS('--text-primary') },
                        grid: { color: getCSS('--border-color') }
                    },
                    y: {
                        ticks: { color: getCSS('--text-primary') },
                        grid: { color: getCSS('--border-color') }
                    }
                }
            }
        });
    }
</script>