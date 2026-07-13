'use client';

import React, { useState } from 'react';

// ✅ Apna WhatsApp business number yahan set karein (country code ke saath, no spaces or dashes)
const WHATSAPP_NUMBER = '923145618923'; // 92 = Pakistan, phir number

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  const message = encodeURIComponent('Assalam-o-Alaikum! Mujhe Fat Pizza se order karna hai. 🍕');
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <>
      <style>{`
        @keyframes wp-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
          50% { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
        }
        .wp-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          animation: wp-pulse 2s infinite;
          border-radius: 50px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .wp-btn:hover {
          transform: scale(1.06);
        }
        .wp-icon {
          width: 58px;
          height: 58px;
          background: #25d366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.45);
        }
        .wp-label {
          background: #25d366;
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 8px 14px;
          border-radius: 50px;
          white-space: nowrap;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.35);
          font-family: sans-serif;
        }
      `}</style>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="wp-btn"
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <span className="wp-label">Chat on WhatsApp 💬</span>
        )}
        <span className="wp-icon">
          {/* WhatsApp SVG Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="white">
            <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.655 4.867 1.898 6.97L2 30l7.284-1.872A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.832-1.598l-.418-.249-4.327 1.112 1.136-4.215-.272-.434A11.47 11.47 0 0 1 4.5 16C4.5 9.648 9.648 4.5 16 4.5S27.5 9.648 27.5 16 22.352 27.5 16 27.5zm6.29-8.575c-.344-.172-2.035-1.004-2.35-1.118-.316-.114-.546-.172-.775.172-.23.344-.888 1.118-1.09 1.348-.2.23-.402.258-.746.086-.344-.172-1.452-.535-2.767-1.707-1.022-.912-1.712-2.038-1.913-2.382-.2-.344-.021-.53.15-.702.155-.154.344-.402.516-.603.172-.2.23-.344.344-.573.114-.23.057-.43-.029-.603-.086-.172-.775-1.868-1.062-2.558-.28-.672-.564-.58-.775-.591l-.66-.011c-.23 0-.603.086-.918.43s-1.204 1.176-1.204 2.867 1.232 3.326 1.404 3.555c.172.23 2.425 3.703 5.875 5.19.821.354 1.462.565 1.962.724.824.262 1.574.225 2.167.137.66-.099 2.035-.831 2.323-1.634.287-.802.287-1.49.2-1.634-.086-.144-.316-.23-.66-.402z"/>
          </svg>
        </span>
      </a>
    </>
  );
}
