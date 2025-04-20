<script lang="ts">
    import { onMount } from 'svelte';


    let isDarkMode = false;
    let selectedTheme = 'indigo';
    
    const themeColors = [
        { name: 'Indigo', value: 'indigo', primary: '#6366f1' },
        { name: 'Blue', value: 'blue', primary: '#3b82f6' },
        { name: 'Green', value: 'green', primary: '#10b981' },
        { name: 'Purple', value: 'purple', primary: '#8b5cf6' },
        { name: 'Rose', value: 'rose', primary: '#f43f5e' }
    ];

    onMount(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        const savedTheme = localStorage.getItem('theme');
        
        if (savedDarkMode) {
            isDarkMode = savedDarkMode === 'true';
            applyDarkMode(isDarkMode);
        }
        
        if (savedTheme) {
            selectedTheme = savedTheme;
            applyTheme(savedTheme);
        }
    });

    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        localStorage.setItem('darkMode', isDarkMode.toString());
        applyDarkMode(isDarkMode);
    }

    function applyDarkMode(dark: boolean) {
        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    function changeTheme(theme: string) {
        selectedTheme = theme;
        localStorage.setItem('theme', theme);
        applyTheme(theme);
    }

    function applyTheme(theme: string) {
        selectedTheme = theme;
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        const selectedColor = themeColors.find(t => t.value === theme);
        if (selectedColor) {
            root.style.setProperty('--primary-color', selectedColor.primary);
        }
    }
</script>

<div class="settings-container">
    <header class="settings-header">
        <h1>Settings</h1>
        <p>Customize your experience</p>
    </header>

    <div class="settings-content">

        <div class="setting-card">
            <div class="setting-header">
                <h2>Dark Mode</h2>
                <p>Toggle dark mode on/off</p>
            </div>
            <div class="setting-control">
                <button 
                    class="toggle-button {isDarkMode ? 'active' : ''}" 
                    on:click={toggleDarkMode}
                >
                    <span class="toggle-slider"></span>
                    <span class="toggle-text">{isDarkMode ? 'On' : 'Off'}</span>
                </button>
            </div>
        </div>


        <div class="setting-card">
            <div class="setting-header">
                <h2>Color Theme</h2>
                <p>Choose your preferred color theme</p>
            </div>
            <div class="theme-grid">
                {#each themeColors as theme}
                    <button
                        class="theme-button {selectedTheme === theme.value ? 'active' : ''}"
                        style="--theme-color: {theme.primary}"
                        on:click={() => changeTheme(theme.value)}
                    >
                        <div class="theme-color"></div>
                        <span>{theme.name}</span>
                    </button>
                {/each}
            </div>
        </div>
    </div>
</div>

<style>
    .settings-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .settings-header {
        margin-bottom: 2rem;
    }

    .settings-header h1 {
        font-size: 2rem;
        font-weight: 600;
        color: var(--primary-color, #6366f1);
        margin-bottom: 0.5rem;
    }

    .settings-header p {
        color: #6b7280;
    }

    .setting-card {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .setting-header {
        margin-bottom: 1.5rem;
    }

    .setting-header h2 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .setting-header p {
        color: #6b7280;
        font-size: 0.875rem;
    }

    .toggle-button {
        position: relative;
        width: 3.5rem;
        height: 2rem;
        background-color: #e5e7eb;
        border-radius: 1rem;
        padding: 0.25rem;
        border: none;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .toggle-button.active {
        background-color: var(--primary-color, #6366f1);
    }

    .toggle-slider {
        position: absolute;
        top: 0.25rem;
        left: 0.25rem;
        width: 1.5rem;
        height: 1.5rem;
        background-color: white;
        border-radius: 50%;
        transition: transform 0.3s;
    }

    .toggle-button.active .toggle-slider {
        transform: translateX(1.5rem);
    }

    .toggle-text {
        position: absolute;
        right: -3rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.875rem;
        color: #6b7280;
    }


    .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
    }

    .theme-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        border: 2px solid transparent;
        border-radius: 0.5rem;
        background: none;
        cursor: pointer;
        transition: border-color 0.3s;
    }

    .theme-button.active {
        border-color: var(--theme-color);
    }

    .theme-color {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 0.5rem;
        background-color: var(--theme-color);
    }

    .theme-button span {
        font-size: 0.875rem;
        color: #374151;
    }

 
    :global(.dark) {
        background-color: #1f2937;
        color: #f3f4f6;
    }

    :global(.dark) .setting-card {
        background-color: #374151;
    }

    :global(.dark) .setting-header h2 {
        color: #f3f4f6;
    }

    :global(.dark) .theme-button span {
        color: #f3f4f6;
    }

    :global(.dark) .toggle-text {
        color: #f3f4f6;
    }
</style> 