'use client';
import dynamic from 'next/dynamic';

// Disable SSR (Server Side Rendering) for Navbar
const NavbarClientOnly = dynamic(() => import('./NavbarClientOnly'), {
  ssr: false,
});

export default NavbarClientOnly;

