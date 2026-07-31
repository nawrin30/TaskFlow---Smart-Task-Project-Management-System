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

