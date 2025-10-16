import React from 'react';
import { FolderOpen, Users, Clock, Plus } from 'lucide-react';

export default function ProjectsSection() {
  const projects = [
    {
      title: 'Build a React Analytics Dashboard',
      description: 'Need a modern analytics dashboard with charts, graphs, and real-time data visualization',
      role: 'Team Member',
      status: 'active',
      members: 3,
      deadline: '5 days left',
    },
    {
      title: 'Emergency Gig',
      description: 'Need urgent plumbing repair - pipe burst in kitchen',
      role: 'Helper',
      status: 'urgent',
      members: 1,
      deadline: '24 hours',
    },
  ];

  return (
    <div className="glass-strong rounded-2xl p-6 md:p-8 neon-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center glow-secondary">
            <FolderOpen className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text">My Posted Projects</h2>
            <p className="text-sm text-muted-foreground">View and manage your project postings</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-gradient-primary rounded-lg font-semibold text-background hover:scale-105 transition-all glow-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Post New
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={index}
            className="glass rounded-xl p-6 hover-lift transition-all border border-primary/20 hover:border-primary/40 group"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Project Info */}
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  {project.status === 'urgent' && (
                    <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full border border-accent/30 glow-accent animate-pulse">
                      URGENT
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="px-3 py-1 glass rounded-lg font-medium text-accent border border-accent/30">
                    {project.role}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.members} {project.members === 1 ? 'applicant' : 'applicants'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {project.deadline}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button className="px-6 py-3 bg-accent/10 text-accent rounded-lg font-semibold hover:bg-accent hover:text-background transition-all border border-accent/30 glow-accent flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Find Matches
                </button>
                <button className="px-4 py-3 glass-strong rounded-lg font-semibold text-foreground hover:bg-muted/20 transition-all">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (Optional) */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No projects posted yet</p>
          <button className="px-6 py-3 bg-gradient-primary rounded-lg font-semibold text-background hover:scale-105 transition-all glow-primary">
            Post Your First Project
          </button>
        </div>
      )}
    </div>
  );
}