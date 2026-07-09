'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

// Component to handle map clicks and drop marker
const LocationMarker = ({ position, setPosition, onLocationUpdate, icon }: any) => {
  useMapEvents({
    click(e: any) {
      setPosition(e.latlng);
      onLocationUpdate(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null || !icon ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
};

// Component to handle map view auto-centering when props change
const ChangeMapView = ({ center }: { center: { lat: number; lng: number } }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center.lat, center.lng, map]);
  return null;
};

interface LocationMapComponentProps {
  position: { lat: number; lng: number };
  setPosition: (pos: { lat: number; lng: number }) => void;
  onLocationUpdate: (lat: number, lng: number) => void;
}

export default function LocationMapComponent({
  position,
  setPosition,
  onLocationUpdate
}: LocationMapComponentProps) {
  const customIcon = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    const L = require('leaflet');
    return new L.Icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, []);

  return (
    <MapContainer 
      center={position} 
      zoom={14} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {customIcon && (
        <LocationMarker 
          position={position} 
          setPosition={setPosition} 
          onLocationUpdate={onLocationUpdate} 
          icon={customIcon}
        />
      )}
      <ChangeMapView center={position} />
    </MapContainer>
  );
}

