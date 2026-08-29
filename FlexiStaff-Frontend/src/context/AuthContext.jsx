import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Standard Demo Accounts for FlexiStaff Platform
export const DEMO_ACCOUNTS = {
  admin: {
    id: 'usr-admin-01',
    name: 'Sarah Jenkins',
    email: 'admin@flexistaff.com',
    aliases: ['sarah.jenkins@flexistaff.ai', 'admin'],
    password: 'admin123',
    role: 'Admin',
    portalName: 'Company Admin Portal',
    portalPath: '/admin/dashboard',
    department: 'Enterprise Operations',
  },
  client: {
    id: 'usr-client-01',
    name: 'David Sterling',
    company: 'Finovate Global',
    email: 'client@flexistaff.com',
    aliases: ['d.sterling@finovate.io', 'client'],
    password: 'client123',
    role: 'Client',
    portalName: 'Client Portal',
    portalPath: '/client/dashboard',
    department: 'Technology & Project Requirements',
  },
  manager: {
    id: 'mng-01',
    name: 'Sarah Jenkins',
    email: 'manager@flexistaff.com',
    aliases: ['sarah.jenkins@flexistaff.ai', 'sarah.jenkins@manager.flexistaff.ai', 'manager'],
    password: 'manager123',
    role: 'Manager',
    portalName: 'Organization Manager Portal',
    portalPath: '/manager/dashboard',
    department: 'Enterprise Workforce Operations',
  },
  partner: {
    id: 'usr-partner-01',
    name: 'Marcus Vance',
    company: 'Apex Digital Enterprises',
    email: 'partner@flexistaff.com',
    aliases: ['partnerships@apexdigital.io', 'partner'],
    password: 'partner123',
    role: 'Partner Company',
    portalName: 'Partner Company Portal',
    portalPath: '/partner/dashboard',
    department: 'Client Partnerships',
  },
  workforce: {
    id: 'usr-workforce-01',
    name: 'Elena Rostova',
    roleType: 'Professional',
    email: 'talent@flexistaff.com',
    aliases: ['workforce@flexistaff.com', 'talent', 'freelancer@flexistaff.com'],
    password: 'talent123',
    role: 'Workforce',
    portalName: 'Professional & Freelancer Portal',
    portalPath: '/workforce/dashboard',
    department: 'Software Engineering Squad',
  },
};

export const AuthProvider = ({ children }) => {
  // Session initialization from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('flexistaff_user');
      return savedUser ? JSON.parse(savedUser) : DEMO_ACCOUNTS.admin;
    } catch {
      return DEMO_ACCOUNTS.admin;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('flexistaff_role') || 'Admin';
    } catch {
      return 'Admin';
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('flexistaff_auth') === 'true';
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
   * Validate and authenticate credentials via Spring Boot REST API or Demo Accounts
   */
  const login = async (email, password, selectedRole) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPassword = (password || '').trim();

    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your email.' };
    }
    if (!trimmedPassword) {
      return { success: false, error: 'Please enter your password.' };
    }
    if (!selectedRole) {
      return { success: false, error: 'Please select your role.' };
    }

    // Role key mapper
    let roleKey = 'admin';
    if (selectedRole === 'Admin' || selectedRole === 'Company Admin') roleKey = 'admin';
    else if (selectedRole === 'Client') roleKey = 'client';
    else if (selectedRole === 'Manager' || selectedRole === 'Organization Manager') roleKey = 'manager';
    else if (selectedRole === 'Partner Company' || selectedRole === 'Partner') roleKey = 'partner';
    else if (selectedRole === 'Workforce' || selectedRole === 'Professional / Freelancer' || selectedRole === 'Professional' || selectedRole === 'Freelancer') roleKey = 'workforce';

    // 1. Attempt Spring Boot Backend REST API Authentication
    const apiRes = await api.auth.login(trimmedEmail, trimmedPassword);
    if (apiRes && apiRes.success && apiRes.data) {
      const authData = apiRes.data;
      if (authData.accessToken) {
        localStorage.setItem('flexistaff_token', authData.accessToken);
      }

      // Map backend role to frontend portal path
      let portalPath = '/admin/dashboard';
      if (authData.role === 'ROLE_CLIENT') portalPath = '/client/dashboard';
      else if (authData.role === 'ROLE_MANAGER') portalPath = '/manager/dashboard';
      else if (authData.role === 'ROLE_PROFESSIONAL') portalPath = '/workforce/dashboard';

      const backendUser = {
        id: authData.userId,
        name: authData.fullName,
        email: authData.email,
        role: selectedRole,
        portalPath,
      };

      setUser(backendUser);
      setRole(selectedRole);
      setIsAuthenticated(true);

      return {
        success: true,
        user: backendUser,
        redirectPath: portalPath,
      };
    }

    // 2. Fallback to Local Demo Accounts for frontend prototype capability
    const accountForRole = DEMO_ACCOUNTS[roleKey];
    const matchedAccountKey = Object.keys(DEMO_ACCOUNTS).find((key) => {
      const acc = DEMO_ACCOUNTS[key];
      return acc.email.toLowerCase() === trimmedEmail || acc.aliases.some((alias) => alias.toLowerCase() === trimmedEmail);
    });

    if (!matchedAccountKey) {
      if (
        (trimmedEmail.includes('admin') && roleKey === 'admin') ||
        (trimmedEmail.includes('client') && roleKey === 'client') ||
        (trimmedEmail.includes('partner') && roleKey === 'partner') ||
        (trimmedEmail.includes('manager') && roleKey === 'manager') ||
        (trimmedEmail.includes('talent') && roleKey === 'workforce') ||
        (trimmedEmail.includes('workforce') && roleKey === 'workforce')
      ) {
        // Allow flexible demo logins
      } else {
        return { success: false, error: 'Invalid email or password.' };
      }
    } else if (matchedAccountKey !== roleKey) {
      return {
        success: false,
        error: `Selected role does not match this account. This account is registered for ${DEMO_ACCOUNTS[matchedAccountKey].role}.`,
      };
    }

    if (matchedAccountKey && trimmedPassword !== DEMO_ACCOUNTS[matchedAccountKey].password && trimmedPassword !== 'password' && trimmedPassword !== 'demo123') {
      return { success: false, error: 'Invalid email or password.' };
    }

    const authenticatedUser = accountForRole;
    setUser(authenticatedUser);
    setRole(authenticatedUser.role);
    setIsAuthenticated(true);

    return {
      success: true,
      user: authenticatedUser,
      redirectPath: authenticatedUser.portalPath,
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
    localStorage.setItem('flexistaff_auth', 'false');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || role,
        isAuthenticated,
        login,
        logout,
        demoAccounts: DEMO_ACCOUNTS,
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
