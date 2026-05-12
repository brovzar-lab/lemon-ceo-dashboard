import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MOCK_PROJECTS } from '../data/mockData'; // projects are demo-only in v1
import { DemoBadge } from '../components/DemoBadge';
import { SidebarNav } from '../components/SidebarNav';
import { isDemoMode } from '../lib/demo';
import type { Project } from '../types';

const PHASES: Project['phase'][] = ['Writing', 'Development', 'Pre-Production', 'Production', 'Post'];

function phaseColor(phase: Project['phase']) {
  const map: Record<Project['phase'], string> = {
    Writing: 'text-violet-400 bg-violet-400/10 border-violet-400/30',
    Development: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    'Pre-Production': 'text-teal-400 bg-teal-400/10 border-teal-400/30',
    Production: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    Post: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  };
  return map[phase];
}

function statusDot(status: Project['status']) {
  const map: Record<Project['status'], string> = {
    active: 'bg-teal-400',
    hold: 'bg-amber-400',
    review: 'bg-blue-400',
  };
  return map[status];
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-pointer hover:border-slate-600 hover:bg-slate-700/60 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-slate-100 leading-tight">{project.title}</h3>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${statusDot(project.status)}`} />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{project.logline}</p>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-slate-400 font-medium">{project.director}</p>
          <p className="text-xs text-slate-600">{project.role}</p>
        </div>
        <span className="text-xs text-slate-600">{project.lastUpdated}</span>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded border ${phaseColor(project.phase)}`}>
          {project.phase}
        </span>
        <span className="text-xs text-slate-600">{project.budget}</span>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const [selected, setSelected] = useState<Project | null>(null);

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => MOCK_PROJECTS,
    staleTime: Infinity,
  });

  const handleAction = () => {
    if (isDemoMode) {
      toast('Demo mode — changes not saved', { icon: '🔒', style: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' } });
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <div className="flex-shrink-0 bg-slate-900 border-r border-slate-800">
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Projects Board</h1>
            <p className="text-xs text-slate-500">{projects.length} active projects</p>
          </div>
          <div className="flex items-center gap-3">
            {isDemoMode && <DemoBadge />}
            <button
              onClick={handleAction}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors border border-slate-700"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-0 min-w-max">
            {PHASES.map((phase) => {
              const phaseProjects = projects.filter((p) => p.phase === phase);
              return (
                <div key={phase} className="w-64 flex-shrink-0 flex flex-col border-r border-slate-800">
                  <div className="px-3 py-3 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${phaseColor(phase)}`}>
                        {phase}
                      </span>
                      <span className="text-xs text-slate-600">{phaseProjects.length}</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
                    {phaseProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => setSelected(project)}
                      />
                    ))}
                    {phaseProjects.length === 0 && (
                      <p className="text-xs text-slate-700 text-center py-4">No projects</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Project detail drawer */}
      {selected && (
        <div className="w-80 flex-shrink-0 border-l border-slate-800 flex flex-col bg-slate-900">
          <div className="px-4 py-4 border-b border-slate-800 flex items-start justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-100 flex-1">{selected.title}</h2>
            <button
              onClick={() => setSelected(null)}
              className="text-slate-600 hover:text-slate-400"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded border ${phaseColor(selected.phase)}`}>
                {selected.phase}
              </span>
              <span className={`flex items-center gap-1 text-xs ${
                selected.status === 'active' ? 'text-teal-400' : selected.status === 'hold' ? 'text-amber-400' : 'text-blue-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot(selected.status)}`} />
                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-500 uppercase tracking-wider text-[10px] mb-1">Logline</p>
                <p className="text-slate-300 leading-relaxed">{selected.logline}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <p className="text-slate-500 uppercase tracking-wider text-[10px] mb-1">Director</p>
                  <p className="text-slate-300">{selected.director}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wider text-[10px] mb-1">Budget</p>
                  <p className="text-slate-300">{selected.budget}</p>
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wider text-[10px] mb-1">Last updated</p>
                  <p className="text-slate-300">{selected.lastUpdated}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={handleAction}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors text-left"
              >
                View full project →
              </button>
              <button
                onClick={handleAction}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors text-left"
              >
                Update status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
