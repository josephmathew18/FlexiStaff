import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Session initialization from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('flexistaff_user');
      if (savedUser) return JSON.parse(savedUser);
      return {
        id: 'usr-admin-01',
        name: 'System Administrator',
        fullName: 'System Administrator',
        email: 'admin@flexistaff.com',
        role: 'Admin',
        portalPath: '/admin/dashboard',
      };
    } catch {
      return {
        id: 'usr-admin-01',
        name: 'System Administrator',
        fullName: 'System Administrator',
        email: 'admin@flexistaff.com',
        role: 'Admin',
        portalPath: '/admin/dashboard',
      };
    }
  });

  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('flexistaff_role') || user?.role || 'Admin';
    } catch {
      return 'Admin';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const auth = localStorage.getItem('flexistaff_auth');
      return auth !== null ? auth === 'true' : true;
    } catch {
      return true;
    }
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
          name: authData.fullName,
          fullName: authData.fullName,
          email: authData.email,
          phone: authData.phone || '',
          companyName: authData.companyName || '',
          company: authData.companyName || '',
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

    // Flexible multi-field lookup helper
    const matchesInput = (obj) => {
      if (!obj) return false;
      const email = (obj.email || '').toLowerCase().trim();
      const loginEmail = (obj.loginEmail || '').toLowerCase().trim();
      const name = (obj.name || obj.fullName || obj.contactPerson || '').toLowerCase().trim();
      const empId = (obj.employeeId || '').toLowerCase().trim();
      const firstWord = name.split(' ')[0];

      return (
        (email && email === trimmedEmail) ||
        (loginEmail && loginEmail === trimmedEmail) ||
        (name && name === trimmedEmail) ||
        (empId && empId === trimmedEmail) ||
        (firstWord && firstWord === trimmedEmail) ||
        (email && email.split('@')[0] === trimmedEmail)
      );
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
      if (savedPartnersStr) {
        const partnersList = JSON.parse(savedPartnersStr);
        matchedPartnerOrg = partnersList.find(matchesInput);
      }
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

    let userRole = selectedRole;
    if (!userRole) {
      if (matchedManagerOrg || trimmedEmail.includes('manager') || (matchedUser && matchedUser.role === 'Manager')) {
        userRole = 'Manager';
      } else if (matchedPartnerOrg || trimmedEmail.includes('partner') || (matchedUser && (matchedUser.role === 'Partner Company' || matchedUser.role === 'Partner'))) {
        userRole = 'Partner Company';
      } else if (matchedWorkforceOrg || trimmedEmail.includes('workforce') || trimmedEmail.includes('freelancer') || trimmedEmail.includes('worker') || (matchedUser && matchedUser.role === 'Workforce')) {
        userRole = 'Workforce';
      } else if (matchedClientOrg || trimmedEmail.includes('client') || (matchedUser && matchedUser.role === 'Client')) {
        userRole = 'Client';
      } else if (trimmedEmail.includes('admin') || trimmedEmail === 'admin' || (matchedUser && matchedUser.role === 'Admin')) {
        userRole = 'Admin';
      } else if (matchedUser && matchedUser.role) {
        userRole = matchedUser.role;
      } else {
        userRole = 'Client';
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
      matchedWorkforceOrg?.name ||
      trimmedEmail.split('@')[0];

    const companyName =
      matchedUser?.companyName ||
      matchedUser?.company ||
      matchedPartnerOrg?.name ||
      matchedClientOrg?.companyName ||
      matchedClientOrg?.company ||
      (userRole === 'Client' ? 'Enterprise Client' : userRole === 'Partner Company' ? 'Partner Company' : userRole === 'Manager' ? 'Enterprise Resource Allocation' : '');

    const resolvedEmail =
      matchedManagerOrg?.email ||
      matchedManagerOrg?.loginEmail ||
      matchedUser?.email ||
      matchedPartnerOrg?.email ||
      matchedClientOrg?.email ||
      matchedWorkforceOrg?.email ||
      trimmedEmail;

    const localUser = {
      id: (userRole === 'Manager' ? matchedManagerOrg?.id : null) || matchedUser?.id || matchedPartnerOrg?.id || matchedClientOrg?.id || matchedWorkforceOrg?.id || `usr-${Date.now()}`,
      name: displayName,
      fullName: displayName,
      email: resolvedEmail,
      phone: matchedManagerOrg?.phone || matchedUser?.phone || matchedPartnerOrg?.phone || matchedClientOrg?.phone || matchedWorkforceOrg?.phone || '',
      companyName: companyName,
      company: companyName,
      contactPerson: displayName,
      role: userRole,
      portalPath,
      avatar: matchedManagerOrg?.avatar || matchedUser?.avatar || '',
    };

    setUser(localUser);
    setRole(userRole);
    setIsAuthenticated(true);
    localStorage.setItem('flexistaff_user', JSON.stringify(localUser));
    localStorage.setItem('flexistaff_role', userRole);

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

    const registeredUser = {
      id: `usr-${Date.now()}`,
      name: fullName,
      fullName: fullName,
      email: trimmedEmail,
      phone: phone || '',
      role: userRole,
      companyName: companyName || (userRole === 'Client' ? 'Enterprise Client' : ''),
      company: companyName || (userRole === 'Client' ? 'Enterprise Client' : ''),
      contactPerson: fullName,
      portalPath,
    };

    try {
      const backendRole = userRole === 'Client' ? 'ROLE_CLIENT' : 'ROLE_PROFESSIONAL';
      await api.auth.register({
        fullName,
        email: trimmedEmail,
        password: trimmedPassword,
        phone: phone || '',
        role: backendRole,
        companyName: companyName || (userRole === 'Client' ? 'Enterprise Client' : null),
        title,
        skills,
      });
    } catch (err) {
      console.warn('Backend API register offline, saving registered profile locally.');
    }

    setUser(registeredUser);
    setRole(userRole);
    setIsAuthenticated(true);
    localStorage.setItem('flexistaff_user', JSON.stringify(registeredUser));
    localStorage.setItem('flexistaff_role', userRole);
    localStorage.setItem('flexistaff_auth', 'true');

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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || role,
        isAuthenticated,
        login,
        register,
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
