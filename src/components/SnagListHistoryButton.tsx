'use client';

import Link from 'next/link';

/**
 * A button component that links to the snag list history page
 */
export default function SnagListHistoryButton() {
  return (
    <Link href="/snag-lists">
      <button 
        className="menu-item bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 w-full sm:w-auto"
        aria-label="View all your snag lists"
      >
        View all snag lists
      </button>
    </Link>
  );
}
