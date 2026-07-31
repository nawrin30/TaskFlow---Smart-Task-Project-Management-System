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
                ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}

                <div class="task-badges">
                    <span class="badge badge-priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    <span class="badge badge-status-${isOverdue ? 'overdue' : (task.status === 'In Progress' ? 'progress' : task.status.toLowerCase().replace(' ', ''))}">
                        ${isOverdue ? 'Overdue' : task.status}
                    </span>
                    ${project ? `<span class="badge" style="background:var(--primary-light); color:var(--primary);">${escapeHTML(project.name)}</span>` : ''}
                </div>

                ${subtaskTotal > 0 ? `
                    <div style="margin-top: 0.25rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:2px;">
                            <span>Subtasks</span>
                            <span>${subtaskDone}/${subtaskTotal}</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                        </div>
                    </div>
                ` : ''}

                <div class="task-card-footer">
                    <span><i data-lucide="calendar" style="width:14px; inline-size:14px;"></i> ${task.dueDate}</span>
                    <div class="task-actions">
                        <button class="icon-btn view-task-btn" title="View Details"><i data-lucide="eye"></i></button>
                        <button class="icon-btn edit-task-btn" title="Edit Task"><i data-lucide="edit-3"></i></button>
                        <button class="icon-btn delete-task-btn" title="Delete Task"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    function attachTaskCardListeners(container) {
        container.querySelectorAll('.task-card').forEach(card => {
            const id = card.getAttribute('data-id');

           
            card.querySelector('.task-toggle-checkbox')?.addEventListener('change', (e) => {
                const t = tasks.find(x => x.id === id);
                if (t) {
                    t.status = e.target.checked ? 'Completed' : 'In Progress';
                    if (t.subtasks) t.subtasks.forEach(s => s.completed = e.target.checked);
                    saveState();
                    renderAllViews();
                    showToast(`Task marked as ${t.status}`, 'success');
                }
            });

           
            card.querySelector('.view-task-btn')?.addEventListener('click', () => openTaskDetailsModal(id));

           
            card.querySelector('.edit-task-btn')?.addEventListener('click', () => openTaskFormModal(id));

            
            card.querySelector('.delete-task-btn')?.addEventListener('click', () => {
                openConfirmModal('Delete Task', 'Are you sure you want to delete this task?', () => {
                    tasks = tasks.filter(x => x.id !== id);
                    saveState();
                    renderAllViews();
                    showToast('Task deleted', 'danger');
                });
            });
        });

        if (window.lucide) lucide.createIcons();
    }

    
    function openTaskFormModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        form.reset();

        populateSelectDropdowns();

        if (taskId) {
            const t = tasks.find(x => x.id === taskId);
            if (t) {
                document.getElementById('taskModalTitle').textContent = 'Edit Task';
                document.getElementById('taskIdInput').value = t.id;
                document.getElementById('taskTitleInput').value = t.title;
                document.getElementById('taskDescInput').value = t.description || '';
                document.getElementById('taskProjectSelect').value = t.projectId || '';
                document.getElementById('taskCategoryInput').value = t.category || '';
                document.getElementById('taskPrioritySelect').value = t.priority;
                document.getElementById('taskStatusSelect').value = t.status;
                document.getElementById('taskStartDateInput').value = t.startDate || '';
                document.getElementById('taskDueDateInput').value = t.dueDate;
                document.getElementById('taskStartTimeInput').value = t.startTime || '';
                document.getElementById('taskEndTimeInput').value = t.endTime || '';
                document.getElementById('taskLinkInput').value = t.link || '';
            }

        } else {
            document.getElementById('taskModalTitle').textContent = 'Create New Task';
            document.getElementById('taskIdInput').value = '';
        }

        modal.classList.remove('hidden');
    }

    document.getElementById('taskForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('taskIdInput').value;
        const title = document.getElementById('taskTitleInput').value.trim();
        const dueDate = document.getElementById('taskDueDateInput').value;

        if (!title || !dueDate) {
            showToast('Please fill in required fields', 'danger');
            return;
        }

        const assignedSelect = document.getElementById('taskAssignedSelect');
        const selectedMembers = Array.from(assignedSelect.selectedOptions).map(opt => opt.value);

        if (id) {
         
            const t = tasks.find(x => x.id === id);
            if (t) {
                t.title = title;
                t.description = document.getElementById('taskDescInput').value;
                t.projectId = document.getElementById('taskProjectSelect').value;
                t.category = document.getElementById('taskCategoryInput').value;
                t.priority = document.getElementById('taskPrioritySelect').value;
                t.status = document.getElementById('taskStatusSelect').value;
                t.startDate = document.getElementById('taskStartDateInput').value;
                t.dueDate = dueDate;
                t.startTime = document.getElementById('taskStartTimeInput').value;
                t.endTime = document.getElementById('taskEndTimeInput').value;
                t.assignedMembers = selectedMembers;
                t.link = document.getElementById('taskLinkInput').value;
            }
            createNotification(`Task updated: "${title}"`);
            showToast('Task updated successfully', 'success');
        } else {
            
            const newTask = {
                id: 'task-' + Date.now(),
                title,
                description: document.getElementById('taskDescInput').value,
                projectId: document.getElementById('taskProjectSelect').value,
                category: document.getElementById('taskCategoryInput').value,
                priority: document.getElementById('taskPrioritySelect').value,
                status: document.getElementById('taskStatusSelect').value,
                startDate: document.getElementById('taskStartDateInput').value,
                dueDate,
                startTime: document.getElementById('taskStartTimeInput').value,
                endTime: document.getElementById('taskEndTimeInput').value,
                assignedMembers: selectedMembers,
                link: document.getElementById('taskLinkInput').value,
                subtasks: []
            };
            tasks.unshift(newTask);
            createNotification(`New task created: "${title}"`);
            showToast('Task created successfully', 'success');
        }

        saveState();
        renderAllViews();
        closeModals();
    });

   
    function openTaskDetailsModal(taskId) {
        const t = tasks.find(x => x.id === taskId);
        if (!t) return;
        activeTaskForDetails = t;

        document.getElementById('detailTaskTitle').textContent = t.title;
        document.getElementById('detailTaskDesc').textContent = t.description || 'No description provided.';
        document.getElementById('detailPriorityBadge').textContent = t.priority;
        document.getElementById('detailStatusBadge').textContent = t.status;

        const proj = projects.find(p => p.id === t.projectId);
        document.getElementById('detailProject').textContent = proj ? proj.name : 'None';
        document.getElementById('detailCategory').textContent = t.category || 'General';
        document.getElementById('detailStartDate').textContent = t.startDate || 'N/A';
        document.getElementById('detailDueDate').textContent = t.dueDate;
        document.getElementById('detailTimeWindow').textContent = (t.startTime && t.endTime) ? `${t.startTime} - ${t.endTime}` : 'All Day';

        const linkEl = document.getElementById('detailLink');
        if (t.link) {
            linkEl.innerHTML = `<a href="${escapeHTML(t.link)}" target="_blank" rel="noopener">Open Link <i data-lucide="external-link"></i></a>`;
        } else {
            linkEl.textContent = 'No link attached.';
        }

        
        const assigneesContainer = document.getElementById('detailAssignedList');
        assigneesContainer.innerHTML = (t.assignedMembers || []).map(mId => {
            const m = teamMembers.find(x => x.id === mId);
            return m ? `<span class="badge" style="background:var(--primary-light); color:var(--primary);">${escapeHTML(m.name)}</span>` : '';
        }).join('') || 'None';

        renderSubtasksUI();
        document.getElementById('taskDetailModal').classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    }

    function renderSubtasksUI() {
        if (!activeTaskForDetails) return;
        const subtasks = activeTaskForDetails.subtasks || [];
        const total = subtasks.length;
        const completed = subtasks.filter(s => s.completed).length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('subtaskProgressText').textContent = `${completed}/${total}`;
        document.getElementById('subtaskPercentText').textContent = `${percent}%`;
        document.getElementById('subtaskProgressBar').style.width = `${percent}%`;

        const list = document.getElementById('subtaskList');
        list.innerHTML = subtasks.map(s => `
            <div class="subtask-item">
                <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                    <input type="checkbox" class="subtask-checkbox" data-id="${s.id}" ${s.completed ? 'checked' : ''}>
                    <span style="${s.completed ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${escapeHTML(s.title)}</span>
                </label>
                <button class="icon-btn delete-subtask-btn" data-id="${s.id}"><i data-lucide="trash-2"></i></button>
            </div>
        `).join('') || '<p style="color:var(--text-muted); font-size:0.85rem; padding:0.5rem 0;">No subtasks added yet.</p>';



        list.querySelectorAll('.subtask-checkbox').forEach(chk => {
            chk.addEventListener('change', (e) => {
                const sId = chk.getAttribute('data-id');
                const sub = activeTaskForDetails.subtasks.find(x => x.id === sId);
                if (sub) {
                    sub.completed = e.target.checked;
                    
                    
                    const allDone = activeTaskForDetails.subtasks.every(x => x.completed);
                    if (allDone && activeTaskForDetails.subtasks.length > 0) {
                        activeTaskForDetails.status = 'Completed';
                    }

                    saveState();
                    renderSubtasksUI();
                    renderAllViews();
                }
            });
        });

        list.querySelectorAll('.delete-subtask-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sId = btn.getAttribute('data-id');
                activeTaskForDetails.subtasks = activeTaskForDetails.subtasks.filter(x => x.id !== sId);
                saveState();
                renderSubtasksUI();
                renderAllViews();
            });
        });

        if (window.lucide) lucide.createIcons();
    }

    document.getElementById('addSubtaskForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('subtaskTitleInput');
        const title = input.value.trim();
        if (!title || !activeTaskForDetails) return;

        if (!activeTaskForDetails.subtasks) activeTaskForDetails.subtasks = [];
        activeTaskForDetails.subtasks.push({
            id: 'st-' + Date.now(),
            title,
            completed: false
        });

        input.value = '';
        saveState();
        renderSubtasksUI();
        renderAllViews();
    });

    
    function renderProjects() {
        const container = document.getElementById('projectsContainer');
        if (!container) return;

        container.innerHTML = projects.map(p => {
            const pTasks = tasks.filter(t => t.projectId === p.id);
            const pCompleted = pTasks.filter(t => t.status === 'Completed').length;
            const progress = pTasks.length ? Math.round((pCompleted / pTasks.length) * 100) : 0;

            return `
                <div class="project-card">
                    <div class="card-header">
                        <h3>${escapeHTML(p.name)}</h3>
                        <div class="task-actions">
                            <button class="icon-btn edit-proj-btn" data-id="${p.id}"><i data-lucide="edit-3"></i></button>
                            <button class="icon-btn delete-proj-btn" data-id="${p.id}"><i data-lucide="trash-2"></i></button>
                        </div>
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">${escapeHTML(p.description || 'No description')}</p>
                    <div style="margin-bottom:0.75rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.25rem;">
                            <span>Progress</span>
                            <span>${progress}% (${pCompleted}/${pTasks.length} Tasks)</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width:${progress}%;"></div>
                        </div>
                    </div>
                    <small style="color:var(--text-muted);"><i data-lucide="calendar"></i> Deadline: ${p.deadline}</small>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.edit-proj-btn').forEach(btn => {
            btn.addEventListener('click', () => openProjectModal(btn.getAttribute('data-id')));
        });

        container.querySelectorAll('.delete-proj-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openConfirmModal('Delete Project', 'Are you sure? Tasks assigned to this project will remain intact.', () => {
                    projects = projects.filter(x => x.id !== id);
                    saveState();
                    renderAllViews();
                    showToast('Project deleted', 'danger');
                });
            });
        });

        if (window.lucide) lucide.createIcons();
    }

    function openProjectModal(projId = null) {
        const modal = document.getElementById('projectModal');
        const form = document.getElementById('projectForm');
        form.reset();

        if (projId) {
            const p = projects.find(x => x.id === projId);
            if (p) {
                document.getElementById('projectIdInput').value = p.id;
                document.getElementById('projectNameInput').value = p.name;
                document.getElementById('projectDescInput').value = p.description || '';
                document.getElementById('projectDeadlineInput').value = p.deadline;
            }
        } else {
            document.getElementById('projectIdInput').value = '';
        }

        modal.classList.remove('hidden');
    }


    document.getElementById('projectForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('projectIdInput').value;
        const name = document.getElementById('projectNameInput').value.trim();
        const deadline = document.getElementById('projectDeadlineInput').value;

        if (id) {
            const p = projects.find(x => x.id === id);
            if (p) {
                p.name = name;
                p.description = document.getElementById('projectDescInput').value;
                p.deadline = deadline;
            }
            showToast('Project updated', 'success');
        } else {
            projects.push({
                id: 'proj-' + Date.now(),
                name,
                description: document.getElementById('projectDescInput').value,
                deadline
            });
            createNotification(`New project created: "${name}"`);
            showToast('Project created', 'success');
        }

        saveState();
        renderAllViews();
        closeModals();
    });

    function renderTeam() {
        const container = document.getElementById('teamMembersContainer');
        if (!container) return;

        container.innerHTML = teamMembers.map(m => {
            const assignedCount = tasks.filter(t => (t.assignedMembers || []).includes(m.id)).length;

            return `
                <div class="team-card">
                    <div class="user-avatar huge">${m.name.charAt(0)}</div>
                    <h3>${escapeHTML(m.name)}</h3>
                    <p style="font-size:0.85rem; color:var(--text-muted);">${escapeHTML(m.role)}</p>
                    <span class="badge" style="background:var(--primary-light); color:var(--primary);">${escapeHTML(m.email)}</span>
                    <div style="margin-top:0.5rem; font-size:0.8rem; color:var(--text-muted);">
                        Assigned Tasks: <strong>${assignedCount}</strong>
                    </div>
                    <div class="task-actions" style="margin-top:0.5rem;">
                        <button class="icon-btn edit-mem-btn" data-id="${m.id}"><i data-lucide="edit-3"></i></button>
                        <button class="icon-btn delete-mem-btn" data-id="${m.id}"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.edit-mem-btn').forEach(btn => {
            btn.addEventListener('click', () => openTeamModal(btn.getAttribute('data-id')));
        });

        container.querySelectorAll('.delete-mem-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openConfirmModal('Delete Team Member', 'Are you sure you want to remove this member?', () => {
                    teamMembers = teamMembers.filter(x => x.id !== id);
                    saveState();
                    renderAllViews();
                    showToast('Team member removed', 'danger');
                });
            });
        });

        if (window.lucide) lucide.createIcons();
    }

    function openTeamModal(memberId = null) {
        const modal = document.getElementById('teamModal');
        const form = document.getElementById('teamForm');
        form.reset();

        if (memberId) {
            const m = teamMembers.find(x => x.id === memberId);
            if (m) {
                document.getElementById('memberIdInput').value = m.id;
                document.getElementById('memberNameInput').value = m.name;
                document.getElementById('memberRoleInput').value = m.role;
                document.getElementById('memberEmailInput').value = m.email;
            }
        } else {
            document.getElementById('memberIdInput').value = '';
        }

        modal.classList.remove('hidden');
    }

    document.getElementById('teamForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('memberIdInput').value;
        const name = document.getElementById('memberNameInput').value.trim();
        const role = document.getElementById('memberRoleInput').value.trim();
        const email = document.getElementById('memberEmailInput').value.trim();

        if (id) {
            const m = teamMembers.find(x => x.id === id);
            if (m) { m.name = name; m.role = role; m.email = email; }
            showToast('Member updated', 'success');
        } else {
            teamMembers.push({ id: 'mem-' + Date.now(), name, role, email });
            showToast('Member added', 'success');
        }

        saveState();
        renderAllViews();
        closeModals();
    });

    
    function renderCalendar() {
        const grid = document.getElementById('calendarDaysGrid');
        const title = document.getElementById('calendarMonthYear');
        if (!grid || !title) return;

        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        title.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let daysHTML = '';

        
        for (let i = 0; i < firstDay; i++) {
            daysHTML += '<div class="cal-day empty"></div>';
        }

        const todayStr = new Date().toISOString().split('T')[0];

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);

            const isToday = dateStr === todayStr;
            const isActive = dateStr === selectedCalendarDay;

            daysHTML += `
                <div class="cal-day ${isToday ? 'today' : ''} ${isActive ? 'active' : ''}" data-date="${dateStr}">
                    <span>${day}</span>
                    ${dayTasks.length > 0 ? `<div class="cal-day-dot"></div>` : ''}
                </div>
            `;
        }



