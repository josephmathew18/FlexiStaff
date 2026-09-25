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

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [companyProfile, setCompanyProfile] = useState(initialCompanyProfile);
  const [adminProfile, setAdminProfile] = useState(initialAdminProfile);

  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem('flexistaff_clients');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return initialClients || [];
  });

  const [partners, setPartners] = useState(() => {
    try {
      const saved = localStorage.getItem('flexistaff_partners');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return initialPartners || [];
  });
  const [managers, setManagers] = useState(() => {
    let list = initialManagers || [];
    try {
      const saved = localStorage.getItem('flexistaff_managers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          list = parsed;
        }
      }
    } catch {
      // Ignore
    }
    return list.map((m, idx) => {
      if (!m) return m;
      const rawNum = Number(String(m.id || m.userId || m.numericId || '').replace(/\D/g, '')) || (idx + 1);
      return { ...m, id: rawNum, numericId: rawNum, employeeId: rawNum };
    });
  });

  const [workforce, setWorkforce] = useState(() => {
    let list = [];
    try {
      const saved = localStorage.getItem('flexistaff_workforce');
      if (saved) list = JSON.parse(saved);
    } catch {}
    if (!list || list.length === 0) {
      list = [];
    }
    return list.filter((w) => {
      if (!w) return false;
      const emailLower = (w.email || '').toLowerCase().trim();
      const nameLower = (w.name || w.pseudonym || '').toLowerCase().trim();
      const roleLower = (w.role || w.title || w.category || '').toLowerCase().trim();

      if (emailLower.includes('sharon') || nameLower.includes('sharon')) return false;
      if (emailLower.includes('admin') || roleLower.includes('admin')) return false;

      const isPartnerCompany =
        roleLower === 'partner company' ||
        roleLower === 'partner' ||
        roleLower === 'role_partner' ||
        nameLower === 'infosys' ||
        nameLower === 'partner' ||
        nameLower === 'partner company' ||
        emailLower === 'partner@infosys.com' ||
        emailLower === 'partner@gmail.com' ||
        emailLower === 'partner@flexistaff.com';

      return !isPartnerCompany;
    });
  });

  const [projects, setProjects] = useState(() => {
    let list = initialProjects || [];
    try {
      const saved = localStorage.getItem('flexistaff_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch {
      // Ignore
    }
    return list.map((p) => {
      if (!p) return p;
      const cleanId = typeof p.id === 'number' ? p.id : (Number(String(p.id).replace(/\D/g, '')) || p.id);
      const isPetrolPump =
        String(p.id || '').includes('7142') ||
        String(p.name || p.title || p.projectName || '').toLowerCase().includes('petrol');

      let stage = isPetrolPump ? 'Completed' : p.stage;
      let status = isPetrolPump ? 'Completed' : p.status;
      let numProg = isPetrolPump ? 100 : (Number(p.progress) || 0);

      if (stage === 'Completed' || status === 'Completed' || numProg >= 100 || isPetrolPump) {
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
    } catch {}
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_workforce', JSON.stringify(workforce));
    } catch {}
  }, [workforce]);

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_projects', JSON.stringify(projects));
    } catch {}
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_partners', JSON.stringify(partners));
    } catch {}
  }, [partners]);

  // Cleanup deleted accounts (Sharon Tomy, admin@gmail.com, admin@flexistaff.ai)
  useEffect(() => {
    try {
      const deletedStr = localStorage.getItem('flexistaff_deleted_accounts') || '[]';
      let deletedList = JSON.parse(deletedStr);
      if (!Array.isArray(deletedList)) deletedList = [];

      const targetDeleted = ['sharon@flexistaff.com', 'sharon.tomy@flexistaff.com', 'sharon', 'admin@gmail.com', 'admin@flexistaff.ai'];
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
          nameLower.includes('sharon') ||
          emailLower === 'admin@gmail.com' ||
          emailLower === 'admin@flexistaff.ai'
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

      // Purge manager assignments of Sharon Tomy
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

      // Purge projects assignedResources of Sharon Tomy
      const projStr = localStorage.getItem('flexistaff_projects');
      if (projStr) {
        const projList = JSON.parse(projStr);
        if (Array.isArray(projList)) {
          const updatedProj = projList.map((p) => {
            if (!p) return p;
            const rawRes = p.assignedResources || [];
            const cleanRes = rawRes.filter((r) => {
              if (!r) return false;
              const rEmail = (r.email || r.professionalEmail || '').toLowerCase();
              const rName = (r.name || r.professionalName || '').toLowerCase();
              return !rEmail.includes('sharon') && !rName.includes('sharon');
            });
            return {
              ...p,
              assignedResources: cleanRes,
              workforceAssigned: cleanRes.length,
            };
          });
          localStorage.setItem('flexistaff_projects', JSON.stringify(updatedProj));
          setProjects(updatedProj);
        }
      }

      // Purge partner company organizations from central workforce roster in localStorage
      const wfStr = localStorage.getItem('flexistaff_workforce');
      if (wfStr) {
        const wfList = JSON.parse(wfStr);
        if (Array.isArray(wfList)) {
          const cleanWf = wfList.filter((w) => {
            if (!w) return false;
            const emailLower = (w.email || '').toLowerCase().trim();
            const nameLower = (w.name || w.pseudonym || '').toLowerCase().trim();
            const roleLower = (w.role || w.title || '').toLowerCase().trim();
            const isPartnerCompany =
              roleLower === 'partner company' ||
              roleLower === 'partner' ||
              roleLower === 'role_partner' ||
              nameLower === 'infosys' ||
              nameLower === 'partner' ||
              nameLower === 'partner company' ||
              emailLower === 'partner@infosys.com' ||
              emailLower === 'partner@gmail.com' ||
              emailLower === 'partner@flexistaff.com';
            return !isPartnerCompany;
          });
          localStorage.setItem('flexistaff_workforce', JSON.stringify(cleanWf));
          setWorkforce(cleanWf);
        }
      }
    } catch {}

    refreshClients();
  }, []);

  const refreshClients = async () => {
    try {
      const res = await api.clients.getAll();
      if (res && res.success && Array.isArray(res.data)) {
        const mappedBackendClients = res.data.map((c) => ({
          id: c.userId || c.id,
          numericId: c.userId || c.id,
          name: c.companyName || c.name,
          companyName: c.companyName || c.name,
          contactPerson: c.name || c.contactPerson || c.companyName,
          email: c.email,
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

        setClients((prevLocal) => {
          const merged = [...mappedBackendClients];
          (prevLocal || []).forEach((localC) => {
            if (!localC) return;
            const exists = merged.some((m) =>
              (m.email && localC.email && m.email.toLowerCase() === localC.email.toLowerCase()) ||
              (m.id && localC.id && String(m.id) === String(localC.id))
            );
            if (!exists) {
              merged.push(localC);
            }
          });
          try {
            localStorage.setItem('flexistaff_clients', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (err) {
      console.warn('Could not fetch clients from backend API:', err.message);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_managers', JSON.stringify(managers));
    } catch {}
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
      name: clientData.companyName || clientData.company || clientData.name || 'Client Organization',
      companyName: clientData.companyName || clientData.company || clientData.name || 'Client Organization',
      contactPerson: clientData.fullName || clientData.contactPerson || clientData.name || 'Contact Person',
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

  const deleteClient = (idOrEmail) => {
    setClients((prev) => prev.filter((c) => c.id !== idOrEmail && c.email !== idOrEmail));
    try {
      const savedStr = localStorage.getItem('flexistaff_clients');
      if (savedStr) {
        const list = JSON.parse(savedStr);
        const updated = list.filter((c) => c && c.id !== idOrEmail && c.email !== idOrEmail);
        localStorage.setItem('flexistaff_clients', JSON.stringify(updated));
      }
      const regStr = localStorage.getItem('flexistaff_registered_users');
      if (regStr) {
        const regList = JSON.parse(regStr);
        const updatedReg = regList.filter((u) => u && u.id !== idOrEmail && u.email !== idOrEmail);
        localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
      }
    } catch {}
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
    } catch {}
  };

  // Clear any existing self-registered client entries on initial load as requested by user
  useEffect(() => {
    try {
      const regStr = localStorage.getItem('flexistaff_registered_users');
      if (regStr) {
        const regList = JSON.parse(regStr);
        const hasClients = regList.some((u) => u && (u.role === 'Client' || u.role === 'ROLE_CLIENT'));
        if (hasClients) {
          const updatedReg = regList.filter((u) => u && u.role !== 'Client' && u.role !== 'ROLE_CLIENT');
          localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
        }
      }
      const savedClientsStr = localStorage.getItem('flexistaff_clients');
      if (savedClientsStr) {
        localStorage.removeItem('flexistaff_clients');
        setClients([]);
      }
    } catch {}
  }, []);

  // Sync projects and data with Spring Boot backend when available
  useEffect(() => {
    async function syncBackendData() {
      try {
        const projRes = await api.projects.getAll();
        if (projRes && projRes.success && Array.isArray(projRes.data) && projRes.data.length > 0) {
          setProjects(projRes.data);
        }
      } catch (err) {
        // Keep initial prototype dataset if backend is loading or unavailable
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
          } catch {}
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
  const [partnerWorkforce, setPartnerWorkforce] = useState(initialPartnerWorkforce);

  // Derive partner workforce members for the active partner company from central workforce state
  const activePartnerWorkforce = useMemo(() => {
    const partnerNameLower = (partnerProfile?.name || partnerProfile?.companyName || '').toLowerCase().trim();
    const partnerEmailLower = (partnerProfile?.email || '').toLowerCase().trim();

    if (!partnerNameLower && !partnerEmailLower) return partnerWorkforce || [];

    const matchedFromCentral = (workforce || []).filter((w) => {
      if (!w) return false;
      const wCompany = (w.partnerCompany || w.partner || w.partnerName || '').toLowerCase().trim();
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
  }, [workforce, partnerWorkforce, partnerProfile]);
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
        try { currentManagersList = JSON.parse(savedManagersStr); } catch {}
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
    } catch {}
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
    } catch {}
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
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(managerAssignments));
    } catch {}
  }, [managerAssignments]);

  useEffect(() => {
    try {
      localStorage.setItem('flexistaff_freelancer_requests', JSON.stringify(freelancerRequests));
    } catch {}
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
          } catch {}
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
      } catch {}
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
          try { currentPartnerWf = JSON.parse(savedPartnerWfStr); } catch {}
        }

        let combinedWorkforceList = [...(workforce || []), ...(currentPartnerWf || [])];
        if (savedWorkforceStr) {
          try {
            const parsedWf = JSON.parse(savedWorkforceStr);
            if (Array.isArray(parsedWf)) combinedWorkforceList = [...combinedWorkforceList, ...parsedWf];
          } catch {}
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
              } catch {}
            }

            const wfName = matchedWf?.name || matchedWf?.pseudonym || savedUser.name || savedUser.fullName || 'Workforce Specialist';
            const emailAddr = matchedWf?.email || savedUser.email || '';
            const phoneNo = matchedWf?.phone || savedUser.phone || '+91 98765 00000';
            const title = matchedWf?.title || matchedWf?.role || savedUser.title || savedUser.jobTitle || 'Senior Software Engineer';

            let partnerCompany =
              matchedWf?.partnerCompany ||
              matchedWf?.partner ||
              matchedWf?.partnerName ||
              savedUser.partnerCompany ||
              savedUser.partnerName ||
              (savedUser.companyName !== 'Enterprise Client' ? savedUser.companyName : '') ||
              (savedUser.company !== 'Enterprise Client' ? savedUser.company : '') ||
              '';

            const isPartnerEmployee =
              Boolean(partnerCompany) ||
              matchedWf?.source === 'Partner Company' ||
              matchedWf?.professionalType === 'PARTNER_EMPLOYEE' ||
              savedUser?.role === 'Partner Employee' ||
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
              roleType: isPartnerEmployee ? 'Professional' : 'Freelancer',
              professionalType: isPartnerEmployee ? 'PARTNER_EMPLOYEE' : 'FREELANCER',
              userType: isPartnerEmployee ? 'PARTNER_EMPLOYEE' : 'FREELANCER',
            });

            if (isPartnerEmployee && (!savedUser.partnerCompany || savedUser.name !== wfName)) {
              const updatedSavedUser = {
                ...savedUser,
                name: wfName,
                fullName: wfName,
                companyName: partnerCompany,
                company: partnerCompany,
                partnerCompany: partnerCompany,
                partnerName: partnerCompany,
                partner: partnerCompany,
                roleType: 'Professional',
                professionalType: 'PARTNER_EMPLOYEE',
                userType: 'PARTNER_EMPLOYEE',
              };
              try {
                localStorage.setItem('flexistaff_user', JSON.stringify(updatedSavedUser));
              } catch {}
            }
          }
        }
      } catch {}
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
          } catch {}
        }
        if (registeredUsersStr) {
          try {
            const list = JSON.parse(registeredUsersStr);
            if (Array.isArray(list)) usersToSync = [...usersToSync, ...list];
          } catch {}
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
          } catch {}
        }

        const workforceUsers = usersToSync.filter((u) => {
          if (!u || !u.email) return false;
          const r = String(u.role || u.userType || '').toLowerCase().trim();
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

          if (
            emailLower.includes('sharon') ||
            nameLower.includes('sharon') ||
            emailLower.includes('admin') ||
            r.includes('admin') ||
            r.includes('client') ||
            r.includes('manager') ||
            isPartnerCompany
          ) {
            return false;
          }
          return (
            r.includes('workforce') ||
            r.includes('freelancer') ||
            r.includes('professional') ||
            r.includes('talent') ||
            Boolean(u.hourlyRate) ||
            Boolean(u.skills)
          );
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
              const newWfMember = {
                id: u.id || `wf-reg-${Date.now()}-${Math.random().toString().slice(-4)}`,
                numericId: u.numericId || u.id || Date.now(),
                name: u.name || u.fullName || 'Independent Freelancer',
                pseudonym: u.name || u.fullName || 'Independent Freelancer',
                email: u.email,
                phone: u.phone || '+91 98765 00000',
                title: u.title || u.jobTitle || u.role || 'Full-Stack Software Engineer',
                role: u.title || u.jobTitle || u.role || 'Full-Stack Software Engineer',
                category: 'Independent Freelancer',
                roleType: isPartner ? 'Professional' : 'Freelancer',
                professionalType: isPartner ? 'PARTNER_EMPLOYEE' : 'FREELANCER',
                source: isPartner ? 'Partner Company' : 'Freelancer Registration',
                partnerCompany: u.partnerCompany || '',
                partnerName: u.partnerCompany || 'Independent Freelancer',
                skills: Array.isArray(u.skills)
                  ? u.skills
                  : (u.skills ? String(u.skills).split(',').map((s) => s.trim()) : ['React.js', 'Node.js']),
                hourlyRate: u.hourlyRate || '$85/hr',
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
            } catch {}
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

  // Sync Client Profile with registered user data
  useEffect(() => {
    const syncClientProfileData = () => {
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        const savedClientsStr = localStorage.getItem('flexistaff_clients');
        let currentClientsList = clients;
        if (savedClientsStr) {
          try { currentClientsList = JSON.parse(savedClientsStr); } catch {}
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

            const companyName = matchedCli?.name || matchedCli?.companyName || savedUser.companyName || savedUser.company || 'Enterprise Client Organization';
            const contactPerson = matchedCli?.contactPerson || savedUser.name || savedUser.contactPerson || 'Client Contact';

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
      } catch {}
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
    } catch {}
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
    const updatedSpecialtiesStr = Array.isArray(data.specialties)
      ? data.specialties.join(', ')
      : data.specialties;
    const updatedSpecialtiesArr = Array.isArray(data.specialties)
      ? data.specialties
      : String(data.specialties || '').split(',').map((s) => s.trim()).filter(Boolean);

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
            id: data.id || partnerProfile.id || `prt-${Date.now()}`,
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
      } catch {}
      return nextPartners;
    });

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
    } catch {}
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
      } catch {}

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
        } catch {}
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
  const submitClientProjectRequest = (formData) => {
    // Generate sequential serial project ID matching PostgreSQL BIGSERIAL Primary Key standard
    const existingNumIds = (projects || [])
      .map((p) => Number(String(p?.id || '').replace(/\D/g, '')))
      .filter((num) => !isNaN(num) && num > 0);
    const nextSerialNum = existingNumIds.length > 0 ? Math.max(...existingNumIds) + 1 : 7143;
    const newId = nextSerialNum;

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
      serialId: nextSerialNum,
      dbId: nextSerialNum,
      name: formData.title || formData.name || 'Custom Enterprise Project',
      title: formData.title || formData.name || 'Custom Enterprise Project',
      client: clientProfile?.company || 'Client Organization',
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
  const approveProject = (projectId, assignedManager = '') => {
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
            status: 'Accepted',
            progress: 15,
            currentTask: 'Approved by Admin. Active project execution started.',
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

    // 2. Update project status to 'In Progress' and stage to 'In Progress'
    const normProjId = (id) => String(id || '').toLowerCase().replace(/[\s_]/g, '-').trim();
    const targetNormId = normProjId(targetAsg.projectId);
    const targetProjName = (targetAsg.projectName || '').toLowerCase().trim();

    const updateProjectObj = (p) => {
      const pNormId = normProjId(p.id);
      const pTitle = (p.name || p.title || '').toLowerCase().trim();
      const isMatch = (targetNormId && pNormId === targetNormId) || (targetProjName && pTitle === targetProjName);

      if (isMatch) {
        const nextAssigned = Math.max(1, (p.workforceAssigned || 0) + 1);
        const newResources = [
          ...(p.assignedResources || []).filter((r) => r.id !== targetAsg.professionalId && (r.name || '').toLowerCase().trim() !== (targetAsg.professionalName || '').toLowerCase().trim()),
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
          recentUpdate: `Squad assignment approved by Company Admin. Project phase changed to "In Progress".`,
        };
      }
      return p;
    };

    setProjects((prev) => prev.map(updateProjectObj));
    setPartnerProjects((prev) => prev.map(updateProjectObj));

    // 3. Notify Workforce Member, Manager & Client
    const wfNotif = {
      id: `wnotif-${Date.now()}`,
      title: 'Project Assignment Approved by Admin',
      message: `Your assignment on "${targetAsg.projectName}" as ${targetAsg.role} was approved by Admin. Project is now In Progress.`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/workforce/assignments',
    };
    setWorkforceNotifications((prev) => [wfNotif, ...prev]);

    const mgrNotif = {
      id: `mnotif-${Date.now()}`,
      title: 'Assignment Proposal Approved by Admin',
      message: `Admin approved the assignment of ${targetAsg.professionalName} for "${targetAsg.projectName}". Project execution started!`,
      type: 'assignment',
      unread: true,
      time: 'Just now',
      link: '/manager/assignments',
    };
    setManagerNotifications((prev) => [mgrNotif, ...prev]);

    const clientNotif = {
      id: `cnotif-${Date.now()}`,
      title: 'Workforce Approved & Project Started',
      message: `${targetAsg.professionalName} (${targetAsg.role}) was approved by Admin for "${targetAsg.projectName}". Project is now In Progress!`,
      type: 'project',
      unread: true,
      time: 'Just now',
      link: `/client/projects/${targetAsg.projectId}`,
    };
    setClientNotifications((prev) => [clientNotif, ...prev]);
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
      user: workforceUserProfile.name || 'Workforce Specialist',
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

    // Update central workforce state
    setWorkforce((prevWorkforce) => {
      let found = false;
      const updatedList = (prevWorkforce || []).map((w) => {
        if (matchesMember(w)) {
          found = true;
          const merged = { ...w, ...updatedFields };
          if (updatedFields.title) merged.role = updatedFields.title;
          if (updatedFields.role) merged.title = updatedFields.role;
          if (updatedFields.name) merged.pseudonym = updatedFields.name;
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
      } catch {}
      return newList;
    });

    // Update partnerWorkforce state
    setPartnerWorkforce((prevPartnerWorkforce) => {
      const updatedList = (prevPartnerWorkforce || []).map((w) => {
        if (matchesMember(w)) {
          const merged = { ...w, ...updatedFields };
          if (updatedFields.title) merged.role = updatedFields.title;
          if (updatedFields.role) merged.title = updatedFields.role;
          if (updatedFields.name) merged.pseudonym = updatedFields.name;
          return merged;
        }
        return w;
      });

      try {
        localStorage.setItem('flexistaff_partner_workforce', JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    // Update workforceUserProfile state
    setWorkforceUserProfile((prevProfile) => {
      if (!prevProfile || matchesMember(prevProfile) || (targetEmail && prevProfile.email && targetEmail === prevProfile.email.toLowerCase())) {
        return {
          ...prevProfile,
          ...updatedFields,
          title: updatedFields.title || updatedFields.role || prevProfile?.title,
          role: updatedFields.role || updatedFields.title || prevProfile?.role,
        };
      }
      return prevProfile;
    });

    // Sync active session in localStorage if logged in user is this employee
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
    } catch {}

    // Sync flexistaff_registered_users in localStorage
    try {
      const regStr = localStorage.getItem('flexistaff_registered_users');
      if (regStr) {
        const regList = JSON.parse(regStr);
        if (Array.isArray(regList)) {
          const updatedReg = regList.map((u) => {
            if (matchesMember(u)) {
              return { ...u, ...updatedFields };
            }
            return u;
          });
          localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
        }
      }
    } catch {}
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
  const addPartner = (partner) => {
    const nextGlobalId = getNextGlobalUserId('Partner', clients, managers, partners, workforce);
    const newPartner = {
      ...partner,
      id: nextGlobalId,
      numericId: nextGlobalId,
      joinedDate: new Date().toISOString().split('T')[0],
      suppliedProfessionals: Number(partner.suppliedProfessionals) || 0,
      activePlacements: 0,
      availabilityRate: '100%',
      rating: 4.8,
    };
    setPartners((prev) => [newPartner, ...prev]);

    addActivity({
      user: userProfile?.name || user?.name || 'System Admin',
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

  const deletePartner = (id) => {
    setPartners((prev) => prev.filter((prt) => prt.id !== id));
  };

  const clearPartners = () => {
    setPartners([]);
    try {
      localStorage.removeItem('flexistaff_partners');
    } catch {}
  };

  // Manager Lifecycle & Project Reassignment Actions
  const addManager = (managerData) => {
    const nextSerialNum = getNextGlobalUserId('Manager', clients, managers, partners, workforce);
    const parsedEmpId = nextSerialNum;

    const newManager = {
      ...managerData,
      id: nextSerialNum,
      employeeId: parsedEmpId,
      role: 'Organization Manager',
      status: managerData.status || 'Active',
      assignedProjectsCount: 0,
      teamSize: 0,
      joinDate: managerData.joinDate || new Date().toISOString().split('T')[0],
      avatar:
        managerData.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    };
    setManagers((prev) => {
      const updated = [newManager, ...prev];
      try {
        localStorage.setItem('flexistaff_managers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setManagerProfile(newManager);

    addActivity({
      user: userProfile?.name || user?.name || 'System Admin',
      action: 'Registered new Organization Manager',
      target: `${newManager.name} (ID: #${newManager.employeeId})`,
      targetType: 'manager',
    });

    return newManager;
  };

  const updateManager = (id, updatedData) => {
    const numId = typeof id === 'number' ? id : (Number(String(id).replace(/\D/g, '')) || id);
    setManagers((prev) => {
      const exists = prev.some((m) => m.id === id || m.id === numId);
      if (!exists && prev.length === 0) {
        const newMng = {
          id: numId || 1,
          employeeId: numId || 1,
          role: 'Organization Manager',
          status: 'Active',
          ...updatedData,
        };
        return [newMng];
      }
      return prev.map((mng) => (mng.id === id || mng.id === numId ? { ...mng, ...updatedData } : mng));
    });
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

  const deleteManager = (id) => {
    setManagers((prev) => {
      const updated = prev.filter((mng) => mng.id !== id && String(mng.id) !== String(id));
      try {
        localStorage.setItem('flexistaff_managers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearManagers = () => {
    setManagers([]);
    try {
      localStorage.removeItem('flexistaff_managers');
    } catch {}
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
    } catch {}
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
      partnerName: member.partnerName || (member.roleType === 'Freelancer' ? 'Freelancer Application' : 'QuantumTech Staffing Solutions'),
      approvalStatus: member.approvalStatus || 'Approved',
      status: member.approvalStatus === 'Pending Review' ? 'Pending Review' : (member.availability === 'Busy' ? 'Assigned' : 'Available'),
      avatar:
        member.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    };
    setWorkforce((prev) => [newMember, ...prev]);

    addActivity({
      user: userProfile?.name || user?.name || 'System Admin',
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
      user: userProfile?.name || user?.name || 'System Admin',
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
      user: userProfile?.name || user?.name || 'System Admin',
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

    const newProf = {
      id: newId,
      name: profData.name,
      pseudonym: profData.pseudonym || profData.name,
      role: profData.role || profData.title || 'Full-Stack Developer',
      title: profData.title || profData.role || 'Full-Stack Developer',
      roleCategory: profData.roleCategory || 'Full-Stack Engineering',
      partner: partnerProfile.name || 'Partner Company',
      partnerName: partnerProfile.name || 'Partner Company',
      partnerCompany: partnerProfile.name || 'Partner Company',
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

    setPartnerWorkforce((prev) => [newProf, ...prev]);
    setWorkforce((prev) => [newProf, ...prev]);

    // Save to flexistaff_registered_users so employee can log in immediately
    try {
      const regStr = localStorage.getItem('flexistaff_registered_users');
      let regList = regStr ? JSON.parse(regStr) : [];
      const userEmailLower = (newProf.email || '').toLowerCase().trim();
      const updatedReg = regList.filter((u) => u && (u.email || '').toLowerCase().trim() !== userEmailLower);
      updatedReg.push({
        id: newProf.id,
        name: newProf.name,
        fullName: newProf.name,
        email: userEmailLower,
        password: profData.password || profData.tempPassword || 'Workforce@123',
        phone: newProf.phone,
        role: 'Workforce',
        portalPath: '/workforce/dashboard',
        companyName: newProf.partnerCompany,
        company: newProf.partnerCompany,
        title: newProf.title,
        avatar: newProf.avatar,
      });
      localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
    } catch {}

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


  const deleteWorkforceMember = (id) => {
    // 1. Locate the target workforce member
    const targetWf =
      (workforce || []).find((w) => w && (w.id === id || String(w.id) === String(id))) ||
      (partnerWorkforce || []).find((w) => w && (w.id === id || String(w.id) === String(id)));

    const targetIdStr = String(id || '').trim();
    const targetNameLower = targetWf ? String(targetWf.name || targetWf.pseudonym || '').toLowerCase().trim() : '';
    const targetEmailLower = targetWf ? String(targetWf.email || '').toLowerCase().trim() : '';

    // 2. Remove from workforce pool & sync localStorage
    setWorkforce((prev) => {
      const updated = (prev || []).filter((w) => {
        if (!w) return false;
        const wIdStr = String(w.id || '').trim();
        const wNameLower = String(w.name || w.pseudonym || '').toLowerCase().trim();
        const wEmailLower = String(w.email || '').toLowerCase().trim();
        if (wIdStr === targetIdStr) return false;
        if (targetNameLower && wNameLower === targetNameLower) return false;
        if (targetEmailLower && wEmailLower === targetEmailLower) return false;
        return true;
      });
      try {
        localStorage.setItem('flexistaff_workforce', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 3. Remove from partnerWorkforce pool & sync localStorage
    setPartnerWorkforce((prev) => {
      const updated = (prev || []).filter((w) => {
        if (!w) return false;
        const wIdStr = String(w.id || '').trim();
        const wNameLower = String(w.name || w.pseudonym || '').toLowerCase().trim();
        const wEmailLower = String(w.email || '').toLowerCase().trim();
        if (wIdStr === targetIdStr) return false;
        if (targetNameLower && wNameLower === targetNameLower) return false;
        if (targetEmailLower && wEmailLower === targetEmailLower) return false;
        return true;
      });
      try {
        localStorage.setItem('flexistaff_partner_workforce', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 4. Remove from managerAssignments & sync localStorage
    setManagerAssignments((prev) => {
      const updated = (prev || []).filter((a) => {
        if (!a) return false;
        const profIdStr = String(a.professionalId || a.id || '').trim();
        const profNameLower = String(a.professionalName || '').toLowerCase().trim();
        if (profIdStr === targetIdStr) return false;
        if (targetNameLower && profNameLower === targetNameLower) return false;
        return true;
      });
      try {
        localStorage.setItem('flexistaff_manager_assignments', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 5. Clean up projects & partnerProjects (remove from assignedResources & update headcount counts)
    const cleanupProjectObj = (p) => {
      if (!p) return p;
      const rawResources = p.assignedResources || [];
      const updatedResources = rawResources.filter((r) => {
        if (!r) return false;
        const rIdStr = String(r.id || '').trim();
        const rNameLower = String(r.name || '').toLowerCase().trim();
        if (rIdStr === targetIdStr) return false;
        if (targetNameLower && rNameLower === targetNameLower) return false;
        return true;
      });

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
      } catch {}
      return updated;
    });

    setPartnerProjects((prev) => {
      const updated = (prev || []).map(cleanupProjectObj);
      try {
        localStorage.setItem('flexistaff_partner_projects', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 6. Clean up freelancerRequests
    setFreelancerRequests((prev) => {
      const updated = (prev || []).filter((r) => {
        if (!r) return false;
        const flIdStr = String(r.freelancerId || '').trim();
        const flNameLower = String(r.freelancerName || '').toLowerCase().trim();
        if (flIdStr === targetIdStr) return false;
        if (targetNameLower && flNameLower === targetNameLower) return false;
        return true;
      });
      try {
        localStorage.setItem('flexistaff_freelancer_requests', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 7. Clean up partnerWorkforceRequests
    setPartnerWorkforceRequests((prev) =>
      (prev || []).map((r) => {
        if (!r || !Array.isArray(r.proposedProfessionals)) return r;
        const filteredProfs = r.proposedProfessionals.filter((p) => {
          if (!p) return false;
          const pIdStr = String(p.id || '').trim();
          const pNameLower = String(p.name || p.pseudonym || '').toLowerCase().trim();
          if (pIdStr === targetIdStr) return false;
          if (targetNameLower && pNameLower === targetNameLower) return false;
          return true;
        });
        return { ...r, proposedProfessionals: filteredProfs };
      })
    );

    // 8. Clean up registered users in localStorage if applicable
    try {
      const regStr = localStorage.getItem('flexistaff_registered_users');
      if (regStr) {
        const regList = JSON.parse(regStr);
        if (Array.isArray(regList)) {
          const updatedReg = regList.filter((u) => {
            if (!u) return false;
            const uIdStr = String(u.id || '').trim();
            const uEmailLower = String(u.email || '').toLowerCase().trim();
            if (uIdStr === targetIdStr) return false;
            if (targetEmailLower && uEmailLower === targetEmailLower) return false;
            return true;
          });
          localStorage.setItem('flexistaff_registered_users', JSON.stringify(updatedReg));
        }
      }
    } catch {}
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
      user: userProfile?.name || user?.name || 'System Admin',
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

  const toggleMilestone = (projectId, milestoneId) => {
    setProjects((prev) =>
      prev.map((prj) => {
        if (prj.id !== projectId && String(prj.id) !== String(projectId)) return prj;
        const updatedMilestones = (prj.milestones || []).map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = updatedMilestones.filter((m) => m.completed).length;
        const computedProgress =
          updatedMilestones.length > 0
            ? Math.round((completedCount / updatedMilestones.length) * 100)
            : prj.progress;
        const isCompleted = computedProgress === 100;
        const isProgressing = computedProgress > 0 && computedProgress < 100;

        return {
          ...prj,
          milestones: updatedMilestones,
          progress: computedProgress,
          stage: isCompleted ? 'Completed' : (isProgressing ? 'In Progress' : (prj.stage === 'Completed' ? 'In Progress' : prj.stage)),
          status: isCompleted ? 'Completed' : (isProgressing ? 'In Progress' : (prj.status === 'Completed' ? 'In Progress' : prj.status)),
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
        deleteClient,
        clearClients,
        refreshClients,
        partners,
        addPartner,
        updatePartner,
        deletePartner,
        clearPartners,
        managers,
        addManager,
        updateManager,
        updateManagerStatus,
        deleteManager,
        clearManagers,
        resetAllData,
        reassignProjectManager,
        workforce,
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
