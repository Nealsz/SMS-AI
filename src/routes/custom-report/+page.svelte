<script lang="ts">
	let loading = false;
	let summary = '';

	async function generateReport() {
		loading = true;
		summary = '';
		const res = await fetch('/api/custom-reports', {
			method: 'POST',
			body: JSON.stringify({ type: 'summary' }),
			headers: { 'Content-Type': 'application/json' }
		});
		const data = await res.json();
		summary = data.summary;
		loading = false;
	}
</script>

<h1 class="text-2xl font-bold mb-4">📊 AI-Generated Report</h1>

<button on:click={generateReport} class="bg-purple-600 text-white px-4 py-2 rounded mb-4">
	{loading ? 'Generating...' : 'Generate Summary'}
</button>

{#if summary}
	<div class="bg-white p-4 rounded shadow border whitespace-pre-wrap">
		{summary}
	</div>
{/if}
