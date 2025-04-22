<script lang="ts">
    import { onMount } from 'svelte';
  
    let summary = "";
    let students: { name: string; age: number; course: string }[] = [];
  
    async function fetchSummary() {
      const res = await fetch("/api/summary");
      const data = await res.json();
      summary = data.summary;
      students = data.students;
    }
  
    // Ensure fetch runs only on the client
    onMount(() => {
      fetchSummary();
    });
  </script>
  
  <h1 class="text-xl font-bold mb-4">Student Management Summary</h1>
  
  <h2 class="text-lg font-semibold">Summary:</h2>
  <p class="mb-4">{summary}</p>
  
  <h2 class="text-lg font-semibold">Student List:</h2>
  <ul class="list-disc pl-5">
    {#each students as student}
      <li>{student.name} – {student.age} – {student.course}</li>
    {/each}
  </ul>
  