<script lang="ts">
    import '../app.css';
    import Sidebar from '../components/navbar.svelte';
    import { slide, fade } from 'svelte/transition';
    export let data;

    interface ChatMessage {
        type: 'user' | 'assistant' | 'error';
        content: string;
        timestamp: Date;
    }

    let showChatbot = false;
    let userQuestion = '';
    let isLoading = false;
    let isExpanded = false;
    let chatHistory: ChatMessage[] = [];

    // Predefined queries
    const suggestedQueries = [
        {
            query: "Give me a complete summary of all student data",
            endpoint: "summary"
        },
        {
            query: "What are the current enrollment trends?",
            endpoint: "enrollment"
        },
        {
            query: "Show me academic performance metrics",
            endpoint: "performance"
        },
        {
            query: "What is the GPA distribution across majors?",
            endpoint: "performance"
        }
    ];

    async function getAIResponse() {
        if (!userQuestion.trim()) return;
        
        const question = userQuestion;
        userQuestion = '';
        isLoading = true;
        
        chatHistory = [...chatHistory, { 
            type: 'user', 
            content: question,
            timestamp: new Date()
        }];

        try {
            const predefinedQuery = suggestedQueries.find(q => 
                q.query.toLowerCase() === question.toLowerCase()
            );

            const response = await fetch('/api/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    question,
                    type: predefinedQuery?.endpoint || 'custom'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();
            
            if (data.response) {
                // Clean up the AI response
                const cleanResponse = data.response
                    .replace(/<think>[\s\S]*?<\/think>/g, '')
                    .replace(/\[INST\][\s\S]*?\[\/INST\]/g, '')
                    .replace(/\[ASSISTANT\][\s\S]*?\[\/ASSISTANT\]/g, '')
                    .trim()
                    .replace(/##\s*(.*?)\s*##/g, '### $1')
                    .replace(/\*\*\s*(.*?)\s*\*\*/g, '**$1**')
                    .split('###')
                    .map((section: string) => section.trim())
                    .filter(Boolean)
                    .join('\n\n### ');

                chatHistory = [...chatHistory, {
                    type: 'assistant',
                    content: cleanResponse,
                    timestamp: new Date()
                }];
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('AI Response Error:', error);
            chatHistory = [...chatHistory, {
                type: 'error',
                content: 'Sorry, I encountered an error while processing your request. Please try again.',
                timestamp: new Date()
            }];
        } finally {
            isLoading = false;
        }
    }

    function formatMessage(content: string): string {
        return content
            .replace(/###\s*(.*?)(?=\n|$)/g, '<h3>$1</h3>')
            .replace(/\*\*\s*(.*?)\s*\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function toggleExpand() {
        isExpanded = !isExpanded;
    }

    function formatTimestamp(date: Date): string {
        return new Intl.DateTimeFormat('en', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    function selectSuggestedQuery(query: string): void {
        userQuestion = query;
        getAIResponse();
    }
</script>

<div class="layout">
    <Sidebar activePage={data?.activePage || ''} />
    <main class="main-content">
        <div class="container">
            <slot />
        </div>
    </main>

    
    <div class="ai-assistant-toggle">
        <button class="btn btn-primary rounded-full" on:click={() => showChatbot = !showChatbot}>
            <i class="fas {showChatbot ? 'fa-times' : 'fa-robot'}"></i>
        </button>
    </div>

    {#if showChatbot}
        <div
            transition:slide
            class="ai-panel {isExpanded ? 'expanded' : ''}"
        >
            <div class="ai-panel-header">
                <div class="flex items-center gap-2">
                    <i class="fas fa-robot text-primary-color"></i>
                    <h3 class="text-lg font-bold">AI Assistant</h3>
                </div>
                <div class="flex gap-2">
                    <button 
                        class="btn btn-icon"
                        on:click={toggleExpand}
                    >
                        <i class="fas {isExpanded ? 'fa-compress-alt' : 'fa-expand-alt'}"></i>
                    </button>
                    <button 
                        class="btn btn-icon"
                        on:click={() => showChatbot = false}
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="ai-panel-body">
                <div class="ai-chat" id="chat-container">
                    {#if chatHistory.length === 0}
                        <div class="ai-welcome" transition:fade>
                            <i class="fas fa-robot text-4xl mb-4 text-primary-color"></i>
                            <h4 class="text-lg font-semibold mb-2">Hello! 👋</h4>
                            <p class="text-text-secondary mb-4">I'm your AI assistant. I can help you analyze student data and provide insights. Feel free to ask me anything!</p>
                            
                            <div class="suggested-queries">
                                <h5 class="text-sm font-semibold mb-2">Try these queries:</h5>
                                {#each suggestedQueries as { query }}
                                    <button 
                                        class="suggested-query"
                                        on:click={() => selectSuggestedQuery(query)}
                                    >
                                        <i class="fas fa-search"></i>
                                        {query}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}
                    {#each chatHistory as message}
                        <div 
                            class="message {message.type}"
                            transition:fade
                        >
                            <div class="message-content">
                                {#if message.type === 'assistant'}
                                    <i class="fas fa-robot message-icon"></i>
                                {:else if message.type === 'user'}
                                    <i class="fas fa-user message-icon"></i>
                                {:else}
                                    <i class="fas fa-exclamation-circle message-icon"></i>
                                {/if}
                                <div class="message-text">
                                    {@html formatMessage(message.content)}
                                </div>
                            </div>
                            <div class="message-timestamp">
                                {formatTimestamp(message.timestamp)}
                            </div>
                        </div>
                    {/each}
                    {#if isLoading}
                        <div class="message assistant" transition:fade>
                            <div class="message-content">
                                <i class="fas fa-robot message-icon"></i>
                                <div class="thinking">
                                    <span class="dot"></span>
                                    <span class="dot"></span>
                                    <span class="dot"></span>
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>
                <div class="ai-input">
                    <form on:submit|preventDefault={getAIResponse} class="flex gap-2">
                        <input
                            type="text"
                            bind:value={userQuestion}
                            placeholder="Ask about student data..."
                            class="form-input flex-1"
                            disabled={isLoading}
                        />
                        <button type="submit" class="btn btn-primary" disabled={isLoading}>
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .ai-assistant-toggle {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 49;
    }

    .ai-assistant-toggle button {
        width: 3.5rem;
        height: 3.5rem;
        padding: 0;
        display: grid;
        place-items: center;
        font-size: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .ai-assistant-toggle button i {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .ai-panel {
        position: fixed;
        bottom: 6rem;
        right: 2rem;
        width: 24rem;
        height: 400px;
        background-color: var(--card-background);
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--border-color);
        z-index: 50;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
    }

    .ai-panel.expanded {
        width: 80vw;
        height: 80vh;
        bottom: 10vh;
        right: 10vw;
    }

    .ai-panel-header {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .btn-icon {
        padding: 0.5rem;
        border-radius: 0.375rem;
        background: transparent;
        color: var(--text-primary);
        transition: background-color 0.2s;
    }

    .btn-icon:hover {
        background-color: var(--hover-color);
    }

    .ai-panel-body {
        padding: 1rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .ai-chat {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 1rem;
        padding-right: 0.5rem;
        scroll-behavior: smooth;
    }

    .ai-welcome {
        text-align: center;
        padding: 2rem;
        color: var(--text-primary);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .message {
        margin-bottom: 1rem;
        opacity: 0;
        animation: fadeIn 0.3s ease forwards;
    }

    .message-content {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 0.75rem;
        border-radius: 0.5rem;
    }

    .message.user .message-content {
        background-color: var(--primary-color);
        color: white;
        margin-left: 2rem;
        border-bottom-right-radius: 0;
    }

    .message.assistant .message-content {
        background-color: var(--background-color);
        margin-right: 2rem;
        border-bottom-left-radius: 0;
    }

    .message.error .message-content {
        background-color: #fee2e2;
        color: #dc2626;
        margin: 0 2rem;
    }

    .message-icon {
        font-size: 1.25rem;
        width: 1.5rem;
    }

    .message-text {
        flex: 1;
        white-space: pre-wrap;
        word-break: break-word;
    }

    .message-timestamp {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin: 0.25rem 1rem;
    }

    .thinking {
        display: flex;
        gap: 0.25rem;
        padding: 0.5rem;
    }

    .dot {
        width: 0.5rem;
        height: 0.5rem;
        background-color: var(--text-secondary);
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;
    }

    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .ai-input {
        border-top: 1px solid var(--border-color);
        padding-top: 1rem;
        margin-top: auto;
    }

    :global(.dark) .ai-panel {
        background-color: var(--card-background);
        border-color: var(--border-color);
    }

    :global(.dark) .message.assistant .message-content {
        background-color: rgba(255, 255, 255, 0.1);
    }

    :global(.dark) .ai-panel-header h3 {
        color: white;
    }

    :global(.dark) .btn-icon {
        color: white;
    }

    .text-primary-color {
        color: var(--primary-color);
    }

    .suggested-queries {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .suggested-query {
        text-align: left;
        padding: 0.75rem;
        background-color: var(--background-color);
        border-radius: 0.375rem;
        color: var(--text-primary);
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .suggested-query:hover {
        background-color: var(--hover-color);
    }

    .message-text :global(h3) {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 1rem 0 0.5rem;
        color: var(--primary-color);
    }

    .message-text :global(strong) {
        font-weight: 600;
        color: inherit;
    }

    .message.user .message-text :global(h3),
    .message.user .message-text :global(strong) {
        color: white;
    }
</style>
  
