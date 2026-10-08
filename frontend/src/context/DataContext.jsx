import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../services/api';
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

export const getNextGlobalUserId = (role, clients = [], managers = [], partners = [], workforce = []) => {
  const allUserIds = [
    ...(clients || []).map((c) => c?.numericId || c?.id),
    ...(managers || []).map((m) => m?.numericId || m?.id || m?.employeeId),
    ...(partners || []).map((p) => p?.numericId || p?.id),
    ...(workforce || []).map((w) => w?.numericId || w?.id),
  ]
    .map((raw) => Number(String(raw || '').replace(/\D/g, '')))
    .filter((num) => !isNaN(num) && num > 0);

  if (allUserIds.length === 0) return 1;

  const maxExisting = Math.max(...allUserIds);
  return maxExisting + 1;
};

const DEFAULT_CLIENTS = [];

export const calculateOverallCompletionProgress = (completedCount) => {
  const count = Number(completedCount) || 0;
  if (count === 1) return 10;
  if (count === 2) return 30;
  if (count === 3) return 55;
  if (count === 4) return 80;
  if (count >= 5) return 100;
  return 0;
};

export const getPartnerCompanyName = (member, partners = [], clients = []) => {
  if (!member) return '';

  const clientNames = new Set(
    (clients || []).flatMap((c) => [
      c?.companyName?.toLowerCase().trim(),
      c?.name?.toLowerCase().trim()
    ]).filter(Boolean)
  );

  const targetId = member.partnerCompanyId || member.partnerId || member.companyId;
  if (targetId) {
    const idStr = String(targetId).trim();
    const matchedPartner = (partners || []).find(
      (p) => p && (String(p.id) === idStr || String(p.numericId) === idStr || String(p.userId) === idStr)
    );
    if (matchedPartner && (matchedPartner.companyName || matchedPartner.name)) {
      const name = (matchedPartner.companyName || matchedPartner.name).trim();
      if (
        name !== 'Partner Company' &&
        name !== 'Partner Organization' &&
        name !== 'FlexiStaff Partner' &&
        !clientNames.has(name.toLowerCase())
      ) {
        return name;
      }
    }
  }

  const memberPartnerName = member.partnerCompanyName || member.partnerCompany || member.partnerName || member.partner;
  if (
    memberPartnerName &&
    typeof memberPartnerName === 'string' &&
    memberPartnerName.trim() !== '' &&
    memberPartnerName !== 'Partner Company' &&
    memberPartnerName !== 'Partner Organization' &&
    memberPartnerName !== 'Partner Professional' &&
    memberPartnerName !== 'Independent Freelancer' &&
    memberPartnerName !== 'Freelancer' &&
    memberPartnerName !== 'FlexiStaff Partner' &&
    !clientNames.has(memberPartnerName.toLowerCase().trim())
  ) {
    return memberPartnerName.trim();
  }

  if (member.partnerEmail) {
    const pEmail = String(member.partnerEmail).toLowerCase().trim();
    const matched = (partners || []).find((p) => p && (p.email || '').toLowerCase().trim() === pEmail);
    if (matched && (matched.companyName || matched.name)) {
      const name = (matched.companyName || matched.name).trim();
      if (
        name !== 'Partner Company' &&
        name !== 'Partner Organization' &&
        name !== 'FlexiStaff Partner' &&
        !clientNames.has(name.toLowerCase())
      ) {
        return name;
      }
    }
  }

  return '';
};

