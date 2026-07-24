import React, { useState } from 'react';
import { Sparkles, Shield, Building2, Heart, Landmark, CheckCircle, Users } from 'lucide-react';

interface NodeItem {
  id: string;
  label: string;
  x: number; // percentage in SVG viewport (0-100)
  y: number; // percentage in SVG viewport (0-100)
  icon: React.ElementType;
  description: string;
}

export function CSREcosystemBanner() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const nodes: NodeItem[] = [
    { id: 'corporate', label: 'CORPORATE', x: 25, y: 18, icon: Building2, description: 'Grants, matching funds & employee engagement policies' },
    { id: 'ngo', label: 'NGO PARTNER', x: 80, y: 18, icon: Heart, description: 'Grassroots implementation, field updates & audit reports' },
    { id: 'government', label: 'GOVERNMENT', x: 20, y: 55, icon: Landmark, description: 'Regulatory alignment, Section 135 compliance & MCA filings' },
    { id: 'auditor', label: 'AUDITOR', x: 85, y: 62, icon: CheckCircle, description: 'Third-party financial verification & impact auditing' },
    { id: 'employee', label: 'EMPLOYEE', x: 38, y: 88, icon: Users, description: 'Volunteering hours, skills contribution & direct pledges' },
    { id: 'community', label: 'COMMUNITY', x: 72, y: 88, icon: Shield, description: 'Beneficiary feedback, local development & long-term progress' },
  ];

  const centerNode = { label: 'CONNECT', x: 53, y: 50 };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#04170e] via-[#092f1f] to-[#03130b] text-white shadow-2xl border border-emerald-900/40 my-8">
      {/* Background Subtle Mesh & Glow Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,_rgba(20,184,166,0.12),_transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d382615_1px,transparent_1px),linear-gradient(to_bottom,#0d382615_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[420px]">
        
        {/* Left Side: Editorial Typography matching attached banner image */}
        <div className="lg:col-span-6 space-y-6 z-10 pr-0 lg:pr-4">
          <div className="inline-flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e5b85c] shadow-[0_0_10px_#e5b85c] animate-pulse" />
            <span className="text-[#e5b85c] text-xs sm:text-sm font-semibold tracking-[0.2em] font-mono uppercase">
              ONE PLATFORM · EVERY CSR STAKEHOLDER
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-serif leading-[1.15] tracking-tight text-slate-100">
            The ecosystem where <br className="hidden sm:inline" />
            <span className="text-white">obligation becomes </span>
            <span className="font-serif italic font-normal text-[#e5b85c] drop-shadow-[0_2px_12px_rgba(229,184,92,0.35)]">
              impact.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/70 max-w-lg leading-relaxed font-sans">
            Unifying corporations, non-profits, government regulators, third-party auditors, employees, and local communities into one transparent trust network.
          </p>

          {/* Active Hover Detail Bar */}
          <div className="h-12 flex items-center">
            {activeNode ? (
              <div className="flex items-center gap-3 bg-emerald-950/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-lg text-xs text-emerald-200 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-[#e5b85c] shrink-0" />
                <span>
                  <strong className="text-white uppercase tracking-wider font-semibold mr-1.5">
                    {nodes.find(n => n.id === activeNode)?.label}:
                  </strong>
                  {nodes.find(n => n.id === activeNode)?.description}
                </span>
              </div>
            ) : (
              <div className="text-xs text-emerald-400/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                Hover over network nodes to explore stakeholder roles
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Stakeholder Constellation Network Diagram */}
        <div className="lg:col-span-6 relative w-full h-[320px] sm:h-[380px] flex items-center justify-center select-none">
          
          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e5b85c" stopOpacity="0.6" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Lines connecting Center (CONNECT) to all nodes */}
            {nodes.map((node) => {
              const isActive = activeNode === node.id;
              return (
                <line
                  key={`center-line-${node.id}`}
                  x1={`${centerNode.x}%`}
                  y1={`${centerNode.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke={isActive ? '#e5b85c' : 'url(#lineGrad)'}
                  strokeWidth={isActive ? '2.5' : '1.2'}
                  strokeDasharray={isActive ? 'none' : '4 3'}
                  opacity={isActive ? 1 : 0.45}
                  filter={isActive ? 'url(#glow)' : undefined}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Polygon perimeter connect lines */}
            <line x1={`${nodes[0].x}%`} y1={`${nodes[0].y}%`} x2={`${nodes[1].x}%`} y2={`${nodes[1].y}%`} stroke="#10b981" strokeWidth="1" opacity="0.25" strokeDasharray="3 3" />
            <line x1={`${nodes[0].x}%`} y1={`${nodes[0].y}%`} x2={`${nodes[2].x}%`} y2={`${nodes[2].y}%`} stroke="#10b981" strokeWidth="1" opacity="0.25" strokeDasharray="3 3" />
            <line x1={`${nodes[1].x}%`} y1={`${nodes[1].y}%`} x2={`${nodes[3].x}%`} y2={`${nodes[3].y}%`} stroke="#10b981" strokeWidth="1" opacity="0.25" strokeDasharray="3 3" />
            <line x1={`${nodes[2].x}%`} y1={`${nodes[2].y}%`} x2={`${nodes[4].x}%`} y2={`${nodes[4].y}%`} stroke="#10b981" strokeWidth="1" opacity="0.25" strokeDasharray="3 3" />
            <line x1={`${nodes[3].x}%`} y1={`${nodes[3].y}%`} x2={`${nodes[5].x}%`} y2={`${nodes[5].y}%`} stroke="#10b981" strokeWidth="1" opacity="0.25" strokeDasharray="3 3" />
            <line x1={`${nodes[4].x}%`} y1={`${nodes[4].y}%`} x2={`${nodes[5].x}%`} y2={`${nodes[5].y}%`} stroke="#10b981" strokeWidth="1" opacity="0.25" strokeDasharray="3 3" />
          </svg>

          {/* Central Node: CONNECT */}
          <div 
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${centerNode.x}%`, top: `${centerNode.y}%` }}
          >
            <div className="relative flex items-center justify-center">
              {/* Pulsing Outer Rings */}
              <div className="absolute w-20 h-20 rounded-full border border-teal-400/40 animate-ping opacity-30" />
              <div className="absolute w-16 h-16 rounded-full bg-teal-500/20 blur-md" />
              
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 border-2 border-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.5)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-[11px] font-extrabold tracking-widest text-white text-center leading-none">
                  CONNECT
                </span>
              </div>
            </div>
          </div>

          {/* Peripheral Stakeholder Nodes */}
          {nodes.map((node) => {
            const Icon = node.icon;
            const isActive = activeNode === node.id;

            return (
              <div
                key={node.id}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 flex flex-col items-center group ${
                  isActive ? 'scale-110 z-30' : 'hover:scale-105'
                }`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {/* Node Circle */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all shadow-lg ${
                  isActive 
                    ? 'bg-[#e5b85c] border-white text-slate-950 shadow-[0_0_18px_#e5b85c]' 
                    : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 hover:border-emerald-300 hover:text-white'
                }`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                {/* Label Text below node */}
                <span className={`text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mt-1.5 whitespace-nowrap transition-colors ${
                  isActive ? 'text-[#e5b85c] font-extrabold' : 'text-emerald-200/90 group-hover:text-white'
                }`}>
                  {node.label}
                </span>
              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}
