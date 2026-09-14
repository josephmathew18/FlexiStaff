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
export const initialPartners = [
  {
    id: 'prt-001',
    name: 'Infosys Technologies',
    companyName: 'Infosys Technologies',
    contactPerson: 'Joseph Mathew',
    email: 'infosys@gmail.com',
    loginEmail: 'infosys',
    phone: '+91 98765 43210',
    status: 'Active',
    tier: 'Tier-1 Strategic Partner',
    location: 'Bengaluru, India',
    city: 'Bengaluru, India',
    specialties: ['Cloud Computing', 'Enterprise IT', 'Full Stack Development'],
    website: 'https://infosys.com',
    description: 'Enterprise IT Services & Strategic Talent Partner on FlexiStaff.',
    joinedDate: '2025-01-15',
    suppliedProfessionals: 12,
    activePlacements: 8,
    availabilityRate: '98.5%',
    rating: 4.9,
    role: 'Partner Company',
  },
];
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