export const mapBackendProjectToFrontend = (p) => {
  if (!p) return p;

  const skillsArr = Array.isArray(p.requiredSkills)
    ? p.requiredSkills
    : typeof p.requiredSkills === 'string'
    ? p.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  let formattedStatus = p.status;
  if (p.status === 'PENDING_APPROVAL') formattedStatus = 'Pending Admin Approval';
  else if (p.status === 'APPROVED') formattedStatus = 'Approved';
  else if (p.status === 'IN_PROGRESS') formattedStatus = 'In Progress';
  else if (p.status === 'REJECTED' || p.status === 'DECLINED') formattedStatus = 'Rejected';
  else if (p.status === 'COMPLETED') formattedStatus = 'Completed';

  const defaultStandardizedMilestones = [
    { id: 'ms-01', title: 'Requirement Analysis', weight: 10, weightage: 10, status: 'Pending', dueDate: p.startDate || '2026-10-15', completed: false, commits: [] },
    { id: 'ms-02', title: 'UI/UX & System Design', weight: 20, weightage: 20, status: 'Pending', dueDate: p.startDate || '2026-11-01', completed: false, commits: [] },
    { id: 'ms-03', title: 'Backend & Database Development', weight: 25, weightage: 25, status: 'Pending', dueDate: p.endDate || '2026-12-15', completed: false, commits: [] },
    { id: 'ms-04', title: 'Frontend & Integration', weight: 25, weightage: 25, status: 'Pending', dueDate: p.endDate || '2027-01-20', completed: false, commits: [] },
    { id: 'ms-05', title: 'Testing, Deployment & Final Delivery', weight: 20, weightage: 20, status: 'Pending', dueDate: p.endDate || '2027-02-28', completed: false, commits: [] },
  ];

  let rawMs = p.milestones || [];
  // Filter out legacy demo 3 milestones
  let cleanMs = rawMs.filter((m) => {
    if (!m || !m.title) return false;
    const titleLower = String(m.title).toLowerCase();
    const isLegacyDemo =
      titleLower.includes('kickoff') ||
      titleLower.includes('feature engineering') ||
      titleLower.includes('handover') ||
      titleLower.includes('architecture blueprint') ||
      titleLower.includes('uat & sign-off');
    return !isLegacyDemo;
  });

  let mappedMilestones = cleanMs.map((m) => {
    const isCompleted = m.status === 'COMPLETED' || m.status === 'Completed' || m.progressPercentage === 100 || Boolean(m.completed);
    const isStarted = !isCompleted && (m.status === 'IN_PROGRESS' || m.status === 'In Progress' || (m.progressPercentage > 0 && m.progressPercentage < 100));
    const formattedMsStatus = isCompleted ? 'Completed' : isStarted ? 'In Progress' : 'Pending';

    return {
      id: m.id || `ms-${Math.random().toString(16).substring(2, 6)}`,
      title: m.title,
      description: m.description || '',
      status: formattedMsStatus,
      dueDate: m.dueDate || p.endDate || p.deadline || '2027-02-28',
      progressPercentage: m.progressPercentage || (isCompleted ? 100 : isStarted ? 50 : 0),
      completed: isCompleted,
      commits: m.commits || [],
    };
  });

  mappedMilestones = defaultStandardizedMilestones.map((defMs, idx) => {
    const existing = mappedMilestones.find((m) => m.title && m.title.toLowerCase().trim() === defMs.title.toLowerCase().trim()) || mappedMilestones[idx];
    if (existing) {
      const isCompleted = existing.completed || existing.status === 'Completed' || existing.status === 'COMPLETED' || existing.progressPercentage === 100;
      const isStarted = !isCompleted && (existing.status === 'In Progress' || existing.status === 'IN_PROGRESS' || (existing.progressPercentage > 0 && existing.progressPercentage < 100));
      const statusText = isCompleted ? 'Completed' : isStarted ? 'In Progress' : 'Pending';

      return {
        ...defMs,
        ...existing,
        id: existing.id || defMs.id,
        title: defMs.title,
        status: statusText,
        completed: isCompleted,
        dueDate: existing.dueDate || defMs.dueDate,
        commits: existing.commits || [],
      };
    }
    return defMs;
  });

  const completedCount = mappedMilestones.filter((m) => m.completed || m.status === 'Completed' || m.status === 'COMPLETED').length;
  const computedProgress = calculateOverallCompletionProgress(completedCount);

  const assignedResources =
    p.allocations && p.allocations.length > 0
      ? p.allocations
          .filter((a) => {
            if (!a) return false;
            const st = String(a.status || '').toLowerCase().trim();
            return !st.includes('declined') && !st.includes('reject') && !st.includes('cancel');
          })
          .map((a) => ({
            id: a.professionalId || a.id,
            allocationId: a.id,
            professionalId: a.professionalId,
            name: a.professionalName,
            professionalName: a.professionalName,
            email: a.professionalEmail,
            role: a.roleInProject || '',
            roleInProject: a.roleInProject || '',
            status: a.status,
            workforceType: a.workforceType || (a.partnerCompanyName || a.partnerCompanyId ? 'Partner Company' : 'Independent Freelancer'),
            partnerCompanyId: a.partnerCompanyId || null,
            partnerCompanyName: a.partnerCompanyName || a.partnerCompany || null,
            partnerCompany: a.partnerCompanyName || a.partnerCompany || null,
            partnerName: a.partnerCompanyName || a.partnerCompany || null,
            hourlyRate: a.hourlyRate || (a.billableRate ? `$${a.billableRate}/hr` : ''),
            workload: a.workload || (a.allocatedHoursPerWeek ? `${a.allocatedHoursPerWeek}h/wk` : ''),
            experience: a.experience || '',
            skills: a.skills,
            avatar: a.avatar || '',
            phone: a.phone || '',
          }))
      : [];

  const clientOrg = p.clientCompanyName || p.companyName || '';
  const clientContact = p.clientName || p.contactPerson || '';

  const clientDisplay = clientOrg || clientContact || '';

  return {
    ...p,
    id: p.id,
    serialId: p.id,
    dbId: p.id,
    name: p.title || p.name,
    title: p.title || p.name,
    description: p.description || '',
    requiredSkills: skillsArr,
    techStack: skillsArr.join(', '),
    clientId: p.clientId,
    client: clientDisplay,
    clientName: clientContact,
    clientCompanyName: clientOrg,
    companyName: clientOrg,
    contactPerson: clientContact,
    manager: (p.managerName && p.managerName !== 'System Administrator' && p.managerName !== 'System Admin') ? p.managerName : (p.manager && p.manager !== 'System Administrator' && p.manager !== 'System Admin') ? p.manager : 'Unassigned',
    managerName: (p.managerName && p.managerName !== 'System Administrator' && p.managerName !== 'System Admin') ? p.managerName : (p.manager && p.manager !== 'System Administrator' && p.manager !== 'System Admin') ? p.manager : 'Unassigned',
    managerId: p.managerId || null,
    managerEmail: p.managerEmail || null,
    managerPhone: p.managerPhone || null,
    status: computedProgress >= 100 ? 'Completed' : formattedStatus,
    stage: computedProgress >= 100 ? 'Completed' : formattedStatus,
    progress: computedProgress,
    progressPercentage: computedProgress,
    workforceRequired: p.allocations ? Math.max(2, p.allocations.length) : 2,
    workforceAssigned: assignedResources.length,
    assignedResources,
    allocations: p.allocations || [],
    startDate: p.startDate,
    targetEndDate: p.endDate,
    endDate: p.endDate,
    deadline: p.endDate,
    milestones: mappedMilestones,
    createdDate: p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
  };
};

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [companyProfile, setCompanyProfile] = useState(initialCompanyProfile);
  const [adminProfile, setAdminProfile] = useState(initialAdminProfile);

  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem('flexistaff_clients');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_CLIENTS;
  });

  const [partners, setPartners] = useState(() => {
    try {
      const saved = localStorage.getItem('flexistaff_partners');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });
  const [managers, setManagers] = useState(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('flexistaff_managers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed.filter((m) => Boolean(m && (m.id || m.employeeId || m.name || m.email)));
        }
      }
    } catch {
      // Ignore
    }
    return list;
  });

  const [workforce, setWorkforce] = useState(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('flexistaff_workforce');
      if (saved) list = JSON.parse(saved);
    } catch { }
    if (!list || !Array.isArray(list)) {
      list = [];
    }

    let deletedIds = new Set();
    try {
      const delWfStr = localStorage.getItem('flexistaff_deleted_workforce');
      if (delWfStr) {
        const parsed = JSON.parse(delWfStr);
        if (Array.isArray(parsed)) parsed.forEach(id => deletedIds.add(String(id).toLowerCase().trim()));
      }
      const delAccStr = localStorage.getItem('flexistaff_deleted_accounts');
      if (delAccStr) {
        const parsed = JSON.parse(delAccStr);
        if (Array.isArray(parsed)) parsed.forEach(id => deletedIds.add(String(id).toLowerCase().trim()));
      }
    } catch {}

    return list.filter((w) => {
      if (!w) return false;
      const roleLower = (w.role || w.title || w.roleType || w.category || '').toLowerCase().trim();
      const userRoleLower = (w.userRole || w.user_role || '').toLowerCase().trim();
      const emailLower = (w.email || '').toLowerCase().trim();
      const nameLower = (w.name || w.pseudonym || '').toLowerCase().trim();
      const idStr = String(w.id || '').toLowerCase().trim();
      const numIdStr = String(w.numericId || '').toLowerCase().trim();
      const uIdStr = String(w.userId || '').toLowerCase().trim();

      if (
        deletedIds.has(idStr) ||
        deletedIds.has(numIdStr) ||
        deletedIds.has(uIdStr) ||
        (emailLower && deletedIds.has(emailLower)) ||
        (nameLower && deletedIds.has(nameLower))
      ) {
        return false;
      }

      if (
        roleLower === 'admin' || roleLower === 'manager' || roleLower === 'client' ||
        roleLower.includes('admin') || roleLower.includes('manager') || roleLower.includes('client') ||
        userRoleLower.includes('admin') || userRoleLower.includes('manager') || userRoleLower.includes('client') ||
        roleLower === 'role_admin' || roleLower === 'role_manager' || roleLower === 'role_client' ||
        emailLower.includes('admin') || emailLower.includes('manager') ||
        nameLower === 'admin'
      ) {
        return false;
      }

      return true;
    });
  });

  const [projects, setProjects] = useState(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('flexistaff_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed;
        }
      }
    } catch {
      // Ignore
    }
    return list.map((p) => {
      if (!p) return p;
      const cleanId = typeof p.id === 'number' ? p.id : (Number(String(p.id).replace(/\D/g, '')) || p.id);

      let stage = p.stage;
      let status = p.status;
      let numProg = Number(p.progress) || 0;

      if (stage === 'Completed' || status === 'Completed' || numProg >= 100) {
        stage = 'Completed';
        status = 'Completed';
        numProg = 100;
      }

      // Filter out Sharon Tomy from assignedResources
      const rawRes = p.assignedResources || [];
      const cleanRes = rawRes.filter((r) => {
        if (!r) return false;
        const rEmail = (r.email || r.professionalEmail || '').toLowerCase();
        const rName = (r.name || r.professionalName || '').toLowerCase();
        return !rEmail.includes('sharon') && !rName.includes('sharon');
      });

      const workforceRequired = Number(p.workforceRequired) || (Array.isArray(p.requirements) && p.requirements.length > 0 ? p.requirements.reduce((acc, r) => acc + (Number(r.required) || 0), 0) : 1);
      const isCompletedPrj = stage === 'Completed' || status === 'Completed' || numProg >= 100;
      const workforceAssigned = isCompletedPrj ? workforceRequired : (cleanRes.length || Number(p.workforceAssigned) || 0);
      const requirements = Array.isArray(p.requirements) ? p.requirements : [];

      return {
        ...p,
        id: cleanId,
        stage: isCompletedPrj ? 'Completed' : stage,
        status: isCompletedPrj ? 'Completed' : status,
        progress: isCompletedPrj ? 100 : numProg,
        assignedResources: cleanRes,
        workforceRequired: workforceRequired,
        workforceAssigned: workforceAssigned,
        requirements,
      };
    });
  });

  const [activities, setActivities] = useState(initialActivities);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_clients', JSON.stringify(clients));
    } catch { }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_workforce', JSON.stringify(workforce));
    } catch { }
  }, [workforce]);

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_projects', JSON.stringify(projects));
    } catch { }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_partners', JSON.stringify(partners));
    } catch { }
  }, [partners]);

  // Cleanup deleted accounts (Sharon Tomy, admin@gmail.com, admin@flexistaff.ai)
  useEffect(() => {
    try {
      const deletedStr = localStorage.getItem('flexistaff_deleted_accounts') || '[]';
      let deletedList = JSON.parse(deletedStr);
      if (!Array.isArray(deletedList)) deletedList = [];

      // Filter out admin accounts from deletedList so genuine admin is never locked out
      deletedList = deletedList.filter((e) => e !== 'admin@gmail.com' && e !== 'admin@flexistaff.ai');
      localStorage.setItem('flexistaff_deleted_accounts', JSON.stringify(deletedList));

      const targetDeleted = ['sharon@flexistaff.com', 'sharon.tomy@flexistaff.com', 'sharon'];
      let listChanged = false;
      targetDeleted.forEach((email) => {
        if (!deletedList.includes(email)) {
          deletedList.push(email);
          listChanged = true;
        }
      });

      if (listChanged) {
        localStorage.setItem('flexistaff_deleted_accounts', JSON.stringify(deletedList));
      }

      // Clear active session if logged in as deleted user
      const currentUserStr = localStorage.getItem('flexistaff_user');
      if (currentUserStr) {
        const u = JSON.parse(currentUserStr);
        const emailLower = (u?.email || '').toLowerCase();
        const nameLower = (u?.name || '').toLowerCase();

        if (
          emailLower.includes('sharon') ||
          nameLower.includes('sharon')
        ) {
          localStorage.removeItem('flexistaff_user');
          localStorage.removeItem('flexistaff_role');
          localStorage.removeItem('flexistaff_token');
          window.dispatchEvent(new CustomEvent('auth_change', { detail: null }));
        }
      }

      // Purge registered users list
      const regStr = localStorage.getItem('flexistaff_registered_users');
      if (regStr) {
        const regList = JSON.parse(regStr);
        if (Array.isArray(regList)) {
          const updatedReg = regList.filter((u) => {
            if (!u) return false;
            const uEmail = (u.email || '').toLowerCase().trim();
            const uName = (u.name || '').toLowerCase().trim();
            if (uEmail.includes('sharon') || uName.includes('sharon')) return false;
            if (uEmail === 'admin@gmail.com' || uEmail === 'admin@flexistaff.ai') return false;
            return true;
          });
          localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
        }
      }

      // Keep managers list valid in localStorage
      const mgrStr = localStorage.getItem('flexistaff_managers');
      if (mgrStr) {
        try {
          const mgrList = JSON.parse(mgrStr);
          if (Array.isArray(mgrList)) {
            const cleanMgr = mgrList.filter((m) => Boolean(m && (m.id || m.employeeId || m.name || m.email)));
            localStorage.setItem('flexistaff_managers', JSON.stringify(cleanMgr));
            setManagers(cleanMgr);
          }
        } catch { }
      }

      const asgStr = localStorage.getItem('flexistaff_manager_assignments');
      if (asgStr) {
        const asgList = JSON.parse(asgStr);
        if (Array.isArray(asgList)) {
          const updatedAsg = asgList.filter((a) => {
            if (!a) return false;
            const aEmail = (a.email || a.professionalEmail || '').toLowerCase();
            const aName = (a.name || a.professionalName || '').toLowerCase();
            return !aEmail.includes('sharon') && !aName.includes('sharon');
          });
          localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(updatedAsg));
          setManagerAssignments(updatedAsg);
        }
      }
    } catch { }

    refreshAllData();
  }, []);

  const refreshPartners = async () => {
    try {
      const res = await api.partners.getAll();
      if (res && (res.success || Array.isArray(res.data) || Array.isArray(res))) {
        const rawList = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped = rawList.map((p) => {
          const specialtiesArray = Array.isArray(p.specialties)
            ? p.specialties
            : String(p.specialties || '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
          return {
            ...p,
            id: p.id,
            numericId: p.id,
            userId: p.userId || p.id,
            name: p.companyName || p.name || 'Partner Company',
            companyName: p.companyName || p.name || 'Partner Company',
            contactPerson: p.contactPerson || 'Contact Representative',
            email: p.email || '',
            phone: p.phone || '',
            location: p.location || p.city || 'India',
            city: p.city || p.location || 'India',
            tier: p.tier || 'Strategic Partner',
            industry: p.industry || 'Technology Staffing',
            specialties: specialtiesArray,
            status: p.status || 'Active',
            joinedDate: p.joinedDate || (p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
            suppliedProfessionals: Number(p.suppliedProfessionals) || 0,
            activePlacements: p.activePlacements || 0,
            availabilityRate: p.availabilityRate || '100%',
            rating: p.rating || 4.8,
          };
        });
        setPartners(mapped);
        try {
          localStorage.setItem('flexistaff_partners', JSON.stringify(mapped));
        } catch {}
        return mapped;
      }
    } catch (err) {
      console.warn('Could not refresh partners from backend API:', err);
    }
    return [];
  };

  const refreshWorkforce = async (currentPartners = partners) => {
    try {
      const res = await api.freelancers.getAll();
      if (res && (res.success || Array.isArray(res.data) || Array.isArray(res))) {
        const rawList = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped = rawList.map((f) => {
          const resolvedPartnerName = getPartnerCompanyName(f, currentPartners, clients);
          return {
            ...f,
            id: f.id || f.userId,
            numericId: f.id || f.userId,
            userId: f.userId || f.id,
            name: f.name || f.fullName,
            pseudonym: f.name || f.fullName,
            email: f.email,
            phone: f.phone,
            role: f.title || 'Software Professional',
            title: f.title || 'Software Professional',
            roleCategory: 'Engineering',
            skills: Array.isArray(f.skills)
              ? f.skills
              : String(f.skills || '')
                  .split(/[,+]/)
                  .map((s) => s.trim())
                  .filter(Boolean),
            bio: f.bio || '',
            experience: f.experienceYears ? `${f.experienceYears} years` : '3+ years',
            experienceYears: f.experienceYears || 3,
            experienceLevel: 'Senior',
            hourlyRate: f.hourlyRate ? `$${f.hourlyRate}/hr` : '$85/hr',
            availability: f.availabilityStatus || 'Available',
            isCurrentlyWorking: Boolean(f.isCurrentlyWorking || f.currentProject || f.currentProjectName),
            currentProject: f.currentProject || f.currentProjectName || null,
            currentProjectId: f.currentProjectId || null,
            currentProjectName: f.currentProjectName || f.currentProject || null,
            currentProjectClient: f.currentProjectClient || null,
            currentProjectRole: f.currentProjectRole || null,
            currentAssignmentStatus: f.currentAssignmentStatus || null,
            currentProjectStatus: f.currentProjectStatus || null,
            assignedProject: f.currentProjectName || f.currentProject || null,
            clientName: f.currentProjectClient || null,
            workingStatus: (f.isCurrentlyWorking || f.currentProject || f.currentProjectName || f.availabilityStatus === 'Assigned' || f.availabilityStatus === 'Busy') ? 'Working' : 'Available',
            partnerCompanyId: f.partnerCompanyId,
            partnerCompany: resolvedPartnerName || f.partnerCompanyName || f.partnerCompany || f.partnerName,
            partnerName: resolvedPartnerName || f.partnerCompanyName || f.partnerCompany || f.partnerName,
            roleType: f.partnerCompanyId ? 'Professional' : 'Freelancer',
            source: f.partnerCompanyId ? 'Partner Company' : 'Freelancer',
            professionalType: f.partnerCompanyId ? 'PARTNER_EMPLOYEE' : 'FREELANCER',
            userRole: 'ROLE_PROFESSIONAL',
          };
        });

        setWorkforce(mapped);
        try {
          localStorage.setItem('flexistaff_workforce', JSON.stringify(mapped));
        } catch {}
        return mapped;
      }
    } catch (err) {
      console.warn('Could not refresh workforce from backend API:', err);
    }
    return [];
  };

  const refreshAllocations = async () => {
    try {
      const res = await api.workforce.getAll();
      if (res && (res.success || Array.isArray(res.data) || Array.isArray(res))) {
        const rawList = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped = rawList.map((a) => ({
          id: a.id,
          allocationId: a.id,
          projectId: a.projectId,
          projectName: a.projectTitle,
          professionalId: a.professionalId,
          professionalName: a.professionalName,
          professionalEmail: a.professionalEmail,
          role: a.roleInProject,
          roleInProject: a.roleInProject,
          allocatedHoursPerWeek: a.allocatedHoursPerWeek,
          billableRate: a.billableRate,
          status: a.status === 'ASSIGNED' ? 'Approved' : a.status === 'PENDING' ? 'Pending Admin Approval' : a.status,
          createdAt: a.createdAt,
          workforceType: a.workforceType || (a.partnerCompanyName || a.partnerCompanyId ? 'Partner Company' : 'Independent Freelancer'),
          partnerCompanyId: a.partnerCompanyId || null,
          partnerCompanyName: a.partnerCompanyName || a.partnerCompany || null,
          partnerCompany: a.partnerCompanyName || a.partnerCompany || null,
          partnerName: a.partnerCompanyName || a.partnerCompany || null,
          roleType: a.roleType || 'Professional',
          hourlyRate: a.hourlyRate || (a.billableRate ? `$${a.billableRate}/hr` : '$95/hr'),
          workload: a.workload || (a.allocatedHoursPerWeek ? `${a.allocatedHoursPerWeek}h/wk` : '40h/wk'),
          experience: a.experience || '3+ years',
          skills: a.skills,
          avatar: a.avatar || '',
          phone: a.phone || '',
        }));
        setManagerAssignments(mapped);
        try {
          localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(mapped));
        } catch {}
        return mapped;
      }
    } catch (err) {
      console.warn('Could not refresh allocations from backend API:', err);
    }
  };

  const refreshManagers = async () => {
    try {
      const res = await api.managers.getAll();
      if (res && (res.success || Array.isArray(res.data) || Array.isArray(res))) {
        const rawList = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        if (rawList.length > 0) {
          const mapped = rawList.map((m) => ({
            ...m,
            id: m.userId || m.id,
            numericId: m.userId || m.id,
            employeeId: m.employeeId || m.userId || m.id,
            name: m.name || m.fullName || '',
            email: m.email || '',
            phone: m.phone || '',
            jobTitle: m.jobTitle || 'HR Manager',
            department: m.department || 'Enterprise Workforce Operations',
            experience: m.experience || '8+ Years',
            status: m.status || 'Active',
            avatar: m.avatar || '',
            assignedProjectsCount: m.assignedProjectsCount || 0,
          }));
          setManagers(mapped);
          try {
            localStorage.setItem('flexistaff_managers', JSON.stringify(mapped));
          } catch { }
          return mapped;
        }
      }
    } catch (err) {
      console.warn('Could not refresh managers from backend API:', err);
    }
    try {
      const saved = localStorage.getItem('flexistaff_managers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setManagers(parsed);
          return parsed;
        }
      }
    } catch { }
    return [];
  };

  const refreshAllData = async () => {
    await refreshClients();
    const fetchedPartners = await refreshPartners();
    await refreshProjects();
    await refreshWorkforce(fetchedPartners && fetchedPartners.length > 0 ? fetchedPartners : partners);
    await refreshAllocations();
    await refreshManagers();
  };

  const refreshProjects = async () => {
    try {
      const res = await api.projects.getAll();
      if (res && (res.success || Array.isArray(res.data) || Array.isArray(res))) {
        const rawList = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const mappedList = await Promise.all(
          rawList.map(async (p) => {
            let pMilestones = p.milestones || [];
            try {
              const msRes = await api.milestones.getByProject(p.id);
              if (msRes && (msRes.success || Array.isArray(msRes.data))) {
                pMilestones = Array.isArray(msRes.data) ? msRes.data : msRes;
              }
            } catch (msErr) {
              console.warn(`Could not fetch milestones for project ${p.id}:`, msErr);
            }
            return mapBackendProjectToFrontend({ ...p, milestones: pMilestones });
          })
        );
        setProjects(mappedList);
        try {
          localStorage.setItem('flexistaff_projects', JSON.stringify(mappedList));
        } catch {}
        return mappedList;
      }
    } catch (err) {
      console.warn('Could not refresh projects from backend API:', err);
    }
  };

  const refreshClients = async () => {
    let mappedBackendClients = [];
    try {
      const res = await api.clients.getAll();
      if (res && res.success && Array.isArray(res.data)) {
        mappedBackendClients = res.data.map((c) => ({
          id: c.userId || c.id,
          numericId: c.userId || c.id,
          name: c.companyName || c.name || '',
          companyName: c.companyName || c.name || '',
          contactPerson: c.name || c.contactPerson || c.companyName || '',
          email: c.email || '',
          phone: c.phone || c.contactPhone || '',
          logo: c.logoUrl || c.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
          industry: c.industry || 'Enterprise Software & Services',
          tier: c.tier || 'Enterprise Client',
          status: c.status || 'Active',
          location: c.location || 'India',
          joinedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active Account',
          activeProjects: c.activeProjects || 0,
          totalSpent: c.totalSpent || '₹0',
        }));
      }
    } catch (err) {
      console.warn('Could not fetch clients from backend API:', err.message);
    }

    setClients((prevLocal) => {
      const isDemoRecord = (c) => {
        if (!c) return true;
        const e = (c.email || '').toLowerCase();
        const n = (c.name || c.companyName || '').toLowerCase();
        const idStr = String(c.id || '');
        return e.includes('sarah@acmefinance') || n.includes('acme financial') || idStr === '102' || idStr === 'cli-02' || idStr.startsWith('usr-') || idStr.startsWith('cli-');
      };

      const cleanPrevLocal = (prevLocal || []).filter((c) => !isDemoRecord(c));
      const combined = mappedBackendClients.length > 0 ? mappedBackendClients : cleanPrevLocal;
      const unique = [];
      const seen = new Set();
      combined.forEach((item) => {
        if (!item || isDemoRecord(item)) return;
        const key = (item.email || item.name || item.id || '').toLowerCase().trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      });
      try {
        localStorage.setItem('flexistaff_clients', JSON.stringify(unique));
      } catch { }
      return unique;
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_managers', JSON.stringify(managers));
    } catch { }
  }, [managers]);


  // Client Registration helper connected to Spring Boot backend API
  const addClient = async (clientData) => {
    let assignedId = clientData.id;
    let numericId = clientData.numericId;

    if (!clientData.skipApi) {
      try {
        const apiRes = await api.clients.register({
          fullName: clientData.fullName || clientData.contactPerson || clientData.name,
          companyName: clientData.companyName || clientData.company || clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          password: clientData.password || 'Password123!',
          industry: clientData.industry,
          tier: clientData.tier,
          location: clientData.location,
        });

        if (apiRes && apiRes.success === false) {
          if (!assignedId) {
            return { success: false, error: apiRes.error || 'Email address already registered' };
          }
        }

        if (apiRes && apiRes.data) {
          assignedId = apiRes.data.userId || apiRes.data.id;
          numericId = apiRes.data.userId || apiRes.data.id;
        }
      } catch (err) {
        console.warn('Backend client register offline, using local state fallback');
      }
    }

    const newClient = {
      id: assignedId || Date.now(),
      numericId: numericId || assignedId || Date.now(),
      name: clientData.companyName || clientData.company || clientData.name || '',
      companyName: clientData.companyName || clientData.company || clientData.name || '',
      contactPerson: clientData.fullName || clientData.contactPerson || clientData.name || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      logo: clientData.logo || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
      industry: clientData.industry || 'Technology & Services',
      tier: clientData.tier || 'Enterprise Client',
      status: clientData.status || 'Active',
      activeProjects: clientData.activeProjects || 0,
      totalSpent: clientData.totalSpent || '₹0',
      location: clientData.location || clientData.address || 'India',
      joinedDate: clientData.joinedDate || new Date().toISOString().split('T')[0],
      website: clientData.website || '',
      taxId: clientData.taxId || '',
      description: clientData.description || 'Enterprise client organization registered on FlexiStaff.',
    };

    setClients((prev) => {
      const filtered = prev.filter((c) => (c.email || '').toLowerCase() !== newClient.email.toLowerCase() && c.id !== newClient.id);
      return [newClient, ...filtered];
    });

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Client Organization Registered',
        message: `Client organization "${newClient.name}" (${newClient.contactPerson}) created an account.`,
        type: 'request',
        unread: true,
        time: 'Just now',
        link: '/admin/clients',
      },
      ...prev,
    ]);

    return { success: true, client: newClient };
  };

  const deleteClient = async (idOrEmail) => {
    const numId = typeof idOrEmail === 'number' ? idOrEmail : Number(String(idOrEmail).replace(/\D/g, ''));
    if (!isNaN(numId) && numId > 0) {
      try {
        await api.clients.delete(numId);
      } catch (err) {
        console.warn('Backend client delete warning:', err);
      }
    }
    setClients((prev) => prev.filter((c) => c.id !== idOrEmail && c.numericId !== idOrEmail && c.email !== idOrEmail));
    try {
      const savedStr = localStorage.getItem('flexistaff_clients');
      if (savedStr) {
        const list = JSON.parse(savedStr);
        const updated = list.filter((c) => c && c.id !== idOrEmail && c.numericId !== idOrEmail && c.email !== idOrEmail);
        localStorage.setItem('flexistaff_clients', JSON.stringify(updated));
      }
      const regStr = localStorage.getItem('flexistaff_registered_users');
      if (regStr) {
        const regList = JSON.parse(regStr);
        const updatedReg = regList.filter((u) => u && u.id !== idOrEmail && u.numericId !== idOrEmail && u.email !== idOrEmail);
        localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
      }
    } catch { }
  };

  const clearClients = () => {
    setClients([]);
    try {
      localStorage.removeItem('flexistaff_clients');
      const regStr = localStorage.getItem('flexistaff_registered_users');
      if (regStr) {
        const regList = JSON.parse(regStr);
        const updatedReg = regList.filter((u) => u && u.role !== 'Client' && u.role !== 'ROLE_CLIENT');
        localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
      }
      const savedUserStr = localStorage.getItem('flexistaff_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u && (u.role === 'Client' || u.role === 'ROLE_CLIENT')) {
          localStorage.removeItem('flexistaff_user');
          localStorage.removeItem('flexistaff_role');
        }
      }
    } catch { }
  };





  const [dashboardStats, setDashboardStats] = useState(null);

  const refreshDashboardStats = async () => {
    try {
      const res = await api.dashboard.getAdmin();
      if (res && res.success && res.data) {
        setDashboardStats(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch admin dashboard stats from API:', err);
    }
  };

  // Sync projects, freelancers, and stats with Spring Boot backend when available
  useEffect(() => {
    async function syncBackendData() {
      // 1. Fetch dashboard metrics calculated from PostgreSQL database
      refreshDashboardStats();

      // 2. Sync Freelancers from PostgreSQL database
      try {
        const flRes = await api.freelancers.getAll();
        if (flRes && flRes.success && Array.isArray(flRes.data)) {
          const backendFreelancers = flRes.data.map((f) => {
            const isPartnerEmp = Boolean(f.partnerCompanyId || f.partnerCompany || f.partnerName || f.partnerCompanyName);
            const pName = f.partnerCompany || f.partnerName || f.partnerCompanyName || (isPartnerEmp ? 'Partner Organization' : '');

            return {
              id: f.id || f.userId,
              numericId: f.userId || f.id,
              userId: f.userId || f.id,
              partnerCompanyId: f.partnerCompanyId || null,
              partnerCompany: pName,
              partnerName: pName,
              partnerCompanyName: pName,
              partner: pName,
              name: f.name || f.fullName || 'Freelancer',
              pseudonym: f.name || f.fullName || 'Freelancer',
              email: f.email || '',
              phone: f.phone || '',
              role: f.role || f.title || 'Freelancer',
              title: f.title || f.role || 'Freelancer',
              category: isPartnerEmp ? 'Partner Employee' : 'Independent Freelancer',
              roleType: isPartnerEmp ? 'Professional' : (f.roleType || 'Freelancer'),
              professionalType: isPartnerEmp ? 'PARTNER_EMPLOYEE' : (f.professionalType || 'FREELANCER'),
              source: isPartnerEmp ? 'Partner Company' : (f.source || 'Freelancer'),
              type: isPartnerEmp ? 'professional' : 'freelancer',
              skills: typeof f.skills === 'string' ? f.skills.split(',').map((s) => s.trim()).filter(Boolean) : (Array.isArray(f.skills) ? f.skills : []),
              experience: f.experienceYears ? `${f.experienceYears}+ years` : (f.experience || '3+ years'),
              hourlyRate: f.hourlyRate ? (String(f.hourlyRate).startsWith('$') ? f.hourlyRate : `$${f.hourlyRate}/hr`) : '$50/hr',
              availability: f.availabilityStatus || f.availability || 'Available',
              availabilityStatus: f.availabilityStatus || f.availability || 'Available',
              isCurrentlyWorking: Boolean(f.isCurrentlyWorking || f.currentProject || f.currentProjectName),
              currentProject: f.currentProject || f.currentProjectName || null,
              currentProjectId: f.currentProjectId || null,
              currentProjectName: f.currentProjectName || f.currentProject || null,
              currentProjectClient: f.currentProjectClient || null,
              currentProjectRole: f.currentProjectRole || null,
              currentAssignmentStatus: f.currentAssignmentStatus || null,
              currentProjectStatus: f.currentProjectStatus || null,
              assignedProject: f.currentProjectName || f.currentProject || null,
              clientName: f.currentProjectClient || null,
              workingStatus: (f.isCurrentlyWorking || f.currentProject || f.currentProjectName || f.availabilityStatus === 'Assigned' || f.availabilityStatus === 'Busy') ? 'Working' : 'Available',
              approvalStatus: f.approvalStatus || f.status || 'Approved',
              verificationStatus: f.verificationStatus || f.status || 'Approved',
              accountStatus: f.accountStatus || f.status || 'Active',
              status: f.status || 'Active',
              joinedDate: f.createdAt ? String(f.createdAt).split('T')[0] : new Date().toISOString().split('T')[0],
              bio: f.bio || '',
            };
          });

          let deletedIds = new Set();
          try {
            const delWfStr = localStorage.getItem('flexistaff_deleted_workforce');
            if (delWfStr) {
              const parsed = JSON.parse(delWfStr);
              if (Array.isArray(parsed)) parsed.forEach(id => deletedIds.add(String(id).toLowerCase().trim()));
            }
            const delAccStr = localStorage.getItem('flexistaff_deleted_accounts');
            if (delAccStr) {
              const parsed = JSON.parse(delAccStr);
              if (Array.isArray(parsed)) parsed.forEach(id => deletedIds.add(String(id).toLowerCase().trim()));
            }
          } catch {}

          const validBackendWorkforce = backendFreelancers.filter((w) => {
            if (!w) return false;
            const r = (w.role || w.title || w.roleType || '').toLowerCase().trim();
            const e = (w.email || '').toLowerCase().trim();
            const n = (w.name || w.pseudonym || '').toLowerCase().trim();
            const idStr = String(w.id || '').toLowerCase().trim();
            const numIdStr = String(w.numericId || '').toLowerCase().trim();
            const uIdStr = String(w.userId || '').toLowerCase().trim();

            if (
              deletedIds.has(idStr) ||
              deletedIds.has(numIdStr) ||
              deletedIds.has(uIdStr) ||
              (e && deletedIds.has(e)) ||
              (n && deletedIds.has(n))
            ) {
              return false;
            }

            if (
              r.includes('admin') || r.includes('client') || r.includes('manager') ||
              e.includes('admin') || e.includes('manager') || n === 'admin'
            ) {
              return false;
            }
            return true;
          });

          setWorkforce(validBackendWorkforce);
          try {
            localStorage.setItem('flexistaff_workforce', JSON.stringify(validBackendWorkforce));
          } catch {}
        }
      } catch (err) {
        console.warn('Could not sync freelancers from backend API:', err);
      }

      // 3. Sync projects from PostgreSQL database
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        let currentUserId = null;
        let userRole = null;
        if (savedUserStr) {
          try {
            const u = JSON.parse(savedUserStr);
            currentUserId = u.id || u.numericId || u.userId;
            userRole = u.role;
          } catch {}
        }

        let backendProjects = [];
        if (currentUserId && (userRole === 'Client' || userRole === 'ROLE_CLIENT')) {
          const clientProjRes = await api.projects.getByClient(currentUserId);
          if (clientProjRes && clientProjRes.success && Array.isArray(clientProjRes.data)) {
            backendProjects = clientProjRes.data;
          }
        }

        const projRes = await api.projects.getAll();
        if (projRes && projRes.success && Array.isArray(projRes.data) && projRes.data.length > 0) {
          const merged = [...projRes.data];
          backendProjects.forEach((bp) => {
            if (!merged.some((p) => String(p.id) === String(bp.id))) {
              merged.push(bp);
            }
          });
          setProjects(merged.map(mapBackendProjectToFrontend));
        } else if (backendProjects.length > 0) {
          setProjects(backendProjects.map(mapBackendProjectToFrontend));
        }
      } catch (err) {
        console.warn('Backend sync error:', err);
      }
    }
    syncBackendData();
  }, []);

  // Client Portal State
  const [clientProfile, setClientProfile] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('flexistaff_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && (savedUser.role === 'Client' || savedUser.role === 'ROLE_CLIENT')) {
          return {
            ...initialClientProfile,
            id: savedUser.id || savedUser.numericId || savedUser.userId || initialClientProfile.id,
            name: savedUser.name || savedUser.fullName || initialClientProfile.name,
            contactPerson: savedUser.name || savedUser.fullName || initialClientProfile.contactPerson,
            email: savedUser.email || initialClientProfile.email,
            phone: savedUser.phone || initialClientProfile.phone,
            company: savedUser.companyName || savedUser.company || initialClientProfile.company,
            companyName: savedUser.companyName || savedUser.company || initialClientProfile.company,
          };
        }
      }
    } catch {
      // Ignore
    }
    return initialClientProfile;
  });
  const [clientNotifications, setClientNotifications] = useState([]);

  // Sync client profile whenever flexistaff_user changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && (savedUser.role === 'Client' || savedUser.role === 'ROLE_CLIENT')) {
            setClientProfile((prev) => ({
              ...prev,
              id: savedUser.id || savedUser.numericId || savedUser.userId || prev.id,
              name: savedUser.name || savedUser.fullName || prev.name,
              contactPerson: savedUser.name || savedUser.fullName || prev.contactPerson,
              email: savedUser.email || prev.email,
              phone: savedUser.phone || prev.phone,
              company: savedUser.companyName || savedUser.company || prev.company,
              companyName: savedUser.companyName || savedUser.company || prev.company,
            }));
          }
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Partner Portal State
  const [partnerProfile, setPartnerProfile] = useState(initialPartnerProfile);

  // Sync partner profile whenever flexistaff_user or flexistaff_partners updates
  useEffect(() => {
    const syncPartnerProfileData = () => {
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        const savedPartnersStr = localStorage.getItem('flexistaff_partners');
        let currentPartnersList = partners || [];
        if (savedPartnersStr) {
          try {
            const parsed = JSON.parse(savedPartnersStr);
            if (Array.isArray(parsed)) currentPartnersList = parsed;
          } catch { }
        }

        if (savedUserStr) {
          let savedUser = JSON.parse(savedUserStr);
          if (savedUser && (savedUser.role === 'Partner Company' || savedUser.role === 'Partner' || savedUser.role === 'ROLE_PARTNER')) {
            const userEmail = (savedUser.email || '').toLowerCase().trim();
            const uId = savedUser.partnerCompanyId || savedUser.id ? String(savedUser.partnerCompanyId || savedUser.id) : '';

            // STRICT lookup by exact ID or exact email match
            let matchedPrt = (currentPartnersList || []).find((p) => {
              if (!p) return false;
              const pEmail = (p.email || '').toLowerCase().trim();
              const pId = p.id ? String(p.id) : '';
              if (uId && pId && pId === uId) return true;
              if (userEmail && pEmail && pEmail === userEmail) return true;
              return false;
            });

            const companyDisplayName = matchedPrt?.name || matchedPrt?.companyName || savedUser.companyName || savedUser.company || (userEmail.includes('infosys') ? 'Infosys Technologies' : 'Partner Company');
            const contactDisplayName = matchedPrt?.contactPerson || savedUser.contactPerson || savedUser.fullName || savedUser.name || 'Partner Contact';
            const emailAddr = matchedPrt?.email || savedUser.email || '';
            const phoneNo = matchedPrt?.phone || savedUser.phone || '';
            const tierVal = matchedPrt?.tier || savedUser.tier || 'Strategic Partner';
            const locationVal = matchedPrt?.location || matchedPrt?.city || savedUser.location || savedUser.address || 'Remote';
            const specsVal = Array.isArray(matchedPrt?.specialties) ? matchedPrt.specialties.join(', ') : (matchedPrt?.specialties || 'IT & Staffing Services');
            const webVal = matchedPrt?.website || savedUser.website || '';
            const descVal = matchedPrt?.description || savedUser.description || '';
            const logoVal = matchedPrt?.logo || matchedPrt?.avatar || matchedPrt?.logoUrl || savedUser.logoUrl || '';
            const partnerId = matchedPrt?.id || uId || `prt-${userEmail.split('@')[0] || Date.now()}`;

            // Ensure this specific partner company is registered in central partners state
            setPartners((prev) => {
              const exists = (prev || []).some((p) => {
                if (!p) return false;
                const pId = String(p.id || '');
                const pEmail = (p.email || '').toLowerCase().trim();
                return (partnerId && pId === partnerId) || (emailAddr && pEmail === emailAddr.toLowerCase());
              });

              if (!exists) {
                const newPartnerRecord = {
                  id: partnerId,
                  name: companyDisplayName,
                  companyName: companyDisplayName,
                  contactPerson: contactDisplayName,
                  email: emailAddr,
                  phone: phoneNo,
                  tier: tierVal,
                  location: locationVal,
                  city: locationVal,
                  specialties: Array.isArray(matchedPrt?.specialties) ? matchedPrt.specialties : ['Enterprise Software', 'IT Staffing'],
                  website: webVal,
                  description: descVal,
                  logo: logoVal,
                  status: 'Active',
                  joinedDate: new Date().toISOString().split('T')[0],
                  suppliedProfessionals: 0,
                  activePlacements: 0,
                  availabilityRate: '100%',
                  rating: 5.0,
                };
                return [newPartnerRecord, ...(prev || [])];
              }
              return prev;
            });

            setPartnerProfile({
              id: partnerId,
              name: companyDisplayName,
              companyName: companyDisplayName,
              contactPerson: contactDisplayName,
              email: emailAddr,
              phone: phoneNo,
              tier: tierVal,
              location: locationVal,
              city: locationVal,
              specialties: specsVal,
              domain: specsVal,
              website: webVal,
              description: descVal,
              logoUrl: logoVal,
              status: matchedPrt?.status || 'Active',
            });
          }
        } else {
          setPartnerProfile(initialPartnerProfile);
        }
      } catch (err) {
        console.error('Error in syncPartnerProfileData:', err);
      }
    };

    syncPartnerProfileData();
    window.addEventListener('storage', syncPartnerProfileData);
    window.addEventListener('auth_change', syncPartnerProfileData);
    return () => {
      window.removeEventListener('storage', syncPartnerProfileData);
      window.removeEventListener('auth_change', syncPartnerProfileData);
    };
  }, []);

  const [partnerProjects, setPartnerProjects] = useState(initialPartnerProjects);
  const [partnerWorkforce, setPartnerWorkforce] = useState(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('flexistaff_partner_workforce');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      }
    } catch {}
    if (!list || list.length === 0) list = initialPartnerWorkforce || [];

    let deletedIds = new Set();
    try {
      const delWfStr = localStorage.getItem('flexistaff_deleted_workforce');
      if (delWfStr) {
        const parsed = JSON.parse(delWfStr);
        if (Array.isArray(parsed)) parsed.forEach(id => deletedIds.add(String(id).toLowerCase().trim()));
      }
      const delAccStr = localStorage.getItem('flexistaff_deleted_accounts');
      if (delAccStr) {
        const parsed = JSON.parse(delAccStr);
        if (Array.isArray(parsed)) parsed.forEach(id => deletedIds.add(String(id).toLowerCase().trim()));
      }
    } catch {}

    return list.filter((pw) => {
      if (!pw) return false;
      const idStr = String(pw.id || '').toLowerCase().trim();
      const numIdStr = String(pw.numericId || '').toLowerCase().trim();
      const uIdStr = String(pw.userId || '').toLowerCase().trim();
      const e = (pw.email || '').toLowerCase().trim();
      const n = (pw.name || pw.pseudonym || '').toLowerCase().trim();

      if (
        deletedIds.has(idStr) ||
        deletedIds.has(numIdStr) ||
        deletedIds.has(uIdStr) ||
        (e && deletedIds.has(e)) ||
        (n && deletedIds.has(n))
      ) {
        return false;
      }
      return true;
    });
  });

  // Self-heal and sync all partner workforce into flexistaff_registered_users so they can log in
  useEffect(() => {
    try {
      const regStr = localStorage.getItem('flexistaff_registered_users');
      let regList = regStr ? JSON.parse(regStr) : [];
      let changed = false;

      (partnerWorkforce || []).forEach((pw) => {
        if (!pw) return;
        const pwEmail = (pw.email || '').toLowerCase().trim();
        const pwName = (pw.name || pw.pseudonym || '').trim();
        const pwPass = pw.password || pw.tempPassword || 'Workforce@123';

        const exists = regList.some((u) => u && (u.email || '').toLowerCase().trim() === pwEmail);
        if (!exists && pwEmail) {
          regList.push({
            id: pw.id,
            name: pwName,
            fullName: pwName,
            email: pwEmail,
            password: pwPass,
            phone: pw.phone || '',
            role: 'Workforce',
            portalPath: '/workforce/dashboard',
            companyName: pw.partnerCompany || pw.partner || '',
            company: pw.partnerCompany || pw.partner || '',
            title: pw.title || pw.role || '',
            avatar: pw.avatar || '',
          });
          changed = true;
        }

        // Also register joseph@flexistaff.com if user is named Joseph Mathew
        if (pwName.toLowerCase().includes('joseph')) {
          const hasJosephEmail = regList.some((u) => u && (u.email || '').toLowerCase().trim() === 'joseph@flexistaff.com');
          if (!hasJosephEmail) {
            regList.push({
              id: pw.id,
              name: pwName,
              fullName: pwName,
              email: 'joseph@flexistaff.com',
              password: 'password123',
              phone: pw.phone || '',
              role: 'Workforce',
              portalPath: '/workforce/dashboard',
              companyName: pw.partnerCompany || pw.partner || '',
              company: pw.partnerCompany || pw.partner || '',
              title: pw.title || pw.role || '',
              avatar: pw.avatar || '',
            });
            changed = true;
          }
        }
      });

      if (changed) {
        localStorage.setItem('flexistaff_registered_users', JSON.stringify(regList));
      }
    } catch {}
  }, [partnerWorkforce]);

  // Derive partner workforce members for the active partner company from central workforce state
  const activePartnerWorkforce = useMemo(() => {
    const pId = partnerProfile?.id || partnerProfile?.userId || partnerProfile?.numericId;
    const pIdStr = pId ? String(pId).trim() : '';
    const partnerNameLower = (partnerProfile?.name || partnerProfile?.companyName || '').toLowerCase().trim();
    const partnerEmailLower = (partnerProfile?.email || '').toLowerCase().trim();

    const matchedFromCentral = (workforce || []).filter((w) => {
      if (!w) return false;
      const wPartnerId = w.partnerCompanyId || w.partnerId || w.companyId;
      const wPartnerIdStr = wPartnerId ? String(wPartnerId).trim() : '';

      if (pIdStr && wPartnerIdStr && pIdStr === wPartnerIdStr) {
        return true;
      }

      const resolvedName = getPartnerCompanyName(w, partners, clients);
      const wCompany = (resolvedName || w.partnerCompany || w.partner || w.partnerName || '').toLowerCase().trim();
      const wEmail = (w.partnerEmail || w.email || '').toLowerCase().trim();

      if (partnerNameLower && wCompany && (wCompany === partnerNameLower || wCompany.includes(partnerNameLower) || partnerNameLower.includes(wCompany))) {
        return true;
      }
      if (partnerEmailLower && wEmail && wEmail === partnerEmailLower) {
        return true;
      }
      return false;
    });

    const combined = [...(partnerWorkforce || []), ...matchedFromCentral];
    const unique = [];
    const seen = new Set();
    combined.forEach((item) => {
      if (item && item.id && !seen.has(String(item.id))) {
        seen.add(String(item.id));
        unique.push(item);
      }
    });

    return unique;
  }, [workforce, partnerWorkforce, partnerProfile, partners, clients]);
  const [partnerWorkforceRequests, setPartnerWorkforceRequests] = useState(initialPartnerWorkforceRequests);
  const [partnerNotifications, setPartnerNotifications] = useState(initialPartnerNotifications);
  const [partnerActivities, setPartnerActivities] = useState(initialPartnerActivities);
  const [partnerSupportTickets, setPartnerSupportTickets] = useState(initialPartnerSupportTickets);

  // Manager Portal State
  // Manager Portal State
  const [managerProfile, setManagerProfile] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('flexistaff_user');
      const savedManagersStr = localStorage.getItem('flexistaff_managers');
      let currentManagersList = [];
      if (savedManagersStr) {
        try { currentManagersList = JSON.parse(savedManagersStr); } catch { }
      }
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && (savedUser.role === 'Manager' || savedUser.role === 'ROLE_MANAGER')) {
          const userEmail = (savedUser.email || savedUser.loginEmail || '').toLowerCase().trim();
          const userName = (savedUser.name || savedUser.fullName || '').toLowerCase().trim();
          const userId = savedUser.id;

          let matchedMng = (currentManagersList || []).find((m) => {
            if (!m) return false;
            const mId = m.id;
            const mEmail = (m.email || '').toLowerCase().trim();
            const mLoginEmail = (m.loginEmail || '').toLowerCase().trim();
            const mName = (m.name || '').toLowerCase().trim();
            const mEmpId = (m.employeeId || '').toLowerCase().trim();

            return (
              (mId && userId && mId === userId) ||
              (mEmail && userEmail && (mEmail === userEmail || mEmail.includes(userEmail) || userEmail.includes(mEmail))) ||
              (mLoginEmail && userEmail && (mLoginEmail === userEmail || mLoginEmail.includes(userEmail) || userEmail.includes(mLoginEmail))) ||
              (mName && userName && (mName === userName || mName.includes(userName) || userName.includes(mName))) ||
              (mEmpId && userEmail && mEmpId === userEmail)
            );
          });



          return {
            id: matchedMng?.id || savedUser.id || 'mng-101',
            name: matchedMng?.name || savedUser.name || savedUser.fullName || '',
            email: matchedMng?.email || matchedMng?.loginEmail || savedUser.email || savedUser.loginEmail || '',
            loginEmail: matchedMng?.loginEmail || savedUser.loginEmail || '',
            phone: matchedMng?.phone || savedUser.phone || '',
            role: matchedMng?.jobTitle || matchedMng?.role || savedUser.jobTitle || savedUser.role || 'Manager',
            jobTitle: matchedMng?.jobTitle || matchedMng?.role || savedUser.jobTitle || savedUser.role || 'Manager',
            department: matchedMng?.department || savedUser.department || '',
            location: matchedMng?.address || matchedMng?.location || savedUser.address || savedUser.location || '',
            address: matchedMng?.address || matchedMng?.location || savedUser.address || savedUser.location || '',
            bio: matchedMng?.bio || savedUser.bio || '',
            avatar: matchedMng?.avatar || savedUser.avatar || '',
            employeeId: matchedMng?.employeeId || savedUser.employeeId || '',
            dob: matchedMng?.dob || savedUser.dob || '',
            joinDate: matchedMng?.joinDate || savedUser.joinDate || '',
            experience: matchedMng?.experience || savedUser.experience || '',
          };
        }
      }
    } catch { }
    return initialManagerProfile;
  });

  const [managerAssignments, setManagerAssignments] = useState(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('flexistaff_manager_assignments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      }
    } catch { }
    if (list.length === 0) list = initialManagerAssignments || [];

    const uniqueList = [];
    const seen = new Set();
    list.forEach((a) => {
      if (!a) return;
      const profName = (a.professionalName || a.name || '').toLowerCase();
      const profEmail = (a.email || a.professionalEmail || '').toLowerCase();
      if (profName.includes('sharon') || profEmail.includes('sharon')) return;

      const projKey = String(a.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
      const profKey = String(a.professionalId || a.professionalName || '').toLowerCase().trim();
      const key = `${projKey}_${profKey}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push(a);
      }
    });

    return uniqueList;
  });

  const [managerNotifications, setManagerNotifications] = useState(initialManagerNotifications);

  const [freelancerRequests, setFreelancerRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('flexistaff_freelancer_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(managerAssignments));
    } catch { }
  }, [managerAssignments]);

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_freelancer_requests', JSON.stringify(freelancerRequests));
    } catch { }
  }, [freelancerRequests]);

  // Sync Manager Profile with registered user data
  useEffect(() => {
    const syncManagerProfileData = () => {
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        const savedManagersStr = localStorage.getItem('flexistaff_managers');
        let currentManagersList = managers;
        if (savedManagersStr) {
          try {
            const parsed = JSON.parse(savedManagersStr);
            if (Array.isArray(parsed) && parsed.length > 0) currentManagersList = parsed;
          } catch { }
        }

        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && (savedUser.role === 'Manager' || savedUser.role === 'ROLE_MANAGER')) {
            const userEmail = (savedUser.email || savedUser.loginEmail || '').toLowerCase().trim();
            const userName = (savedUser.name || savedUser.fullName || '').toLowerCase().trim();
            const userId = savedUser.id;

            let matchedMng = (currentManagersList || []).find((m) => {
              if (!m) return false;
              const mId = m.id;
              const mEmail = (m.email || '').toLowerCase().trim();
              const mLoginEmail = (m.loginEmail || '').toLowerCase().trim();
              const mName = (m.name || '').toLowerCase().trim();
              const mEmpId = (m.employeeId || '').toLowerCase().trim();

              return (
                (mId && userId && mId === userId) ||
                (mEmail && userEmail && (mEmail === userEmail || mEmail.includes(userEmail) || userEmail.includes(mEmail))) ||
                (mLoginEmail && userEmail && (mLoginEmail === userEmail || mLoginEmail.includes(userEmail) || userEmail.includes(mLoginEmail))) ||
                (mName && userName && (mName === userName || mName.includes(userName) || userName.includes(mName))) ||
                (mEmpId && userEmail && mEmpId === userEmail)
              );
            });



            const managerName = matchedMng?.name || savedUser.name || savedUser.fullName || '';
            const emailAddr = matchedMng?.email || matchedMng?.loginEmail || savedUser.email || savedUser.loginEmail || '';
            const phoneNo = matchedMng?.phone || savedUser.phone || '';
            const jobTitle = matchedMng?.jobTitle || matchedMng?.role || savedUser.jobTitle || savedUser.role || 'Manager';
            const dept = matchedMng?.department || savedUser.department || '';
            const loc = matchedMng?.address || matchedMng?.location || savedUser.address || savedUser.location || '';
            const bioText = matchedMng?.bio || savedUser.bio || '';
            const avatarImg = matchedMng?.avatar || savedUser.avatar || '';

            setManagerProfile({
              id: matchedMng?.id || savedUser.id || 'mng-101',
              name: managerName,
              email: emailAddr,
              loginEmail: matchedMng?.loginEmail || savedUser.loginEmail || emailAddr,
              phone: phoneNo,
              role: jobTitle,
              jobTitle: jobTitle,
              department: dept,
              location: loc,
              address: loc,
              bio: bioText,
              avatar: avatarImg,
              employeeId: matchedMng?.employeeId || savedUser.employeeId || '',
              dob: matchedMng?.dob || savedUser.dob || '',
              joinDate: matchedMng?.joinDate || savedUser.joinDate || '',
              experience: matchedMng?.experience || savedUser.experience || '',
            });
          }
        }
      } catch { }
    };

    syncManagerProfileData();
    window.addEventListener('storage', syncManagerProfileData);
    window.addEventListener('auth_change', syncManagerProfileData);
    return () => {
      window.removeEventListener('storage', syncManagerProfileData);
      window.removeEventListener('auth_change', syncManagerProfileData);
    };
  }, [managers]);

  // Workforce Portal State
  const [workforceUserProfile, setWorkforceUserProfile] = useState(initialWorkforceUserProfile);
  const [workforceNotifications, setWorkforceNotifications] = useState(initialWorkforceNotifications);

  // Sync Workforce User Profile with registered user data
  useEffect(() => {
    const syncWorkforceProfileData = () => {
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        const savedWorkforceStr = localStorage.getItem('flexistaff_workforce');
        const savedPartnerWfStr = localStorage.getItem('flexistaff_partner_workforce');

        let currentPartnerWf = partnerWorkforce || [];
        if (savedPartnerWfStr) {
          try { currentPartnerWf = JSON.parse(savedPartnerWfStr); } catch { }
        }

        // Prioritize partner-registered workforce records so that company metadata is preserved
        let combinedWorkforceList = [...(currentPartnerWf || []), ...(workforce || [])];
        if (savedWorkforceStr) {
          try {
            const parsedWf = JSON.parse(savedWorkforceStr);
            if (Array.isArray(parsedWf)) combinedWorkforceList = [...combinedWorkforceList, ...parsedWf];
          } catch { }
        }

        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && (savedUser.role === 'Workforce' || savedUser.role === 'ROLE_PROFESSIONAL' || savedUser.role === 'ROLE_WORKFORCE' || savedUser.role === 'Freelancer' || savedUser.role === 'Partner Employee')) {
            const userEmail = (savedUser.email || '').toLowerCase().trim();
            const userName = (savedUser.name || savedUser.fullName || '').toLowerCase().trim();

            let matchedWf = (combinedWorkforceList || []).find((w) => {
              if (!w) return false;
              const wEmail = (w.email || '').toLowerCase().trim();
              const wName = (w.name || w.pseudonym || '').toLowerCase().trim();
              const wId = w.id ? String(w.id) : '';
              const uId = savedUser.id ? String(savedUser.id) : '';
              return (
                (wId && uId && wId === uId) ||
                (wEmail && userEmail && wEmail === userEmail) ||
                (wName && userName && wName === userName)
              );
            });

            if (!matchedWf) {
              try {
                const regStr = localStorage.getItem('flexistaff_registered_users');
                if (regStr) {
                  const regList = JSON.parse(regStr);
                  matchedWf = regList.find((u) => {
                    if (!u) return false;
                    const uEmail = (u.email || '').toLowerCase().trim();
                    const uName = (u.name || u.fullName || '').toLowerCase().trim();
                    const uId = u.id ? String(u.id) : '';
                    return (
                      (uId && savedUser.id && uId === savedUser.id) ||
                      (uEmail && userEmail && uEmail === userEmail) ||
                      (uName && userName && uName === userName)
                    );
                  });
                }
              } catch { }
            }

            const wfName = matchedWf?.name || matchedWf?.pseudonym || savedUser.name || savedUser.fullName || 'Workforce Specialist';
            const emailAddr = matchedWf?.email || savedUser.email || '';
            const phoneNo = matchedWf?.phone || savedUser.phone || '+91 98765 00000';
            const title = matchedWf?.title || matchedWf?.role || savedUser.title || savedUser.jobTitle || 'Senior Software Engineer';

            let partnerCoId =
              matchedWf?.partnerCompanyId ||
              matchedWf?.partner_company_id ||
              savedUser?.partnerCompanyId;

            let partnerCompany =
              matchedWf?.partnerCompany ||
              matchedWf?.partner ||
              matchedWf?.partnerName ||
              savedUser.partnerCompany ||
              savedUser.partnerName ||
              (savedUser.companyName !== 'Enterprise Client' ? savedUser.companyName : '') ||
              (savedUser.company !== 'Enterprise Client' ? savedUser.company : '') ||
              '';

            if (!partnerCompany && partnerCoId) {
              const matchedPrt = (partners || []).find((p) => String(p.id) === String(partnerCoId) || String(p.userId) === String(partnerCoId));
              if (matchedPrt) {
                partnerCompany = matchedPrt.companyName || matchedPrt.name || '';
              }
            }

            const isPartnerEmployee =
              Boolean(partnerCompany) ||
              Boolean(partnerCoId) ||
              matchedWf?.source === 'Partner Company' ||
              matchedWf?.professionalType === 'PARTNER_EMPLOYEE' ||
              matchedWf?.roleType === 'Professional' ||
              savedUser?.role === 'Partner Employee' ||
              savedUser?.roleType === 'Professional' ||
              savedUser?.professionalType === 'PARTNER_EMPLOYEE';

            setWorkforceUserProfile({
              id: matchedWf?.id || savedUser.id || 'wf-101',
              name: wfName,
              email: emailAddr,
              phone: phoneNo,
              title: title,
              role: title,
              experience: matchedWf?.experience || savedUser.experience || '4+ Years',
              location: matchedWf?.location || savedUser.location || 'Bengaluru, India',
              skills: matchedWf?.skills || savedUser.skills || ['React.js', 'Node.js', 'TypeScript', 'Tailwind CSS'],
              availability: matchedWf?.availability || savedUser.availability || 'Available',
              preferredWorkType: matchedWf?.preferredWorkType || savedUser.preferredWorkType || 'Remote',
              bio: matchedWf?.bio || savedUser.bio || 'Specialized engineering professional experienced in building enterprise cloud architectures.',
              avatar: matchedWf?.avatar || savedUser.avatar || '',
              hourlyRate: matchedWf?.hourlyRate || savedUser.hourlyRate || '$85/hr',
              partnerCompany: partnerCompany,
              partnerName: partnerCompany,
              partner: partnerCompany,
              companyName: partnerCompany,
              company: partnerCompany,
              partnerCompanyId: partnerCoId,
              roleType: isPartnerEmployee ? 'Professional' : 'Freelancer',
              professionalType: isPartnerEmployee ? 'PARTNER_EMPLOYEE' : 'FREELANCER',
              userType: isPartnerEmployee ? 'PARTNER_EMPLOYEE' : 'FREELANCER',
              source: isPartnerEmployee ? 'Partner Company' : 'Freelancer',
            });

            if (isPartnerEmployee && (!savedUser.partnerCompany || savedUser.name !== wfName || !savedUser.roleType)) {
              const updatedSavedUser = {
                ...savedUser,
                name: wfName,
                fullName: wfName,
                companyName: partnerCompany,
                company: partnerCompany,
                partnerCompany: partnerCompany,
                partnerName: partnerCompany,
                partner: partnerCompany,
                partnerCompanyId: partnerCoId || savedUser.partnerCompanyId,
                roleType: 'Professional',
                professionalType: 'PARTNER_EMPLOYEE',
                userType: 'PARTNER_EMPLOYEE',
                source: 'Partner Company',
              };
              try {
                localStorage.setItem('flexistaff_user', JSON.stringify(updatedSavedUser));
              } catch { }
            }
          }
        }
      } catch { }
    };

    syncWorkforceProfileData();
    window.addEventListener('storage', syncWorkforceProfileData);
    window.addEventListener('auth_change', syncWorkforceProfileData);
    return () => {
      window.removeEventListener('storage', syncWorkforceProfileData);
      window.removeEventListener('auth_change', syncWorkforceProfileData);
    };
  }, [workforce]);

  // Sync any logged-in or registered workforce / freelancer user into the central workforce roster
  useEffect(() => {
    const syncUserToWorkforceList = () => {
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        const registeredUsersStr = localStorage.getItem('flexistaff_registered_users');
        const applicationsStr = localStorage.getItem('flexistaff_freelancer_applications');

        let usersToSync = [];
        if (savedUserStr) {
          try {
            const u = JSON.parse(savedUserStr);
            if (u && typeof u === 'object') usersToSync.push(u);
          } catch { }
        }
        if (registeredUsersStr) {
          try {
            const list = JSON.parse(registeredUsersStr);
            if (Array.isArray(list)) usersToSync = [...usersToSync, ...list];
          } catch { }
        }
        if (applicationsStr) {
          try {
            const apps = JSON.parse(applicationsStr);
            if (Array.isArray(apps)) {
              apps.forEach((app) => {
                if (app && app.email) {
                  usersToSync.push({
                    id: app.id,
                    name: app.fullName || app.name,
                    email: app.email,
                    phone: app.phone,
                    role: 'Freelancer',
                    title: app.roleTitle || app.title || 'Freelancer Professional',
                    skills: app.skills,
                    hourlyRate: app.hourlyRate ? (typeof app.hourlyRate === 'number' ? `$${app.hourlyRate}/hr` : app.hourlyRate) : '$85/hr',
                    experience: app.experienceLevel || app.experience || '3+ Years',
                    location: app.personalDetails?.city || app.location || 'India',
                    bio: app.bioOverview || app.bio || '',
                    avatar: app.personalDetails?.avatarUrl || app.avatar || '',
                  });
                }
              });
            }
          } catch { }
        }

        const workforceUsers = usersToSync.filter((u) => {
          if (!u || !u.email) return false;
          const r = String(u.role || u.userType || u.userRole || '').toLowerCase().trim();
          const emailLower = (u.email || '').toLowerCase().trim();
          const nameLower = (u.name || u.fullName || '').toLowerCase().trim();

          const isPartnerCompany =
            r.includes('partner company') ||
            r === 'partner' ||
            r === 'role_partner' ||
            nameLower === 'infosys' ||
            nameLower === 'partner' ||
            nameLower === 'partner company' ||
            emailLower === 'partner@infosys.com' ||
            emailLower === 'partner@gmail.com' ||
            emailLower === 'partner@flexistaff.com';

          const isNonWorkforceRole =
            r === 'admin' || r === 'manager' || r === 'client' ||
            r === 'role_admin' || r === 'role_manager' || r === 'role_client' ||
            r.includes('admin') || r.includes('manager') || r.includes('client') ||
            emailLower.includes('admin') || emailLower.includes('manager') ||
            nameLower === 'admin' || nameLower === 'manager' || nameLower === 'client';

          if (emailLower.includes('sharon') || nameLower.includes('sharon') || isPartnerCompany || isNonWorkforceRole) {
            return false;
          }
          return true;
        });

        if (workforceUsers.length === 0) return;

        setWorkforce((prevWorkforce) => {
          let hasNewEntries = false;
          let updatedList = [...(prevWorkforce || [])];

          workforceUsers.forEach((u) => {
            const userEmail = (u.email || '').toLowerCase().trim();
            const userName = (u.name || u.fullName || u.pseudonym || '').toLowerCase().trim();
            const userId = u.id ? String(u.id).trim() : '';

            const exists = updatedList.some((w) => {
              if (!w) return false;
              const wEmail = (w.email || '').toLowerCase().trim();
              const wName = (w.name || w.pseudonym || '').toLowerCase().trim();
              const wId = w.id ? String(w.id).trim() : '';
              return (
                (wId && userId && wId === userId) ||
                (wEmail && userEmail && wEmail === userEmail) ||
                (wName && userName && wName === userName)
              );
            });

            if (!exists && (userEmail || userName)) {
              hasNewEntries = true;
              const isPartner = Boolean(u.partnerCompany || u.partnerName);
              const genericRoles = ['workforce', 'freelancer', 'professional', 'talent', 'role_workforce', 'role_professional'];
              const rawRole = u.title || u.jobTitle || (u.role && !genericRoles.includes(String(u.role).toLowerCase().trim()) ? u.role : '') || 'Software Engineer';
              const newWfMember = {
                id: u.id || `wf-reg-${Date.now()}-${Math.random().toString().slice(-4)}`,
                numericId: u.numericId || u.id || Date.now(),
                name: u.name || u.fullName || 'Independent Freelancer',
                pseudonym: u.name || u.fullName || 'Independent Freelancer',
                email: u.email,
                phone: u.phone || '+91 98765 00000',
                title: rawRole,
                role: rawRole,
                category: isPartner ? 'Partner Employee' : 'Independent Freelancer',
                roleType: isPartner ? 'Professional' : 'Freelancer',
                professionalType: isPartner ? 'PARTNER_EMPLOYEE' : 'FREELANCER',
                source: isPartner ? 'Partner Company' : 'Freelancer Registration',
                partnerCompany: u.partnerCompany || '',
                partnerName: u.partnerCompany || (isPartner ? 'Partner Organization' : 'Independent Freelancer'),
                skills: Array.isArray(u.skills)
                  ? u.skills
                  : (u.skills ? String(u.skills).split(',').map((s) => s.trim()) : ['React.js', 'Node.js']),
                hourlyRate: u.hourlyRate ? (typeof u.hourlyRate === 'number' ? `$${u.hourlyRate}/hr` : u.hourlyRate) : '$50/hr',
                experience: u.experience || '3+ Years',
                location: u.location || 'Bengaluru, India',
                bio: u.bio || 'Specialized engineering professional registered on FlexiStaff.',
                status: u.availability || 'Available',
                availability: u.availability || 'Available',
                approvalStatus: 'Approved',
                verificationStatus: 'Approved',
                accountStatus: 'Active',
                rating: 5.0,
                avatar:
                  u.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || u.fullName || 'Freelancer')}`,
              };
              updatedList = [newWfMember, ...updatedList];
            }
          });

          if (hasNewEntries) {
            try {
              localStorage.setItem('flexistaff_workforce', JSON.stringify(updatedList));
            } catch { }
            return updatedList;
          }
          return prevWorkforce;
        });
      } catch (err) {
        console.error('Error syncing user to workforce list:', err);
      }
    };

    syncUserToWorkforceList();
    window.addEventListener('storage', syncUserToWorkforceList);
    window.addEventListener('auth_change', syncUserToWorkforceList);
    return () => {
      window.removeEventListener('storage', syncUserToWorkforceList);
      window.removeEventListener('auth_change', syncUserToWorkforceList);
    };
  }, []);

  // Sync assigned squad members (e.g. Mathuchan18) into central workforce roster
  useEffect(() => {
    const squadCandidates = [];

    // 1. Collect from projects assignedResources
    (projects || []).forEach((p) => {
      if (p && Array.isArray(p.assignedResources)) {
        p.assignedResources.forEach((res) => {
          if (res && (res.name || res.professionalName)) {
            squadCandidates.push({
              id: res.id || res.professionalId || `wf-squad-${Date.now()}`,
              numericId: res.id || Date.now(),
              name: res.name || res.professionalName || 'Workforce Specialist',
              pseudonym: res.name || res.professionalName || 'Workforce Specialist',
              email: res.email || res.professionalEmail || '',
              phone: res.phone || '+91 98765 00000',
              title: res.role || res.title || 'Workforce Specialist',
              role: res.role || res.title || 'Workforce Specialist',
              category: 'Independent Freelancer',
              roleType: res.roleType || 'Freelancer',
              professionalType: res.professionalType || 'FREELANCER',
              source: res.source || 'Freelancer',
              partnerCompany: res.partnerName || '',
              partnerName: res.partnerName || 'Independent Freelancer',
              skills: res.skills || ['React.js', 'Node.js', 'PostgreSQL'],
              hourlyRate: res.hourlyRate || '$85/hr',
              experience: res.experience || '3+ Years',
              location: res.location || 'Bengaluru, India',
              bio: res.bio || 'Assigned engineering squad specialist.',
              status: res.status || 'Active',
              availability: 'Available',
              approvalStatus: 'Approved',
              verificationStatus: 'Approved',
              accountStatus: 'Active',
              avatar: res.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(res.name || 'Workforce')}`,
            });
          }
        });
      }
    });

    // 2. Collect from managerAssignments
    (managerAssignments || []).forEach((asg) => {
      if (asg && (asg.professionalName || asg.name)) {
        squadCandidates.push({
          id: asg.professionalId || asg.id || `wf-asg-${Date.now()}`,
          numericId: asg.professionalId || asg.id || Date.now(),
          name: asg.professionalName || asg.name || 'Workforce Specialist',
          pseudonym: asg.professionalName || asg.name || 'Workforce Specialist',
          email: asg.email || asg.professionalEmail || '',
          phone: asg.phone || '+91 98765 00000',
          title: asg.role || 'Workforce Specialist',
          role: asg.role || 'Workforce Specialist',
          category: 'Independent Freelancer',
          roleType: asg.roleType || 'Freelancer',
          professionalType: asg.professionalType || 'FREELANCER',
          source: asg.source || 'Freelancer',
          partnerCompany: asg.partnerName || '',
          partnerName: asg.partnerName || 'Independent Freelancer',
          skills: asg.skills || ['React.js', 'Node.js'],
          hourlyRate: asg.hourlyRate || '$85/hr',
          experience: asg.experience || '3+ Years',
          location: asg.location || 'Bengaluru, India',
          bio: asg.notes || 'Assigned engineering squad specialist.',
          status: asg.status || 'Active',
          availability: 'Available',
          approvalStatus: 'Approved',
          verificationStatus: 'Approved',
          accountStatus: 'Active',
          avatar: asg.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(asg.professionalName || 'Workforce')}`,
        });
      }
    });

    if (squadCandidates.length > 0) {
      setWorkforce((prev) => {
        let list = [...(prev || [])];
        let added = false;
        squadCandidates.forEach((cand) => {
          const candName = (cand.name || '').toLowerCase().trim();
          const candEmail = (cand.email || '').toLowerCase().trim();
          const candId = String(cand.id || '').toLowerCase().trim();

          const isNonWorkforce =
            candName === 'admin' || candName === 'manager' || candName === 'client' ||
            candEmail.includes('admin') || candEmail.includes('manager');

          const exists = list.some((w) => {
            if (!w) return false;
            const wId = String(w.id || '').toLowerCase().trim();
            const wName = (w.name || w.pseudonym || '').toLowerCase().trim();
            const wEmail = (w.email || '').toLowerCase().trim();
            return (candId && wId === candId) || (candName && wName === candName) || (candEmail && wEmail && wEmail === candEmail);
          });

          if (!exists && !isNonWorkforce) {
            list = [cand, ...list];
            added = true;
          }
        });

        if (added) {
          try {
            localStorage.setItem('flexistaff_workforce', JSON.stringify(list));
          } catch {}
          return list;
        }
        return prev;
      });
    }
  }, [projects, managerAssignments]);

  // Sync Client Profile with registered user data
  useEffect(() => {
    const syncClientProfileData = () => {
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        const savedClientsStr = localStorage.getItem('flexistaff_clients');
        let currentClientsList = clients;
        if (savedClientsStr) {
          try { currentClientsList = JSON.parse(savedClientsStr); } catch { }
        }

        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && (savedUser.role === 'Client' || savedUser.role === 'ROLE_CLIENT')) {
            const userEmail = (savedUser.email || '').toLowerCase().trim();
            const userName = (savedUser.companyName || savedUser.company || savedUser.name || '').toLowerCase().trim();

            let matchedCli = (currentClientsList || []).find((c) => {
              if (!c) return false;
              const cEmail = (c.email || '').toLowerCase().trim();
              const cName = (c.name || c.companyName || '').toLowerCase().trim();
              return (cEmail && userEmail && cEmail === userEmail) || (cName && userName && cName === userName);
            });

            const companyName = matchedCli?.name || matchedCli?.companyName || savedUser.companyName || savedUser.company || '';
            const contactPerson = matchedCli?.contactPerson || savedUser.name || savedUser.contactPerson || '';

            setClientProfile({
              id: matchedCli?.id || savedUser.id || 'cli-101',
              name: contactPerson,
              contactPerson: contactPerson,
              company: companyName,
              companyName: companyName,
              email: matchedCli?.email || savedUser.email || '',
              phone: matchedCli?.phone || savedUser.phone || '',
              location: matchedCli?.location || 'Bengaluru, India',
              address: matchedCli?.address || matchedCli?.location || 'Bengaluru, India',
              city: matchedCli?.city || 'Bengaluru',
              country: matchedCli?.country || 'India',
              tier: matchedCli?.tier || 'Enterprise Premium',
              industry: matchedCli?.industry || 'Technology & Innovation',
              avatar: matchedCli?.avatar || savedUser.avatar || '',
            });
          }
        }
      } catch { }
    };

    syncClientProfileData();
    window.addEventListener('storage', syncClientProfileData);
    window.addEventListener('auth_change', syncClientProfileData);
    return () => {
      window.removeEventListener('storage', syncClientProfileData);
      window.removeEventListener('auth_change', syncClientProfileData);
    };
  }, [clients]);

  // Freelancer Applications State (Submitted via Form for Freelancer)
  const [freelancerApplications, setFreelancerApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('flexistaff_freelancer_applications');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_freelancer_applications', JSON.stringify(freelancerApplications));
    } catch { }
  }, [freelancerApplications]);

  const addFreelancerApplication = async (appData) => {
    let assignedId = appData.id;
    let numericId = appData.numericId;

    try {
      const skillsStr = Array.isArray(appData.skills) ? appData.skills.join(', ') : (appData.skills || '');
      const apiRes = await api.freelancers.register({
        fullName: appData.fullName,
        email: appData.email,
        phone: appData.phone,
        password: appData.password || 'Password123!',
        title: appData.roleTitle || appData.title || 'Full Stack Software Engineer',
        skills: skillsStr,
        bio: appData.bioOverview || appData.bio,
        hourlyRate: appData.hourlyRate ? parseFloat(appData.hourlyRate) : 1500,
        experienceYears: appData.experienceYears || 3,
      });

      if (apiRes && apiRes.success === false) {
        return { success: false, error: apiRes.error || 'Email address already registered' };
      }

      if (apiRes && apiRes.data) {
        assignedId = apiRes.data.userId || apiRes.data.id;
        numericId = apiRes.data.userId || apiRes.data.id;
      }
    } catch (err) {
      console.warn('Backend freelancer register offline, saving locally', err.message);
    }

    const newApp = {
      id: assignedId || `fl-app-${Date.now()}`,
      numericId: numericId || assignedId || null,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'Approved',
      ...appData,
    };
    setFreelancerApplications((prev) => [newApp, ...prev]);

    const newWorkforceMember = {
      id: assignedId || Date.now(),
      numericId: numericId || assignedId || Date.now(),
      name: appData.fullName,
      email: appData.email,
      phone: appData.phone,
      role: 'Freelancer',
      roleType: 'Freelancer',
      title: appData.roleTitle || appData.title || 'Full Stack Software Engineer',
      skills: Array.isArray(appData.skills) ? appData.skills : (appData.skills ? appData.skills.split(',').map((s) => s.trim()) : ['React', 'Node.js']),
      bio: appData.bioOverview || appData.bio,
      hourlyRate: appData.hourlyRate ? `₹${appData.hourlyRate}/hr` : '₹1500/hr',
      availabilityStatus: 'Available',
      approvalStatus: 'Approved',
      verificationStatus: 'Verified',
      accountStatus: 'Active',
      source: 'Freelancer Registration',
      location: appData.personalDetails?.city || appData.location || 'India',
      avatar: appData.personalDetails?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };

    setWorkforce((prev) => {
      const filtered = prev.filter((w) => (w.email || '').toLowerCase() !== (newWorkforceMember.email || '').toLowerCase() && w.id !== newWorkforceMember.id);
      return [newWorkforceMember, ...filtered];
    });

    // Send notification to Admin feed
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Freelancer Candidate Registered',
        message: `${appData.fullName || 'Freelancer'} registered profile details in PostgreSQL database.`,
        type: 'request',
        unread: true,
        time: 'Just now',
        link: '/admin/workforce',
      },
      ...prev,
    ]);

    return { success: true, freelancer: newWorkforceMember, application: newApp };
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
        title: app.roleTitle || (app.skills?.[0] ? `${app.skills[0]} Specialist` : 'Software Engineer'),
        role: app.roleTitle || (app.skills?.[0] ? `${app.skills[0]} Specialist` : 'Software Engineer'),
        category: app.category || 'Independent Freelancer',
        specialties: app.specialties || [],
        location: app.personalDetails?.city
          ? `${app.personalDetails.city}, ${app.personalDetails.country || 'India'}`
          : app.place || 'Remote',
        email: app.email,
        phone: app.phone || app.personalDetails?.phoneNumber,
        experience: app.experienceLevel || '3+ years',
        skills: app.skills || ['React.js', 'Node.js'],
        status: 'Available',
        approvalStatus: 'Approved',
        verificationStatus: 'Approved',
        accountStatus: 'Active',
        source: 'Freelancer',
        roleType: 'Freelancer',
        hourlyRate: typeof app.hourlyRate === 'number' ? `$${app.hourlyRate.toFixed(2)}/hr` : (app.hourlyRate || '$75.00/hr'),
        rating: 5.0,
        avatar: app.personalDetails?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bioOverview: app.bioOverview,
        experiences: app.experiences,
        educations: app.educations,
        languages: app.languages,
        personalDetails: app.personalDetails,
        importMethod: app.importMethod,
        resumeFileName: app.resumeFileName,
        linkedInPdfName: app.linkedInPdfName,
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
  const [supportTickets, setSupportTickets] = useState([]);

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
  const [projectMilestones, setProjectMilestones] = useState({});

  const getDefaultProjectMilestones = (pId) => [
    { id: 'ms-01', title: 'Requirement Analysis', weight: 10, weightage: 10, status: 'Pending', dueDate: 'Sprint 1', commits: [] },
    { id: 'ms-02', title: 'UI/UX & System Design', weight: 20, weightage: 20, status: 'Pending', dueDate: 'Sprint 2', commits: [] },
    { id: 'ms-03', title: 'Backend & Database Development', weight: 25, weightage: 25, status: 'Pending', dueDate: 'Sprint 3', commits: [] },
    { id: 'ms-04', title: 'Frontend & Integration', weight: 25, weightage: 25, status: 'Pending', dueDate: 'Sprint 4', commits: [] },
    { id: 'ms-05', title: 'Testing, Deployment & Final Delivery', weight: 20, weightage: 20, status: 'Pending', dueDate: 'Sprint 5', commits: [] },
  ];

  const syncMilestoneProgressToState = (pId, updatedMilestones) => {
    const completedCount = (updatedMilestones || []).filter(
      (m) => m.completed || String(m.status || '').toLowerCase() === 'completed' || m.status === 'COMPLETED'
    ).length;

    const calculatedProgress = calculateOverallCompletionProgress(completedCount);
    const isComplete = calculatedProgress >= 100;
    const normPId = String(pId || '').toLowerCase().replace(/[\s_]/g, '-').trim();

    setProjects((prevProjects) => {
      const updated = (prevProjects || []).map((p) => {
        if (!p) return p;
        const normId = String(p.id || p.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
        if (normId === normPId || String(p.id) === String(pId)) {
          if (p.status === 'Rejected' || p.status === 'Declined' || p.status === 'Cancelled') {
            return p;
          }
          return {
            ...p,
            progress: calculatedProgress,
            status: isComplete ? 'Completed' : (calculatedProgress > 0 ? 'In Progress' : p.status),
            stage: isComplete ? 'Completed' : (calculatedProgress > 0 ? 'In Progress' : p.stage),
            recentUpdate: isComplete ? 'All sprint deliverables completed.' : `Milestone progress updated to ${calculatedProgress}%.`,
          };
        }
        return p;
      });
      try { localStorage.setItem('flexistaff_projects', JSON.stringify(updated)); } catch { }
      return updated;
    });

    setManagerAssignments((prevAssignments) => {
      const updated = (prevAssignments || []).map((a) => {
        if (!a) return a;
        const normId = String(a.id || a.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim();
        if (normId === normPId || String(a.projectId) === String(pId) || String(a.id) === String(pId)) {
          if (a.status === 'Declined' || a.status === 'Rejected' || a.status === 'Cancelled') {
            return a;
          }
          return {
            ...a,
            progress: calculatedProgress,
            status: isComplete ? 'Completed' : (a.status === 'Pending' ? 'Accepted' : a.status),
            currentTask: isComplete ? 'All sprint deliverables completed.' : `Milestone progress updated to ${calculatedProgress}%.`,
          };
        }
        return a;
      });
      try { localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(updated)); } catch { }
      return updated;
    });

    return calculatedProgress;
  };

  const addMilestoneCommit = (projectId, milestoneId, commitData) => {
    // 1. Check if workforce assignment is rejected/declined
    const asgStatus = String(commitData?.assignmentStatus || commitData?.status || '').toLowerCase();
    if (asgStatus === 'declined' || asgStatus === 'rejected' || asgStatus === 'cancelled') {
      console.warn('Rejected or declined workforce assignments cannot update or complete milestones.');
      return null;
    }

    const newCommit = {
      id: `cmt-${Date.now()}`,
      commitHash: Math.random().toString(16).substring(2, 9),
      dateTime: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      ...commitData,
    };

    const pId = projectId || (projects[0]?.id || 1);

    // 2. Persist update to PostgreSQL backend if numeric ID
    if (milestoneId) {
      const numericMsId = Number(String(milestoneId).replace(/\D/g, ''));
      if (numericMsId) {
        const msStatus = (commitData.milestoneStatus === 'Completed' || commitData.status === 'Completed') ? 'COMPLETED' : 'IN_PROGRESS';
        api.milestones.updateProgress(numericMsId, {
          status: msStatus,
          authorRole: commitData.authorRole,
          authorSkills: Array.isArray(commitData.authorSkills) ? commitData.authorSkills.join(', ') : commitData.authorSkills,
          milestoneSkillDomain: commitData.assignedSkill || '',
        }).catch((err) => console.warn('Milestone API sync fallback:', err));
      }
    }

    setProjectMilestones((prev) => {
      const projectMs = (prev[pId] && prev[pId].length > 0) ? prev[pId] : getDefaultProjectMilestones(pId);
      const targetStatus = commitData.milestoneStatus || commitData.status || 'In Progress';

      const updated = projectMs.map((ms) => {
        if (ms.id === milestoneId || (!milestoneId && ms.status === 'In Progress')) {
          return {
            ...ms,
            status: targetStatus,
            completed: targetStatus === 'Completed',
            commits: [newCommit, ...(ms.commits || [])],
          };
        }
        return ms;
      });

      syncMilestoneProgressToState(pId, updated);

      return {
        ...prev,
        [pId]: updated,
      };
    });

    // 3. Broadcast real-time notifications to Admin, Manager, Client, and Partner Company
    const msTitle = commitData.milestoneTitle || commitData.milestoneName || 'Milestone';
    const notifPayload = {
      id: `notif-${Date.now()}`,
      title: `Milestone Update: ${msTitle} (${commitData.milestoneStatus || 'Updated'})`,
      message: `${newCommit.authorName || 'Specialist'} logged commit #${newCommit.commitHash}: "${newCommit.commitMessage || newCommit.workCompleted}"`,
      time: 'Just now',
      unread: true,
      link: '/projects',
    };

    setNotifications((prev) => [notifPayload, ...prev]);
    setManagerNotifications((prev) => [{ ...notifPayload, link: '/manager/projects' }, ...prev]);
    setClientNotifications((prev) => [{ ...notifPayload, link: '/client/progress' }, ...prev]);
    setPartnerNotifications((prev) => [{ ...notifPayload, link: '/partner/projects' }, ...prev]);

    return newCommit;
  };

  const updateMilestoneStatus = (projectId, milestoneId, newStatus) => {
    const pId = projectId || (projects[0]?.id || 1);

    setProjectMilestones((prev) => {
      const projectMs = (prev[pId] && prev[pId].length > 0) ? prev[pId] : getDefaultProjectMilestones(pId);
      const updated = projectMs.map((ms) =>
        ms.id === milestoneId ? { ...ms, status: newStatus } : ms
      );

      syncMilestoneProgressToState(pId, updated);

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

  const updatePartnerProfile = async (data) => {
    const updatedSpecialtiesStr = Array.isArray(data.specialties)
      ? data.specialties.join(', ')
      : data.specialties;
    const updatedSpecialtiesArr = Array.isArray(data.specialties)
      ? data.specialties
      : String(data.specialties || '').split(',').map((s) => s.trim()).filter(Boolean);

    const partnerId = data.id || partnerProfile?.id || partnerProfile?.numericId;
    const rawNum = typeof partnerId === 'number' ? partnerId : Number(String(partnerId || '').replace(/\D/g, ''));
    const targetDbId = !isNaN(rawNum) && rawNum > 0 ? rawNum : null;

    if (targetDbId) {
      try {
        await api.partners.update(targetDbId, {
          companyName: data.name || data.companyName,
          name: data.name || data.companyName,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone,
          location: data.location || data.city,
          tier: data.tier,
          specialties: updatedSpecialtiesArr,
        });
      } catch (err) {
        console.warn(`Could not persist partner profile update to backend API for ID ${targetDbId}:`, err);
      }
    }

    setPartnerProfile((prev) => ({
      ...prev,
      ...data,
      name: data.name || prev.name,
      contactPerson: data.contactPerson || prev.contactPerson,
      email: data.email || prev.email,
      phone: data.phone || prev.phone,
      location: data.location || prev.location,
      specialties: updatedSpecialtiesStr || prev.specialties,
      logoUrl: data.logoUrl || data.avatar || prev.logoUrl,
    }));

    // Sync to partners list in DataContext and localStorage
    setPartners((prevPartners) => {
      const emailToMatch = (data.email || partnerProfile.email || '').toLowerCase().trim();
      const nameToMatch = (data.name || partnerProfile.name || '').toLowerCase().trim();

      const existsIdx = prevPartners.findIndex((p) => {
        if (!p) return false;
        if (targetDbId && (p.id === targetDbId || p.numericId === targetDbId)) return true;
        const pEmail = (p.email || '').toLowerCase().trim();
        const pName = (p.name || p.companyName || '').toLowerCase().trim();
        if (pEmail && emailToMatch && pEmail === emailToMatch) return true;
        if (pName && nameToMatch && (pName === nameToMatch || nameToMatch.includes(pName) || pName.includes(nameToMatch))) return true;
        return false;
      });

      const updatedPartnerObj = {
        name: data.name || partnerProfile.name,
        companyName: data.name || partnerProfile.name,
        contactPerson: data.contactPerson || partnerProfile.contactPerson,
        email: data.email || partnerProfile.email,
        phone: data.phone || partnerProfile.phone,
        tier: data.tier || partnerProfile.tier,
        location: data.location || data.city || partnerProfile.location,
        city: data.location || data.city || partnerProfile.location,
        specialties: updatedSpecialtiesArr,
        website: data.website !== undefined ? data.website : partnerProfile.website,
        description: data.description !== undefined ? data.description : partnerProfile.description,
        logo: data.logoUrl || data.avatar || partnerProfile.logoUrl,
        avatar: data.logoUrl || data.avatar || partnerProfile.logoUrl,
      };

      let nextPartners;
      if (existsIdx >= 0) {
        nextPartners = [...prevPartners];
        nextPartners[existsIdx] = { ...nextPartners[existsIdx], ...updatedPartnerObj };
      } else {
        nextPartners = [
          {
            id: targetDbId || data.id || partnerProfile.id || `prt-${Date.now()}`,
            numericId: targetDbId || data.id || partnerProfile.id || Date.now(),
            status: data.status || 'Active',
            joinedDate: new Date().toISOString().split('T')[0],
            suppliedProfessionals: 0,
            activePlacements: 0,
            availabilityRate: '100%',
            rating: 4.9,
            ...updatedPartnerObj,
          },
          ...prevPartners,
        ];
      }

      try {
        localStorage.setItem('flexistaff_partners', JSON.stringify(nextPartners));
      } catch { }
      return nextPartners;
    });

    const newName = data.name || data.companyName;
    if (newName) {
      setWorkforce((prevWf) => {
        const nextWf = (prevWf || []).map((w) => {
          if (!w) return w;
          if (targetDbId && (w.partnerCompanyId === targetDbId || String(w.partnerCompanyId) === String(targetDbId))) {
            return { ...w, partnerCompany: newName, partnerName: newName };
          }
          return w;
        });
        try {
          localStorage.setItem('flexistaff_workforce', JSON.stringify(nextWf));
        } catch { }
        return nextWf;
      });
    }

    // Update flexistaff_user if logged-in user is partner
    try {
      const savedUserStr = localStorage.getItem('flexistaff_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && (savedUser.role === 'Partner Company' || savedUser.role === 'Partner' || savedUser.role === 'ROLE_PARTNER')) {
          const updatedUser = {
            ...savedUser,
            name: data.contactPerson || data.name || savedUser.name,
            contactPerson: data.contactPerson || savedUser.contactPerson,
            companyName: data.name || savedUser.companyName,
            company: data.name || savedUser.company,
            email: data.email || savedUser.email,
            phone: data.phone || savedUser.phone,
          };
          localStorage.setItem('flexistaff_user', JSON.stringify(updatedUser));
        }
      }
    } catch { }
  };

  const updateManagerProfile = (data) => {
    setManagerProfile((prev) => {
      const updated = { ...prev, ...data };

      // Sync flexistaff_user in localStorage if user is Manager
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && (savedUser.role === 'Manager' || savedUser.role === 'ROLE_MANAGER')) {
            const updatedUser = {
              ...savedUser,
              name: updated.name || savedUser.name,
              fullName: updated.name || savedUser.fullName,
              email: updated.email || savedUser.email,
              phone: updated.phone || savedUser.phone,
              location: updated.location || updated.address || savedUser.location,
              address: updated.address || updated.location || savedUser.address,
              department: updated.department || savedUser.department,
              jobTitle: updated.jobTitle || updated.role || savedUser.jobTitle,
              bio: updated.bio || savedUser.bio,
              avatar: updated.avatar || savedUser.avatar,
            };
            localStorage.setItem('flexistaff_user', JSON.stringify(updatedUser));
          }
        }
      } catch { }

      // Sync managers list in state & localStorage
      setManagers((prevManagers) => {
        const targetId = updated.id || prev.id;
        const exists = (prevManagers || []).some(
          (m) => m.id === targetId || m.email === updated.email || m.name === updated.name
        );
        let newManagers;
        if (exists) {
          newManagers = prevManagers.map((m) =>
            m.id === targetId || m.email === updated.email || m.name === updated.name
              ? { ...m, ...updated }
              : m
          );
        } else {
          newManagers = [{ ...updated, id: targetId || `mng-${Date.now()}` }, ...prevManagers];
        }
        try {
          localStorage.setItem('flexistaff_managers', JSON.stringify(newManagers));
        } catch { }
        return newManagers;
      });

      return updated;
    });
  };

  const updateClientProfile = (data) => {
    setClientProfile((prev) => {
      const updated = { ...prev, ...data };
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          const updatedUser = {
            ...savedUser,
            name: updated.name || updated.contactPerson || savedUser.name,
            contactPerson: updated.contactPerson || updated.name || savedUser.contactPerson,
            email: updated.email || savedUser.email,
            phone: updated.phone || savedUser.phone,
            company: updated.company || updated.companyName || savedUser.company,
            companyName: updated.companyName || updated.company || savedUser.companyName,
          };
          localStorage.setItem('flexistaff_user', JSON.stringify(updatedUser));
        }
      } catch {
        // Ignore
      }
      return updated;
    });
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
      client: partnerProfile.name || 'Partner Organization',
      partner: partnerProfile.name || 'Partner Organization',
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
      location: projectData.location || 'India, Karnataka, Bengaluru',
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
  const submitClientProjectRequest = async (formData) => {
    const parseIdNum = (val) => {
      if (!val) return null;
      if (typeof val === 'number') return val;
      const num = Number(String(val).replace(/\D/g, ''));
      return (!isNaN(num) && num > 0) ? num : null;
    };

    let clientIdNum = parseIdNum(formData?.clientId);

    if (!clientIdNum) {
      try {
        const u = JSON.parse(localStorage.getItem('flexistaff_user'));
        if (u) clientIdNum = parseIdNum(u.id) || parseIdNum(u.numericId) || parseIdNum(u.userId);
      } catch {}
    }

    if (!clientIdNum && clientProfile) {
      clientIdNum = parseIdNum(clientProfile.id) || parseIdNum(clientProfile.numericId) || parseIdNum(clientProfile.userId);
    }

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

    const payload = {
      title: formData.title || formData.name || 'Custom Enterprise Project',
      description: formData.description || 'Enterprise staffing requirement submitted by client.',
      requiredSkills: skillsArr.join(', ') || 'React.js, Node.js, PostgreSQL',
      clientId: clientIdNum,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.targetEndDate || formData.endDate || formData.deadline || null,
    };

    let newProject = null;
    try {
      const res = await api.projects.create(payload);
      if (res && res.success && res.data) {
        newProject = mapBackendProjectToFrontend(res.data);
      }
    } catch (err) {
      console.warn('Backend project creation error:', err);
    }

    if (!newProject) {
      const existingNumIds = (projects || [])
        .map((p) => Number(String(p?.id || '').replace(/\D/g, '')))
        .filter((num) => !isNaN(num) && num > 0);
      const nextSerialNum = existingNumIds.length > 0 ? Math.max(...existingNumIds) + 1 : 7143;

      newProject = {
        id: nextSerialNum,
        serialId: nextSerialNum,
        dbId: nextSerialNum,
        name: formData.title || formData.name || 'Custom Enterprise Project',
        title: formData.title || formData.name || 'Custom Enterprise Project',
        client: clientProfile?.company || '',
        clientId: clientIdNum,
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
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        targetEndDate: formData.targetEndDate || formData.endDate || formData.deadline || '2027-02-28',
        endDate: formData.targetEndDate || formData.endDate || formData.deadline || '2027-02-28',
        deadline: formData.targetEndDate || formData.endDate || formData.deadline || '2027-02-28',
        manager: 'Unassigned',
        assignedResources: [],
        requirements: reqList,
        milestones: [
          { id: 'ms-01', title: 'Requirement Analysis', weight: 10, weightage: 10, status: 'Pending', dueDate: formData.startDate, completed: false, commits: [] },
          { id: 'ms-02', title: 'UI/UX & System Design', weight: 20, weightage: 20, status: 'Pending', dueDate: formData.startDate, completed: false, commits: [] },
          { id: 'ms-03', title: 'Backend & Database Development', weight: 25, weightage: 25, status: 'Pending', dueDate: formData.targetEndDate, completed: false, commits: [] },
          { id: 'ms-04', title: 'Frontend & Integration', weight: 25, weightage: 25, status: 'Pending', dueDate: formData.targetEndDate, completed: false, commits: [] },
          { id: 'ms-05', title: 'Testing, Deployment & Final Delivery', weight: 20, weightage: 20, status: 'Pending', dueDate: formData.targetEndDate, completed: false, commits: [] },
        ],
        createdDate: new Date().toISOString().split('T')[0],
      };
    }

    setProjects((prev) => [newProject, ...prev.filter((p) => String(p.id) !== String(newProject.id))]);

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
  const approveProject = async (projectId, assignedManager = '') => {
    const numId = typeof projectId === 'number' ? projectId : parseInt(String(projectId).replace(/\D/g, ''), 10);
    
    // Find manager entity / ID if assignedManager name or object is passed
    let assignedManagerUser = (managers || []).find(
      (m) => (m.name || m.fullName || '').toLowerCase().trim() === String(assignedManager).toLowerCase().trim()
    );
    let managerIdToUpdate = assignedManagerUser?.id || assignedManagerUser?.userId || null;

    if (numId && !isNaN(numId) && api?.projects?.update) {
      try {
        const updatePayload = { status: 'IN_PROGRESS' };
        if (managerIdToUpdate) {
          updatePayload.managerId = managerIdToUpdate;
        }
        const res = await api.projects.update(numId, updatePayload);
        if (res && res.success && res.data) {
          const mapped = mapBackendProjectToFrontend(res.data);
          setProjects((prev) => prev.map((p) => (p.id === numId || p.id === projectId ? mapped : p)));
          refreshDashboardStats();
        }
      } catch (err) {
        console.warn('Could not update backend project on approve:', err);
      }
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId || p.id === numId) {
          return {
            ...p,
            status: 'In Progress',
            stage: 'In Progress',
            manager: assignedManager || p.manager || 'Unassigned',
            managerName: assignedManager || p.managerName,
            managerId: managerIdToUpdate || p.managerId,
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
    try {
      const numId = typeof projectId === 'number' ? projectId : parseInt(String(projectId).replace(/\D/g, ''), 10);
      if (numId && !isNaN(numId) && api?.projects?.reject) {
        api.projects.reject(numId, reason).catch((err) => console.warn('Backend project reject offline fallback:', err));
      }
    } catch { }

    const normProjId = (id) => String(id || '').toLowerCase().replace(/[\s_]/g, '-').trim();
    const targetNorm = normProjId(projectId);

    const updateRejectedObj = (p) => {
      if (!p) return p;
      const pNorm = normProjId(p.id);
      if (pNorm === targetNorm || String(p.id) === String(projectId)) {
        return {
          ...p,
          status: 'Rejected',
          stage: 'Rejected',
          rejectionReason: reason,
          approvalStatus: 'Rejected',
          workforceAssigned: 0,
          assignedResources: [],
        };
      }
      return p;
    };

    setProjects((prev) => {
      const updated = (prev || []).map(updateRejectedObj);
      try { localStorage.setItem('flexistaff_projects', JSON.stringify(updated)); } catch { }
      return updated;
    });

    setPartnerProjects((prev) => {
      const updated = (prev || []).map(updateRejectedObj);
      try { localStorage.setItem('flexistaff_partner_projects', JSON.stringify(updated)); } catch { }
      return updated;
    });

    setClientProjects((prev) => {
      const updated = (prev || []).map(updateRejectedObj);
      try { localStorage.setItem('flexistaff_client_projects', JSON.stringify(updated)); } catch { }
      return updated;
    });

    setManagerAssignments((prev) => {
      const updated = (prev || []).map((a) => {
        if (!a) return a;
        const aNorm = normProjId(a.projectId);
        if (aNorm === targetNorm || String(a.projectId) === String(projectId)) {
          return {
            ...a,
            status: 'Rejected',
            rejectionReason: `Project rejected by client/admin: ${reason}`,
            currentTask: 'Project rejected. Assignment cancelled.',
          };
        }
        return a;
      });
      try { localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(updated)); } catch { }
      return updated;
    });

    setFreelancerRequests((prev) => {
      const updated = (prev || []).map((r) => {
        if (!r) return r;
        const rNorm = normProjId(r.projectId);
        if (rNorm === targetNorm || String(r.projectId) === String(projectId)) {
          return {
            ...r,
            status: 'Rejected',
            rejectionReason: `Project rejected by client/admin: ${reason}`,
          };
        }
        return r;
      });
      try { localStorage.setItem('flexistaff_freelancer_requests', JSON.stringify(updated)); } catch { }
      return updated;
    });

    setPartnerWorkforceRequests((prev) => {
      const updated = (prev || []).map((pr) => {
        if (!pr) return pr;
        const prNorm = normProjId(pr.projectId);
        if (prNorm === targetNorm || String(pr.projectId) === String(projectId)) {
          return {
            ...pr,
            status: 'Rejected',
            rejectionReason: `Project rejected by client/admin: ${reason}`,
          };
        }
        return pr;
      });
      try { localStorage.setItem('flexistaff_partner_requests', JSON.stringify(updated)); } catch { }
      return updated;
    });

    // Notify Client
    const clientNotif = {
      id: `cnotif-${Date.now()}`,
      title: 'Project Requirement Update',
      message: `Your project "${projectId}" was rejected: ${reason}. You can modify and resubmit.`,
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
      projects.find((p) => String(p.id).toLowerCase().replace(/[\s_]/g, '-').trim() === String(projectId).toLowerCase().replace(/[\s_]/g, '-').trim()) || {
        id: projectId,
        name: 'Enterprise Project',
        title: 'Enterprise Project',
        client: 'Enterprise Client',
      };

    if (prj && (prj.status === 'Rejected' || prj.status === 'REJECTED' || prj.stage === 'Rejected' || prj.status === 'Cancelled')) {
      toast.error('Cannot assign workforce: This project has been rejected or cancelled.');
      return null;
    }

    const cand =
      workforce.find((w) => w.id === (workforceMember.id || workforceMember)) ||
      partnerWorkforce.find((w) => w.id === (workforceMember.id || workforceMember)) ||
      workforceMember;

    if (!cand) {
      toast.error('Invalid workforce candidate selected.');
      return null;
    }

    // Availability & Candidate Project Limit Validation (Up to 5 Projects allowed per candidate)
    const isGone = cand.status === 'Terminated' || cand.status === 'Suspended' || cand.accountStatus === 'Suspended' || cand.status === 'Inactive';
    const availLower = (cand.availability || '').toLowerCase();
    const isUnavailable = availLower === 'unavailable' || availLower === 'paused';

    const candActiveAssignments = (managerAssignments || []).filter(
      (a) =>
        (a.professionalId === cand.id || a.professionalName?.toLowerCase() === (cand.name || cand.pseudonym)?.toLowerCase()) &&
        a.status !== 'Rejected' &&
        a.status !== 'Declined'
    );

    if (isGone || isUnavailable) {
      toast.error(`Cannot assign ${cand.name || 'candidate'}: Talent account is inactive or unavailable.`);
      return null;
    }

    if (candActiveAssignments.length >= 5) {
      toast.error(`Cannot assign ${cand.name || 'candidate'}: Maximum limit of 5 project assignments reached for this candidate (5/5 allowed).`);
      return null;
    }

    // Check if candidate is ALREADY assigned or proposed to THIS project
    const alreadyAssignedToThisProject = (managerAssignments || []).some(
      (a) =>
        a &&
        String(a.projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim() === String(prj.id || projectId || '').toLowerCase().replace(/[\s_]/g, '-').trim() &&
        (String(a.professionalId || '') === String(cand.id || '') || String(a.professionalName || '').toLowerCase().trim() === String(cand.name || cand.pseudonym || '').toLowerCase().trim()) &&
        a.status !== 'Rejected' &&
        a.status !== 'Declined'
    );

    if (alreadyAssignedToThisProject) {
      toast.info(`${cand.name || cand.pseudonym || 'Candidate'} is already assigned to this project.`);
      return null;
    }

    if (projectAssignments.length >= 5) {
      toast.error('Cannot assign candidate: Maximum limit of 5 workforce members per project reached (5/5 assigned).');
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
      message: `Manager proposed assigning ${cand.name || cand.pseudonym} (${assignedRole}) to "${prj.name || prj.title}". Review and approve.`,
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
      partnerName: reqData.partnerName || partnerProfile?.name || 'Partner Company',
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
    if (selectedWorkforceList.length > 5) {
      toast.error('Maximum 5 workforce members can be assigned to a project.');
      return false;
    }
    if (selectedWorkforceList.length === 0) {
      toast.error('Please select at least 1 workforce member.');
      return false;
    }

    const normProjId = (id) => String(id || '').toLowerCase().replace(/[\s_]/g, '-').trim();
    const targetNormId = normProjId(projectId);

    const prj = projects.find((p) => normProjId(p.id) === targetNormId) || {
      id: projectId,
      name: 'Enterprise Project',
      title: 'Enterprise Project',
      client: 'Enterprise Client',
      duration: '6 Months',
    };

    if (prj && (prj.status === 'Rejected' || prj.status === 'REJECTED' || prj.stage === 'Rejected' || prj.status === 'Cancelled')) {
      toast.error('Cannot submit assignment request: This project has been rejected or cancelled.');
      return false;
    }

    // Filter out candidates already submitted for this project
    const uniqueCandidatesToSubmit = selectedWorkforceList.filter((cand) => {
      const cName = (cand.name || cand.pseudonym || '').toLowerCase().trim();
      const cId = cand.id ? String(cand.id).trim() : null;
      const alreadyQueued = (managerAssignments || []).some((a) => {
        if (!a) return false;
        const aProjId = normProjId(a.projectId);
        const aName = (a.professionalName || '').toLowerCase().trim();
        const aId = a.professionalId ? String(a.professionalId).trim() : null;
        const sameProject = aProjId === targetNormId;
        const sameCandidate = (cId && aId && cId === aId) || (cName && aName && cName === aName);
        return sameProject && sameCandidate && a.status !== 'Rejected' && a.status !== 'Declined';
      });
      return !alreadyQueued;
    });

    if (uniqueCandidatesToSubmit.length === 0) {
      toast.info('Selected candidate(s) are already submitted for this project assignment.');
      return false;
    }

    const newAssignments = uniqueCandidatesToSubmit.map((cand) => {
      return {
        id: `asg-req-${Date.now().toString().slice(-4)}-${cand.id || Math.random().toString().slice(-2)}`,
        professionalId: cand.id,
        professionalName: cand.name || cand.pseudonym,
        avatar: cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        role: cand.role || cand.assignedRole || 'Software Engineer',
        projectId: prj.id,
        projectName: prj.name || prj.title,
        client: prj.client || 'Enterprise Client',
        manager: prj.manager || managerProfile?.name || 'Organization Manager',
        partnerName: cand.source === 'Partner Company' ? (cand.partnerName || cand.partner || partnerProfile?.name || 'Partner Company') : 'Independent Freelancer',
        roleType: cand.source === 'Partner Company' ? 'Professional' : 'Freelancer',
        source: cand.source || (cand.partnerName ? 'Partner Company' : 'Freelancer'),
        skills: cand.skills || [],
        experience: cand.experience || '3+ years',
        hourlyRate: cand.hourlyRate || '$95/hr',
        workload: cand.workload || 0,
        assignedDate: new Date().toISOString().split('T')[0],
        status: 'Pending Assignment Approval',
        notes: notes,
        progress: 0,
        currentTask: 'Assignment Request created by Manager. Awaiting Company Admin sign-off.',
      };
    });

    setManagerAssignments((prev) => {
      const existingKeys = new Set(
        prev.map((a) => `${normProjId(a.projectId)}_${(a.professionalName || '').toLowerCase().trim()}`)
      );
      const uniqueNew = newAssignments.filter(
        (a) => !existingKeys.has(`${normProjId(a.projectId)}_${(a.professionalName || '').toLowerCase().trim()}`)
      );
      return [...uniqueNew, ...prev];
    });

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

    // Send recruitment notifications to targeted Workforce Members & Partner Companies
    newAssignments.forEach((asg) => {
      const wfNotif = {
        id: `wnotif-${Date.now()}-${Math.random().toString().slice(-4)}`,
        title: `Project Recruitment Offer: ${asg.role}`,
        message: `HR Manager selected you for project "${asg.projectName}". Please review project requirements, verify your availability, and Accept or Decline the offer.`,
        type: 'request',
        unread: true,
        time: 'Just now',
        link: '/workforce/assignments',
      };
      setWorkforceNotifications((prev) => [wfNotif, ...prev]);

      if (asg.source === 'Partner Company' || asg.roleType === 'Professional') {
        const pNotif = {
          id: `pnotif-${Date.now()}-${Math.random().toString().slice(-4)}`,
          title: `Professional Selected for Project: ${asg.projectName}`,
          message: `HR Manager selected ${asg.professionalName} (${asg.role}) for project "${asg.projectName}".`,
          type: 'assignment',
          unread: true,
          time: 'Just now',
          link: '/partner/workforce',
        };
        setPartnerNotifications((prev) => [pNotif, ...prev]);
      }
    });

    return newAssignments;
  };

  // =========================================================================
  // PROJECT EXECUTION: UPDATE PROJECT PROGRESS & MILESTONES
  // =========================================================================
  const updateProjectProgress = (projectId, { progress, milestoneId, taskUpdate }) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const numProg = progress !== undefined && !isNaN(Number(progress)) ? Number(progress) : p.progress;
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
            progress: 0,
            currentTask: 'Approved by Company Admin. Awaiting candidate response.',
            approvedDate: new Date().toISOString().split('T')[0],
          };
          return targetAsg;
        }
        return a;
      })
    );

    if (!targetAsg) return;

    // 1. Notify Workforce Member, Manager & Client
    const wfNotif = {
      id: `wnotif-${Date.now()}`,
      title: 'Project Assignment Approved by Admin',
      message: `Your assignment proposal on "${targetAsg.projectName}" as ${targetAsg.role} was approved by Admin. Please Accept or Decline the offer.`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/workforce/assignments',
    };
    setWorkforceNotifications((prev) => [wfNotif, ...prev]);

    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Assignment Proposal Approved by Admin',
      message: `Admin approved the assignment proposal for ${targetAsg.professionalName} on "${targetAsg.projectName}". Offer sent to talent.`,
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
    const targetIdStr = String(assignmentId || '').toLowerCase().trim();

    try {
      const numId = parseInt(targetIdStr.replace(/\D/g, ''), 10);
      if (numId && !isNaN(numId) && api?.workforce?.updateStatus) {
        api.workforce.updateStatus(numId, 'ACTIVE').catch((err) => console.warn('Backend workforce update status offline fallback:', err));
      }
    } catch { }

    setManagerAssignments((prev) => {
      const updated = (prev || []).map((a) => {
        if (!a) return a;
        const aIdStr = String(a.id || '').toLowerCase().trim();
        const aProjIdStr = String(a.projectId || '').toLowerCase().trim();
        if (aIdStr === targetIdStr || aProjIdStr === targetIdStr) {
          targetAsg = {
            ...a,
            status: 'Accepted',
            progress: a.progress || 0,
            currentTask: 'Architecture orientation and codebase setup in progress',
            acceptedDate: new Date().toISOString().split('T')[0],
          };
          return targetAsg;
        }
        return a;
      });
      try { localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(updated)); } catch { }
      return updated;
    });

    if (!targetAsg) return;

    // 1. Update candidate availability to 'Assigned' in central workforce and partner pools
    setWorkforce((prev) => {
      const updated = (prev || []).map((w) =>
        w && (String(w.id || '') === String(targetAsg.professionalId || '') || String(w.name || '').toLowerCase() === String(targetAsg.professionalName || '').toLowerCase())
          ? {
            ...w,
            availability: 'Assigned',
            workingStatus: 'Working',
            currentProject: targetAsg.projectName,
            assignedProject: targetAsg.projectName,
          }
          : w
      );
      try { localStorage.setItem('flexistaff_workforce', JSON.stringify(updated)); } catch { }
      return updated;
    });

    setPartnerWorkforce((prev) =>
      (prev || []).map((w) =>
        w && (String(w.id || '') === String(targetAsg.professionalId || '') || String(w.name || '').toLowerCase() === String(targetAsg.professionalName || '').toLowerCase())
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

    // 2. Update project status to 'In Progress' and add assigned resources
    const updateProjObj = (p) => {
      if (!p) return p;
      const pIdStr = String(p.id || '').toLowerCase().trim();
      const asgProjIdStr = String(targetAsg.projectId || '').toLowerCase().trim();
      const pTitleLower = (p.title || p.name || '').toLowerCase().trim();
      const asgTitleLower = (targetAsg.projectName || '').toLowerCase().trim();

      if (pIdStr === asgProjIdStr || (pTitleLower && asgTitleLower && (pTitleLower === asgTitleLower || pTitleLower.includes(asgTitleLower)))) {
        const nextAssigned = Math.max(1, (p.workforceAssigned || 0) + 1);
        const newResources = [
          ...(p.assignedResources || []).filter((r) => r && r.id !== targetAsg.professionalId && (r.name || '').toLowerCase() !== (targetAsg.professionalName || '').toLowerCase()),
          {
            id: targetAsg.professionalId || targetAsg.id,
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
          recentUpdate: `Workforce candidate accepted assignment. Project phase set to In Progress.`,
        };
      }
      return p;
    };

    setProjects((prev) => {
      const updated = (prev || []).map(updateProjObj);
      try { localStorage.setItem('flexistaff_projects', JSON.stringify(updated)); } catch { }
      return updated;
    });

    setPartnerProjects((prev) => {
      const updated = (prev || []).map(updateProjObj);
      try { localStorage.setItem('flexistaff_partner_projects', JSON.stringify(updated)); } catch { }
      return updated;
    });

    // 3. Notify Manager & Client
    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Talent Accepted Assignment Offer',
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
      message: `${targetAsg.professionalName} (${targetAsg.role}) accepted assignment offer for "${targetAsg.projectName}".`,
      type: 'project',
      unread: true,
      time: 'Just now',
      link: `/client/projects/${targetAsg.projectId}`,
    };
    setClientNotifications((prev) => [clientNotif, ...prev]);
  };

  const declineWorkforceAssignment = (assignmentId, reason = 'Schedule conflict / timeline mismatch') => {
    let targetAsg = null;
    const targetIdStr = String(assignmentId || '').toLowerCase().trim();

    try {
      const numId = parseInt(targetIdStr.replace(/\D/g, ''), 10);
      if (numId && !isNaN(numId) && api?.workforce?.updateStatus) {
        api.workforce.updateStatus(numId, 'REJECTED').catch((err) => console.warn('Backend workforce update status offline fallback:', err));
      }
    } catch { }

    setManagerAssignments((prev) => {
      const updated = (prev || []).map((a) => {
        if (!a) return a;
        const aIdStr = String(a.id || '').toLowerCase().trim();
        const aProjIdStr = String(a.projectId || '').toLowerCase().trim();

        if (aIdStr === targetIdStr || aProjIdStr === targetIdStr) {
          targetAsg = {
            ...a,
            status: 'Declined',
            progress: 0,
            declineReason: reason,
            rejectionReason: reason,
            currentTask: 'Assignment declined by candidate.',
          };
          return targetAsg;
        }
        return a;
      });
      try { localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(updated)); } catch { }
      return updated;
    });

    setFreelancerRequests((prev) => {
      const updated = (prev || []).map((r) => {
        if (!r) return r;
        const rIdStr = String(r.id || '').toLowerCase().trim();
        const rProjIdStr = String(r.projectId || '').toLowerCase().trim();
        if (rIdStr === targetIdStr || rProjIdStr === targetIdStr) {
          return { ...r, status: 'Declined', progress: 0, rejectionReason: reason };
        }
        return r;
      });
      try { localStorage.setItem('flexistaff_freelancer_requests', JSON.stringify(updated)); } catch { }
      return updated;
    });

    setPartnerWorkforceRequests((prev) => {
      const updated = (prev || []).map((pr) => {
        if (!pr) return pr;
        const prIdStr = String(pr.id || '').toLowerCase().trim();
        const prProjIdStr = String(pr.projectId || '').toLowerCase().trim();
        if (prIdStr === targetIdStr || prProjIdStr === targetIdStr) {
          return { ...pr, status: 'Declined', progress: 0, rejectionReason: reason };
        }
        return pr;
      });
      try { localStorage.setItem('flexistaff_partner_requests', JSON.stringify(updated)); } catch { }
      return updated;
    });

    if (targetAsg) {
      // Remove candidate from project assignedResources if present
      const cleanupProjectObj = (p) => {
        if (!p) return p;
        const pIdStr = String(p.id || '').toLowerCase().trim();
        const asgProjIdStr = String(targetAsg.projectId || '').toLowerCase().trim();
        if (pIdStr === asgProjIdStr) {
          const newResources = (p.assignedResources || []).filter(
            (r) => r && r.id !== targetAsg.professionalId && (r.name || '').toLowerCase() !== (targetAsg.professionalName || '').toLowerCase()
          );
          return {
            ...p,
            workforceAssigned: newResources.length,
            assignedResources: newResources,
          };
        }
        return p;
      };

      setProjects((prev) => {
        const updated = (prev || []).map(cleanupProjectObj);
        try { localStorage.setItem('flexistaff_projects', JSON.stringify(updated)); } catch { }
        return updated;
      });

      // Update candidate availability to 'Available' in central workforce and partner pools
      setWorkforce((prev) =>
        (prev || []).map((w) =>
          w && (String(w.id || '') === String(targetAsg.professionalId || '') || String(w.name || '').toLowerCase() === String(targetAsg.professionalName || '').toLowerCase())
            ? { ...w, availability: 'Available', workingStatus: 'Available', currentProject: 'None' }
            : w
        )
      );
    }

    // Notify Manager
    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Assignment Offer Declined by Candidate',
      message: `${targetAsg?.professionalName || 'Candidate'} declined assignment offer on "${targetAsg?.projectName || 'Project'}": ${reason}.`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/manager/assignments',
    };
    setManagerNotifications((prev) => [mgrNotif, ...prev]);
  };

  const rejectWorkforceAssignment = declineWorkforceAssignment;

  // Legacy alias for compatibility
  const assignWorkforce = (projectId, workforceId, assignedRole) => {
    return requestWorkforceAssignment(projectId, workforceId, assignedRole);
  };

  // Robust Flexible Workforce Progress & Sprint Updates
  const updateWorkforceProgress = (arg1, arg2, arg3) => {
    let targetAsgId = null;
    let targetProjectId = null;
    let numProgress = 0;
    let taskName = null;

    if (typeof arg1 === 'string' && (typeof arg2 === 'number' || !isNaN(Number(arg2)))) {
      // Signature: updateWorkforceProgress(asgId, 30)
      targetAsgId = arg1;
      numProgress = Number(arg2) || 0;
    } else if (typeof arg1 === 'string' && typeof arg2 === 'string' && arg3 && typeof arg3 === 'object') {
      // Signature: updateWorkforceProgress(projectId, workforceId, { progress, task })
      targetProjectId = arg1;
      targetAsgId = arg2;
      numProgress = Number(arg3.progress) || 0;
      taskName = arg3.task;
    } else if (arg1 && typeof arg1 === 'object') {
      targetAsgId = arg1.id;
      numProgress = Number(arg1.progress) || 0;
      taskName = arg1.task;
    }

    numProgress = Math.max(0, Math.min(100, Math.round(numProgress)));

    let updatedAsgObj = null;

    // 1. Update manager assignments
    setManagerAssignments((prev) => {
      const updated = (prev || []).map((a) => {
        if (!a) return a;
        const aIdStr = String(a.id || '').toLowerCase().trim();
        const aProjIdStr = String(a.projectId || '').toLowerCase().trim();
        const tIdStr = String(targetAsgId || '').toLowerCase().trim();
        const pIdStr = String(targetProjectId || '').toLowerCase().trim();

        const isMatch = (tIdStr && aIdStr === tIdStr) || (pIdStr && aProjIdStr === pIdStr);

        if (isMatch) {
          const isComplete = numProgress === 100;
          updatedAsgObj = {
            ...a,
            progress: numProgress,
            status: isComplete ? 'Completed' : (a.status === 'Completed' && numProgress < 100 ? 'Working' : (a.status === 'Pending Assignment Approval' ? 'Accepted' : a.status)),
            currentTask: taskName || (isComplete ? 'All project sprint deliverables completed.' : `Sprint execution progress updated to ${numProgress}%.`),
          };
          return updatedAsgObj;
        }
        return a;
      });
      try { localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(updated)); } catch { }
      return updated;
    });

    // 2. Update projects overall progress
    setProjects((prev) => {
      const updated = (prev || []).map((p) => {
        if (!p) return p;
        const pIdStr = String(p.id || '').toLowerCase().trim();
        const tIdStr = String(targetAsgId || '').toLowerCase().trim();
        const pIdMatch = pIdStr === tIdStr || (updatedAsgObj && String(updatedAsgObj.projectId || '').toLowerCase().trim() === pIdStr);

        if (pIdMatch) {
          const isComplete = numProgress === 100;
          return {
            ...p,
            progress: numProgress,
            status: isComplete ? 'Completed' : (numProgress > 0 ? 'In Progress' : p.status),
            stage: isComplete ? 'Completed' : (numProgress > 0 ? 'In Progress' : p.stage),
            recentUpdate: taskName || `Sprint execution progress updated to ${numProgress}%.`,
          };
        }
        return p;
      });
      try { localStorage.setItem('flexistaff_projects', JSON.stringify(updated)); } catch { }
      return updated;
    });

    // 3. Update workforce user profile state if applicable
    setWorkforceUserProfile((prev) => ({
      ...prev,
      currentAssignment: {
        ...(prev.currentAssignment || {}),
        currentTask: taskName || `Sprint progress ${numProgress}%`,
        progress: numProgress,
        status: numProgress === 100 ? 'Completed' : 'Working',
        lastUpdated: 'Just now',
      },
    }));
  };

  // =========================================================================
  // FREELANCER REGISTRATION & VERIFICATION (COMMON PROFESSIONAL POOL)
  // =========================================================================
  const registerFreelancer = (formData) => {
    const freelancers = (workforce || []).filter(
      (w) => w.roleType === 'Freelancer' || w.source === 'Freelancer Registration' || w.professionalType === 'FREELANCER'
    );
    if (freelancers.length >= 5) {
      toast.error('Maximum limit of 5 Freelance workforce members reached (5/5 allowed).');
      return null;
    }

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
      location: formData.location ? (typeof formData.location === 'string' ? formData.location : `${formData.location.city || 'Bengaluru'}, ${formData.location.state || 'Karnataka'}, ${formData.location.country || 'India'}`) : 'Bengaluru, India',
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

  const updateProjectHeadcount = (projectId, newHeadcount) => {
    const num = Math.max(1, Number(newHeadcount) || 1);
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId || String(p.id) === String(projectId) || (typeof p.id === 'number' && Number(projectId) === p.id)) {
          const reqs = Array.isArray(p.requirements) && p.requirements.length > 0
            ? p.requirements.map((r, idx) => (idx === 0 ? { ...r, required: num } : r))
            : [{ role: p.category || 'Enterprise Software Engineering', required: num, assigned: p.workforceAssigned || 0, skills: p.techStack || '' }];
          return { ...p, workforceRequired: num, requirements: reqs };
        }
        return p;
      })
    );
  };

  const updateWorkforceMember = (idOrEmail, updatedFields) => {
    if (!idOrEmail && !updatedFields) return;

    const targetStr = String(idOrEmail || '').toLowerCase().trim();
    const targetEmail = String(updatedFields.email || targetStr).toLowerCase().trim();
    const targetName = String(updatedFields.name || targetStr).toLowerCase().trim();

    const matchesMember = (w) => {
      if (!w) return false;
      const wId = String(w.id || '').toLowerCase().trim();
      const wNumericId = String(w.numericId || '').toLowerCase().trim();
      const wEmail = String(w.email || '').toLowerCase().trim();
      const wName = String(w.name || w.pseudonym || '').toLowerCase().trim();

      if (targetStr && (wId === targetStr || wNumericId === targetStr)) return true;
      if (targetEmail && wEmail && wEmail === targetEmail) return true;
      if (targetName && wName && (wName === targetName || wName.includes(targetName) || targetName.includes(wName))) return true;
      return false;
    };

    // 1. Update central workforce state
    setWorkforce((prevWorkforce) => {
      let found = false;
      const updatedList = (prevWorkforce || []).map((w) => {
        if (matchesMember(w)) {
          found = true;
          const merged = { ...w, ...updatedFields };
          if (updatedFields.title) merged.role = updatedFields.title;
          if (updatedFields.role) merged.title = updatedFields.role;
          if (updatedFields.name) {
            merged.name = updatedFields.name;
            merged.pseudonym = updatedFields.name;
          }
          return merged;
        }
        return w;
      });

      const newList = found
        ? updatedList
        : [
          {
            id: updatedFields.id || targetStr || `wf-${Date.now()}`,
            name: updatedFields.name || 'Specialist',
            pseudonym: updatedFields.name || 'Specialist',
            title: updatedFields.title || updatedFields.role || 'Software Engineer',
            role: updatedFields.role || updatedFields.title || 'Software Engineer',
            email: updatedFields.email || '',
            phone: updatedFields.phone || '',
            location: updatedFields.location || 'India',
            experience: updatedFields.experience || '3+ Years',
            hourlyRate: updatedFields.hourlyRate || '$85/hr',
            skills: Array.isArray(updatedFields.skills)
              ? updatedFields.skills
              : (updatedFields.skills ? String(updatedFields.skills).split(',').map((s) => s.trim()) : ['React.js', 'Node.js']),
            bio: updatedFields.bio || '',
            status: updatedFields.availability || 'Available',
            availability: updatedFields.availability || 'Available',
            approvalStatus: updatedFields.approvalStatus || 'Approved',
            verificationStatus: updatedFields.verificationStatus || 'Approved',
            accountStatus: updatedFields.accountStatus || 'Active',
            avatar: updatedFields.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            ...updatedFields,
          },
          ...(prevWorkforce || []),
        ];

      try {
        localStorage.setItem('flexistaff_workforce', JSON.stringify(newList));
      } catch { }
      return newList;
    });

    // 2. Update partnerWorkforce state
    setPartnerWorkforce((prevPartnerWorkforce) => {
      const updatedList = (prevPartnerWorkforce || []).map((w) => {
        if (matchesMember(w)) {
          const merged = { ...w, ...updatedFields };
          if (updatedFields.title) merged.role = updatedFields.title;
          if (updatedFields.role) merged.title = updatedFields.role;
          if (updatedFields.name) {
            merged.name = updatedFields.name;
            merged.pseudonym = updatedFields.name;
          }
          return merged;
        }
        return w;
      });

      try {
        localStorage.setItem('flexistaff_partner_workforce', JSON.stringify(updatedList));

        const regStr = localStorage.getItem('flexistaff_registered_users');
        if (regStr) {
          let regList = JSON.parse(regStr);
          regList = regList.map((u) => {
            if (matchesMember(u)) {
              return {
                ...u,
                name: updatedFields.name || u.name,
                fullName: updatedFields.name || u.fullName,
                email: (updatedFields.email || u.email || '').toLowerCase().trim(),
                password: updatedFields.password || updatedFields.tempPassword || u.password,
              };
            }
            return u;
          });
          localStorage.setItem('flexistaff_registered_users', JSON.stringify(regList));
        }
      } catch { }
      return updatedList;
    });

    // 3. Update managerAssignments state so assigned squad cards display updated name
    setManagerAssignments((prevAssignments) => {
      const updatedAsgs = (prevAssignments || []).map((asg) => {
        if (!asg) return asg;
        const asgId = String(asg.professionalId || asg.workforceId || asg.id || '').toLowerCase().trim();
        const asgEmail = String(asg.email || asg.professionalEmail || '').toLowerCase().trim();
        const asgName = String(asg.professionalName || asg.name || '').toLowerCase().trim();

        if (
          (targetStr && asgId === targetStr) ||
          (targetEmail && asgEmail && asgEmail === targetEmail) ||
          (targetName && asgName && (asgName === targetName || asgName.includes(targetName)))
        ) {
          return {
            ...asg,
            professionalName: updatedFields.name || asg.professionalName,
            name: updatedFields.name || asg.name,
            role: updatedFields.title || updatedFields.role || asg.role,
          };
        }
        return asg;
      });

      try {
        localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(updatedAsgs));
      } catch { }
      return updatedAsgs;
    });

    // 4. Update projects state (assignedResources) so project details & squad components display updated name
    setProjects((prevProjects) => {
      const updatedProjects = (prevProjects || []).map((p) => {
        if (!p || !Array.isArray(p.assignedResources)) return p;
        let pChanged = false;
        const newResources = p.assignedResources.map((res) => {
          if (!res) return res;
          const rId = String(res.id || res.professionalId || '').toLowerCase().trim();
          const rEmail = String(res.email || res.professionalEmail || '').toLowerCase().trim();
          const rName = String(res.name || res.professionalName || '').toLowerCase().trim();

          if (
            (targetStr && rId === targetStr) ||
            (targetEmail && rEmail && rEmail === targetEmail) ||
            (targetName && rName && (rName === targetName || rName.includes(targetName)))
          ) {
            pChanged = true;
            return {
              ...res,
              name: updatedFields.name || res.name,
              professionalName: updatedFields.name || res.professionalName,
              role: updatedFields.title || updatedFields.role || res.role,
            };
          }
          return res;
        });
        return pChanged ? { ...p, assignedResources: newResources } : p;
      });

      try {
        localStorage.setItem('flexistaff_projects', JSON.stringify(updatedProjects));
      } catch { }
      return updatedProjects;
    });

    // 5. Update workforceUserProfile state
    setWorkforceUserProfile((prevProfile) => {
      if (!prevProfile || matchesMember(prevProfile) || (targetEmail && prevProfile.email && targetEmail === prevProfile.email.toLowerCase())) {
        return {
          ...prevProfile,
          ...updatedFields,
          name: updatedFields.name || prevProfile?.name,
          title: updatedFields.title || updatedFields.role || prevProfile?.title,
          role: updatedFields.role || updatedFields.title || prevProfile?.role,
        };
      }
      return prevProfile;
    });

    // 6. Sync active session in localStorage if logged in user is this employee
    try {
      const savedUserStr = localStorage.getItem('flexistaff_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && matchesMember(savedUser)) {
          const updatedUser = {
            ...savedUser,
            ...updatedFields,
            name: updatedFields.name || savedUser.name,
            fullName: updatedFields.name || savedUser.fullName,
            title: updatedFields.title || updatedFields.role || savedUser.title,
            role: updatedFields.role || updatedFields.title || savedUser.role,
          };
          localStorage.setItem('flexistaff_user', JSON.stringify(updatedUser));
          window.dispatchEvent(new CustomEvent('auth_change', { detail: updatedUser }));
        }
      }
    } catch { }

    // 7. Sync flexistaff_registered_users in localStorage
    try {
      const regStr = localStorage.getItem('flexistaff_registered_users');
      if (regStr) {
        const regList = JSON.parse(regStr);
        if (Array.isArray(regList)) {
          const updatedReg = regList.map((u) => {
            if (matchesMember(u)) {
              return {
                ...u,
                ...updatedFields,
                name: updatedFields.name || u.name,
                fullName: updatedFields.name || u.fullName,
              };
            }
            return u;
          });
          localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
        }
      }
    } catch { }

    // 8. PERSIST UPDATE TO SPRING BOOT REST API / POSTGRESQL DATABASE
    const rawId = idOrEmail || updatedFields.id || updatedFields.numericId || updatedFields.userId;
    const numericId = Number(String(rawId || '').replace(/\D/g, ''));

    if (!isNaN(numericId) && numericId > 0) {
      let expYears = 3;
      if (updatedFields.experience) {
        const parsedExp = parseInt(String(updatedFields.experience), 10);
        if (!isNaN(parsedExp)) expYears = parsedExp;
      }

      let hourlyRateNum = null;
      if (updatedFields.hourlyRate) {
        const cleanedRate = String(updatedFields.hourlyRate).replace(/[^0-9.]/g, '');
        if (cleanedRate) hourlyRateNum = parseFloat(cleanedRate);
      }

      const backendPayload = {
        name: updatedFields.name,
        fullName: updatedFields.name,
        email: updatedFields.email,
        phone: updatedFields.phone,
        title: updatedFields.title || updatedFields.role,
        skills: Array.isArray(updatedFields.skills) ? updatedFields.skills.join(', ') : updatedFields.skills,
        bio: updatedFields.bio,
        experienceYears: expYears,
        hourlyRate: hourlyRateNum,
        availabilityStatus: updatedFields.availability || updatedFields.status,
      };

      try {
        api.freelancers.update(numericId, backendPayload).then((res) => {
          if (res && res.success) {
            console.log('Successfully persisted workforce profile name & details to PostgreSQL database:', res);
          }
        });
        api.users.updateProfile(numericId, backendPayload);
      } catch (apiErr) {
        console.warn('Could not persist workforce update to backend API:', apiErr);
      }
    }
  };

  const updateWorkforceUserProfile = (data) => {
    setWorkforceUserProfile((prev) => {
      const updated = { ...prev, ...data };
      const targetId = updated.id || prev?.id;
      const targetEmail = updated.email || prev?.email;
      const targetName = updated.name || prev?.name;

      updateWorkforceMember(targetId || targetEmail || targetName, updated);
      return updated;
    });
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



  const updateClient = (id, updatedData) => {
    setClients((prev) =>
      prev.map((cli) => (cli.id === id ? { ...cli, ...updatedData } : cli))
    );
  };

  // Partner Actions
  const addPartner = async (partner) => {
    const specialtiesArray = Array.isArray(partner.specialties)
      ? partner.specialties
      : String(partner.specialties || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

    const payload = {
      companyName: partner.companyName || partner.name || 'Partner Organization',
      name: partner.name || partner.companyName || 'Partner Organization',
      contactPerson: partner.contactPerson || 'Contact Representative',
      email: partner.email || '',
      phone: partner.phone || '',
      location: partner.location || partner.city || 'India',
      industry: partner.industry || 'IT Staffing & Consulting',
      tier: partner.tier || 'Strategic Partner',
      specialties: Array.isArray(specialtiesArray) ? specialtiesArray.join(', ') : (specialtiesArray || ''),
      status: partner.status || 'Active',
      suppliedProfessionals: Number(partner.suppliedProfessionals) || 0,
      password: partner.tempPassword || partner.password || 'Password123!',
      tempPassword: partner.tempPassword || partner.password || 'Password123!',
    };

    let backendPartner = null;
    try {
      const res = await api.partners.register(payload);
      if (res && (res.success || res.data || res.id)) {
        backendPartner = res.data || res;
      }
      await refreshPartners();
    } catch (err) {
      console.warn('Could not persist new partner in backend API:', err);
    }

    const partnerId = backendPartner?.id || partner.id || Date.now();
    const newPartner = {
      ...partner,
      id: partnerId,
      numericId: partnerId,
      userId: backendPartner?.userId || partnerId,
      name: backendPartner?.companyName || backendPartner?.name || payload.name,
      companyName: backendPartner?.companyName || backendPartner?.name || payload.companyName,
      contactPerson: backendPartner?.contactPerson || payload.contactPerson,
      email: backendPartner?.email || payload.email,
      phone: backendPartner?.phone || payload.phone,
      location: backendPartner?.location || payload.location,
      city: backendPartner?.location || payload.location,
      tier: backendPartner?.tier || payload.tier,
      industry: backendPartner?.industry || payload.industry,
      specialties: specialtiesArray,
      status: backendPartner?.status || payload.status,
      joinedDate: new Date().toISOString().split('T')[0],
      suppliedProfessionals: Number(backendPartner?.suppliedProfessionals ?? payload.suppliedProfessionals),
      activePlacements: 0,
      availabilityRate: '100%',
      rating: 4.8,
    };

    setPartners((prev) => {
      const filtered = (prev || []).filter((p) => p && p.id !== newPartner.id && (p.email || '').toLowerCase() !== (newPartner.email || '').toLowerCase());
      const updated = [newPartner, ...filtered];
      try {
        localStorage.setItem('flexistaff_partners', JSON.stringify(updated));
      } catch { }
      return updated;
    });

    // Also register user credentials for partner company login
    if (newPartner.email) {
      try {
        const regStr = localStorage.getItem('flexistaff_registered_users');
        let regList = regStr ? JSON.parse(regStr) : [];
        if (!Array.isArray(regList)) regList = [];

        const newUserObj = {
          id: partnerId,
          email: newPartner.email,
          password: partner.tempPassword || partner.password || 'Password123!',
          role: 'Partner Company',
          name: newPartner.contactPerson,
          companyName: newPartner.name,
        };

        const existingIdx = regList.findIndex(
          (u) => u && u.email && u.email.toLowerCase() === newPartner.email.toLowerCase()
        );
        if (existingIdx >= 0) {
          regList[existingIdx] = newUserObj;
        } else {
          regList.push(newUserObj);
        }
        localStorage.setItem('flexistaff_registered_users', JSON.stringify(regList));
      } catch { }
    }

    addActivity({
      user: adminProfile?.name || 'System Admin',
      action: 'Registered new staffing partner',
      target: newPartner.name,
      targetType: 'partner',
    });

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Partner Organization Registered',
        message: `Partner company "${newPartner.name}" (${newPartner.contactPerson}) was added successfully.`,
        type: 'request',
        unread: true,
        time: 'Just now',
        link: '/admin/partners',
      },
      ...prev,
    ]);

    return newPartner;
  };

  const updatePartner = async (id, updatedData) => {
    const rawNum = typeof id === 'number' ? id : Number(String(id).replace(/\D/g, ''));
    const targetDbId = !isNaN(rawNum) && rawNum > 0 ? rawNum : null;

    if (targetDbId) {
      try {
        const specialtiesArr = updatedData.specialties
          ? (Array.isArray(updatedData.specialties)
            ? updatedData.specialties
            : String(updatedData.specialties).split(',').map((s) => s.trim()).filter(Boolean))
          : undefined;

        await api.partners.update(targetDbId, {
          companyName: updatedData.companyName || updatedData.name,
          name: updatedData.name || updatedData.companyName,
          contactPerson: updatedData.contactPerson,
          email: updatedData.email,
          phone: updatedData.phone,
          location: updatedData.location || updatedData.city,
          industry: updatedData.industry,
          tier: updatedData.tier,
          specialties: specialtiesArr ? specialtiesArr.join(', ') : undefined,
          status: updatedData.status,
          suppliedProfessionals: updatedData.suppliedProfessionals,
        });
        await refreshPartners();
      } catch (err) {
        console.warn(`Could not update partner ${targetDbId} in backend API:`, err);
      }
    }

    const newCompanyName = updatedData.companyName || updatedData.name;

    setPartners((prev) => {
      const updated = (prev || []).map((prt) => {
        if (!prt) return prt;
        if (prt.id === id || String(prt.id) === String(id) || (targetDbId && prt.id === targetDbId) || (updatedData.email && prt.email === updatedData.email)) {
          const merged = { ...prt, ...updatedData };
          if (newCompanyName) {
            merged.companyName = newCompanyName;
            merged.name = newCompanyName;
          }
          if (updatedData.specialties) {
            merged.specialties = Array.isArray(updatedData.specialties)
              ? updatedData.specialties
              : String(updatedData.specialties).split(',').map((s) => s.trim()).filter(Boolean);
          }
          return merged;
        }
        return prt;
      });
      try {
        localStorage.setItem('flexistaff_partners', JSON.stringify(updated));
      } catch { }
      return updated;
    });

    // When the Partner Company name is changed, update all related workforce records
    if (newCompanyName) {
      setWorkforce((prevWf) => {
        const updatedWf = (prevWf || []).map((w) => {
          if (!w) return w;
          const matchById = targetDbId && (w.partnerCompanyId === targetDbId || String(w.partnerCompanyId) === String(targetDbId));
          const matchByParamId = String(w.partnerCompanyId) === String(id);
          if (matchById || matchByParamId) {
            return {
              ...w,
              partnerCompany: newCompanyName,
              partnerName: newCompanyName,
            };
          }
          return w;
        });
        try {
          localStorage.setItem('flexistaff_workforce', JSON.stringify(updatedWf));
        } catch { }
        return updatedWf;
      });
    }
  };

  const deletePartner = async (id) => {
    const rawNum = typeof id === 'number' ? id : Number(String(id).replace(/\D/g, ''));
    const targetDbId = !isNaN(rawNum) && rawNum > 0 ? rawNum : null;

    if (targetDbId) {
      try {
        await api.partners.delete(targetDbId);
        await refreshPartners();
      } catch (err) {
        console.warn(`Could not delete partner ${targetDbId} in backend API:`, err);
      }
    }

    setPartners((prev) => {
      const updated = (prev || []).filter((prt) => prt && prt.id !== id && String(prt.id) !== String(id) && (!targetDbId || prt.id !== targetDbId) && prt.email !== id);
      try {
        localStorage.setItem('flexistaff_partners', JSON.stringify(updated));
      } catch { }
      return updated;
    });
  };

  const clearPartners = () => {
    setPartners([]);
    try {
      localStorage.removeItem('flexistaff_partners');
    } catch { }
  };

  // Manager Lifecycle & Project Reassignment Actions
  const addManager = async (managerData) => {
    try {
      const res = await api.managers.create(managerData);
      let newManager = null;
      if (res && (res.success || res.data)) {
        const d = res.data || res;
        newManager = {
          ...d,
          id: d.userId || d.id,
          numericId: d.userId || d.id,
          employeeId: d.employeeId || d.userId || d.id,
          password: managerData.password || managerData.tempPassword || 'Manager@123',
        };
      } else if (res && !res.success && res.error) {
        console.warn('Backend API manager create failed:', res.error);
        throw new Error(res.error);
      } else {
        const generatedId = Date.now();
        newManager = {
          ...managerData,
          id: generatedId,
          numericId: generatedId,
          employeeId: String(generatedId),
          status: managerData.status || managerData.accountStatus || 'Active',
          password: managerData.password || managerData.tempPassword || 'Manager@123',
        };
      }

      if (newManager) {
        setManagers((prev) => {
          const updated = [newManager, ...(prev || []).filter((m) => m && m.id !== newManager.id && m.email !== newManager.email)];
          try {
            localStorage.setItem('flexistaff_managers', JSON.stringify(updated));
          } catch { }
          return updated;
        });
        setManagerProfile(newManager);

        try {
          const regStr = localStorage.getItem('flexistaff_registered_users');
          const regList = regStr ? JSON.parse(regStr) : [];
          const managerUser = {
            id: newManager.id,
            name: newManager.name,
            email: newManager.email,
            loginEmail: newManager.loginEmail || newManager.email,
            role: 'Manager',
            password: newManager.password || 'Manager@123',
            status: newManager.status || 'Active',
            phone: newManager.phone,
            department: newManager.department,
            jobTitle: newManager.jobTitle,
          };
          const updatedReg = [managerUser, ...(regList || []).filter((u) => u && u.email !== newManager.email)];
          localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
        } catch { }

        addActivity({
          user: adminProfile?.name || 'System Administrator',
          action: 'Registered new HR Manager',
          target: `${newManager.name} (ID: #${newManager.employeeId})`,
          targetType: 'manager',
        });

        return newManager;
      }
    } catch (err) {
      console.error('Failed to register HR Manager:', err);
      throw err;
    }
  };

  const updateManager = async (id, updatedData) => {
    const rawNum = typeof id === 'number' ? id : Number(String(id).replace(/\D/g, ''));
    const targetId = !isNaN(rawNum) && rawNum > 0 ? rawNum : id;
    let updated = null;
    try {
      const res = await api.managers.update(targetId, updatedData);
      if (res && (res.success || res.data)) {
        const d = res.data || res;
        updated = {
          ...d,
          id: d.userId || d.id,
          numericId: d.userId || d.id,
          employeeId: d.employeeId || d.userId || d.id,
        };
      }
    } catch (err) {
      console.warn('Failed to update manager via API:', err);
    }

    setManagers((prev) => {
      const list = (prev || []).map((mng) => {
        if (mng.id === id || mng.id === targetId || mng.userId === targetId) {
          return updated || { ...mng, ...updatedData };
        }
        return mng;
      });
      try {
        localStorage.setItem('flexistaff_managers', JSON.stringify(list));
      } catch { }
      return list;
    });

    if (managerProfile && (managerProfile.id === id || managerProfile.id === targetId || managerProfile.userId === targetId)) {
      setManagerProfile(updated || { ...managerProfile, ...updatedData });
    }
    return updated;
  };

  const updateManagerStatus = async (id, newStatus, reason = '') => {
    const rawNum = typeof id === 'number' ? id : Number(String(id).replace(/\D/g, ''));
    const targetId = !isNaN(rawNum) && rawNum > 0 ? rawNum : id;
    let updated = null;
    try {
      const res = await api.managers.updateStatus(targetId, newStatus, reason);
      if (res && (res.success || res.data)) {
        const d = res.data || res;
        updated = {
          ...d,
          id: d.userId || d.id,
          numericId: d.userId || d.id,
          employeeId: d.employeeId || d.userId || d.id,
        };
      }
    } catch (err) {
      console.warn('Failed to update manager status via API:', err);
    }

    setManagers((prev) => {
      const list = (prev || []).map((mng) => {
        if (mng.id === id || mng.id === targetId || mng.userId === targetId) {
          return updated || { ...mng, status: newStatus, statusReason: reason };
        }
        return mng;
      });
      try {
        localStorage.setItem('flexistaff_managers', JSON.stringify(list));
      } catch { }
      return list;
    });

    addActivity({
      user: 'Company Admin',
      action: `Changed Manager status to ${newStatus}`,
      target: updated?.name || 'Manager',
      targetType: 'manager',
    });
    return updated;
  };

  const deleteManager = async (id) => {
    const rawNum = typeof id === 'number' ? id : Number(String(id).replace(/\D/g, ''));
    const targetId = !isNaN(rawNum) && rawNum > 0 ? rawNum : id;
    try {
      await api.managers.delete(targetId);
    } catch (err) {
      console.warn('Failed to delete manager via API:', err);
    }
    setManagers((prev) => {
      const list = (prev || []).filter((mng) => mng.id !== id && mng.id !== targetId && mng.userId !== targetId);
      try {
        localStorage.setItem('flexistaff_managers', JSON.stringify(list));
      } catch { }
      return list;
    });
  };

  const clearManagers = () => {
    setManagers([]);
    try {
      localStorage.removeItem('flexistaff_managers');
    } catch { }
  };

  const resetAllData = () => {
    setClients([]);
    setPartners([]);
    setManagers([]);
    setWorkforce([]);
    setProjects([]);
    setActivities([]);
    setNotifications([]);
    setPartnerProjects([]);
    setPartnerWorkforce([]);
    setPartnerWorkforceRequests([]);
    setPartnerNotifications([]);
    setPartnerActivities([]);
    setPartnerSupportTickets([]);
    setManagerAssignments([]);
    setManagerNotifications([]);
    setFreelancerRequests([]);
    setWorkforceNotifications([]);
    setClientNotifications([]);
    setSupportTickets([]);
    setFreelancerApplications([]);

    try {
      localStorage.removeItem('flexistaff_clients');
      localStorage.removeItem('flexistaff_partners');
      localStorage.removeItem('flexistaff_managers');
      localStorage.removeItem('flexistaff_workforce');
      localStorage.removeItem('flexistaff_projects');
      localStorage.removeItem('flexistaff_partner_projects');
      localStorage.removeItem('flexistaff_partner_workforce');
      localStorage.removeItem('flexistaff_manager_assignments');
      localStorage.removeItem('flexistaff_support_tickets');
      localStorage.removeItem('flexistaff_freelancer_applications');
    } catch { }
  };

  const reassignProjectManager = (projectId, newManagerId, reason = '') => {
    const targetManager = managers.find((m) => m.id === newManagerId || m.name === newManagerId);
    if (!targetManager) return false;

    const numId = typeof projectId === 'number' ? projectId : parseInt(String(projectId).replace(/\D/g, ''), 10);
    const targetMgrId = targetManager.id || targetManager.userId || targetManager.numericId;

    if (numId && !isNaN(numId) && api?.projects?.update && targetMgrId) {
      api.projects.update(numId, { managerId: targetMgrId }).catch((err) => {
        console.warn('Could not update project manager in PostgreSQL:', err);
      });
    }

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
      partnerName: member.partnerName || (member.roleType === 'Freelancer' ? 'Freelancer Application' : 'QuantumTech Staffing Solutions'),
      approvalStatus: member.approvalStatus || 'Approved',
      status: member.approvalStatus === 'Pending Review' ? 'Pending Review' : (member.availability === 'Busy' ? 'Assigned' : 'Available'),
      avatar:
        member.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    };
    setWorkforce((prev) => [newMember, ...prev]);

    addActivity({
      user: adminProfile?.name || 'System Administrator',
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
      user: adminProfile?.name || 'System Administrator',
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
      user: adminProfile?.name || 'System Administrator',
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
      partnerName: 'Freelancer Application',
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

  const addPartnerProfessional = (profData) => {
    const partnerEmployees = (partnerWorkforce || []).filter(
      (w) => w.roleType === 'Professional' || w.source === 'Partner Company' || Boolean(w.partnerCompany || w.partner) || w.professionalType === 'PARTNER_EMPLOYEE'
    );
    if (partnerEmployees.length >= 5) {
      toast.error('Maximum limit of 5 Partner Employee workforce members reached (5/5 allowed). Registration is blocked.');
      return null;
    }
    const newId = `WF-${Date.now().toString().slice(-4)}`;
    const skillsList = Array.isArray(profData.skills)
      ? profData.skills
      : String(profData.skills || '')
        .split(/[,+]/)
        .map((s) => s.trim())
        .filter(Boolean);

    const resolvedPartnerCoName =
      profData.partnerCompany ||
      profData.partnerName ||
      profData.partner ||
      profData.companyName ||
      partnerProfile?.companyName ||
      partnerProfile?.name ||
      'Partner Company';

    let resolvedPartnerCoId =
      profData.partnerCompanyId ||
      partnerProfile?.id ||
      partnerProfile?.numericId ||
      partnerProfile?.userId;

    if (resolvedPartnerCoName && (!resolvedPartnerCoId || isNaN(Number(resolvedPartnerCoId)))) {
      const matchP = (partners || []).find((p) =>
        (p.companyName && p.companyName.toLowerCase() === resolvedPartnerCoName.toLowerCase()) ||
        (p.name && p.name.toLowerCase() === resolvedPartnerCoName.toLowerCase())
      );
      if (matchP && matchP.id) {
        resolvedPartnerCoId = matchP.id;
      }
    }

    const newProf = {
      id: newId,
      name: profData.name,
      pseudonym: profData.pseudonym || profData.name,
      role: profData.role || profData.title || 'Full-Stack Developer',
      title: profData.title || profData.role || 'Full-Stack Developer',
      roleCategory: profData.roleCategory || 'Full-Stack Engineering',
      partner: resolvedPartnerCoName,
      partnerName: resolvedPartnerCoName,
      partnerCompany: resolvedPartnerCoName,
      companyName: resolvedPartnerCoName,
      company: resolvedPartnerCoName,
      partnerCompanyId: resolvedPartnerCoId,
      roleType: 'Professional',
      professionalType: 'PARTNER_EMPLOYEE',
      source: 'Partner Company',
      userType: 'PARTNER_EMPLOYEE',
      employmentType: 'Partner Company Employee',
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
      phone: profData.phone || '+91 98765 43210',
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

    setPartnerWorkforce((prev) => {
      const updated = [newProf, ...prev];
      try {
        localStorage.setItem('flexistaff_partner_workforce', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setWorkforce((prev) => {
      const updated = [newProf, ...prev];
      try {
        localStorage.setItem('flexistaff_workforce', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Save to flexistaff_registered_users so employee can log in immediately
    try {
      const regStr = localStorage.getItem('flexistaff_registered_users');
      let regList = regStr ? JSON.parse(regStr) : [];
      const userEmailLower = (newProf.email || '').toLowerCase().trim();
      const updatedReg = regList.filter((u) => u && (u.email || '').toLowerCase().trim() !== userEmailLower);
      const userPassword = profData.password || profData.tempPassword || 'Workforce@123';

      const newRegUser = {
        id: newProf.id,
        name: newProf.name,
        fullName: newProf.name,
        email: userEmailLower,
        password: userPassword,
        phone: newProf.phone,
        role: 'Workforce',
        roleType: 'Professional',
        professionalType: 'PARTNER_EMPLOYEE',
        source: 'Partner Company',
        userType: 'PARTNER_EMPLOYEE',
        employmentType: 'Partner Company Employee',
        portalPath: '/workforce/dashboard',
        companyName: resolvedPartnerCoName,
        company: resolvedPartnerCoName,
        partnerCompany: resolvedPartnerCoName,
        partnerName: resolvedPartnerCoName,
        partner: resolvedPartnerCoName,
        partnerCompanyId: resolvedPartnerCoId,
        title: newProf.title,
        avatar: newProf.avatar,
      };
      updatedReg.push(newRegUser);

      // Register clean username alias (e.g. name with dots)
      if (newProf.name) {
        const cleanName = newProf.name.toLowerCase().replace(/\s+/g, '.');
        const aliasEmail = `${cleanName}@flexistaff.com`;
        if (aliasEmail !== userEmailLower) {
          updatedReg.push({
            ...newRegUser,
            email: aliasEmail,
          });
        }
      }

      localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
    } catch { }

    // Synchronize to Spring Boot REST Backend
    try {
      const numRate = parseFloat(String(newProf.hourlyRate || '85').replace(/[^0-9.]/g, '')) || 85;
      const numExp = parseInt(String(newProf.experience || '3').replace(/[^0-9]/g, ''), 10) || 3;
      const numPartnerCoId = Number(resolvedPartnerCoId);
      api.freelancers.register({
        fullName: newProf.name,
        email: newProf.email,
        password: profData.password || profData.tempPassword || 'Workforce@123',
        phone: newProf.phone || '+91 98765 43210',
        title: newProf.title || 'Software Specialist',
        skills: Array.isArray(newProf.skills) ? newProf.skills.join(', ') : String(newProf.skills || ''),
        bio: newProf.bio || '',
        hourlyRate: numRate,
        experienceYears: numExp,
        availabilityStatus: newProf.availability || 'Available',
        partnerCompanyId: !isNaN(numPartnerCoId) && numPartnerCoId > 0 ? numPartnerCoId : null,
      }).catch((err) => {
        console.warn('Backend freelancer registration async notice:', err);
      });
    } catch (apiErr) {
      console.warn('Backend API registration call skipped:', apiErr);
    }

    // Send activity & notifications
    addActivity({
      title: 'New Specialist Registered',
      description: `${partnerProfile?.name || 'Partner Company'} added ${newProf.name} (${newProf.role}) to workforce roster.`,
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


  const deleteWorkforceMember = (idOrMember) => {
    // 1. Identify member object or ID
    const memberObj = (idOrMember && typeof idOrMember === 'object') ? idOrMember : null;
    const rawId = memberObj ? (memberObj.id ?? memberObj.userId ?? memberObj.numericId) : idOrMember;

    // Locate target workforce member if available in state
    const targetWf = memberObj ||
      (workforce || []).find((w) => w && (
        w.id === rawId ||
        String(w.id) === String(rawId) ||
        (w.userId && String(w.userId) === String(rawId)) ||
        (w.numericId && String(w.numericId) === String(rawId))
      )) ||
      (partnerWorkforce || []).find((w) => w && (
        w.id === rawId ||
        String(w.id) === String(rawId) ||
        (w.userId && String(w.userId) === String(rawId)) ||
        (w.numericId && String(w.numericId) === String(rawId))
      ));

    const targetIdStr = String(rawId || '').trim();
    const targetNumericId = targetWf?.numericId || targetWf?.id || memberObj?.numericId || memberObj?.id || (!isNaN(rawId) ? Number(rawId) : null);
    const targetUserId = targetWf?.userId || memberObj?.userId || (targetWf?.user?.id) || null;
    const targetNameLower = targetWf ? String(targetWf.name || targetWf.pseudonym || '').toLowerCase().trim() : '';
    const targetEmailLower = targetWf ? String(targetWf.email || '').toLowerCase().trim() : '';

    // Record tombstones in localStorage so reloading or re-fetching NEVER resurrects this workforce
    try {
      const curDelWf = JSON.parse(localStorage.getItem('flexistaff_deleted_workforce') || '[]');
      const newDelWf = new Set(Array.isArray(curDelWf) ? curDelWf : []);
      if (rawId) newDelWf.add(String(rawId).trim());
      if (targetIdStr) newDelWf.add(targetIdStr);
      if (targetNumericId) newDelWf.add(String(targetNumericId).trim());
      if (targetUserId) newDelWf.add(String(targetUserId).trim());
      if (targetWf?.id) newDelWf.add(String(targetWf.id).trim());
      if (targetEmailLower) newDelWf.add(targetEmailLower);
      if (targetNameLower) newDelWf.add(targetNameLower);
      localStorage.setItem('flexistaff_deleted_workforce', JSON.stringify(Array.from(newDelWf)));

      const curDelAcc = JSON.parse(localStorage.getItem('flexistaff_deleted_accounts') || '[]');
      const newDelAcc = new Set(Array.isArray(curDelAcc) ? curDelAcc : []);
      if (targetEmailLower) newDelAcc.add(targetEmailLower);
      if (targetNameLower) newDelAcc.add(targetNameLower);
      if (targetUserId) newDelAcc.add(String(targetUserId).trim());
      if (targetNumericId) newDelAcc.add(String(targetNumericId).trim());
      localStorage.setItem('flexistaff_deleted_accounts', JSON.stringify(Array.from(newDelAcc)));
    } catch (e) {
      console.warn('Error saving deleted workforce tombstones:', e);
    }

    // Call Spring Boot backend to delete from PostgreSQL database
    const deleteId = (!isNaN(Number(targetNumericId)) && Number(targetNumericId) > 0)
      ? Number(targetNumericId)
      : (!isNaN(Number(targetUserId)) && Number(targetUserId) > 0)
        ? Number(targetUserId)
        : (!isNaN(Number(rawId)) && Number(rawId) > 0)
          ? Number(rawId)
          : null;

    if (deleteId) {
      api.freelancers.delete(deleteId).catch((err) => {
        console.warn('Backend freelancer deletion API call error:', err);
      });
      if (targetUserId && targetUserId !== deleteId) {
        api.freelancers.delete(targetUserId).catch(() => {});
        api.users.delete(targetUserId).catch(() => {});
      }
    }

    const matchesTarget = (item) => {
      if (!item) return false;
      const iIdStr = String(item.id || '').trim();
      const iNumIdStr = String(item.numericId || '').trim();
      const iUserIdStr = String(item.userId || '').trim();
      const iNameLower = String(item.name || item.pseudonym || item.fullName || '').toLowerCase().trim();
      const iEmailLower = String(item.email || '').toLowerCase().trim();

      if (targetIdStr && (iIdStr === targetIdStr || iNumIdStr === targetIdStr || iUserIdStr === targetIdStr)) return true;
      if (targetNumericId && (iIdStr === String(targetNumericId) || iNumIdStr === String(targetNumericId))) return true;
      if (targetUserId && (iIdStr === String(targetUserId) || iUserIdStr === String(targetUserId))) return true;
      if (targetNameLower && iNameLower === targetNameLower) return true;
      if (targetEmailLower && iEmailLower === targetEmailLower) return true;
      return false;
    };

    // 2. Remove from workforce pool & sync localStorage
    setWorkforce((prev) => {
      const updated = (prev || []).filter((w) => !matchesTarget(w));
      try {
        localStorage.setItem('flexistaff_workforce', JSON.stringify(updated));
      } catch { }
      return updated;
    });

    // 3. Remove from partnerWorkforce pool & sync localStorage
    setPartnerWorkforce((prev) => {
      const updated = (prev || []).filter((w) => !matchesTarget(w));
      try {
        localStorage.setItem('flexistaff_partner_workforce', JSON.stringify(updated));
      } catch { }
      return updated;
    });

    // 4. Remove from managerAssignments & sync localStorage
    setManagerAssignments((prev) => {
      const updated = (prev || []).filter((a) => {
        if (!a) return false;
        const profIdStr = String(a.professionalId || a.id || '').trim();
        const profNameLower = String(a.professionalName || '').toLowerCase().trim();
        if (targetIdStr && profIdStr === targetIdStr) return false;
        if (targetNumericId && profIdStr === String(targetNumericId)) return false;
        if (targetUserId && profIdStr === String(targetUserId)) return false;
        if (targetNameLower && profNameLower === targetNameLower) return false;
        return true;
      });
      try {
        localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(updated));
      } catch { }
      return updated;
    });

    // 5. Clean up projects & partnerProjects (remove from assignedResources & update headcount counts)
    const cleanupProjectObj = (p) => {
      if (!p) return p;
      const rawResources = p.assignedResources || [];
      const updatedResources = rawResources.filter((r) => !matchesTarget(r));

      const nextAssignedCount = updatedResources.length;

      const updatedRequirements = (p.requirements || []).map((req) => {
        if (!req) return req;
        const reqRoleLower = String(req.role || '').toLowerCase();
        const targetRoleLower = targetWf ? String(targetWf.role || targetWf.title || '').toLowerCase() : '';
        if (targetRoleLower && reqRoleLower.includes(targetRoleLower)) {
          return { ...req, assigned: Math.max(0, (req.assigned || 0) - 1) };
        }
        return req;
      });

      return {
        ...p,
        workforceAssigned: nextAssignedCount,
        assignedResources: updatedResources,
        requirements: updatedRequirements,
      };
    };

    setProjects((prev) => {
      const updated = (prev || []).map(cleanupProjectObj);
      try {
        localStorage.setItem('flexistaff_projects', JSON.stringify(updated));
      } catch { }
      return updated;
    });

    setPartnerProjects((prev) => {
      const updated = (prev || []).map(cleanupProjectObj);
      try {
        localStorage.setItem('flexistaff_partner_projects', JSON.stringify(updated));
      } catch { }
      return updated;
    });

    // 6. Clean up freelancerRequests
    setFreelancerRequests((prev) => {
      const updated = (prev || []).filter((r) => {
        if (!r) return false;
        const flIdStr = String(r.freelancerId || '').trim();
        const flNameLower = String(r.freelancerName || '').toLowerCase().trim();
        if (targetIdStr && flIdStr === targetIdStr) return false;
        if (targetNumericId && flIdStr === String(targetNumericId)) return false;
        if (targetUserId && flIdStr === String(targetUserId)) return false;
        if (targetNameLower && flNameLower === targetNameLower) return false;
        return true;
      });
      try {
        localStorage.setItem('flexistaff_freelancer_requests', JSON.stringify(updated));
      } catch { }
      return updated;
    });

    // 7. Clean up partnerWorkforceRequests
    setPartnerWorkforceRequests((prev) =>
      (prev || []).map((r) => {
        if (!r || !Array.isArray(r.proposedProfessionals)) return r;
        const filteredProfs = r.proposedProfessionals.filter((p) => !matchesTarget(p));
        return { ...r, proposedProfessionals: filteredProfs };
      })
    );

    // 8. Clean up registered users in localStorage if applicable
    try {
      const regStr = localStorage.getItem('flexistaff_registered_users');
      if (regStr) {
        const regList = JSON.parse(regStr);
        if (Array.isArray(regList)) {
          const updatedReg = regList.filter((u) => !matchesTarget(u));
          localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
        }
      }
    } catch { }
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
      user: adminProfile?.name || 'System Administrator',
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

  const updateProject = async (id, updatedData) => {
    const numId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10);

    if (numId && !isNaN(numId) && api?.projects?.update) {
      try {
        const payload = {};
        if (updatedData.title) payload.title = updatedData.title;
        if (updatedData.description) payload.description = updatedData.description;
        if (updatedData.budget) payload.budget = updatedData.budget;
        if (updatedData.status) payload.status = updatedData.status;
        if (updatedData.managerId) payload.managerId = updatedData.managerId;
        else if (updatedData.manager) {
          const mgr = (managers || []).find((m) => (m.name || m.fullName || '').toLowerCase().trim() === String(updatedData.manager).toLowerCase().trim());
          if (mgr) payload.managerId = mgr.id || mgr.userId;
        }

        const res = await api.projects.update(numId, payload);
        if (res && res.success && res.data) {
          const mapped = mapBackendProjectToFrontend(res.data);
          setProjects((prev) => prev.map((prj) => (prj.id === numId || prj.id === id ? mapped : prj)));
          refreshDashboardStats();
          return;
        }
      } catch (err) {
        console.warn('Could not sync project update with backend API:', err);
      }
    }

    setProjects((prev) =>
      prev.map((prj) => {
        if (prj.id === id || String(prj.id) === String(id)) {
          const merged = { ...prj, ...updatedData };
          const numProg = Number(merged.progress) || 0;
          if (numProg < 100 && (merged.stage === 'Completed' || merged.status === 'Completed')) {
            merged.stage = numProg > 0 ? 'In Progress' : 'Approved';
            merged.status = numProg > 0 ? 'In Progress' : 'Approved';
          } else if (numProg === 100) {
            merged.stage = 'Completed';
            merged.status = 'Completed';
          }
          return merged;
        }
        return prj;
      })
    );
  };

  const updateProjectStage = (id, newStage) => {
    setProjects((prev) =>
      prev.map((prj) => {
        if (prj.id !== id && String(prj.id) !== String(id)) return prj;
        const isCompleted = newStage === 'Completed';
        const isRequest = newStage === 'Request' || newStage === 'Pending Admin Approval';
        const newStatus = isCompleted ? 'Completed' : isRequest ? 'Pending Admin Approval' : newStage;
        let newProgress = prj.progress;
        if (isCompleted) newProgress = 100;
        else if (isRequest) newProgress = 0;
        else if (prj.progress === 100) newProgress = 50;

        return {
          ...prj,
          stage: newStage,
          status: newStatus,
          progress: newProgress,
        };
      })
    );
  };

  const toggleMilestone = async (projectId, milestoneId) => {
    const targetPrj = projects.find((p) => p.id === projectId || String(p.id) === String(projectId));
    const targetMs = (targetPrj?.milestones || []).find((m) => m.id === milestoneId || String(m.id) === String(milestoneId));
    const willBeCompleted = !(targetMs?.completed || targetMs?.status === 'Completed' || targetMs?.status === 'COMPLETED');
    const newStatus = willBeCompleted ? 'COMPLETED' : 'NOT_STARTED';

    const numericMsId = Number(String(milestoneId).replace(/\D/g, ''));
    if (numericMsId && !isNaN(numericMsId)) {
      try {
        await api.milestones.updateProgress(numericMsId, { status: newStatus });
      } catch (err) {
        console.warn('Milestone API sync fallback:', err);
      }
    }

    setProjects((prev) =>
      prev.map((prj) => {
        if (prj.id !== projectId && String(prj.id) !== String(projectId)) return prj;
        const updatedMilestones = (prj.milestones || []).map((m) =>
          m.id === milestoneId || String(m.id) === String(milestoneId)
            ? { ...m, completed: willBeCompleted, status: willBeCompleted ? 'Completed' : 'Pending', progressPercentage: willBeCompleted ? 100 : 0 }
            : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed || m.status === 'Completed' || m.status === 'COMPLETED').length;
        const computedProgress = calculateOverallCompletionProgress(completedCount);
        const isCompleted = computedProgress === 100;
        const isProgressing = computedProgress > 0 && computedProgress < 100;

        return {
          ...prj,
          milestones: updatedMilestones,
          progress: computedProgress,
          progressPercentage: computedProgress,
          stage: isCompleted ? 'Completed' : (isProgressing ? 'In Progress' : (prj.stage === 'Completed' ? 'In Progress' : prj.stage)),
          status: isCompleted ? 'Completed' : (isProgressing ? 'In Progress' : (prj.status === 'Completed' ? 'In Progress' : prj.status)),
        };
      })
    );

    refreshProjects();
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
        deleteClient,
        clearClients,
        refreshClients,
        partners,
        addPartner,
        updatePartner,
        deletePartner,
        clearPartners,
        refreshPartners,
        managers,
        refreshManagers,
        addManager,
        updateManager,
        updateManagerStatus,
        deleteManager,
        clearManagers,
        resetAllData,
        reassignProjectManager,
        workforce,
        refreshWorkforce,
        addWorkforceMember,
        approveWorkforceMember,
        rejectWorkforceMember,
        submitPartnerCandidate,
        submitFreelancerRequest,
        updateWorkforceMember,
        deleteWorkforceMember,
        projects,
        addProject,
        updateProject,
        updateProjectStage,
        toggleMilestone,
        refreshProjects,
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
        partnerWorkforce: activePartnerWorkforce,
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
        updateProjectHeadcount,
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
        // Dashboard Stats
        dashboardStats,
        refreshDashboardStats,
        // Freelancer Registration & Verification Pool
        registerFreelancer,
        approveProfessional,
        rejectProfessional,
        updateProfessionalAvailability,
        getPartnerCompanyName,
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
