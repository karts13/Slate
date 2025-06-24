function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.classList.toggle('fa-sun', !isDark);
    themeIcon.classList.toggle('fa-moon', isDark);
    themeIcon.classList.toggle('text-yellow-500', !isDark);
    themeIcon.classList.toggle('text-gray-600', isDark);
    themeIcon.classList.toggle('hover:text-yellow-400', !isDark);
    themeIcon.classList.toggle('hover:text-gray-500', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function searchProjects() {
    const query = document.getElementById('searchInput').value;
    alert('Search functionality to be implemented. Query: ' + query);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeIcon.classList.remove('fa-sun', 'text-yellow-500', 'hover:text-yellow-400');
        themeIcon.classList.add('fa-moon', 'text-gray-600', 'hover:text-gray-500');
    }
});