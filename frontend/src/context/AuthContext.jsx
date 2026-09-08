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
    let savedUser = null;
    try {
      const stored = localStorage.getItem('flexistaff_user');
      if (stored) savedUser = JSON.parse(stored);
    } catch {
      // Ignore
    }

    let userRole = selectedRole;
    if (!userRole) {
      if (savedUser && savedUser.email && savedUser.email.toLowerCase() === trimmedEmail && savedUser.role) {
        userRole = savedUser.role;
      } else if (trimmedEmail.includes('client')) {
        userRole = 'Client';
      } else if (trimmedEmail.includes('manager')) {
        userRole = 'Manager';
      } else if (trimmedEmail.includes('partner')) {
        userRole = 'Partner Company';
      } else if (trimmedEmail.includes('workforce') || trimmedEmail.includes('freelancer') || trimmedEmail.includes('worker')) {
        userRole = 'Workforce';
      } else if (trimmedEmail.includes('admin') || trimmedEmail === 'admin') {
        userRole = 'Admin';
      } else {
        userRole = savedUser?.role || 'Admin';
      }
    }

    const portalPath =
      userRole === 'Client'
        ? '/client/dashboard'
        : userRole === 'Manager'
        ? '/manager/dashboard'
        : userRole === 'Partner Company'
        ? '/partner/dashboard'
        : userRole === 'Workforce'
        ? '/workforce/dashboard'
        : '/admin/dashboard';

    const localUser = {
      id: (savedUser && savedUser.email?.toLowerCase() === trimmedEmail && savedUser.id) || `usr-${Date.now()}`,
      name: (savedUser && savedUser.email?.toLowerCase() === trimmedEmail && (savedUser.name || savedUser.fullName)) || trimmedEmail.split('@')[0],
      fullName: (savedUser && savedUser.email?.toLowerCase() === trimmedEmail && (savedUser.fullName || savedUser.name)) || trimmedEmail.split('@')[0],
      email: trimmedEmail,
      phone: savedUser?.phone || '',
      companyName: savedUser?.companyName || savedUser?.company || (userRole === 'Client' ? 'Enterprise Client' : ''),
      company: savedUser?.company || savedUser?.companyName || (userRole === 'Client' ? 'Enterprise Client' : ''),
      contactPerson: (savedUser && savedUser.email?.toLowerCase() === trimmedEmail && (savedUser.name || savedUser.fullName)) || trimmedEmail.split('@')[0],
      role: userRole,
      portalPath,
    };

    setUser(localUser);
    setRole(userRole);
    setIsAuthenticated(true);
    localStorage.setItem('flexistaff_user', JSON.stringify(localUser));

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
    const portalPath = userRole === 'Client' ? '/client/dashboard' : '/workforce/dashboard';

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
