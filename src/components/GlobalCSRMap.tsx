import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const mockLocations: any[] = [];

export function GlobalCSRMap() {
  return (
    <Card className="border-indigo-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
      <CardHeader className="bg-white z-10 pb-4 shrink-0">
        <CardTitle className="text-xl flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-500" />
          Global CSR Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative z-0">
        <MapContainer center={[20, 0]} zoom={2} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mockLocations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                <div className="p-1">
                  <div className="font-bold text-sm mb-1">{loc.name}</div>
                  <div className="text-xs text-gray-600 mb-1">{loc.type} • {loc.focus}</div>
                  <div className="text-xs text-gray-500">{loc.location}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
