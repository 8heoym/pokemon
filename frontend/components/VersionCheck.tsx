'use client';

import { useEffect } from 'react';

const CURRENT_VERSION = '20250907-001';

export default function VersionCheck() {
  useEffect(() => {
    const checkVersion = () => {
      const storedVersion = localStorage.getItem('app-version');
      
      if (storedVersion && storedVersion !== CURRENT_VERSION) {
        console.log(`🔄 Version mismatch detected. Stored: ${storedVersion}, Current: ${CURRENT_VERSION}`);
        localStorage.setItem('app-version', CURRENT_VERSION);
        
        if (typeof window !== 'undefined' && window.location) {
          const url = new URL(window.location.href);
          url.searchParams.set('_refresh', Date.now().toString());
          window.location.href = url.toString();
        }
      } else if (!storedVersion) {
        localStorage.setItem('app-version', CURRENT_VERSION);
      }
    };

    checkVersion();
  }, []);

  return null;
}