import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FilePlus,
  FolderKanban,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ProjectRequestForm } from '../../components/workflow';
import { toast } from 'react-toastify';

export const ClientProjectRequest = () => {
  const { submitClientProjectRequest, clientProfile } = useData() || {};
  const navigate = useNavigate();

  const handleFormSubmit = (data) => {
    const newPrj = submitClientProjectRequest({
      ...data,
      client: clientProfile?.company || 'Finovate Global',
      clientId: clientProfile?.id || 'cli-01',
    });

    toast.success(`Project "${newPrj.name || newPrj.title}" submitted with status: Pending Admin Approval!`);
    navigate(`/client/projects/${newPrj.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Project Requirement
          </h1>

        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit your enterprise staffing requirement. Upon submission, the project status will be{' '}
          <strong className="text-amber-800">Pending Admin Approval</strong>. Once approved by Company Admin, the Organization Manager will request suitable talent.
        </p>
      </div>

      {/* Project Request Form Component */}
      <ProjectRequestForm onSubmitSuccess={handleFormSubmit} />
    </div>
  );
};

export default ClientProjectRequest;
