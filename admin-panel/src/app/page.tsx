'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRootPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin');
  }, [router]);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0B1528',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255,255,255,0.1)',
          borderTopColor: '#00F2FE',
          borderRadius: '50%',
          margin: '0 auto 20px auto',
        }}></div>
        <p style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
          LOADING FATPIZZA ADMINISTRATION SYSTEM...
        </p>
      </div>
      {/* CSS is now globally defined in globals.css, or inline */}
    </div>
  );
}
