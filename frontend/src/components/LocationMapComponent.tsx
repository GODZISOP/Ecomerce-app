'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// Component to handle map clicks
const LocationMarker = ({ position, setPosition, onLocationUpdate }: any) => {
  useMapEvents({
    click(e: any) {
      setPosition(e.latlng);
      onLocationUpdate(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
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
  return (
    <MapContainer 
      center={position} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker 
        position={position} 
        setPosition={setPosition} 
        onLocationUpdate={onLocationUpdate} 
      />
    </MapContainer>
  );
}
