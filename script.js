marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
    gfm: true,
    breaks: true,
    sanitize: false,
});

const renderer = new marked.Renderer();
renderer.code = (code, lang) => {
    const language = lang || 'plaintext';
    const highlighted = hljs.highlight(code, { language }).value;
    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};
renderer.hr = () => `<hr>`;
renderer.list = (body, ordered) => {
    const tag = ordered ? 'ol' : 'ul';
    return `<${tag}>${body}</${tag}>`;
};
renderer.listitem = (text) => `<li>${text}</li>`;
renderer.paragraph = (text) => `<p>${text}</p>`;
renderer.heading = (text, level) => `<h${level} id="${text.toLowerCase().replace(/[^\w]+/g, '-')}">${text}</h${level}>`;
marked.use({ renderer });

function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    const newTheme = !isDark;
    const themeIcon = document.getElementById('themeIcon');
    const header = document.querySelector('header');
    const asides = document.querySelectorAll('aside');

    const classUpdates = () => {
        document.body.classList.toggle('dark', newTheme);
        themeIcon.classList.toggle('fa-sun', !newTheme);
        themeIcon.classList.toggle('fa-moon', newTheme);
        themeIcon.classList.toggle('text-yellow-500', !newTheme);
        themeIcon.classList.toggle('text-gray-600', newTheme);
        themeIcon.classList.toggle('hover:text-yellow-400', !newTheme);
        themeIcon.classList.toggle('hover:text-gray-500', newTheme);
        header.classList.toggle('bg-white', !newTheme);
        header.classList.toggle('dark:bg-[#1A1A1A]', newTheme);
        asides.forEach(aside => {
            aside.classList.toggle('bg-white', !newTheme);
            aside.classList.toggle('dark:bg-[#1A1A1A]', newTheme);
        });
    };

    requestAnimationFrame(() => {
        classUpdates();
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    });
}

function searchProjects() {
    const query = document.getElementById('searchInput').value;
    alert('Search functionality to be implemented. Query: ' + query);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');
    const header = document.querySelector('header');
    const asides = document.querySelectorAll('aside');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeIcon.classList.remove('fa-sun', 'text-yellow-500', 'hover:text-yellow-400');
        themeIcon.classList.add('fa-moon', 'text-gray-600', 'hover:text-gray-500');
        header.classList.add('dark:bg-[#1A1A1A]');
        asides.forEach(aside => aside.classList.add('dark:bg-[#1A1A1A]'));
    } else {
        header.classList.add('bg-white');
        asides.forEach(aside => aside.classList.add('bg-white'));
    }

    const projectList = [
        { id: 'silksphere', file: 'markdown/silksphere.md', name: 'SilkSphere' },
        { id: 'deskwatch', file: 'markdown/deskwatch.md', name: 'DeskWatch' },
        { id: 'slate', file: 'markdown/slate.md', name: 'Slate' },
        { id: 'portfolio', file: 'markdown/portfolio.md', name: 'Portfolio v2' },
        { id: 'news-harbour', file: 'markdown/news-harbour.md', name: 'News-Harbour' },
        { id: 'quicksense', file: 'markdown/quicksense.md', name: 'QuickSense' },
        { id: 'gamehub', file: 'markdown/gamehub.md', name: 'GameHub' },
        { id: 'emailtracker', file: 'markdown/emailtracker.md', name: 'EmailTracker' },
        { id: 'tictactoe', file: 'markdown/tictactoe.md', name: 'TicTacToe' },
        { id: 'chronograph', file: 'markdown/chronograph.md', name: 'Chronograph' },
        { id: 'parkease', file: 'markdown/parkease.md', name: 'ParkEase' }
    ];

    function populateProjectList() {
        const projectListElement = document.getElementById('projectList');
        projectListElement.innerHTML = '';
        projectList.forEach(project => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${project.id}`;
            a.textContent = project.name;
            a.className = 'text-gray-900 hover:text-purple-600 block';
            a.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = project.id;
                loadMarkdown(project.id);
            });
            li.appendChild(a);
            projectListElement.appendChild(li);
        });
    }

    function loadMarkdown(projectId) {
        const project = projectList.find(p => p.id === projectId) || projectList[0];
        fetch(project.file)
            .then(response => response.text())
            .then(text => {
                const markdownContent = document.getElementById('markdownContent');
                markdownContent.innerHTML = marked.parse(text);
                hljs.highlightAll(); // Re-highlight code blocks
                generateHeadingsNav();
                setupIntersectionObserver();
            })
            .catch(error => {
                console.error('Error loading markdown:', error);
                document.getElementById('markdownContent').innerHTML = '<p>Error loading documentation.</p>';
            });
    }

    function generateHeadingsNav() {
        const headingsNav = document.getElementById('headingsNav');
        headingsNav.innerHTML = '';
        const headings = document.querySelectorAll('#markdownContent h2, #markdownContent h3');
        headings.forEach((heading, index) => {
            const id = heading.id || `heading-${index}`;
            heading.id = id;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${id}`;
            a.textContent = heading.textContent;
            a.className = `block text-gray-900 hover:text-purple-600 dark:text-white dark:hover:text-[#D8B4FE] ${heading.tagName === 'H3' ? 'pl-4 text-sm' : ''}`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
            });
            li.appendChild(a);
            headingsNav.appendChild(li);
        });
    }

    function setupIntersectionObserver() {
        const headings = document.querySelectorAll('#markdownContent h2, #markdownContent h3');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const navLink = document.querySelector(`#headingsNav a[href="#${id}"]`);
                if (entry.isIntersecting) {
                    document.querySelectorAll('#headingsNav a').forEach(link => link.classList.remove('active-heading'));
                    if (navLink) navLink.classList.add('active-heading');
                }
            });
        }, { rootMargin: '-100px 0px -50% 0px' });

        headings.forEach(heading => observer.observe(heading));
    }

    populateProjectList();

    const initialProjectId = window.location.hash.substring(1) || projectList[0].id;
    loadMarkdown(initialProjectId);

    window.addEventListener('hashchange', () => {
        const projectId = window.location.hash.substring(1) || projectList[0].id;
        loadMarkdown(projectId);
    });
});