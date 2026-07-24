import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import L from 'leaflet';
import { MapPin, HeartHandshake } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATE_COORDINATES: Record<string, [number, number]> = {
  'Maharashtra': [19.0760, 72.8777], // Mumbai
  'Mumbai': [19.0760, 72.8777],
  'Delhi': [28.6139, 77.2090],
  'NCR': [28.6139, 77.2090],
  'Karnataka': [12.9716, 77.5946], // Bengaluru
  'Bengaluru': [12.9716, 77.5946],
  'Uttar Pradesh': [25.3176, 82.9739], // Varanasi
  'Varanasi': [25.3176, 82.9739],
  'Haryana': [28.4595, 77.0266], // Gurugram
  'Gurugram': [28.4595, 77.0266],
  'Tamil Nadu': [13.0827, 80.2707], // Chennai
  'Chennai': [13.0827, 80.2707],
  'West Bengal': [22.5726, 88.3639], // Kolkata
  'Kolkata': [22.5726, 88.3639],
  'Telangana': [17.3850, 78.4867], // Hyderabad
  'Hyderabad': [17.3850, 78.4867],
  'Gujarat': [23.0225, 72.5714], // Ahmedabad
  'Rajasthan': [26.9124, 75.7873] // Jaipur
};

const DEFAULT_LOCATIONS = [
  { id: '1', name: 'EcoBharat Foundation', focus: 'Environment & Forestry', location: 'Varanasi, Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { id: '2', name: 'Shiksha India Trust', focus: 'Education & Mentorship', location: 'Gurugram, Haryana', lat: 28.4595, lng: 77.0266 },
  { id: '3', name: 'HealthFirst India', focus: 'Healthcare & Preventive Camps', location: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
  { id: '4', name: 'Surya Jyoti Alliance', focus: 'Clean Energy & Solar Microgrids', location: 'Ranchi, Jharkhand', lat: 23.3441, lng: 85.3096 }
];

export function GlobalCSRMap() {
  const [locations, setLocations] = useState<any[]>(DEFAULT_LOCATIONS);

  useEffect(() => {
    fetchCharityLocations();
  }, []);

  const fetchCharityLocations = async () => {
    try {
      const snap = await getDocs(collection(db, 'charities'));
      if (!snap.empty) {
        const fetched = snap.docs.map((d, index) => {
          const data = d.data();
          const locationStr = data.location || (data.city && data.state ? `${data.city}, ${data.state}` : 'India');
          
          let latLng: [number, number] = [20.5937 + (index * 0.5), 78.9629 + (index * 0.5)];
          for (const key of Object.keys(STATE_COORDINATES)) {
            if (locationStr.toLowerCase().includes(key.toLowerCase()) || (data.state && data.state.toLowerCase().includes(key.toLowerCase()))) {
              latLng = STATE_COORDINATES[key];
              // jitter slightly so multiple charities in same state don't overlap completely
              latLng = [latLng[0] + (Math.random() * 0.08 - 0.04), latLng[1] + (Math.random() * 0.08 - 0.04)];
              break;
            }
          }

          return {
            id: d.id,
            name: data.name || 'CSR Charity Partner',
            focus: data.focus || 'Community Welfare',
            location: locationStr,
            lat: latLng[0],
            lng: latLng[1]
          };
        });
        setLocations(fetched);
      }
    } catch (e) {
      console.error('Error fetching charity map locations:', e);
    }
  };

  return (
    <Card className="border-indigo-100 shadow-sm overflow-hidden h-[500px] flex flex-col">
      <CardHeader className="bg-white z-10 pb-4 shrink-0 border-b">
        <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
          <MapPin className="h-5 w-5 text-indigo-600" />
          National CSR Network Map
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative z-0">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup>
                <div className="p-1">
                  <div className="font-bold text-sm mb-1 text-slate-900 flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5 text-indigo-600" />
                    {loc.name}
                  </div>
                  <div className="text-xs text-indigo-700 font-semibold mb-1">{loc.focus}</div>
                  <div className="text-xs text-slate-500">{loc.location}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
