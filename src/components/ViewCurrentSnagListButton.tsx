'use client';

import Link from 'next/link';

/**
 * A button component that links to the current snag list
 */
export default function ViewCurrentSnagListButton() {
  return (
    <Link href="/snags/summary">
      <button 
        className="menu-item bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 w-full sm:w-auto"
        aria-label="View your current snag list"
      >
        View snag list
      </button>
    </Link>
  );
}
