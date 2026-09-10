// FlexiStaff AI - Clean Data Store without Demo Dummy Users

export const initialCompanyProfile = {
  id: '',
  name: 'FlexiStaff Enterprise Platform',
  legalName: 'FlexiStaff Solutions LLC',
  logoUrl: '',
  registrationNumber: '',
  taxId: '',
  industry: 'Enterprise Workforce Management',
  companyType: 'Enterprise',
  founded: '2024',
  employeeCount: '0',
  status: 'Active Enterprise',
  email: '',
  phone: '',
  website: '',
  headquarters: {
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  billingAddress: {
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  },
  overview: 'FlexiStaff AI Enterprise Workforce Management Platform.',
  certifications: [],
};

export const initialClients = [];
export const initialPartners = [];
export const initialManagers = [
  {
    id: 'mng-001',
    employeeId: 'MNG-001',
    name: 'Thomas Anderson',
    email: 'thomas@flexistaff.com',
    loginEmail: 'thomas',
    phone: '+91 98765 43210',
    role: 'Organization Manager',
    jobTitle: 'Senior HR Operations Manager',
    department: 'Enterprise Resource Allocation',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
  },
  {
    id: 'mng-002',
    employeeId: 'MNG-002',
    name: 'Manager User',
    email: 'manager@gmail.com',
    loginEmail: 'manager',
    phone: '+91 98765 43211',
    role: 'Organization Manager',
    jobTitle: 'Resource Allocation Manager',
    department: 'Enterprise Resource Allocation',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
  },
];
export const initialWorkforce = [];
export const initialProjects = [];
export const initialActivities = [];
export const initialNotifications = [];

export const initialPartnerProfile = {
  id: '',
  companyName: '',
  email: '',
  phone: '',
  status: 'Active',
  tier: '',
};

export const initialPartnerProjects = [];
export const initialPartnerWorkforce = [];
export const initialPartnerWorkforceRequests = [];
export const initialPartnerNotifications = [];
export const initialPartnerActivities = [];
export const initialPartnerSupportTickets = [];

export const initialManagerProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  role: 'Manager',
};

export const initialManagerAssignments = [];
export const initialManagerNotifications = [];

export const initialWorkforceUserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  title: '',
  bio: '',
  skills: [],
};

export const initialWorkforceNotifications = [];

export const initialClientProfile = {
  id: '',
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  industry: '',
  tier: '',
};

export const initialAdminProfile = {
  id: '',
  name: '',
  email: '',
  role: 'Admin',
};

export const chartAnalyticsData = {
  monthlyProjectGrowth: [],
  revenueVsPayout: [],
  skillDemandDistribution: [],
  sprintVelocity: [],
};
