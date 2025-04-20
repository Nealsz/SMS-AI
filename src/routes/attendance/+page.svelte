<script lang="ts">
	import { onMount } from 'svelte';
	let records: { studentId: string; date: string; status: string }[] = [];

	onMount(async () => {
		const res = await fetch('/api/attendance');
		records = await res.json();
	});
</script>

<h2 class="text-xl font-bold mb-4">Attendance Records</h2>

<table class="w-full table-auto border">
	<thead>
		<tr class="bg-gray-200">
			<th class="p-2 border">Student</th>
			<th class="p-2 border">Date</th>
			<th class="p-2 border">Status</th>
		</tr>
	</thead>
	<tbody>
		{#each records as record}
			<tr>
				<td class="border p-2">{record.studentId}</td>
				<td class="border p-2">{record.date}</td>
				<td class="border p-2">{record.status}</td>
			</tr>
		{/each}
	</tbody>
</table>
