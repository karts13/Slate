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
renderer.heading = (text, level) => {
    const baseId = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    let uniqueId = baseId;
    let counter = 1;
    while (document.getElementById(uniqueId)) {
        uniqueId = `${baseId}-${counter}`;
        counter++;
    }
    return `<h${level} id="${uniqueId}">${text}</h${level}>`;
};
marked.use({ renderer });

function searchProjects() {
    const query = document.getElementById('searchInput').value;
    alert('Search functionality to be implemented. Query: ' + query);
}

document.addEventListener('DOMContentLoaded', () => {
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
        const projectListMobileElement = document.getElementById('projectListMobile');
        
        const populate = (element, isMobile = false) => {
            if (element) {
                element.innerHTML = '';
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
                        if (isMobile && window.innerWidth <= 768) {
                            const projectMenu = document.getElementById('projectMenu');
                            if (projectMenu) {
                                projectMenu.classList.remove('show');
                                document.getElementById('projectToggle').classList.remove('active');
                            }
                        }
                    });
                    li.appendChild(a);
                    element.appendChild(li);
                });
            }
        };

        populate(projectListElement);
        populate(projectListMobileElement, true);
    }

    function getNextProject(currentId) {
        const currentIndex = projectList.findIndex(p => p.id === currentId);
        const nextIndex = (currentIndex + 1) % projectList.length;
        return projectList[nextIndex];
    }

    function loadMarkdown(projectId) {
        const project = projectList.find(p => p.id === projectId) || projectList[0];
        fetch(project.file)
            .then(response => response.text())
            .then(text => {
                const markdownContent = document.getElementById('markdownContent');
                if (markdownContent) {
                    markdownContent.innerHTML = marked.parse(text);
                    
                    const nextProject = getNextProject(project.id);
                    const nextLinkContainer = document.createElement('div');
                    nextLinkContainer.className = 'next-project-link mt-8 text-right';
                    nextLinkContainer.innerHTML = `
                        <div class="next-project-label">Next Project →</div>
                        <a href="#${nextProject.id}" class="project-name text-purple-600 font-semibold">${nextProject.name}</a>
                    `;
                    nextLinkContainer.querySelector('a').addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.hash = nextProject.id;
                        loadMarkdown(nextProject.id);
                    });
                    markdownContent.appendChild(nextLinkContainer);

                    hljs.highlightAll();
                    generateHeadingsNav();
                    setupIntersectionObserver();
                }
            })
            .catch(error => {
                console.error('Error loading markdown:', error);
                if (document.getElementById('markdownContent')) {
                    document.getElementById('markdownContent').innerHTML = '<p>Error loading documentation.</p>';
                }
            });
    }

    function generateHeadingsNav() {
        const headingsNav = document.getElementById('headingsNav');
        const headingsNavMobile = document.getElementById('headingsNavMobile');

        const populateHeadings = (navElement, isMobile = false) => {
            if (navElement) {
                navElement.innerHTML = '';
                const headings = document.querySelectorAll('#markdownContent h2, #markdownContent h3');
                if (headings.length === 0) {
                    console.warn('No headings found in #markdownContent');
                }
                headings.forEach((heading, index) => {
                    const id = heading.id || `heading-${index}`;
                    heading.id = id;
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `#${id}`;
                    a.textContent = heading.textContent;
                    a.className = `block text-gray-900 hover:text-purple-600 ${heading.tagName === 'H3' ? 'pl-4 text-sm' : ''}`;
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        const target = document.getElementById(id);
                        if (target) {
                            const header = document.querySelector('header');
                            const headerHeight = header ? header.offsetHeight : 0;
                            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                            console.log(`Scrolling to ${id}, targetPosition: ${targetPosition}, headerHeight: ${headerHeight}`);
                            document.documentElement.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                            [headingsNav, headingsNavMobile].forEach(nav => {
                                if (nav) {
                                    const navLinks = nav.querySelectorAll('a');
                                    navLinks.forEach(link => link.classList.remove('active-heading'));
                                    const matchingLink = nav.querySelector(`a[href="#${id}"]`);
                                    if (matchingLink) matchingLink.classList.add('active-heading');
                                }
                            });
                            if (isMobile && window.innerWidth <= 768) {
                                const headingsMenu = document.getElementById('headingsMenu');
                                if (headingsMenu) {
                                    headingsMenu.classList.remove('show');
                                    document.getElementById('headingsToggle').classList.remove('active');
                                }
                            }
                        } else {
                            console.error(`Target element with ID ${id} not found`);
                        }
                    });
                    li.appendChild(a);
                    navElement.appendChild(li);
                });
            } else {
                console.warn(`Navigation element ${navElement ? navElement.id : 'null'} not found`);
            }
        };

        populateHeadings(headingsNav);
        populateHeadings(headingsNavMobile, true);
    }

    function setupIntersectionObserver() {
        const headings = document.querySelectorAll('#markdownContent h2, #markdownContent h3');
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        [document.getElementById('headingsNav'), document.getElementById('headingsNavMobile')].forEach(nav => {
                            if (nav) {
                                const navLinks = nav.querySelectorAll('a');
                                navLinks.forEach(link => link.classList.remove('active-heading'));
                                const navLink = nav.querySelector(`a[href="#${id}"]`);
                                if (navLink) navLink.classList.add('active-heading');
                            }
                        });
                    }
                });
            },
            {
                root: null, // Use viewport as root
                rootMargin: `-${headerHeight + 20}px 0px -40% 0px`,
                threshold: 0.2
            }
        );

        headings.forEach(heading => observer.observe(heading));
    }

    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('show');
            const icon = mobileMenuButton.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    const projectToggle = document.getElementById('projectToggle');
    const projectMenu = document.getElementById('projectMenu');
    if (projectToggle && projectMenu) {
        projectToggle.addEventListener('click', () => {
            projectMenu.classList.toggle('show');
            projectToggle.classList.toggle('active');
            const headingsMenu = document.getElementById('headingsMenu');
            if (headingsMenu && headingsMenu.classList.contains('show')) {
                headingsMenu.classList.remove('show');
                document.getElementById('headingsToggle').classList.remove('active');
            }
        });
    }

    const headingsToggle = document.getElementById('headingsToggle');
    const headingsMenu = document.getElementById('headingsMenu');
    if (headingsToggle && headingsMenu) {
        headingsToggle.addEventListener('click', () => {
            headingsMenu.classList.toggle('show');
            headingsToggle.classList.toggle('active');
            const projectMenu = document.getElementById('projectMenu');
            if (projectMenu && projectMenu.classList.contains('show')) {
                projectMenu.classList.remove('show');
                document.getElementById('projectToggle').classList.remove('active');
            }
        });
    }

    populateProjectList();

    const initialProjectId = window.location.hash.substring(1) || projectList[0].id;
    loadMarkdown(initialProjectId);

    window.addEventListener('hashchange', () => {
        const projectId = window.location.hash.substring(1) || projectList[0].id;
        loadMarkdown(projectId);
    });
});