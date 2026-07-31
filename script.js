(function () {
    'use strict';

    
    const DEFAULT_PROJECTS = [
        { id: 'proj-1', name: 'Website Redesign', description: 'Revamp corporate website UI/UX', deadline: '2026-08-30' },
        { id: 'proj-2', name: 'Mobile App V2', description: 'React Native companion app update', deadline: '2026-09-15' },
        { id: 'proj-3', name: 'Brand Refresh', description: 'New logo, typography, and assets', deadline: '2026-10-01' }
    ];

    const DEFAULT_MEMBERS = [
        { id: 'mem-1', name: 'Nawrin', role: 'Senior Lead', email: 'nawrintarannum30@gmail.com' },
        { id: 'mem-2', name: 'Nawsin', role: 'UI/UX Designer', email: 'nawsin2006@gmail.com' },
        { id: 'mem-3', name: 'Anika', role: 'Frontend Developer', email: 'anika18@gmail.com' }
    ];

    const DEFAULT_TASKS = [
        {
            id: 'task-101',
            title: 'Design Wireframes for Task Dashboard',
            description: 'Create high-fidelity Figma components and interactive prototypes.',
            projectId: 'proj-1',
            category: 'Design',
            priority: 'High',
            status: 'In Progress',
            startDate: '2026-07-01',
            dueDate: '2026-08-05',
            startTime: '09:00',
            endTime: '17:00',
            assignedMembers: ['mem-1', 'mem-2'],
            link: 'https://figma.com',
            subtasks: [
                { id: 'st-1', title: 'Layout Navigation Panel', completed: true },
                { id: 'st-2', title: 'Design Widget Components', completed: false }
            ]
        },
        {
            id: 'task-102',
            title: 'Setup LocalStorage Engine',
            description: 'Implement persistent data layer with ES6 modules.',
            projectId: 'proj-2',
            category: 'Frontend',
            priority: 'Medium',
            status: 'Completed',
            startDate: '2026-07-10',
            dueDate: '2026-07-25',
            startTime: '10:00',
            endTime: '12:00',
            assignedMembers: ['mem-1'],
            link: '',
            subtasks: [
                { id: 'st-3', title: 'Write Data Persistence Handlers', completed: true }
            ]
        }
    ];   
     const DEFAULT_USER = {
        name: 'Nawrin',
        role: 'Senior Lead Engineer',
        email: 'nawrintarannum30@gmail.com'
    };


    let tasks = JSON.parse(localStorage.getItem('tf_tasks')) || DEFAULT_TASKS;
    let projects = JSON.parse(localStorage.getItem('tf_projects')) || DEFAULT_PROJECTS;
    let teamMembers = JSON.parse(localStorage.getItem('tf_members')) || DEFAULT_MEMBERS;
    let notifications = JSON.parse(localStorage.getItem('tf_notifications')) || [
        { id: 'notif-1', title: 'System initialized', time: 'Just now', read: false }
    ];
    let userProfile = JSON.parse(localStorage.getItem('tf_user')) || DEFAULT_USER;
    let theme = localStorage.getItem('tf_theme') || 'light';

    let currentCalendarDate = new Date();
    let selectedCalendarDay = new Date().toISOString().split('T')[0];
    let activeTaskForDetails = null;

    let statusChartInstance = null;
    let priorityChartInstance = null;

    function saveState() {
        localStorage.setItem('tf_tasks', JSON.stringify(tasks));
        localStorage.setItem('tf_projects', JSON.stringify(projects));
        localStorage.setItem('tf_members', JSON.stringify(teamMembers));
        localStorage.setItem('tf_notifications', JSON.stringify(notifications));
        localStorage.setItem('tf_user', JSON.stringify(userProfile));
        localStorage.setItem('tf_theme', theme);
    }

    document.addEventListener('DOMContentLoaded', () => {
        applyTheme(theme);
        initNavigation();
        initEventListeners();
        populateSelectDropdowns();
        renderAllViews();
        if (window.lucide) lucide.createIcons();
    });

    function applyTheme(newTheme) {
        theme = newTheme;
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
            if (window.lucide) lucide.createIcons();
        }
        const toggle = document.getElementById('settingsDarkModeToggle');
        if (toggle) toggle.checked = theme === 'dark';
        saveState();
    }

    function initNavigation() {
        const navLinks = document.querySelectorAll('[data-view]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetView = link.getAttribute('data-view');
                switchView(targetView);
            });
        });

        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) switchView(hash);
        });
    }

    function switchView(viewId) {
        const views = document.querySelectorAll('.view-section');
        views.forEach(v => v.classList.remove('active'));

        const target = document.getElementById(`${viewId}-view`);
        if (target) {
            target.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        document.querySelectorAll('[data-view]').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-view') === viewId);
        });
        document.getElementById('sidebar').classList.remove('mobile-open');

        if (viewId === 'analytics') renderAnalyticsCharts();
        if (viewId === 'calendar') renderCalendar();

        if (window.lucide) lucide.createIcons();
    }

    function renderAllViews() {
        updateUserProfileUI();
        updateDashboardStats();
        renderRecentDashboardTasks();
        renderDashboardProjects();
        renderTasks();
        renderProjects();
        renderTeam();
        renderNotifications();
        renderCalendar();
        renderAnalyticsMetrics();
    }


    function createNotification(title) {
        const notif = {
            id: 'notif-' + Date.now(),
            title: title,
            time: 'Just now',
            read: false
        };
        notifications.unshift(notif);
        saveState();
        renderNotifications();
    }

    function renderNotifications() {
        const unreadCount = notifications.filter(n => !n.read).length;
        document.querySelectorAll('.notification-badge-count').forEach(badge => {
            badge.textContent = unreadCount;
            badge.classList.toggle('hidden', unreadCount === 0);
        });

        
        const miniList = document.getElementById('dropdownNotificationList');
        if (miniList) {
            miniList.innerHTML = notifications.slice(0, 5).map(n => `
                <div class="dropdown-item ${n.read ? '' : 'unread'}" style="${n.read ? '' : 'font-weight:bold; background:var(--primary-light);'}">
                    <div>
                        <p style="margin:0; font-size:0.85rem;">${escapeHTML(n.title)}</p>
                        <small style="color:var(--text-muted);">${n.time}</small>
                    </div>
                </div>
            `).join('') || '<div style="padding:1rem; text-align:center;">No notifications</div>';
        }
        const fullList = document.getElementById('fullNotificationList');
        if (fullList) {
            fullList.innerHTML = notifications.map(n => `
                <div class="subtask-item" style="padding:1rem; ${n.read ? 'opacity:0.7;' : 'font-weight:bold;'}">
                    <div>
                        <h4>${escapeHTML(n.title)}</h4>
                        <small style="color:var(--text-muted);">${n.time}</small>
                    </div>
                    ${!n.read ? `<button class="btn btn-secondary mark-read-btn" data-id="${n.id}">Mark Read</button>` : ''}
                </div>
            `).join('') || '<div style="padding:2rem; text-align:center;">No notifications found</div>';

            fullList.querySelectorAll('.mark-read-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const target = notifications.find(x => x.id === id);
                    if (target) target.read = true;
                    saveState();
                    renderNotifications();
                });
            });
        }
    }
    function updateDashboardStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'Completed').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        
        const now = new Date().toISOString().split('T')[0];
        const overdue = tasks.filter(t => t.status !== 'Completed' && t.dueDate < now).length;

        document.getElementById('statTotalTasks').textContent = total;
        document.getElementById('statCompletedTasks').textContent = completed;
        document.getElementById('statInProgressTasks').textContent = inProgress;
        document.getElementById('statOverdueTasks').textContent = overdue;
    }

    function renderRecentDashboardTasks() {
        const container = document.getElementById('dashboardRecentTasksList');
        if (!container) return;

        const recent = tasks.slice(0, 4);
        if (recent.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); text-align:center;">No tasks available.</p>';
            return;
        }

        container.innerHTML = recent.map(t => createTaskCardHTML(t)).join('');
        attachTaskCardListeners(container);
    }
    function renderDashboardProjects() {
        const container = document.getElementById('dashboardProjectsList');
        if (!container) return;

        container.innerHTML = projects.slice(0, 3).map(p => {
            const pTasks = tasks.filter(t => t.projectId === p.id);
            const pCompleted = pTasks.filter(t => t.status === 'Completed').length;
            const progress = pTasks.length ? Math.round((pCompleted / pTasks.length) * 100) : 0;

            return `
                <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
                        <strong>${escapeHTML(p.name)}</strong>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    
    function renderTasks() {
        const container = document.getElementById('tasksContainer');
        if (!container) return;
        const searchVal = (document.getElementById('globalSearchInput')?.value || '').toLowerCase();
        const filterStatus = document.getElementById('filterStatus')?.value || 'all';
        const filterPriority = document.getElementById('filterPriority')?.value || 'all';
        const filterProj = document.getElementById('filterProject')?.value || 'all';
        const sortBy = document.getElementById('sortBy')?.value || 'newest';

        const now = new Date().toISOString().split('T')[0];

        let filtered = tasks.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchVal) || t.description.toLowerCase().includes(searchVal);
            
            let matchesStatus = true;
            if (filterStatus === 'Overdue') {
                matchesStatus = t.status !== 'Completed' && t.dueDate < now;
            } else if (filterStatus !== 'all') {
                matchesStatus = t.status === filterStatus;
            }

            const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
            const matchesProject = filterProj === 'all' || t.projectId === filterProj;

            return matchesSearch && matchesStatus && matchesPriority && matchesProject;
        });
        filtered.sort((a, b) => {
            if (sortBy === 'newest') return b.id.localeCompare(a.id);
            if (sortBy === 'oldest') return a.id.localeCompare(b.id);
            if (sortBy === 'dueDate') return a.dueDate.localeCompare(b.dueDate);
            if (sortBy === 'priority') {
                const map = { High: 3, Medium: 2, Low: 1 };
                return map[b.priority] - map[a.priority];
            }
            return 0;
        });

        if (filtered.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted);">No tasks match your criteria.</div>';
            return;
        }

        container.innerHTML = filtered.map(t => createTaskCardHTML(t)).join('');
        attachTaskCardListeners(container);
    }

    function createTaskCardHTML(task) {
        const isCompleted = task.status === 'Completed';
        const now = new Date().toISOString().split('T')[0];
        const isOverdue = task.status !== 'Completed' && task.dueDate < now;

        const subtaskTotal = task.subtasks ? task.subtasks.length : 0;
        const subtaskDone = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
        const progress = subtaskTotal ? Math.round((subtaskDone / subtaskTotal) * 100) : (isCompleted ? 100 : 0);

        const project = projects.find(p => p.id === task.projectId);

        return `
            <div class="task-card" data-id="${task.id}">
                <div class="task-card-header">
                    <div class="task-checkbox-title">
                        <input type="checkbox" class="task-toggle-checkbox" ${isCompleted ? 'checked' : ''}>
                        <h4 class="${isCompleted ? 'completed' : ''}">${escapeHTML(task.title)}</h4>
                    </div>
                </div>





