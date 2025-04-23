<script lang="ts">
    import type { PageData } from './$types';
    import { fade } from 'svelte/transition';

    let { data }: { data: PageData } = $props();
    let journalText = $state('');
    let messages: { text: string; isUser: boolean; error?: boolean }[] = $state([]);
    let isLoading = $state(false);
    let charCount = $derived(journalText.length);
    const MAX_CHARS = 2000;

    async function handleSubmit(event: Event) {
        event.preventDefault();
        const trimmedText = journalText.trim();
        
        if (!trimmedText) {
            messages = [...messages, { 
                text: "Please enter some text to summarize.", 
                isUser: false, 
                error: true 
            }];
            return;
        }

        if (trimmedText.length > MAX_CHARS) {
            messages = [...messages, { 
                text: `Text exceeds maximum length of ${MAX_CHARS} characters.`, 
                isUser: false, 
                error: true 
            }];
            return;
        }

        messages = [...messages, { text: trimmedText, isUser: true }];
        isLoading = true;
        
        try {
            const response = await fetch('/api/summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: trimmedText })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            messages = [...messages, { text: data.summary, isUser: false }];
        } catch (error) {
            messages = [...messages, { 
                text: 'Sorry, there was an error generating the summary. Please try again later.', 
                isUser: false, 
                error: true 
            }];
            console.error('Summary error:', error);
        } finally {
            isLoading = false;
            journalText = '';
        }
    }

    async function handleDatabaseSummary() {
        isLoading = true;
        messages = [...messages, { text: "Requesting database summary...", isUser: true }];
        
        try {
            const response = await fetch('/api/summary');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            messages = [...messages, { text: data.summary, isUser: false }];
        } catch (error) {
            messages = [...messages, { 
                text: 'Sorry, there was an error generating the database summary. Please try again later.', 
                isUser: false, 
                error: true 
            }];
            console.error('Database summary error:', error);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="min-h-screen bg-red-900 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div class="p-6 border-b">
            <h1 class="text-2xl font-medium text-center">Personal Journal</h1>
            <h2 class="text-gray-600 text-center">Summarizer</h2>
        </div>

        <div class="flex-1 h-[400px] overflow-y-auto p-6 space-y-4" id="message-container">
            {#each messages as message}
                <div 
                    class="flex {message.isUser ? 'justify-end' : 'justify-start'}"
                    transition:fade
                >
                    <div class="max-w-[70%] rounded-lg p-3 {
                        message.isUser 
                            ? 'bg-blue-500 text-white' 
                            : message.error
                                ? 'bg-red-100 text-red-700 border border-red-300'
                                : 'bg-gray-200 text-gray-800'
                    }">
                        {message.text}
                    </div>
                </div>
            {/each}
            {#if isLoading}
                <div class="flex justify-start" transition:fade>
                    <div class="max-w-[70%] rounded-lg p-3 bg-gray-200 text-gray-800">
                        <div class="flex items-center space-x-2">
                            <div class="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                            <span>Generating summary...</span>
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <div class="border-t p-6">
            <form onsubmit={handleSubmit} class="w-full">
                <div class="relative">
                    <textarea 
                        bind:value={journalText}
                        placeholder="Write Something......"
                        class="w-full border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50 {
                            charCount > MAX_CHARS ? 'border-red-500' : ''
                        }"
                        rows="3"
                        disabled={isLoading}
                    ></textarea>
                    <div class="absolute bottom-2 right-2 text-sm text-gray-500">
                        {charCount}/{MAX_CHARS}
                    </div>
                </div>
                <div class="flex gap-2 mt-2">
                    <button 
                        type="submit"
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || charCount > MAX_CHARS}
                    >
                        {isLoading ? 'Generating...' : 'Submit Journal'}
                    </button>
                    <button 
                        type="button"
                        onclick={handleDatabaseSummary}
                        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Generating...' : 'Summarize Database'}
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>