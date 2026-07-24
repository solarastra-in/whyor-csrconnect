import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Users, HeartHandshake, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LOCATION_COORDINATES: Record<string, [number, number]> = {
  'Varanasi, UP': [25.3176, 82.9739],
  'Gurugram, Haryana': [28.4595, 77.0266],
  'Bangalore, Karnataka': [12.9716, 77.5946],
  'Bengaluru, Karnataka': [12.9716, 77.5946],
  'Mumbai, Maharashtra': [19.0760, 72.8777],
  'Pune, Maharashtra': [18.5204, 73.8567],
  'Delhi NCR': [28.6139, 77.2090],
  'Chennai, Tamil Nadu': [13.0827, 80.2707],
  'Kolkata, West Bengal': [22.5726, 88.3639],
  'Hyderabad, Telangana': [17.3850, 78.4867],
  'Remote / Pan India': [20.5937, 78.9629],
  'Remote': [20.5937, 78.9629]
};

interface ProjectMapViewProps {
  projects: any[];
  onSelectProject?: (project: any) => void;
}

export function ProjectMapView({ projects, onSelectProject }: ProjectMapViewProps) {
  // Compute lat/lng for projects
  const mapProjects = projects.map((p, idx) => {
    let coords: [number, number] = [20.5937 + (idx * 0.3), 78.9629 + (idx * 0.3)];
    
    for (const key of Object.keys(LOCATION_COORDINATES)) {
      if (p.location && p.location.toLowerCase().includes(key.toLowerCase().split(',')[0])) {
        const base = LOCATION_COORDINATES[key];
        coords = [base[0] + (Math.random() * 0.06 - 0.03), base[1] + (Math.random() * 0.06 - 0.03)];
        break;
      }
    }

    return {
      ...p,
      coords
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm text-white">Geographic Volunteer Projects Map</h3>
          <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/40 text-[10px]">
            {mapProjects.length} Opportunities Displayed
          </Badge>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Click markers on the map to inspect project details & volunteer opportunities
        </span>
      </div>

      <div className="h-[520px] w-full relative z-0">
        <MapContainer center={[21.1458, 79.0882]} zoom={5} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mapProjects.map((p) => (
            <Marker key={p.id} position={p.coords}>
              <Popup className="min-w-[260px]">
                <div className="p-1 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-indigo-100 text-indigo-800 text-[10px] font-bold border-indigo-200">
                      {p.tags?.[0] || 'CSR Initiative'}
                    </Badge>
                    <span className="text-[11px] text-slate-500 font-semibold">{p.location}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-tight">
                    {p.name}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {p.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-semibold text-indigo-700">
                      <Building2 className="w-3 h-3" /> {p.charity}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-800">
                      <Users className="w-3 h-3 text-emerald-600" /> {p.volunteerRoles?.[0]?.spotsLeft || 12} spots
                    </span>
                  </div>

                  {onSelectProject && (
                    <Button
                      onClick={() => onSelectProject(p)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-7 gap-1 mt-1"
                    >
                      View Project <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
