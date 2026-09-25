import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Session initialization from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('flexistaff_user');
      if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return null;
  });

  const [role, setRole] = useState(() => {
    try {
      const r = localStorage.getItem('flexistaff_role');
      if (r && r !== 'undefined' && r !== 'null') return r;
    } catch {}
    return user?.role || '';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const auth = localStorage.getItem('flexistaff_auth');
      if (auth !== null) return auth === 'true';
    } catch {}
    return Boolean(user);
  });

  // Sync to localStorage
  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem('flexistaff_user', JSON.stringify(user));
      localStorage.setItem('flexistaff_role', user.role || role);
      localStorage.setItem('flexistaff_auth', 'true');
    } else {
      localStorage.removeItem('flexistaff_user');
      localStorage.removeItem('flexistaff_role');
      localStorage.removeItem('flexistaff_token');
      localStorage.setItem('flexistaff_auth', 'false');
    }
  }, [user, role, isAuthenticated]);

  /**
   * Validate and authenticate credentials via Spring Boot REST API
   */
  const login = async (email, password, selectedRole = null) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email.' };
    }
    if (!trimmedPassword) {
      return { success: false, error: 'Please enter your password.' };
    }

    // Check if account has been explicitly deleted
    const deletedAdminEmails = ['admin@gmail.com', 'admin@flexistaff.ai'];
    try {
      const deletedAccountsStr = localStorage.getItem('flexistaff_deleted_accounts');
      const deletedList = deletedAccountsStr ? JSON.parse(deletedAccountsStr) : [];
      if (
        deletedAdminEmails.includes(trimmedEmail) ||
        (Array.isArray(deletedList) && deletedList.includes(trimmedEmail))
      ) {
        return {
          success: false,
          error: `Account not found: The account "${trimmedEmail}" has been permanently deleted.`,
        };
      }
    } catch {}

    // Check if partner organization account is deactivated by Admin
    try {
      const savedPartnersStr = localStorage.getItem('flexistaff_partners');
      if (savedPartnersStr) {
        const partnersList = JSON.parse(savedPartnersStr);
        const matchingPartner = partnersList.find((p) => {
          if (!p) return false;
          const pEmail = (p.email || '').toLowerCase().trim();
          return pEmail && (pEmail === trimmedEmail || (trimmedEmail.includes('partner') && String(p.status).toLowerCase().trim() !== 'active'));
        });

        if (matchingPartner) {
          const status = String(matchingPartner.status || '').toLowerCase().trim();
          if (['inactive', 'deactivated', 'terminated', 'pending', 'rejected'].includes(status)) {
            return {
              success: false,
              error: `Access Denied: Partner organization "${matchingPartner.name}" is currently ${matchingPartner.status || 'Inactive'}. Login access has been disabled by Admin.`,
            };
          }
        }
      }
    } catch {
      // Ignore parse errors
    }

    try {
      // 1. Attempt Spring Boot Backend REST API Authentication
      const apiRes = await api.auth.login(trimmedEmail, trimmedPassword);
      if (apiRes && apiRes.success && apiRes.data) {
        const authData = apiRes.data;
        if (authData.accessToken) {
          localStorage.setItem('flexistaff_token', authData.accessToken);
        }

        let portalPath = '/admin/dashboard';
        let userRole = selectedRole || 'Admin';

        if (authData.role === 'ROLE_CLIENT') {
          portalPath = '/client/dashboard';
          userRole = selectedRole || 'Client';
        } else if (authData.role === 'ROLE_MANAGER') {
          portalPath = '/manager/dashboard';
          userRole = selectedRole || 'Manager';
        } else if (authData.role === 'ROLE_PARTNER') {
          portalPath = '/partner/dashboard';
          userRole = selectedRole || 'Partner Company';
        } else if (authData.role === 'ROLE_PROFESSIONAL' || authData.role === 'ROLE_WORKFORCE') {
          portalPath = '/workforce/dashboard';
          userRole = selectedRole || 'Workforce';
        }

        const backendUser = {
          id: authData.userId,
          partnerCompanyId: authData.partnerCompanyId || authData.userId,
          name: authData.fullName,
          fullName: authData.fullName,
          email: authData.email,
          phone: authData.phone || '',
          companyName: authData.companyName || (userRole === 'Partner Company' ? (trimmedEmail.includes('infosys') ? 'Infosys Technologies' : 'Partner Company') : ''),
          company: authData.companyName || (userRole === 'Partner Company' ? (trimmedEmail.includes('infosys') ? 'Infosys Technologies' : 'Partner Company') : ''),
          partnerCompany: authData.companyName || (userRole === 'Partner Company' ? (trimmedEmail.includes('infosys') ? 'Infosys Technologies' : 'Partner Company') : ''),
          role: userRole,
          portalPath,
        };

        setUser(backendUser);
        setRole(userRole);
        setIsAuthenticated(true);
        localStorage.setItem('flexistaff_user', JSON.stringify(backendUser));

        return {
          success: true,
          user: backendUser,
          redirectPath: portalPath,
        };
      }
    } catch (err) {
      console.warn('API Authentication offline, falling back to local user session.');
    }

    // Local authentication fallback (restores stored registered user or initializes session)
    let registeredUsers = [];
    try {
      const stored = localStorage.getItem('flexistaff_registered_users');
      if (stored) registeredUsers = JSON.parse(stored);
    } catch {}

    // Strict and safe multi-field lookup helper
    const matchesInput = (obj) => {
      if (!obj) return false;
      const email = (obj.email || '').toLowerCase().trim();
      const loginEmail = (obj.loginEmail || '').toLowerCase().trim();
      const name = (obj.name || obj.fullName || obj.contactPerson || '').toLowerCase().trim();
      const companyName = (obj.companyName || obj.company || '').toLowerCase().trim();
      const empId = (obj.employeeId || '').toLowerCase().trim();

      // Exact email / loginEmail match
      if (email && email === trimmedEmail) return true;
      if (loginEmail && loginEmail === trimmedEmail) return true;

      // Username / empId match only if input does not contain @
      if (!trimmedEmail.includes('@')) {
        if (name && name === trimmedEmail) return true;
        if (companyName && companyName === trimmedEmail) return true;
        if (empId && empId === trimmedEmail) return true;
      }

      return false;
    };

    let matchedUser = registeredUsers.find(matchesInput);

    if (!matchedUser) {
      try {
        const savedUserStr = localStorage.getItem('flexistaff_user');
        if (savedUserStr) {
          const u = JSON.parse(savedUserStr);
          if (matchesInput(u)) matchedUser = u;
        }
      } catch {}
    }

    let matchedManagerOrg = null;
    try {
      const savedManagersStr = localStorage.getItem('flexistaff_managers');
      if (savedManagersStr) {
        const managersList = JSON.parse(savedManagersStr);
        matchedManagerOrg = managersList.find(matchesInput);
      }
    } catch {}

    let matchedPartnerOrg = null;
    try {
      const savedPartnersStr = localStorage.getItem('flexistaff_partners');
      let currentPartnersList = [];
      if (savedPartnersStr) {
        try { currentPartnersList = JSON.parse(savedPartnersStr); } catch {}
      }
      if (!currentPartnersList || currentPartnersList.length === 0) {
        currentPartnersList = initialPartners;
      }
      matchedPartnerOrg = (currentPartnersList || []).find(matchesInput);
    } catch {}

    let matchedClientOrg = null;
    try {
      const savedClientsStr = localStorage.getItem('flexistaff_clients');
      if (savedClientsStr) {
        const clientsList = JSON.parse(savedClientsStr);
        matchedClientOrg = clientsList.find(matchesInput);
      }
    } catch {}

    let matchedWorkforceOrg = null;
    try {
      const savedWorkforceStr = localStorage.getItem('flexistaff_workforce');
      if (savedWorkforceStr) {
        const workforceList = JSON.parse(savedWorkforceStr);
        matchedWorkforceOrg = workforceList.find(matchesInput);
      }
    } catch {}

    // Check if account has been explicitly deleted
    try {
      const deletedAccountsStr = localStorage.getItem('flexistaff_deleted_accounts');
      if (deletedAccountsStr) {
        const deletedList = JSON.parse(deletedAccountsStr);
        if (Array.isArray(deletedList) && (deletedList.includes(trimmedEmail) || (trimmedEmail.includes('sharon') && deletedList.some(e => e.includes('sharon'))))) {
          return {
            success: false,
            error: 'Account not found: This account has been permanently deleted by Admin.',
          };
        }
      }
    } catch {}

    // Strict Password Validation
    const matchedAccount = matchedUser || matchedManagerOrg || matchedPartnerOrg || matchedClientOrg || matchedWorkforceOrg;
    const isStandardRoleInput =
      ['admin', 'admin@flexistaff.com', 'admin@flexistaff.ai',
       'manager', 'manager@flexistaff.com',
       'client', 'client@flexistaff.com',
       'partner', 'partner@flexistaff.com',
       'workforce', 'workforce@flexistaff.com', 'freelancer'].includes(trimmedEmail);

    if (!matchedAccount && !isStandardRoleInput) {
      return {
        success: false,
        error: 'Account not found. Please check your email address or register for an account.',
      };
    }

    const expectedPassword =
      matchedUser?.password ||
      matchedUser?.tempPassword ||
      matchedPartnerOrg?.tempPassword ||
      matchedPartnerOrg?.password ||
      matchedManagerOrg?.tempPassword ||
      matchedManagerOrg?.password ||
      matchedWorkforceOrg?.tempPassword ||
      matchedWorkforceOrg?.password ||
      matchedClientOrg?.password ||
      matchedClientOrg?.tempPassword ||
      'Password123!';

    if (trimmedPassword !== expectedPassword) {
      return {
        success: false,
        error: 'Invalid password. Please check your password and try again.',
      };
    }

    const isWorkforceUser =
      Boolean(matchedWorkforceOrg) ||
      trimmedEmail.includes('workforce') ||
      trimmedEmail.includes('freelancer') ||
      trimmedEmail.includes('professional') ||
      selectedRole === 'Workforce' ||
      selectedRole === 'Freelancer' ||
      (matchedUser && (
        matchedUser.role === 'Workforce' ||
        matchedUser.role === 'Freelancer' ||
        matchedUser.role === 'Professional' ||
        matchedUser.role === 'Talent' ||
        matchedUser.role === 'ROLE_WORKFORCE' ||
        matchedUser.role === 'ROLE_PROFESSIONAL'
      ));

    const isPartnerUser =
      !isWorkforceUser &&
      (Boolean(matchedPartnerOrg) ||
      trimmedEmail.includes('partner') ||
      selectedRole === 'Partner Company' ||
      selectedRole === 'Partner' ||
      (matchedUser && (
        matchedUser.role === 'Partner Company' ||
        matchedUser.role === 'Partner' ||
        matchedUser.role === 'ROLE_PARTNER'
      )));

    let userRole = selectedRole;
    if (!userRole) {
      if (isWorkforceUser) {
        userRole = 'Workforce';
      } else if (isPartnerUser) {
        userRole = 'Partner Company';
      } else if (matchedManagerOrg || trimmedEmail.includes('manager') || selectedRole === 'Manager' || (matchedUser && matchedUser.role === 'Manager')) {
        userRole = 'Manager';
      } else if (matchedClientOrg || trimmedEmail.includes('client') || selectedRole === 'Client' || (matchedUser && matchedUser.role === 'Client')) {
        userRole = 'Client';
      } else if (trimmedEmail.includes('admin') || trimmedEmail === 'admin' || selectedRole === 'Admin' || (matchedUser && matchedUser.role === 'Admin')) {
        userRole = 'Admin';
      } else if (matchedUser && matchedUser.role) {
        userRole = matchedUser.role;
      } else {
        userRole = 'Workforce';
      }
    }

    const portalPath =
      userRole === 'Client'
        ? '/client/dashboard'
        : userRole === 'Manager'
        ? '/manager/dashboard'
        : userRole === 'Partner Company' || userRole === 'Partner'
        ? '/partner/dashboard'
        : userRole === 'Workforce' || userRole === 'Freelancer'
        ? '/workforce/dashboard'
        : '/admin/dashboard';

    const displayName =
      (userRole === 'Manager' ? matchedManagerOrg?.name : null) ||
      (userRole === 'Partner Company' ? (matchedPartnerOrg?.contactPerson || matchedPartnerOrg?.name) : null) ||
      (userRole === 'Client' ? (matchedClientOrg?.contactPerson || matchedClientOrg?.name) : null) ||
      (userRole === 'Workforce' ? matchedWorkforceOrg?.name : null) ||
      matchedUser?.name ||
      matchedUser?.fullName ||
      matchedManagerOrg?.name ||
      matchedPartnerOrg?.name ||
      matchedClientOrg?.name ||
      trimmedEmail.split('@')[0];

    const partnerCompany =
      matchedPartnerOrg?.companyName ||
      matchedPartnerOrg?.name ||
      matchedWorkforceOrg?.partnerCompany ||
      matchedWorkforceOrg?.partnerName ||
      matchedWorkforceOrg?.partner ||
      matchedUser?.partnerCompany ||
      matchedUser?.companyName ||
      matchedUser?.company ||
      matchedUser?.partnerName ||
      '';

    const resolvedPartnerCompanyId =
      matchedPartnerOrg?.id ||
      matchedUser?.partnerCompanyId ||
      matchedUser?.id ||
      (trimmedEmail.includes('infosys') ? 'prt-infosys' : 'prt-partner');

    const companyName =
      partnerCompany ||
      (userRole === 'Partner Company'
        ? (trimmedEmail.includes('infosys') ? 'Infosys Technologies' : 'Partner Company')
        : userRole === 'Client'
        ? 'Enterprise Client'
        : userRole === 'Manager'
        ? 'Enterprise Resource Allocation'
        : '');

    const roleType =
      matchedWorkforceOrg?.roleType ||
      matchedUser?.roleType ||
      (partnerCompany ? 'Professional' : 'Freelancer');

    const professionalType =
      matchedWorkforceOrg?.professionalType ||
      matchedUser?.professionalType ||
      (partnerCompany ? 'PARTNER_EMPLOYEE' : 'FREELANCER');

    const resolvedEmail =
      matchedManagerOrg?.email ||
      matchedManagerOrg?.loginEmail ||
      matchedUser?.email ||
      matchedPartnerOrg?.email ||
      matchedClientOrg?.email ||
      matchedWorkforceOrg?.email ||
      trimmedEmail;

    const localUser = {
      id: matchedUser?.id || matchedManagerOrg?.id || matchedPartnerOrg?.id || matchedWorkforceOrg?.id || matchedClientOrg?.id || 1,
      numericId: matchedUser?.id || matchedManagerOrg?.id || matchedPartnerOrg?.id || matchedWorkforceOrg?.id || matchedClientOrg?.id || 1,
      employeeId: matchedUser?.id || matchedManagerOrg?.id || matchedPartnerOrg?.id || matchedWorkforceOrg?.id || matchedClientOrg?.id || 1,
      partnerCompanyId: resolvedPartnerCompanyId,
      name: displayName,
      fullName: displayName,
      email: resolvedEmail,
      loginEmail: matchedManagerOrg?.loginEmail || matchedUser?.loginEmail || resolvedEmail,
      phone: matchedWorkforceOrg?.phone || matchedManagerOrg?.phone || matchedUser?.phone || matchedPartnerOrg?.phone || matchedClientOrg?.phone || '',
      companyName: companyName,
      company: companyName,
      partnerCompany: companyName,
      partnerName: companyName,
      partner: companyName,
      roleType: roleType,
      professionalType: professionalType,
      userType: professionalType,
      contactPerson: matchedPartnerOrg?.contactPerson || displayName,
      role: userRole,
      portalPath,
      avatar: matchedWorkforceOrg?.avatar || matchedManagerOrg?.avatar || matchedUser?.avatar || matchedPartnerOrg?.logo || '',
      location: matchedPartnerOrg?.location || matchedWorkforceOrg?.location || matchedManagerOrg?.location || matchedUser?.location || '',
      address: matchedPartnerOrg?.location || matchedWorkforceOrg?.location || matchedManagerOrg?.address || matchedUser?.address || '',
      department: matchedManagerOrg?.department || matchedUser?.department || '',
      jobTitle: matchedWorkforceOrg?.title || matchedWorkforceOrg?.role || matchedManagerOrg?.jobTitle || matchedUser?.jobTitle || '',
      title: matchedWorkforceOrg?.title || matchedWorkforceOrg?.role || matchedUser?.title || '',
      bio: matchedWorkforceOrg?.bio || matchedManagerOrg?.bio || matchedUser?.bio || matchedPartnerOrg?.description || '',
      employeeId: matchedWorkforceOrg?.id || matchedManagerOrg?.employeeId || matchedUser?.employeeId || '',
      dob: matchedManagerOrg?.dob || matchedUser?.dob || '',
      joinDate: matchedManagerOrg?.joinDate || matchedUser?.joinDate || '',
      experience: matchedWorkforceOrg?.experience || matchedManagerOrg?.experience || matchedUser?.experience || '',
      skills: matchedWorkforceOrg?.skills || matchedUser?.skills || [],
      hourlyRate: matchedWorkforceOrg?.hourlyRate || matchedUser?.hourlyRate || '$85/hr',
      availability: matchedWorkforceOrg?.availability || matchedUser?.availability || 'Available',
    };

    setUser(localUser);
    setRole(userRole);
    setIsAuthenticated(true);
    localStorage.setItem('flexistaff_user', JSON.stringify(localUser));
    localStorage.setItem('flexistaff_role', userRole);

    try {
      window.dispatchEvent(new CustomEvent('auth_change', { detail: localUser }));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // Save to registered users list for persistence
    try {
      const existingListStr = localStorage.getItem('flexistaff_registered_users');
      let list = existingListStr ? JSON.parse(existingListStr) : [];
      if (!list.some((u) => u.email && u.email.toLowerCase() === trimmedEmail)) {
        list.push(localUser);
        localStorage.setItem('flexistaff_registered_users', JSON.stringify(list));
      }
    } catch {}

    return {
      success: true,
      user: localUser,
      redirectPath: portalPath,
    };
  };

  /**
   * Register a new user and set active authenticated session
   */
  const register = async (userData) => {
    const { email, password, fullName, phone, role = 'Client', companyName, title, skills } = userData;

    if (!email || !password || !fullName) {
      return { success: false, error: 'Full name, email, and password are required.' };
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const userRole = role === 'Freelancer' ? 'Workforce' : role;
    const portalPath =
      userRole === 'Client'
        ? '/client/dashboard'
        : userRole === 'Manager'
        ? '/manager/dashboard'
        : userRole === 'Partner Company' || userRole === 'Partner'
        ? '/partner/dashboard'
        : userRole === 'Workforce'
        ? '/workforce/dashboard'
        : '/admin/dashboard';

    let backendUserId = null;
    try {
      let backendRole = 'ROLE_CLIENT';
      if (userRole === 'Workforce' || userRole === 'Freelancer' || role === 'ROLE_PROFESSIONAL') {
        backendRole = 'ROLE_PROFESSIONAL';
      } else if (userRole === 'Partner Company' || userRole === 'Partner' || role === 'ROLE_PARTNER') {
        backendRole = 'ROLE_PARTNER';
      } else if (userRole === 'Manager' || role === 'ROLE_MANAGER') {
        backendRole = 'ROLE_MANAGER';
      } else if (userRole === 'Admin' || role === 'ROLE_ADMIN') {
        backendRole = 'ROLE_ADMIN';
      }

      const apiRes = await api.auth.register({
        fullName,
        email: trimmedEmail,
        password: trimmedPassword,
        phone: phone || '',
        role: backendRole,
        companyName: companyName || (userRole === 'Client' ? 'Enterprise Client' : null),
        title,
        skills,
      });

      if (apiRes && apiRes.success === false) {
        return {
          success: false,
          error: apiRes.error || 'Email address is already registered or registration failed.',
        };
      }

      if (apiRes && apiRes.data) {
        backendUserId = apiRes.data.id || apiRes.data.userId;
      }
    } catch (err) {
      console.warn('Backend API register offline, using local session state.', err.message);
    }

    const registeredUser = {
      id: backendUserId || 1,
      numericId: backendUserId || 1,
      employeeId: backendUserId || 1,
      name: fullName,
      fullName: fullName,
      email: trimmedEmail,
      password: trimmedPassword,
      tempPassword: trimmedPassword,
      phone: phone || '',
      role: userRole,
      companyName: companyName || (userRole === 'Client' ? 'Enterprise Client' : ''),
      company: companyName || (userRole === 'Client' ? 'Enterprise Client' : ''),
      contactPerson: fullName,
      portalPath,
    };

    setUser(registeredUser);
    setRole(userRole);
    setIsAuthenticated(true);
    localStorage.setItem('flexistaff_user', JSON.stringify(registeredUser));
    localStorage.setItem('flexistaff_role', userRole);
    localStorage.setItem('flexistaff_auth', 'true');

    try {
      window.dispatchEvent(new CustomEvent('auth_change', { detail: registeredUser }));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    // Also persist in flexistaff_registered_users array
    try {
      const existingListStr = localStorage.getItem('flexistaff_registered_users');
      let list = existingListStr ? JSON.parse(existingListStr) : [];
      const filtered = list.filter((u) => u.email && u.email.toLowerCase() !== trimmedEmail);
      filtered.push(registeredUser);
      localStorage.setItem('flexistaff_registered_users', JSON.stringify(filtered));
    } catch {}

    return {
      success: true,
      user: registeredUser,
      redirectPath: portalPath,
    };
  };

  /**
   * Reset / update password directly for a registered email or username
   */
  const resetPassword = async (emailOrUsername, newPassword) => {
    const trimmedInput = (emailOrUsername || '').trim().toLowerCase();
    const trimmedPassword = (newPassword || '').trim();

    if (!trimmedInput) {
      return { success: false, error: 'Please enter your registered email address or username.' };
    }
    if (!trimmedPassword || trimmedPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const matchesInput = (obj) => {
      if (!obj) return false;
      const email = (obj.email || '').toLowerCase().trim();
      const loginEmail = (obj.loginEmail || '').toLowerCase().trim();
      const name = (obj.name || obj.fullName || obj.contactPerson || '').toLowerCase().trim();
      const empId = (obj.employeeId || '').toLowerCase().trim();

      if (email && email === trimmedInput) return true;
      if (loginEmail && loginEmail === trimmedInput) return true;

      const inputUser = trimmedInput.split('@')[0];
      const objUser = email.split('@')[0];
      if (inputUser && objUser && inputUser === objUser && inputUser !== 'admin' && inputUser !== 'manager' && inputUser !== 'client' && inputUser !== 'partner') return true;

      if (name && name === trimmedInput) return true;
      if (empId && empId === trimmedInput) return true;
      return false;
    };

    let updatedAny = false;

    // 1. Update flexistaff_registered_users
    try {
      const stored = localStorage.getItem('flexistaff_registered_users');
      let registeredUsers = stored ? JSON.parse(stored) : [];
      let foundInRegistered = false;
      registeredUsers = registeredUsers.map((u) => {
        if (matchesInput(u)) {
          foundInRegistered = true;
          updatedAny = true;
          return { ...u, password: trimmedPassword, tempPassword: trimmedPassword };
        }
        return u;
      });
      if (foundInRegistered) {
        localStorage.setItem('flexistaff_registered_users', JSON.stringify(registeredUsers));
      }
    } catch {}

    // 2. Update active user session if matching
    try {
      const savedUserStr = localStorage.getItem('flexistaff_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (matchesInput(u)) {
          const updatedUser = { ...u, password: trimmedPassword, tempPassword: trimmedPassword };
          localStorage.setItem('flexistaff_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          updatedAny = true;
        }
      }
    } catch {}

    // 3. Update workforce roster
    try {
      const savedWorkforceStr = localStorage.getItem('flexistaff_workforce');
      if (savedWorkforceStr) {
        let workforceList = JSON.parse(savedWorkforceStr);
        let foundWf = false;
        workforceList = workforceList.map((w) => {
          if (matchesInput(w)) {
            foundWf = true;
            updatedAny = true;
            return { ...w, password: trimmedPassword, tempPassword: trimmedPassword };
          }
          return w;
        });
        if (foundWf) {
          localStorage.setItem('flexistaff_workforce', JSON.stringify(workforceList));
        }
      }
    } catch {}

    // 4. Update managers roster
    try {
      const savedManagersStr = localStorage.getItem('flexistaff_managers');
      if (savedManagersStr) {
        let managersList = JSON.parse(savedManagersStr);
        let foundMgr = false;
        managersList = managersList.map((m) => {
          if (matchesInput(m)) {
            foundMgr = true;
            updatedAny = true;
            return { ...m, password: trimmedPassword, tempPassword: trimmedPassword };
          }
          return m;
        });
        if (foundMgr) {
          localStorage.setItem('flexistaff_managers', JSON.stringify(managersList));
        }
      }
    } catch {}

    // 5. Update partners roster
    try {
      const savedPartnersStr = localStorage.getItem('flexistaff_partners');
      if (savedPartnersStr) {
        let partnersList = JSON.parse(savedPartnersStr);
        let foundPtn = false;
        partnersList = partnersList.map((p) => {
          if (matchesInput(p)) {
            foundPtn = true;
            updatedAny = true;
            return { ...p, password: trimmedPassword, tempPassword: trimmedPassword };
          }
          return p;
        });
        if (foundPtn) {
          localStorage.setItem('flexistaff_partners', JSON.stringify(partnersList));
        }
      }
    } catch {}

    // 6. Update clients roster
    try {
      const savedClientsStr = localStorage.getItem('flexistaff_clients');
      if (savedClientsStr) {
        let clientsList = JSON.parse(savedClientsStr);
        let foundCl = false;
        clientsList = clientsList.map((c) => {
          if (matchesInput(c)) {
            foundCl = true;
            updatedAny = true;
            return { ...c, password: trimmedPassword, tempPassword: trimmedPassword };
          }
          return c;
        });
        if (foundCl) {
          localStorage.setItem('flexistaff_clients', JSON.stringify(clientsList));
        }
      }
    } catch {}

    // Check standard role keywords fallback (admin, manager, client, partner, workforce, etc.)
    const isStandardRoleInput =
      ['admin', 'admin@flexistaff.com', 'admin@flexistaff.ai',
       'manager', 'manager@flexistaff.com',
       'client', 'client@flexistaff.com',
       'partner', 'partner@flexistaff.com',
       'workforce', 'workforce@flexistaff.com', 'freelancer'].includes(trimmedInput);

    if (isStandardRoleInput || !updatedAny) {
      try {
        const stored = localStorage.getItem('flexistaff_registered_users');
        let registeredUsers = stored ? JSON.parse(stored) : [];
        const existingIdx = registeredUsers.findIndex((u) => {
          const uEmail = (u.email || '').toLowerCase().trim();
          return uEmail === trimmedInput || uEmail.split('@')[0] === trimmedInput;
        });
        if (existingIdx >= 0) {
          registeredUsers[existingIdx].password = trimmedPassword;
          registeredUsers[existingIdx].tempPassword = trimmedPassword;
        } else {
          registeredUsers.push({
            id: `usr-${Date.now()}`,
            email: trimmedInput.includes('@') ? trimmedInput : `${trimmedInput}@flexistaff.com`,
            password: trimmedPassword,
            tempPassword: trimmedPassword,
            name: trimmedInput,
            role: trimmedInput.includes('admin') ? 'Admin' : trimmedInput.includes('manager') ? 'Manager' : trimmedInput.includes('client') ? 'Client' : trimmedInput.includes('partner') ? 'Partner Company' : 'Workforce',
          });
        }
        localStorage.setItem('flexistaff_registered_users', JSON.stringify(registeredUsers));
        updatedAny = true;
      } catch {}
    }

    return {
      success: true,
      message: 'Password changed successfully! You can now log in with your new password.',
    };
  };

  /**
   * Clear session on logout
   */
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setRole('');
    localStorage.removeItem('flexistaff_user');
    localStorage.removeItem('flexistaff_role');
    localStorage.removeItem('flexistaff_token');
    localStorage.setItem('flexistaff_auth', 'false');

    try {
      window.dispatchEvent(new CustomEvent('auth_change', { detail: null }));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || role,
        isAuthenticated,
        login,
        register,
        resetPassword,
        logout,
        demoAccounts: {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
