import React from 'react';
import { ShieldCheck, Building2, Users, HardHat } from 'lucide-react';
import RoleCard from './RoleCard';

export const ROLE_DEFINITIONS = [
  {
    role: 'Admin',
    title: 'Admin',
    icon: ShieldCheck,
    description: 'Manage approvals and system operations',
    defaultEmail: 'admin@flexistaff.com',
    defaultPassword: 'admin123',
    redirectPath: '/admin/dashboard',
  },
  {
    role: 'Partner Company',
    title: 'Partner Company',
    icon: Building2,
    description: 'Manage projects and workforce requirements',
    defaultEmail: 'partner@flexistaff.com',
    defaultPassword: 'partner123',
    redirectPath: '/partner/dashboard',
  },
  {
    role: 'Manager',
    title: 'Manager',
    icon: Users,
    description: 'Match and assign workforce to projects',
    defaultEmail: 'manager@flexistaff.com',
    defaultPassword: 'manager123',
    redirectPath: '/manager/dashboard',
  },
];

export const RoleSelector = ({ selectedRole, onSelectRole }) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 tracking-tight">
          Sign in as
        </label>
        <span className="text-[10px] font-semibold text-slate-400">
          Select your portal role
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {ROLE_DEFINITIONS.map((def) => (
          <RoleCard
            key={def.role}
            role={def.role}
            title={def.title}
            description={def.description}
            icon={def.icon}
            isSelected={selectedRole === def.role}
            onSelect={onSelectRole}
          />
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;
