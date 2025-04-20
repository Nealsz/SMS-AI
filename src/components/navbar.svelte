<script lang="ts">
    export let activePage = ''; // The current active page
</script>

<header class="navbar bg-primary text-white shadow">
    <!-- Brand Section -->
    <div class="navbar-brand text-lg font-bold">
        EduSumm
    </div>

    <!-- Navigation Links -->
    <nav class="navbar-nav flex space-x-6">
        <a 
            href="/" 
            class="nav-link flex items-center gap-2 text-sm"
            class:active={activePage === ''}
        >
            <i class="fas fa-home"></i>
            Dashboard
        </a>

        <a 
            href="/attendance" 
            class="nav-link flex items-center gap-2 text-sm"
            class:active={activePage === 'attendance'}
        >
            <i class="fas fa-calendar-check"></i>
            Attendance
        </a>
    
        <a 
            href="/students" 
            class="nav-link flex items-center gap-2 text-sm"
            class:active={activePage === 'students'}
        >
            <i class="fas fa-users"></i>
            Students
        </a>

        <a 
            href="/subjects" 
            class="nav-link flex items-center gap-2 text-sm"
            class:active={activePage === 'subjects'}
        >
            <i class="fas fa-book"></i>
            Subjects
        </a>

        <a 
            href="/settings" 
            class="nav-link flex items-center gap-2 text-sm"
            class:active={activePage === 'settings'}
        >
            <i class="fas fa-cog"></i>
            Settings
        </a>
    </nav>
</header>

<!-- Main Content -->
<main class="main-content pt-16 px-4">
    <slot />
</main>