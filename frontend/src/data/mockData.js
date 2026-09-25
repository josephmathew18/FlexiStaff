// FlexiStaff AI - Clean Data Store without Demo Dummy Users

export const initialCompanyProfile = {
  id: '1',
  name: 'FlexiStaff Enterprise Platform',
  legalName: 'FlexiStaff Solutions LLC',
  logoUrl: '',
  registrationNumber: 'REG-2026-889412',
  taxId: 'XX-XXX4910',
  industry: 'Enterprise Workforce Management',
  companyType: 'Enterprise LLC',
  founded: '2026',
  employeeCount: '500+ Professionals',
  status: 'Active',
  email: 'contact@flexistaff.ai',
  phone: '+1 (800) 555-0199',
  website: 'https://flexistaff.ai',
  headquarters: {
    address: '100 Enterprise Way, Suite 500',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
  },
  billingAddress: {
    address: '100 Enterprise Way, Suite 500',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
  },
  overview: 'FlexiStaff AI is a next-generation enterprise staffing and workforce management platform, enabling seamless talent deployment, automated project tracking, and AI-driven skill matching across global enterprises.',
  certifications: [
    { name: 'ISO 27001 Security Standard', verifiedDate: 'Jan 2026', status: 'Active' },
    { name: 'SOC 2 Type II Compliance', verifiedDate: 'Feb 2026', status: 'Active' },
    { name: 'GDPR Data Protection Certified', verifiedDate: 'Mar 2026', status: 'Active' },
  ],
};

export const initialClients = [];
export const initialPartners = [];
export const initialManagers = [];
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
