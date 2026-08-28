import React, { createContext, useContext, useState } from 'react';
import {
  initialCompanyProfile,
  initialClients,
  initialPartners,
  initialManagers,
  initialWorkforce,
  initialProjects,
  initialActivities,
  initialNotifications,
  initialPartnerProfile,
  initialPartnerProjects,
  initialPartnerWorkforce,
  initialPartnerWorkforceRequests,
  initialPartnerNotifications,
  initialPartnerActivities,
  initialPartnerSupportTickets,
  initialManagerProfile,
  initialManagerAssignments,
  initialManagerNotifications,
  initialWorkforceUserProfile,
  initialWorkforceNotifications,
  initialClientProfile,
  initialAdminProfile,
} from '../data/mockData';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [companyProfile, setCompanyProfile] = useState(initialCompanyProfile);
  const [adminProfile, setAdminProfile] = useState(initialAdminProfile);
  const [clients, setClients] = useState(initialClients);
  const [partners, setPartners] = useState(initialPartners);
  const [managers, setManagers] = useState(initialManagers);
  const [workforce, setWorkforce] = useState(initialWorkforce);
  const [projects, setProjects] = useState(initialProjects);
  const [activities, setActivities] = useState(initialActivities);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Client Portal State
  const [clientProfile, setClientProfile] = useState(initialClientProfile);
  const [clientNotifications, setClientNotifications] = useState([
    {
      id: 'cnotif-01',
      title: 'Project In Progress',
      message: 'AI Clinical Decision Support Engine has 3 assigned specialists active.',
      type: 'project',
      unread: false,
      time: '2 hours ago',
      link: '/client/projects/PRJ-102',
    },
    {
      id: 'cnotif-02',
      title: 'Project Requirement Review Pending',
      message: 'Your project "AI Smart Credit Scoring Engine" is awaiting Admin sign-off.',
      type: 'project',
      unread: true,
      time: 'Just now',
      link: '/client/projects/PRJ-REQ-201',
    },
  ]);

  // Partner Portal State
  const [partnerProfile, setPartnerProfile] = useState(initialPartnerProfile);
  const [partnerProjects, setPartnerProjects] = useState(initialPartnerProjects);
  const [partnerWorkforce, setPartnerWorkforce] = useState(initialPartnerWorkforce);
  const [partnerWorkforceRequests, setPartnerWorkforceRequests] = useState(initialPartnerWorkforceRequests);
  const [partnerNotifications, setPartnerNotifications] = useState(initialPartnerNotifications);
  const [partnerActivities, setPartnerActivities] = useState(initialPartnerActivities);
  const [partnerSupportTickets, setPartnerSupportTickets] = useState(initialPartnerSupportTickets);

  // Manager Portal State
  const [managerProfile, setManagerProfile] = useState(initialManagerProfile);
  const [managerAssignments, setManagerAssignments] = useState(initialManagerAssignments);
  const [managerNotifications, setManagerNotifications] = useState(initialManagerNotifications);
  const [freelancerRequests, setFreelancerRequests] = useState([
    {
      id: 'fl-req-01',
      freelancerId: 'wf-01',
      freelancerName: 'David Miller',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      projectId: 'PRJ-101',
      projectName: 'Cloud Infrastructure Modernization',
      client: 'Finovate Global',
      role: 'Frontend Developer',
      skills: ['React.js', 'JavaScript', 'Tailwind CSS'],
      experience: '3+ years',
      hourlyRate: '$110/hr',
      duration: '6 Months',
      startDate: '2026-09-01',
      status: 'Accepted',
      requestedDate: '2026-08-15',
      notes: 'Need expert frontend engineer for responsive cloud dashboards.',
    },
    {
      id: 'fl-req-02',
      freelancerId: 'wf-03',
      freelancerName: 'Sophia Chen',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      projectId: 'PRJ-102',
      projectName: 'AI Clinical Decision Support Engine',
      client: 'Medix Health Tech',
      role: 'Senior ML Engineer',
      skills: ['Python', 'PyTorch', 'Transformers'],
      experience: '5+ years',
      hourlyRate: '$125/hr',
      duration: '9 Months',
      startDate: '2026-09-01',
      status: 'Pending',
      requestedDate: '2026-08-15',
      notes: 'Lead NLP pipeline development for clinical records.',
    },
  ]);

  // Workforce Portal State
  const [workforceUserProfile, setWorkforceUserProfile] = useState(initialWorkforceUserProfile);
  const [workforceNotifications, setWorkforceNotifications] = useState(initialWorkforceNotifications);

  // Freelancer Applications State (Submitted via Form for Freelancer)
  const [freelancerApplications, setFreelancerApplications] = useState([
    {
      id: 'fl-app-01',
      fullName: 'Marcus Vance',
      email: 'marcus.vance@devpool.io',
      phone: '+1 (555) 234-8901',
      place: 'Austin, TX',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      experience: '5+ years',
      submittedAt: '2026-08-27',
      status: 'Pending Admin Approval',
    },
    {
      id: 'fl-app-02',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@techcraft.net',
      phone: '+1 (555) 987-6543',
      place: 'Seattle, WA',
      skills: ['Python', 'AI / ML', 'Docker', 'Kubernetes'],
      experience: '6+ years',
      submittedAt: '2026-08-28',
      status: 'Pending Admin Approval',
    },
  ]);

  const addFreelancerApplication = (appData) => {
    const newApp = {
      id: `fl-app-${Date.now()}`,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Pending Admin Approval',
      ...appData,
    };
    setFreelancerApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  const approveFreelancerApplication = (appId) => {
    setFreelancerApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: 'Approved' } : app))
    );

    const app = freelancerApplications.find((a) => a.id === appId);
    if (app) {
      const newWorkforceMember = {
        id: `wf-app-${Date.now()}`,
        name: app.fullName,
        role: app.skills?.[0] ? `${app.skills[0]} Specialist` : 'Software Engineer',
        category: 'Independent Freelancer',
        location: app.place || 'Remote',
        email: app.email,
        phone: app.phone,
        experience: app.experience,
        skills: app.skills || ['React.js', 'Node.js'],
        status: 'Available',
        hourlyRate: '$95/hr',
        rating: 4.9,
      };
      setWorkforce((prev) => [newWorkforceMember, ...prev]);
    }
  };

  const rejectFreelancerApplication = (appId) => {
    setFreelancerApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: 'Rejected' } : app))
    );
  };

  // Central Support & Feedback Tickets State (Submitted by Client, Manager, Partner, Workforce to Admin)
  const [supportTickets, setSupportTickets] = useState([
    {
      id: 'st-01',
      senderRole: 'Client',
      senderName: 'Finovate Global (Sarah Jenkins)',
      senderEmail: 'client@flexistaff.com',
      subject: 'Milestone SLA Acceleration Request',
      category: 'Project Execution',
      priority: 'High',
      message: 'We require an additional Senior React Engineer added to Sprint 3 for the Credit Scoring Engine.',
      submittedAt: '2026-08-28 10:30 AM',
      status: 'Pending Admin Review',
    },
    {
      id: 'st-02',
      senderRole: 'Workforce',
      senderName: 'David Miller',
      senderEmail: 'talent@flexistaff.com',
      subject: 'Timesheet & Milestone Delivery Inquiry',
      category: 'Workforce & Billing',
      priority: 'Medium',
      message: 'Completed Sprint 2 milestone deliverables on Cloud Infrastructure project. Requesting admin sign-off verification.',
      submittedAt: '2026-08-28 11:15 AM',
      status: 'Open',
    },
    {
      id: 'st-03',
      senderRole: 'Manager',
      senderName: 'Alex Morgan',
      senderEmail: 'manager@flexistaff.com',
      subject: 'Partner Skill Match Consultation',
      category: 'Talent Orchestration',
      priority: 'Normal',
      message: 'Requesting admin review for proposed AI Engineer allocation on Medix Health Tech SOW.',
      submittedAt: '2026-08-27 04:45 PM',
      status: 'Resolved',
    },
  ]);

  const submitSupportTicket = (ticketData) => {
    const newTicket = {
      id: `st-${Date.now()}`,
      submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      status: 'Pending Admin Review',
      ...ticketData,
    };
    setSupportTickets((prev) => [newTicket, ...prev]);

    // Send notification to Admin feed
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `New Support Ticket (${ticketData.senderRole})`,
        message: `${ticketData.senderName}: "${ticketData.subject}"`,
        type: 'request',
        unread: true,
        time: 'Just now',
        link: '/admin/support-tickets',
      },
      ...prev,
    ]);

    return newTicket;
  };

  const updateSupportTicketStatus = (ticketId, status) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
  };

  // GitHub-style Milestone Commit System State for Workforce Module
  const [projectMilestones, setProjectMilestones] = useState({
    'PRJ-2026-001': [
      {
        id: 'ms-01',
        title: 'Core OAuth2 & RBAC Auth Engine',
        status: 'Completed',
        dueDate: '2026-09-15',
        commits: [
          {
            id: 'cmt-101',
            commitHash: 'a7f3d91',
            commitMessage: 'feat(auth): Implement JWT token rotation & session refresh handler',
            workCompleted: 'Configured secure HttpOnly cookies, added middleware route protection, and wrote unit tests for auth flow.',
            authorName: 'David Miller',
            dateTime: '2026-08-28 02:45 PM',
          },
          {
            id: 'cmt-102',
            commitHash: 'b82e1c9',
            commitMessage: 'fix(security): Enforce role-based permission verification on API endpoints',
            workCompleted: 'Resolved permission bypass bug in admin route guards and updated Swagger documentation.',
            authorName: 'David Miller',
            dateTime: '2026-08-27 11:20 AM',
          },
        ],
      },
      {
        id: 'ms-02',
        title: 'Real-time Analytics & Dashboard Metrics',
        status: 'In Progress',
        dueDate: '2026-10-01',
        commits: [
          {
            id: 'cmt-201',
            commitHash: 'c4d9e20',
            commitMessage: 'feat(analytics): Wire WebSocket live metrics feed to dashboard UI',
            workCompleted: 'Integrated Socket.io client listener with automatic reconnection and live chart state updates.',
            authorName: 'David Miller',
            dateTime: '2026-08-28 04:10 PM',
          },
        ],
      },
      {
        id: 'ms-03',
        title: 'Billing Gateway & Webhook Integration',
        status: 'Pending',
        dueDate: '2026-10-20',
        commits: [],
      },
    ],
    'PRJ-2026-002': [
      {
        id: 'ms-11',
        title: 'Cloud Infrastructure & CI/CD Pipeline',
        status: 'In Progress',
        dueDate: '2026-09-30',
        commits: [
          {
            id: 'cmt-301',
            commitHash: 'f1e82a4',
            commitMessage: 'infra: Setup AWS EKS Cluster with Terraform manifests',
            workCompleted: 'Provisioned VPC, subnets, worker node groups, and Helm charts for ingress controller.',
            authorName: 'David Miller',
            dateTime: '2026-08-28 01:15 PM',
          },
        ],
      },
    ],
  });

  const addMilestoneCommit = (projectId, milestoneId, commitData) => {
    const newCommit = {
      id: `cmt-${Date.now()}`,
      commitHash: Math.random().toString(16).substring(2, 9),
      dateTime: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      ...commitData,
    };

    const pId = projectId || 'PRJ-2026-001';

    setProjectMilestones((prev) => {
      const projectMs = prev[pId] || [
        {
          id: milestoneId || 'ms-01',
          title: 'Milestone 1: Core Deliverables',
          status: 'In Progress',
          commits: [],
        },
      ];

      const updated = projectMs.map((ms) => {
        if (ms.id === milestoneId || (!milestoneId && ms.status === 'In Progress')) {
          return {
            ...ms,
            commits: [newCommit, ...(ms.commits || [])],
          };
        }
        return ms;
      });

      // Recalculate progress percentage for this project
      const totalMs = updated.length || 1;
      const completedMs = updated.filter((m) => m.status === 'Completed').length;
      const inProgressMs = updated.filter((m) => m.status === 'In Progress').length;
      const calculatedProgress = Math.min(100, Math.round(((completedMs + inProgressMs * 0.5) / totalMs) * 100));

      // Update project progress in state
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === pId || p.projectId === pId
            ? { ...p, progress: calculatedProgress }
            : p
        )
      );

      return {
        ...prev,
        [pId]: updated,
      };
    });

    // Notify Admin, Manager, and Client feeds
    const notifPayload = {
      id: `notif-${Date.now()}`,
      title: `Git Commit Progress: ${newCommit.commitHash}`,
      message: `${newCommit.authorName} committed: "${newCommit.commitMessage}"`,
      time: 'Just now',
      unread: true,
      link: '/projects',
    };

    setNotifications((prev) => [notifPayload, ...prev]);
    setManagerNotifications((prev) => [{ ...notifPayload, link: '/manager/projects' }, ...prev]);
    setClientNotifications((prev) => [{ ...notifPayload, link: '/client/progress' }, ...prev]);

    return newCommit;
  };

  const updateMilestoneStatus = (projectId, milestoneId, newStatus) => {
    const pId = projectId || 'PRJ-2026-001';

    setProjectMilestones((prev) => {
      const projectMs = prev[pId] || [];
      const updated = projectMs.map((ms) =>
        ms.id === milestoneId ? { ...ms, status: newStatus } : ms
      );

      // Recalculate progress percentage
      const totalMs = updated.length || 1;
      const completedMs = updated.filter((m) => m.status === 'Completed').length;
      const inProgressMs = updated.filter((m) => m.status === 'In Progress').length;
      const calculatedProgress = Math.min(100, Math.round(((completedMs + inProgressMs * 0.5) / totalMs) * 100));

      // Sync overall project progress bar
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === pId || p.projectId === pId
            ? { ...p, progress: calculatedProgress }
            : p
        )
      );

      return {
        ...prev,
        [pId]: updated,
      };
    });
  };

  // Activity & Notification Helpers
  const addActivity = (activity) => {
    const newAct = {
      id: `act-${Date.now()}`,
      avatar:
        activity.avatar ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      timestamp: 'Just now',
      ...activity,
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 15)]);
  };

  const markNotificationRead = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Profile Update Actions across all roles
  const updateAdminProfile = (data) => {
    setAdminProfile((prev) => ({ ...prev, ...data }));
  };

  const updatePartnerProfile = (data) => {
    setPartnerProfile((prev) => ({ ...prev, ...data }));
  };

  const updateManagerProfile = (data) => {
    setManagerProfile((prev) => ({ ...prev, ...data }));
  };

  const updateClientProfile = (data) => {
    setClientProfile((prev) => ({ ...prev, ...data }));
  };

  // Universal Project Submission & Approval Actions
  const addPartnerProject = (projectData, isDraft = false) => {
    const newId = `PRJ-PARTNER-${Date.now().toString().slice(-4)}`;
    const reqList = projectData.requirements || [
      { role: 'Frontend React Developer', required: 2, assigned: 0, skills: 'React.js, JavaScript, HTML, CSS', experience: '2+ years' },
      { role: 'Java Backend Architect', required: 2, assigned: 0, skills: 'Java, Spring Boot, MySQL', experience: '3+ years' },
      { role: 'UI/UX Designer', required: 1, assigned: 0, skills: 'Figma, UI Design', experience: '2+ years' },
      { role: 'QA Automation Engineer', required: 1, assigned: 0, skills: 'Selenium, Testing', experience: '2+ years' },
    ];
    const totalRequired = reqList.reduce((sum, r) => sum + (Number(r.required) || 0), 0) || 6;

    const newProject = {
      id: newId,
      name: projectData.name,
      client: partnerProfile.name || 'Apex Digital Enterprises',
      partner: partnerProfile.name || 'Apex Digital Enterprises',
      category: projectData.category || 'Full-Stack Software',
      techStack: projectData.techStack || 'React.js, Java Spring Boot, MySQL, Selenium',
      priority: projectData.priority || 'High',
      description: projectData.description || 'Enterprise platform engineering and multi-role staffing sprint.',
      stage: isDraft ? 'Draft' : 'Requirement Review',
      status: isDraft ? 'Draft' : 'Pending Approval',
      approvalStatus: isDraft ? 'Draft' : 'Pending Admin Review',
      progress: 0,
      workforceRequired: totalRequired,
      workforceAssigned: 0,
      budget: '$180,000',
      createdDate: new Date().toISOString().split('T')[0],
      startDate: projectData.startDate || '2026-09-01',
      expectedEndDate: projectData.expectedEndDate || '2027-02-28',
      duration: projectData.duration || '6 Months',
      workType: projectData.workType || 'Remote',
      location: projectData.location || 'United States, California, San Francisco',
      additionalRequirements: projectData.additionalRequirements || '',
      workflowSteps: [
        { step: 1, label: 'Partner Creates Project', status: 'Completed', date: 'Just now' },
        { step: 2, label: 'Project Submitted', status: isDraft ? 'Pending' : 'Completed', date: isDraft ? 'Draft' : 'Just now' },
        { step: 3, label: 'FlexiStaff Admin Review', status: isDraft ? 'Pending' : 'Active', date: 'In Progress' },
        { step: 4, label: 'Approved / Rejected', status: 'Pending', date: 'Pending' },
        { step: 5, label: 'Manager Receives Approved Project', status: 'Pending', date: 'Pending' },
        { step: 6, label: 'Workforce Matching', status: 'Pending', date: 'Pending' },
        { step: 7, label: 'Workforce Assigned', status: 'Pending', date: 'Pending' },
        { step: 8, label: 'Project Starts', status: 'Pending', date: 'Pending' },
        { step: 9, label: 'Project Completed', status: 'Pending', date: 'Pending' },
      ],
      milestones: [
        { id: `m-${Date.now()}-1`, name: 'Requirement Analysis & Architecture Validation', completed: false, date: 'Month 1' },
        { id: `m-${Date.now()}-2`, name: 'Core Feature Engineering & MVP', completed: false, date: 'Month 3' },
        { id: `m-${Date.now()}-3`, name: 'Final Testing & Deployment', completed: false, date: 'Month 6' },
      ],
      requirements: reqList,
    };

    setPartnerProjects((prev) => [newProject, ...prev]);
    setProjects((prev) => [newProject, ...prev]);

    // Create notification for Admin & Manager
    if (!isDraft) {
      const newNotif = {
        id: `notif-${Date.now()}`,
        title: 'New Project Requirement Submitted',
        message: `Partner "${partnerProfile.name}" submitted requirement for "${newProject.name}" with ${totalRequired} requested engineers.`,
        type: 'project',
        unread: true,
        time: 'Just now',
        link: `/projects/${newProject.id}`,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    return newProject;
  };

  // =========================================================================
  // CLIENT PROJECT REQUEST & SUBMISSION
  // =========================================================================
  const submitClientProjectRequest = (formData) => {
    const newId = `PRJ-REQ-${Date.now().toString().slice(-4)}`;
    const skillsArr = Array.isArray(formData.requiredSkills)
      ? formData.requiredSkills
      : (formData.requiredSkills || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const reqCount = Number(formData.workforceRequired) || 2;
    const reqList = formData.requirements && formData.requirements.length > 0
      ? formData.requirements
      : [
          {
            role: formData.primaryRole || 'Senior Full-Stack Engineer',
            required: reqCount,
            assigned: 0,
            skills: skillsArr.join(', ') || 'React.js, Node.js, Cloud',
            experience: '3+ years',
          },
        ];

    const newProject = {
      id: newId,
      name: formData.title || formData.name || 'Custom Enterprise Project',
      title: formData.title || formData.name || 'Custom Enterprise Project',
      client: clientProfile?.company || 'Finovate Global',
      clientId: clientProfile?.id || 'cli-01',
      category: formData.category || 'Enterprise Software Engineering',
      techStack: formData.techStack || skillsArr.join(', ') || 'React.js, Python, Cloud',
      requiredSkills: skillsArr.length > 0 ? skillsArr : ['React.js', 'Node.js', 'PostgreSQL'],
      priority: formData.priority || 'High',
      description:
        formData.description ||
        'Enterprise staffing requirement submitted directly by client organization.',
      stage: 'Pending Admin Approval',
      status: 'Pending Admin Approval',
      progress: 0,
      workforceRequired: reqCount,
      workforceAssigned: 0,
      budget: formData.budget || '$150,000',
      duration: formData.duration || '6 Months',
      startDate: formData.startDate || '2026-09-01',
      deadline: formData.deadline || '2027-02-28',
      manager: 'Unassigned',
      managerAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      assignedResources: [],
      requirements: reqList,
      milestones: [
        { id: `m-1`, title: 'Project Kickoff & Technical Architecture Blueprint', dueDate: '2026-09-30', completed: false },
        { id: `m-2`, title: 'Core Feature Engineering & Sprint Reviews', dueDate: '2026-11-30', completed: false },
        { id: `m-3`, title: 'Production Handover, UAT & Sign-off', dueDate: '2027-02-28', completed: false },
      ],
      createdDate: new Date().toISOString().split('T')[0],
    };

    setProjects((prev) => [newProject, ...prev]);

    // Send notification to Admin
    const adminNotif = {
      id: `notif-${Date.now()}`,
      title: `New Client Project Request: ${newProject.title}`,
      message: `${newProject.client} submitted project requirement for "${newProject.title}" (${reqCount} engineers required). Review and approve.`,
      type: 'project',
      unread: true,
      time: 'Just now',
      link: '/admin/projects',
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    return newProject;
  };

  // =========================================================================
  // COMPANY ADMIN: PROJECT APPROVAL & REJECTION
  // =========================================================================
  const approveProject = (projectId, assignedManager = 'Alex Morgan') => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            status: 'Approved',
            stage: 'Approved',
            manager: assignedManager,
            approvalStatus: 'Approved',
          };
        }
        return p;
      })
    );

    // Notify Organization Manager
    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'New Project Approved by Admin',
      message: `Project "${projectId}" was approved by Company Admin and assigned to you. Ready for workforce matching.`,
      type: 'project',
      unread: true,
      time: 'Just now',
      link: `/manager/matching/${projectId}`,
    };
    setManagerNotifications((prev) => [mgrNotif, ...prev]);

    // Notify Client
    const clientNotif = {
      id: `cnotif-${Date.now()}`,
      title: 'Project Requirement Approved',
      message: `Your project requirement for "${projectId}" was approved by FlexiStaff Admin and assigned to Manager ${assignedManager}.`,
      type: 'project',
      unread: true,
      time: 'Just now',
      link: `/client/projects/${projectId}`,
    };
    setClientNotifications((prev) => [clientNotif, ...prev]);
  };

  const rejectProject = (projectId, reason = 'Scope budget or project timeline requires adjustment.') => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            status: 'Rejected',
            stage: 'Rejected',
            rejectionReason: reason,
            approvalStatus: 'Rejected',
          };
        }
        return p;
      })
    );

    // Notify Client
    const clientNotif = {
      id: `cnotif-${Date.now()}`,
      title: 'Project Requirement Update',
      message: `Your project "${projectId}" was rejected by Admin: ${reason}. You can modify and resubmit.`,
      type: 'project',
      unread: true,
      time: 'Just now',
      link: `/client/projects/${projectId}`,
    };
    setClientNotifications((prev) => [clientNotif, ...prev]);
  };

  // =========================================================================
  // ORGANIZATION MANAGER: WORKFORCE SELECTION & ASSIGNMENT REQUEST
  // =========================================================================
  const requestWorkforceAssignment = (projectId, workforceMember, assignedRole, notes = '') => {
    const prj =
      projects.find((p) => p.id === projectId) || {
        id: projectId,
        name: 'Enterprise Project',
        title: 'Enterprise Project',
        client: 'Enterprise Client',
      };
    const cand =
      workforce.find((w) => w.id === (workforceMember.id || workforceMember)) ||
      partnerWorkforce.find((w) => w.id === (workforceMember.id || workforceMember)) ||
      workforceMember;

    if (!cand) {
      toast.error('Invalid workforce candidate selected.');
      return null;
    }

    // Availability validation: ensure talent is available and not already doing a project
    const availLower = (cand.availability || '').toLowerCase();
    const workingLower = (cand.workingStatus || '').toLowerCase();
    const prjLower = (cand.currentProject || cand.assignedProject || '').toLowerCase();
    const isGone = cand.status === 'Terminated' || cand.status === 'Suspended' || cand.accountStatus === 'Suspended' || cand.status === 'Inactive';
    const isDoingProject = workingLower === 'working' || availLower === 'assigned' || (prjLower && prjLower !== 'none' && prjLower !== 'unassigned');
    const isUnavailable = availLower === 'unavailable' || availLower === 'paused' || availLower === 'busy';

    // Check if candidate is already in manager assignments queue for an active sprint
    const isAlreadyQueued = (managerAssignments || []).some(
      (a) =>
        (a.professionalId === cand.id || a.professionalName?.toLowerCase() === (cand.name || cand.pseudonym)?.toLowerCase()) &&
        (a.status === 'Pending Assignment Approval' ||
         a.status === 'Awaiting Workforce Response' ||
         a.status === 'Accepted' ||
         a.status === 'Working' ||
         a.status === 'In Progress')
    );

    if (isGone || isDoingProject || isUnavailable || isAlreadyQueued || (availLower !== 'available' && availLower !== 'immediate')) {
      toast.error(`Cannot assign ${cand.name || 'candidate'}: Talent is currently active on another project or unavailable.`);
      return null;
    }

    const newAssignment = {
      id: `asg-req-${Date.now().toString().slice(-4)}`,
      professionalId: cand.id,
      professionalName: cand.name || cand.pseudonym,
      avatar:
        cand.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      role: assignedRole || cand.role || 'Software Engineer',
      projectId: prj.id,
      projectName: prj.name || prj.title,
      client: prj.client || 'Enterprise Client',
      partnerName: cand.partnerName || 'Independent Freelancer',
      roleType: cand.roleType || 'Professional',
      skills: cand.skills || [],
      experience: cand.experience || '3+ years',
      hourlyRate: cand.hourlyRate || '$95/hr',
      workload: cand.workload || 0,
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'Pending Assignment Approval',
      notes: notes,
      progress: 0,
      currentTask: 'Proposed by Manager. Awaiting Company Admin assignment sign-off.',
    };

    setManagerAssignments((prev) => [newAssignment, ...prev]);

    // Send notification to Admin
    const adminNotif = {
      id: `notif-${Date.now()}`,
      title: 'Workforce Assignment Approval Request',
      message: `Manager Alex Morgan proposed assigning ${cand.name || cand.pseudonym} (${assignedRole}) to "${prj.name || prj.title}". Review and approve.`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/admin/assignment-approvals',
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    return newAssignment;
  };

  // =========================================================================
  // MANAGER: REQUEST PROFESSIONALS FROM PARTNER COMPANY
  // =========================================================================
  const sendPartnerWorkforceRequest = (reqData) => {
    const newId = `req-${Date.now().toString().slice(-4)}`;
    const skillsList = Array.isArray(reqData.skills)
      ? reqData.skills
      : String(reqData.skills || '')
          .split(/[,+]/)
          .map((s) => s.trim())
          .filter(Boolean);

    const newReq = {
      id: newId,
      role: reqData.role || 'Senior Software Engineer',
      projectName: reqData.projectName || 'Enterprise Project',
      projectId: reqData.projectId || 'PRJ-101',
      partnerName: reqData.partnerName || 'Apex Digital Enterprises',
      required: Number(reqData.required) || 1,
      assigned: 0,
      remaining: Number(reqData.required) || 1,
      status: 'Pending',
      skills: skillsList.join(', '),
      experience: reqData.experience || '3+ years',
      duration: reqData.duration || '6 Months',
      startDate: reqData.startDate || '2026-09-01',
      priority: reqData.priority || 'High',
      additionalRequirements: reqData.additionalRequirements || '',
      proposedProfessionals: [],
      createdDate: new Date().toISOString().split('T')[0],
    };

    setPartnerWorkforceRequests((prev) => [newReq, ...prev]);

    // Send notification to Partner Company
    const pNotif = {
      id: `pnotif-${Date.now()}`,
      title: `New Workforce Request: ${newReq.role}`,
      message: `Organization Manager requested ${newReq.required} ${newReq.role} for "${newReq.projectName}". Please select suitable professionals.`,
      type: 'workforce',
      unread: true,
      time: 'Just now',
      link: '/partner/workforce',
    };
    setPartnerNotifications((prev) => [pNotif, ...prev]);

    return newReq;
  };

  // Partner Company selects suitable Professionals from its roster and responds
  const respondPartnerWorkforceRequest = (requestId, selectedProfessionalIds = []) => {
    let updatedReq = null;
    const selectedProfs = partnerWorkforce.filter((p) => selectedProfessionalIds.includes(p.id));

    setPartnerWorkforceRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          updatedReq = {
            ...r,
            status: 'Accepted',
            assigned: selectedProfs.length,
            remaining: Math.max(0, r.required - selectedProfs.length),
            proposedProfessionals: selectedProfs,
          };
          return updatedReq;
        }
        return r;
      })
    );

    // Notify Organization Manager
    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Partner Responded to Workforce Request',
      message: `Partner selected ${selectedProfs.length} professional(s) for "${updatedReq?.projectName || 'Project'}". Ready for review.`,
      type: 'workforce',
      unread: true,
      time: 'Just now',
      link: `/manager/matching/${updatedReq?.projectId || ''}`,
    };
    setManagerNotifications((prev) => [mgrNotif, ...prev]);
  };

  const rejectPartnerWorkforceRequest = (requestId, reason = 'No matching talent currently available.') => {
    let targetReq = null;
    setPartnerWorkforceRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          targetReq = {
            ...r,
            status: 'Rejected',
            rejectionReason: reason,
          };
          return targetReq;
        }
        return r;
      })
    );

    // Notify Organization Manager
    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Partner Declined Workforce Request',
      message: `Partner could not fulfill request for "${targetReq?.role || 'role'}": ${reason}.`,
      type: 'workforce',
      unread: true,
      time: 'Just now',
      link: `/manager/matching/${targetReq?.projectId || ''}`,
    };
    setManagerNotifications((prev) => [mgrNotif, ...prev]);
  };

  // =========================================================================
  // MANAGER: REQUEST FREELANCERS FROM FREELANCER POOL
  // =========================================================================
  const sendFreelancerWorkforceRequest = (reqData) => {
    const newId = `fl-req-${Date.now().toString().slice(-4)}`;
    const flCandidate = workforce.find((w) => w.id === reqData.freelancerId) || reqData;
    const newReq = {
      id: newId,
      freelancerId: reqData.freelancerId || flCandidate.id,
      freelancerName: flCandidate.name || flCandidate.pseudonym || 'Freelancer',
      avatar: flCandidate.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      projectId: reqData.projectId,
      projectName: reqData.projectName,
      client: reqData.client,
      role: reqData.role || flCandidate.role,
      skills: Array.isArray(reqData.skills) ? reqData.skills : (flCandidate.skills || []),
      experience: reqData.experience || flCandidate.experience,
      hourlyRate: flCandidate.hourlyRate || '$95/hr',
      duration: reqData.duration || '6 Months',
      startDate: reqData.startDate || '2026-09-01',
      status: 'Pending',
      requestedDate: new Date().toISOString().split('T')[0],
      notes: reqData.notes || '',
    };

    setFreelancerRequests((prev) => [newReq, ...prev]);

    // Send notification to Freelancer
    const wfNotif = {
      id: `wnotif-${Date.now()}`,
      title: `New Workforce Request: ${newReq.role}`,
      message: `Organization Manager requested your availability for "${newReq.projectName}". Review and respond.`,
      type: 'request',
      unread: true,
      time: 'Just now',
      link: '/workforce/assignments',
    };
    setWorkforceNotifications((prev) => [wfNotif, ...prev]);

    return newReq;
  };

  const respondFreelancerWorkforceRequest = (requestId, isAccepted, reason = '') => {
    let targetReq = null;
    setFreelancerRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          targetReq = {
            ...r,
            status: isAccepted ? 'Accepted' : 'Rejected',
            rejectionReason: !isAccepted ? reason : null,
          };
          return targetReq;
        }
        return r;
      })
    );

    // Notify Manager
    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: isAccepted ? 'Freelancer Accepted Request' : 'Freelancer Declined Request',
      message: `${targetReq?.freelancerName} ${isAccepted ? 'accepted' : 'declined'} workforce request for "${targetReq?.projectName}".`,
      type: 'workforce',
      unread: true,
      time: 'Just now',
      link: `/manager/matching/${targetReq?.projectId || ''}`,
    };
    setManagerNotifications((prev) => [mgrNotif, ...prev]);
  };

  // =========================================================================
  // MANAGER: CREATE & SUBMIT ASSIGNMENT REQUEST (MAX 3 WORKFORCE MEMBERS)
  // =========================================================================
  const submitAssignmentRequest = (projectId, selectedWorkforceList = [], notes = '') => {
    if (selectedWorkforceList.length > 3) {
      toast.error('Maximum 3 workforce members can be assigned to a project.');
      return false;
    }
    if (selectedWorkforceList.length === 0) {
      toast.error('Please select at least 1 workforce member.');
      return false;
    }

    const prj = projects.find((p) => p.id === projectId) || {
      id: projectId,
      name: 'Enterprise Project',
      title: 'Enterprise Project',
      client: 'Enterprise Client',
      duration: '6 Months',
    };

    const newAssignments = selectedWorkforceList.map((cand) => {
      return {
        id: `asg-req-${Date.now().toString().slice(-4)}-${cand.id || Math.random().toString().slice(-2)}`,
        professionalId: cand.id,
        professionalName: cand.name || cand.pseudonym,
        avatar: cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        role: cand.role || cand.assignedRole || 'Software Engineer',
        projectId: prj.id,
        projectName: prj.name || prj.title,
        client: prj.client || 'Enterprise Client',
        manager: 'Alex Morgan',
        partnerName: cand.source === 'Partner Company' ? (cand.partnerName || cand.partner || 'Apex Digital Enterprises') : 'Independent Freelancer',
        roleType: cand.source === 'Partner Company' ? 'Professional' : 'Freelancer',
        source: cand.source || (cand.partnerName ? 'Partner Company' : 'Freelancer'),
        skills: cand.skills || [],
        experience: cand.experience || '3+ years',
        hourlyRate: cand.hourlyRate || '$95/hr',
        workload: cand.workload || 0,
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'Pending Admin Approval',
        notes: notes,
        progress: 0,
        currentTask: 'Assignment Request created by Manager. Awaiting Company Admin sign-off.',
      };
    });

    setManagerAssignments((prev) => [...newAssignments, ...prev]);

    // Send notification to Admin
    const adminNotif = {
      id: `notif-${Date.now()}`,
      title: 'New Workforce Assignment Request',
      message: `Organization Manager submitted an assignment request with ${selectedWorkforceList.length} specialist(s) for "${prj.name || prj.title}". Review and approve.`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/admin/assignment-approvals',
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    return newAssignments;
  };

  // =========================================================================
  // PROJECT EXECUTION: UPDATE PROJECT PROGRESS & MILESTONES
  // =========================================================================
  const updateProjectProgress = (projectId, { progress, milestoneId, taskUpdate }) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const numProg = Number(progress) !== undefined ? Number(progress) : p.progress;
          const updatedMilestones = milestoneId && p.milestones
            ? p.milestones.map((m) => (m.id === milestoneId ? { ...m, completed: !m.completed } : m))
            : p.milestones;
          const isComplete = numProg === 100;

          return {
            ...p,
            progress: numProg,
            milestones: updatedMilestones,
            status: isComplete ? 'Completed' : (p.status === 'Approved' ? 'In Progress' : p.status),
            stage: isComplete ? 'Completed' : p.stage,
            recentUpdate: taskUpdate || `Project progress updated to ${numProg}%.`,
          };
        }
        return p;
      })
    );
  };

  // =========================================================================
  // COMPANY ADMIN: ASSIGNMENT APPROVAL & REJECTION
  // =========================================================================
  const approveWorkforceAssignment = (assignmentId) => {
    let targetAsg = null;
    setManagerAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          targetAsg = {
            ...a,
            status: 'Awaiting Workforce Response',
            currentTask: 'Approved by Admin. Awaiting candidate response.',
          };
          return targetAsg;
        }
        return a;
      })
    );

    // Notify Workforce Member (Professional or Freelancer)
    const wfNotif = {
      id: `wnotif-${Date.now()}`,
      title: 'New Project Assignment Offer',
      message: `You have received an assignment offer for "${targetAsg?.projectName || 'Project'}" as ${targetAsg?.role || 'Specialist'}. Please review and respond.`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/workforce/assignments',
    };
    setWorkforceNotifications((prev) => [wfNotif, ...prev]);

    // Notify Manager
    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Assignment Proposal Approved by Admin',
      message: `Admin approved the assignment of ${targetAsg?.professionalName} for "${targetAsg?.projectName}". Invitation routed to talent.`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/manager/assignments',
    };
    setManagerNotifications((prev) => [mgrNotif, ...prev]);
  };

  const rejectWorkforceAssignment = (assignmentId, reason = 'Candidate rate or allocation mismatch with client SLA.') => {
    let targetAsg = null;
    setManagerAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          targetAsg = {
            ...a,
            status: 'Rejected',
            rejectionReason: reason,
            currentTask: 'Assignment rejected by Admin. Please select alternate candidate.',
          };
          return targetAsg;
        }
        return a;
      })
    );

    // Notify Manager
    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Assignment Proposal Rejected by Admin',
      message: `Admin rejected assignment of ${targetAsg?.professionalName} on "${targetAsg?.projectName}": ${reason}. Please select another talent.`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/manager/assignments',
    };
    setManagerNotifications((prev) => [mgrNotif, ...prev]);
  };

  // =========================================================================
  // WORKFORCE (PROFESSIONAL / FREELANCER): ACCEPT OR DECLINE
  // =========================================================================
  const acceptWorkforceAssignment = (assignmentId) => {
    let targetAsg = null;
    setManagerAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          targetAsg = {
            ...a,
            status: 'Accepted',
            progress: 15,
            currentTask: 'Architecture orientation and codebase setup',
            acceptedDate: new Date().toISOString().split('T')[0],
          };
          return targetAsg;
        }
        return a;
      })
    );

    if (!targetAsg) return;

    // 1. Update candidate availability to 'Assigned' in central workforce and partner pools
    setWorkforce((prev) =>
      prev.map((w) =>
        w.id === targetAsg.professionalId
          ? {
              ...w,
              availability: 'Assigned',
              workingStatus: 'Working',
              currentProject: targetAsg.projectName,
              assignedProject: targetAsg.projectName,
            }
          : w
      )
    );
    setPartnerWorkforce((prev) =>
      prev.map((w) =>
        w.id === targetAsg.professionalId
          ? {
              ...w,
              availability: 'Assigned',
              workingStatus: 'Working',
              currentProject: targetAsg.projectName,
              assignedProject: targetAsg.projectName,
            }
          : w
      )
    );

    // 2. Update project status to 'In Progress' and increment workforceAssigned
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === targetAsg.projectId) {
          const nextAssigned = (p.workforceAssigned || 0) + 1;
          const newResources = [
            ...(p.assignedResources || []).filter((r) => r.id !== targetAsg.professionalId),
            {
              id: targetAsg.professionalId,
              name: targetAsg.professionalName,
              role: targetAsg.role,
              avatar: targetAsg.avatar,
              roleType: targetAsg.roleType || 'Professional',
              hoursPerWeek: 40,
            },
          ];
          return {
            ...p,
            status: 'In Progress',
            stage: 'In Progress',
            workforceAssigned: nextAssigned,
            assignedResources: newResources,
          };
        }
        return p;
      })
    );

    // 3. Notify Manager & Client
    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Talent Accepted Assignment',
      message: `${targetAsg.professionalName} accepted assignment on "${targetAsg.projectName}". Project execution started.`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/manager/assignments',
    };
    setManagerNotifications((prev) => [mgrNotif, ...prev]);

    const clientNotif = {
      id: `cnotif-${Date.now()}`,
      title: 'Workforce Onboarded to Project',
      message: `${targetAsg.professionalName} (${targetAsg.role}) accepted assignment and has been allocated to "${targetAsg.projectName}".`,
      type: 'project',
      unread: true,
      time: 'Just now',
      link: `/client/projects/${targetAsg.projectId}`,
    };
    setClientNotifications((prev) => [clientNotif, ...prev]);
  };

  const declineWorkforceAssignment = (assignmentId, reason = 'Schedule conflict / timeline mismatch') => {
    let targetAsg = null;
    setManagerAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          targetAsg = {
            ...a,
            status: 'Declined',
            declineReason: reason,
            currentTask: 'Assignment declined by talent.',
          };
          return targetAsg;
        }
        return a;
      })
    );

    // Notify Manager
    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Assignment Declined by Talent',
      message: `${targetAsg?.professionalName} declined assignment on "${targetAsg?.projectName}": ${reason}. Please select alternate talent.`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/manager/assignments',
    };
    setManagerNotifications((prev) => [mgrNotif, ...prev]);
  };

  // Legacy alias for compatibility
  const assignWorkforce = (projectId, workforceId, assignedRole) => {
    return requestWorkforceAssignment(projectId, workforceId, assignedRole);
  };

  // Workforce Progress Update
  const updateWorkforceProgress = (projectId, workforceId, { task, progress, status, description }) => {
    const numProgress = Number(progress) || 0;

    // 1. Update workforce list
    setWorkforce((prev) =>
      prev.map((w) => (w.id === workforceId ? { ...w, workProgress: numProgress, currentTask: task, workingStatus: status || 'Working', lastUpdated: 'Just now' } : w))
    );
    setPartnerWorkforce((prev) =>
      prev.map((w) => (w.id === workforceId ? { ...w, workProgress: numProgress, currentTask: task, workingStatus: status || 'Working', lastUpdated: 'Just now' } : w))
    );

    // 2. Update manager assignments
    setManagerAssignments((prev) =>
      prev.map((a) => (a.professionalId === workforceId || a.projectId === projectId ? { ...a, progress: numProgress, currentTask: task, status: status || 'Working' } : a))
    );

    // 3. Update workforce user profile state
    setWorkforceUserProfile((prev) => ({
      ...prev,
      currentAssignment: {
        ...prev.currentAssignment,
        currentTask: task,
        progress: numProgress,
        status: status || 'Working',
        description: description || prev.currentAssignment.description,
        lastUpdated: 'Just now',
      },
    }));

    // 4. Update overall project progress
    const updatePrjProgress = (p) => {
      if (p.id === projectId || p.name.includes('E-Commerce')) {
        return {
          ...p,
          progress: numProgress,
          stage: numProgress >= 100 ? 'Completed' : 'Development',
          status: numProgress >= 100 ? 'Completed' : 'In Progress',
        };
      }
      return p;
    };
    setProjects((prev) => prev.map(updatePrjProgress));
    setPartnerProjects((prev) => prev.map(updatePrjProgress));

    // 5. Add to real-time activity stream
    const newAct = {
      id: `act-${Date.now()}`,
      user: workforceUserProfile.name || 'David Miller',
      action: `updated sprint task to "${task}" (${numProgress}% progress)`,
      project: 'E-Commerce Platform Development',
      time: 'Just now',
      avatar: workforceUserProfile.avatar,
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 15)]);
    setPartnerActivities((prev) => [newAct, ...prev.slice(0, 15)]);

    // 6. Notify Manager & Partner
    const mNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Workforce Progress Updated',
      message: `${workforceUserProfile.name} updated progress to ${numProgress}% on "${task}".`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/manager/assignments',
    };
    setManagerNotifications((prev) => [mNotif, ...prev]);

    const pNotif = {
      id: `pnotif-${Date.now()}`,
      title: 'Project Sprint Progress Updated',
      message: `Workforce updated task "${task}" with ${numProgress}% completion on your project.`,
      type: 'progress',
      unread: true,
      time: 'Just now',
      link: '/partner/project-progress',
    };
    setPartnerNotifications((prev) => [pNotif, ...prev]);
  };

  // =========================================================================
  // FREELANCER REGISTRATION & VERIFICATION (COMMON PROFESSIONAL POOL)
  // =========================================================================
  const registerFreelancer = (formData) => {
    const nextIdNum = 1000 + (workforce.length || 0) + 1;
    const newProfessionalId = `PRO-${nextIdNum}`;

    const newProfessional = {
      id: newProfessionalId,
      name: formData.fullName || formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role || 'Frontend Developer',
      title: `${formData.role || 'Professional'} (${formData.experience || '2 Years'})`,
      roleType: 'Freelancer',
      source: 'Freelancer Registration',
      professionalType: 'FREELANCER',
      partnerName: 'Independent Freelancer',
      qualification: formData.qualification || 'Bachelor\'s Degree',
      experience: formData.experience || '2 Years',
      skills: formData.skills && formData.skills.length > 0 ? formData.skills : ['React.js', 'JavaScript', 'HTML', 'CSS'],
      summary: formData.summary || '',
      portfolio: formData.portfolio || '',
      linkedin: formData.linkedin || '',
      github: formData.github || '',
      resume: formData.resume || 'resume.pdf',
      availability: formData.availability || 'Available',
      workPreference: formData.workPreference && formData.workPreference.length > 0 ? formData.workPreference : ['Remote'],
      location: formData.location ? (typeof formData.location === 'string' ? formData.location : `${formData.location.city || 'City'}, ${formData.location.state || 'State'}, ${formData.location.country || 'Country'}`) : 'San Francisco, CA',
      availableFrom: formData.availableFrom || new Date().toISOString().split('T')[0],
      durationPreference: formData.durationPreference || 'Flexible',
      verificationStatus: 'Pending',
      accountStatus: 'Inactive',
      approvalStatus: 'Pending',
      status: 'Pending Verification',
      rating: 4.9,
      hourlyRate: '$95/hr',
      currentProject: 'Unassigned',
      registrationDate: new Date().toISOString().split('T')[0],
      avatar: formData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullName || formData.name || 'Pro')}`,
    };

    // 1. Add to common workforce pool
    setWorkforce((prev) => [newProfessional, ...prev]);

    // 2. Notify Admin about pending verification
    const adminNotif = {
      id: `notif-${Date.now()}`,
      title: 'New Freelancer Registration',
      message: `${newProfessional.name} registered as a ${newProfessional.role} (${newProfessional.id}). Verification pending.`,
      type: 'user',
      unread: true,
      time: 'Just now',
      link: '/workforce',
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    // 3. Add to activity log
    const newAct = {
      id: `act-${Date.now()}`,
      user: newProfessional.name,
      action: `submitted freelancer registration (${newProfessional.id}) for verification`,
      project: 'Professional Pool',
      time: 'Just now',
      avatar: newProfessional.avatar,
    };
    setActivities((prev) => [newAct, ...prev.slice(0, 15)]);

    return { success: true, professional: newProfessional };
  };

  const approveProfessional = (professionalId) => {
    let approvedMember = null;

    setWorkforce((prev) =>
      prev.map((w) => {
        if (w.id === professionalId) {
          approvedMember = {
            ...w,
            verificationStatus: 'Approved',
            accountStatus: 'Active',
            approvalStatus: 'Approved',
            status: 'Available',
          };
          return approvedMember;
        }
        return w;
      })
    );

    if (approvedMember) {
      // Activity
      const newAct = {
        id: `act-${Date.now()}`,
        user: 'FlexiStaff Admin',
        action: `verified & approved professional ${approvedMember.name} (${approvedMember.id}) to Common Pool`,
        project: 'Workforce Pool',
        time: 'Just now',
        avatar: approvedMember.avatar,
      };
      setActivities((prev) => [newAct, ...prev.slice(0, 15)]);

      // Notify Manager that talent is ready for matching
      const mNotif = {
        id: `mnotif-${Date.now()}`,
        title: 'New Verified Talent Available',
        message: `${approvedMember.name} (${approvedMember.role} - ${approvedMember.professionalType}) is approved and available for project matching.`,
        type: 'approval',
        unread: true,
        time: 'Just now',
        link: '/manager/matching',
      };
      setManagerNotifications((prev) => [mNotif, ...prev]);
    }
  };

  const rejectProfessional = (professionalId, reason = 'Profile criteria does not match platform standards.') => {
    setWorkforce((prev) =>
      prev.map((w) =>
        w.id === professionalId
          ? { ...w, verificationStatus: 'Rejected', accountStatus: 'Inactive', approvalStatus: 'Rejected', status: 'Rejected', rejectionReason: reason }
          : w
      )
    );
  };

  const updateProfessionalAvailability = (professionalId, availabilityData) => {
    setWorkforce((prev) =>
      prev.map((w) => {
        if (w.id === professionalId) {
          return {
            ...w,
            availability: availabilityData.availability || w.availability,
            workPreference: availabilityData.workPreference || w.workPreference,
            availableFrom: availabilityData.availableFrom || w.availableFrom,
            location: availabilityData.location || w.location,
          };
        }
        return w;
      })
    );

    // If currently logged-in workforce user matches, update workforceUserProfile as well
    setWorkforceUserProfile((prev) => ({
      ...prev,
      availability: availabilityData.availability || prev.availability,
      workPreference: availabilityData.workPreference || prev.workPreference,
      availableFrom: availabilityData.availableFrom || prev.availableFrom,
      location: availabilityData.location || prev.location,
    }));
  };

  const updateWorkforceUserProfile = (data) => {
    setWorkforceUserProfile((prev) => ({ ...prev, ...data }));
  };

  // Skill Matching Utility: Match Score = (Matched Required Skills / Total Required Skills) * 100
  const calculateSkillMatch = (requiredSkillsStr = '', candidateSkillsList = []) => {
    if (!requiredSkillsStr) return 85;
    const reqTokens = String(requiredSkillsStr)
      .toLowerCase()
      .split(/[,+]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (reqTokens.length === 0) return 85;

    const candTokens = (candidateSkillsList || []).map((s) => String(s).toLowerCase().trim());

    let matchCount = 0;
    reqTokens.forEach((req) => {
      const hasMatch = candTokens.some((c) => c.includes(req) || req.includes(c));
      if (hasMatch) matchCount++;
    });

    const rawPercentage = Math.round((matchCount / reqTokens.length) * 100);
    // Keep score realistic between 60% and 98%
    return Math.max(65, Math.min(98, rawPercentage === 0 ? 70 : rawPercentage));
  };

  const updatePartnerProject = (id, data) => {
    setPartnerProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  // Partner Notification Actions
  const markPartnerNotificationRead = (notifId) => {
    setPartnerNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, unread: false } : n))
    );
  };

  const markAllPartnerNotificationsRead = () => {
    setPartnerNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Partner Support Ticket
  const addPartnerSupportTicket = (ticketData) => {
    const newTicket = {
      id: `TICK-${Math.floor(100 + Math.random() * 900)}`,
      subject: ticketData.subject,
      project: ticketData.project || 'General Inquiries',
      priority: ticketData.priority || 'Medium',
      status: 'Open',
      createdDate: new Date().toISOString().split('T')[0],
      lastReply: 'Submitted to FlexiStaff Support Desk',
      message: ticketData.message,
    };
    setPartnerSupportTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  // Company Profile Actions
  const updateCompanyProfile = (updatedData) => {
    setCompanyProfile((prev) => ({ ...prev, ...updatedData }));
  };

  // Client Actions
  const addClient = (client) => {
    const newClient = {
      ...client,
      id: `cli-${Date.now().toString().slice(-4)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      activeProjects: 0,
      totalSpent: '$0',
      logo:
        client.logo ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    };
    setClients((prev) => [newClient, ...prev]);

    // Record Activity
    addActivity({
      user: 'Sarah Jenkins',
      action: 'Onboarded new client',
      target: newClient.name,
      targetType: 'client',
    });

    return newClient;
  };

  const updateClient = (id, updatedData) => {
    setClients((prev) =>
      prev.map((cli) => (cli.id === id ? { ...cli, ...updatedData } : cli))
    );
  };

  // Partner Actions
  const addPartner = (partner) => {
    const newPartner = {
      ...partner,
      id: `prt-${Date.now().toString().slice(-4)}`,
      joinedDate: new Date().toISOString().split('T')[0],
      suppliedProfessionals: Number(partner.suppliedProfessionals) || 0,
      activePlacements: 0,
      availabilityRate: '100%',
      rating: 4.8,
    };
    setPartners((prev) => [newPartner, ...prev]);

    addActivity({
      user: 'Sarah Jenkins',
      action: 'Registered new staffing partner',
      target: newPartner.name,
      targetType: 'partner',
    });

    return newPartner;
  };

  const updatePartner = (id, updatedData) => {
    setPartners((prev) =>
      prev.map((prt) => (prt.id === id ? { ...prt, ...updatedData } : prt))
    );
  };

  // Manager Lifecycle & Project Reassignment Actions
  const addManager = (managerData) => {
    const nextNum = managers.length + 1;
    const nextEmployeeId = managerData.employeeId || `MNG-${nextNum.toString().padStart(3, '0')}`;
    const newManager = {
      ...managerData,
      id: `mng-${Date.now().toString().slice(-4)}`,
      employeeId: nextEmployeeId,
      role: 'Organization Manager',
      status: managerData.status || 'Active',
      assignedProjectsCount: 0,
      teamSize: 0,
      joinDate: managerData.joinDate || new Date().toISOString().split('T')[0],
      avatar:
        managerData.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    };
    setManagers((prev) => [newManager, ...prev]);

    addActivity({
      user: 'Sarah Jenkins (Admin)',
      action: 'Registered new Organization Manager',
      target: `${newManager.name} (${newManager.employeeId})`,
      targetType: 'manager',
    });

    return newManager;
  };

  const updateManager = (id, updatedData) => {
    setManagers((prev) =>
      prev.map((mng) => (mng.id === id ? { ...mng, ...updatedData } : mng))
    );
  };

  const updateManagerStatus = (id, newStatus, reason = '') => {
    let affectedManagerName = '';
    const nowStr = new Date().toISOString().split('T')[0];

    setManagers((prev) =>
      prev.map((mng) => {
        if (mng.id === id) {
          affectedManagerName = mng.name;
          const statusUpdates = {
            status: newStatus,
            statusReason: reason || mng.statusReason || '',
          };
          if (newStatus === 'Suspended') statusUpdates.suspendedDate = nowStr;
          if (newStatus === 'Resigned') statusUpdates.resignedDate = nowStr;
          if (newStatus === 'Terminated') statusUpdates.terminatedDate = nowStr;
          if (newStatus === 'Active') {
            delete statusUpdates.suspendedDate;
            delete statusUpdates.terminatedDate;
          }
          return { ...mng, ...statusUpdates };
        }
        return mng;
      })
    );

    addActivity({
      user: 'Company Admin',
      action: `Changed Manager status to ${newStatus}`,
      target: affectedManagerName,
      targetType: 'manager',
    });
  };

  const reassignProjectManager = (projectId, newManagerId, reason = '') => {
    const targetManager = managers.find((m) => m.id === newManagerId || m.name === newManagerId);
    if (!targetManager) return false;

    let previousManagerName = '';
    let projectTitle = '';

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          previousManagerName = p.manager;
          projectTitle = p.title || p.name;
          return {
            ...p,
            manager: targetManager.name,
            managerAvatar: targetManager.avatar,
            reassignmentHistory: [
              ...(p.reassignmentHistory || []),
              {
                previousManager: previousManagerName,
                newManager: targetManager.name,
                date: new Date().toISOString().split('T')[0],
                reason: reason || 'Manager lifecycle transition',
              },
            ],
          };
        }
        return p;
      })
    );

    // Update manager project counts
    setManagers((prev) =>
      prev.map((m) => {
        if (m.name === targetManager.name) {
          return { ...m, assignedProjectsCount: (m.assignedProjectsCount || 0) + 1 };
        }
        if (m.name === previousManagerName && m.assignedProjectsCount > 0) {
          return { ...m, assignedProjectsCount: m.assignedProjectsCount - 1 };
        }
        return m;
      })
    );

    addActivity({
      user: 'Company Admin',
      action: `Reassigned project "${projectTitle}"`,
      target: `${previousManagerName} → ${targetManager.name}`,
      targetType: 'project',
    });

    return true;
  };

  // Workforce Actions
  const addWorkforceMember = (member) => {
    const newMember = {
      ...member,
      id: `wf-${Date.now().toString().slice(-4)}`,
      workload: Number(member.workload) || 0,
      rating: 4.9,
      currentProject: 'None',
      source: member.source || (member.roleType === 'Freelancer' ? 'Freelancer' : 'Partner Company'),
      partnerName: member.partnerName || (member.roleType === 'Freelancer' ? 'Direct Freelancer Application' : 'QuantumTech Staffing Solutions'),
      approvalStatus: member.approvalStatus || 'Approved',
      status: member.approvalStatus === 'Pending Review' ? 'Pending Review' : (member.availability === 'Busy' ? 'Assigned' : 'Available'),
      avatar:
        member.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    };
    setWorkforce((prev) => [newMember, ...prev]);

    addActivity({
      user: 'Sarah Jenkins',
      action: `Added ${newMember.roleType.toLowerCase()} to workforce`,
      target: newMember.name,
      targetType: 'talent',
    });

    return newMember;
  };

  // Admin Accept / Approve candidate into active talent pool
  const approveWorkforceMember = (id) => {
    let approvedName = '';
    let approvedSource = '';
    setWorkforce((prev) =>
      prev.map((wf) => {
        if (wf.id === id) {
          approvedName = wf.name;
          approvedSource = wf.source;
          return {
            ...wf,
            approvalStatus: 'Approved',
            status: wf.availability === 'Busy' ? 'Assigned' : 'Available',
          };
        }
        return wf;
      })
    );

    addActivity({
      user: 'Sarah Jenkins (Admin)',
      action: `Approved & accepted into talent pool (${approvedSource})`,
      target: approvedName,
      targetType: 'talent',
    });

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `Candidate Approved: ${approvedName}`,
      message: `${approvedName} has been verified and added to the active talent pool.`,
      type: 'user',
      unread: true,
      time: 'Just now',
      link: '/workforce',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Admin Reject recruitment or partner request
  const rejectWorkforceMember = (id, reason = 'Did not meet requirements') => {
    let rejectedName = '';
    setWorkforce((prev) =>
      prev.map((wf) => {
        if (wf.id === id) {
          rejectedName = wf.name;
          return {
            ...wf,
            approvalStatus: 'Rejected',
            status: 'Rejected',
            rejectionReason: reason,
          };
        }
        return wf;
      })
    );

    addActivity({
      user: 'Sarah Jenkins (Admin)',
      action: `Rejected recruitment request (${reason})`,
      target: rejectedName,
      targetType: 'talent',
    });
  };

  // Partner Company submits a candidate for admin review
  const submitPartnerCandidate = (candidate) => {
    const newCandidate = {
      ...candidate,
      id: `wf-${Date.now().toString().slice(-4)}`,
      source: 'Partner Company',
      partnerName: candidate.partnerName || 'Partner Staffing Agency',
      approvalStatus: 'Pending Review',
      status: 'Pending Review',
      workload: 0,
      rating: 4.8,
      currentProject: 'None',
      submittedDate: new Date().toISOString().split('T')[0],
      avatar:
        candidate.avatar ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    };
    setWorkforce((prev) => [newCandidate, ...prev]);

    addActivity({
      user: candidate.partnerName || 'Partner Agency',
      action: 'Submitted temporary employee for Admin review',
      target: newCandidate.name,
      targetType: 'talent',
    });

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `New Partner Submission: ${newCandidate.name}`,
      message: `${newCandidate.partnerName} submitted ${newCandidate.name} (${newCandidate.title}) for approval.`,
      type: 'partner',
      unread: true,
      time: 'Just now',
      link: '/workforce',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newCandidate;
  };

  // Freelancer submits direct recruitment request
  const submitFreelancerRequest = (freelancerData) => {
    const newFreelancer = {
      ...freelancerData,
      id: `wf-${Date.now().toString().slice(-4)}`,
      roleType: 'Freelancer',
      source: 'Freelancer',
      partnerName: 'Direct Freelancer Application',
      approvalStatus: 'Pending Review',
      status: 'Pending Review',
      workload: 0,
      rating: 4.9,
      currentProject: 'None',
      submittedDate: new Date().toISOString().split('T')[0],
      avatar:
        freelancerData.avatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    };
    setWorkforce((prev) => [newFreelancer, ...prev]);

    addActivity({
      user: 'Independent Freelancer',
      action: 'Submitted recruitment request to join roster',
      target: newFreelancer.name,
      targetType: 'talent',
    });

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `Freelancer Recruitment Request: ${newFreelancer.name}`,
      message: `${newFreelancer.name} applied to join as ${newFreelancer.title}. Review application.`,
      type: 'user',
      unread: true,
      time: 'Just now',
      link: '/workforce',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newFreelancer;
  };

  // Partner Company adds a new Professional with full details
  const addPartnerProfessional = (profData) => {
    const newId = `WF-${Date.now().toString().slice(-4)}`;
    const skillsList = Array.isArray(profData.skills)
      ? profData.skills
      : String(profData.skills || '')
          .split(/[,+]/)
          .map((s) => s.trim())
          .filter(Boolean);

    const newProf = {
      id: newId,
      name: profData.name,
      pseudonym: profData.pseudonym || profData.name,
      role: profData.role || profData.title || 'Full-Stack Developer',
      title: profData.title || profData.role || 'Full-Stack Developer',
      roleCategory: profData.roleCategory || 'Full-Stack Engineering',
      partner: partnerProfile.name || 'Apex Digital Enterprises',
      partnerName: partnerProfile.name || 'Apex Digital Enterprises',
      partnerCompany: partnerProfile.name || 'Apex Digital Enterprises',
      roleType: 'Professional',
      professionalType: 'PARTNER_EMPLOYEE',
      source: 'Partner Company',
      skills: skillsList.length > 0 ? skillsList : ['React.js', 'JavaScript', 'Tailwind CSS'],
      experience: profData.experience || '3+ years',
      experienceLevel: profData.experienceLevel || 'Senior',
      location: profData.location || 'Remote',
      hourlyRate: profData.hourlyRate || '$85/hr',
      availability: profData.availability || 'Available',
      preferredWorkType: profData.preferredWorkType || 'Remote',
      workingStatus: profData.workingStatus || 'Available',
      workload: 0,
      workProgress: 0,
      currentProject: 'None',
      assignedProject: 'None',
      approvalStatus: 'Approved',
      verificationStatus: 'Approved',
      accountStatus: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      email: profData.email || `${(profData.name || 'talent').toLowerCase().replace(/\s+/g, '.')}@apexdigital.com`,
      phone: profData.phone || '+1 (555) 234-5678',
      bio: profData.bio || 'Experienced software specialist dedicated to agile enterprise delivery.',
      certifications: profData.certifications || [],
      github: profData.github || '',
      linkedin: profData.linkedin || '',
      portfolio: profData.portfolio || '',
      tasks: [],
      isAvailable: profData.availability === 'Available' || profData.availability === 'Immediate',
      avatar:
        profData.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    };

    setPartnerWorkforce((prev) => [newProf, ...prev]);
    setWorkforce((prev) => [newProf, ...prev]);

    // Send activity & notifications
    addActivity({
      title: 'New Specialist Registered',
      description: `${partnerProfile?.name || 'Apex Digital'} added ${newProf.name} (${newProf.role}) to workforce roster.`,
      icon: 'Users',
      color: 'blue',
      timestamp: 'Just now',
    });

    const notif = {
      id: `notif-${Date.now()}`,
      title: `New Professional Added: ${newProf.name}`,
      message: `${partnerProfile.name} added ${newProf.name} (${newProf.role}) to the workforce pool. Ready for project matching.`,
      type: 'partner',
      unread: true,
      time: 'Just now',
      link: '/workforce',
    };
    setNotifications((prev) => [notif, ...prev]);
    setManagerNotifications((prev) => [notif, ...prev]);

    return newProf;
  };

  const updatePartnerProfessionalAvailability = (id, newAvailability) => {
    const isWorking = newAvailability === 'Assigned';
    setPartnerWorkforce((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              availability: newAvailability,
              workingStatus: isWorking ? 'Working' : 'Available',
            }
          : p
      )
    );
    setWorkforce((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              availability: newAvailability,
              workingStatus: isWorking ? 'Working' : 'Available',
            }
          : w
      )
    );
  };

  const updateWorkforceMember = (id, updatedData) => {
    setWorkforce((prev) =>
      prev.map((wf) => (wf.id === id ? { ...wf, ...updatedData } : wf))
    );
  };

  // Project Actions
  const addProject = (project) => {
    const newProject = {
      ...project,
      id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      stage: project.stage || 'Request',
      status: project.stage === 'Completed' ? 'Completed' : project.stage === 'Request' ? 'Pending' : 'Active',
      spent: '$0',
      progress: project.stage === 'Request' ? 0 : 15,
      assignedResources: project.assignedResources || [],
      milestones: project.milestones || [
        { id: 'm-1', title: 'Initial Kickoff & Resource Allocation', dueDate: project.deadline, completed: false },
      ],
    };
    setProjects((prev) => [newProject, ...prev]);

    addActivity({
      user: 'Sarah Jenkins',
      action: project.stage === 'Request' ? 'Created staffing request' : 'Launched new project',
      target: newProject.title,
      targetType: 'project',
    });

    // Add notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `Project Added: ${newProject.title}`,
      message: `Assigned to ${newProject.manager} for client ${newProject.client}.`,
      type: 'project',
      unread: true,
      time: 'Just now',
      link: `/projects/${newProject.id}`,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newProject;
  };

  const updateProject = (id, updatedData) => {
    setProjects((prev) =>
      prev.map((prj) => (prj.id === id ? { ...prj, ...updatedData } : prj))
    );
  };

  const updateProjectStage = (id, newStage) => {
    setProjects((prev) =>
      prev.map((prj) => {
        if (prj.id !== id) return prj;
        const newStatus =
          newStage === 'Completed' ? 'Completed' : newStage === 'Request' ? 'Pending' : 'Active';
        const newProgress =
          newStage === 'Completed' ? 100 : newStage === 'Request' ? 10 : prj.progress;
        return {
          ...prj,
          stage: newStage,
          status: newStatus,
          progress: newProgress,
        };
      })
    );
  };

  const toggleMilestone = (projectId, milestoneId) => {
    setProjects((prev) =>
      prev.map((prj) => {
        if (prj.id !== projectId) return prj;
        const updatedMilestones = prj.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const computedProgress =
          updatedMilestones.length > 0
            ? Math.round((completedCount / updatedMilestones.length) * 100)
            : prj.progress;
        return {
          ...prj,
          milestones: updatedMilestones,
          progress: computedProgress,
          stage: computedProgress === 100 ? 'Completed' : prj.stage,
          status: computedProgress === 100 ? 'Completed' : prj.status,
        };
      })
    );
  };

  return (
    <DataContext.Provider
      value={{
        // Admin Profile values
        adminProfile,
        setAdminProfile,
        updateAdminProfile,
        companyProfile,
        updateCompanyProfile,
        clients,
        addClient,
        updateClient,
        partners,
        addPartner,
        updatePartner,
        managers,
        addManager,
        updateManager,
        updateManagerStatus,
        reassignProjectManager,
        workforce,
        addWorkforceMember,
        approveWorkforceMember,
        rejectWorkforceMember,
        submitPartnerCandidate,
        submitFreelancerRequest,
        updateWorkforceMember,
        projects,
        addProject,
        updateProject,
        updateProjectStage,
        toggleMilestone,
        activities,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        // Partner Portal values
        partnerProfile,
        updatePartnerProfile,
        partnerProjects,
        addPartnerProject,
        updatePartnerProject,
        partnerWorkforce,
        addPartnerProfessional,
        updatePartnerProfessionalAvailability,
        partnerWorkforceRequests,
        partnerNotifications,
        markPartnerNotificationRead,
        markAllPartnerNotificationsRead,
        partnerActivities,
        partnerSupportTickets,
        addPartnerSupportTicket,
        // Manager Portal values
        managerProfile,
        setManagerProfile,
        updateManagerProfile,
        managerAssignments,
        setManagerAssignments,
        managerNotifications,
        setManagerNotifications,
        freelancerRequests,
        setFreelancerRequests,
        // Workforce Portal values
        workforceUserProfile,
        setWorkforceUserProfile,
        updateWorkforceUserProfile,
        workforceNotifications,
        setWorkforceNotifications,
        // Client Portal values
        clientProfile,
        setClientProfile,
        updateClientProfile,
        clientNotifications,
        setClientNotifications,
        submitClientProjectRequest,
        // Universal Workflow Actions
        approveProject,
        rejectProject,
        sendPartnerWorkforceRequest,
        respondPartnerWorkforceRequest,
        rejectPartnerWorkforceRequest,
        sendFreelancerWorkforceRequest,
        respondFreelancerWorkforceRequest,
        submitAssignmentRequest,
        requestWorkforceAssignment,
        approveWorkforceAssignment,
        rejectWorkforceAssignment,
        acceptWorkforceAssignment,
        declineWorkforceAssignment,
        assignWorkforce,
        updateWorkforceProgress,
        updateProjectProgress,
        calculateSkillMatch,
        // GitHub-style Milestone Commits System
        projectMilestones,
        addMilestoneCommit,
        updateMilestoneStatus,
        // Central Support & Feedback Reports
        supportTickets,
        submitSupportTicket,
        updateSupportTicketStatus,
        // Freelancer Applications (Form for Freelancer)
        freelancerApplications,
        addFreelancerApplication,
        approveFreelancerApplication,
        rejectFreelancerApplication,
        // Freelancer Registration & Verification Pool
        registerFreelancer,
        approveProfessional,
        rejectProfessional,
        updateProfessionalAvailability,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
