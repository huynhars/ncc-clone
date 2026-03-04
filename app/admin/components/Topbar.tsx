'use client';

import Image from 'next/image';

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full h-14 bg-orange-600 flex items-center justify-between px-4">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-2">
        <Image
          src="/Timesheet.png"
          alt="Timesheet Logo"
          width={28}
          height={28}
          priority
        />
        <span className="text-white font-semibold text-lg">
          Timesheet
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 text-white">
        {/* Upload icon */}
        <button className="hover:opacity-80">
          ⬆️
        </button>

        {/* Document icon */}
        <button className="hover:opacity-80">
          📄
        </button>

        {/* Language */}
        <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
          🇬🇧
          <span className="text-sm">English</span>
          <span className="text-xs">▾</span>
        </div>

        {/* More */}
        <button className="hover:opacity-80 text-xl">
          ⋮
        </button>
      </div>
    </header>
  );
}
