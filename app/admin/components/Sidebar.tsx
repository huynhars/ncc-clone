'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Users,
  Tag,
  Settings,
  Briefcase,
  Gavel,
  Book,
  Calendar,
  Building2,
  FileText,
  LayoutGrid,
  Sliders,
  Clock,
  History,
  RefreshCcw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const [openAdmin, setOpenAdmin] = useState(true);
  const [openTimesheet, setOpenTimesheet] = useState(true);
  const [openManagement, setOpenManagement] = useState(true);

  return (
    <aside className="w-72 h-screen bg-white border-r flex flex-col">
      {/* HEADER */}
      <div className="h-28 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white px-4 py-3 flex-shrink-0">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-orange-500">
            U
          </div>
          <div className="text-sm">
            <div className="font-semibold">admin admin</div>
            <div className="text-xs opacity-90">
              admin@aspnetboilerplate.com
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto text-sm py-2">

        {/* Admin */}
        <Section
          label="Admin"
          icon={LayoutGrid}
          open={openAdmin}
          onToggle={() => setOpenAdmin(!openAdmin)}
        >
          <SubItem icon={Users} label="Users" href="/admin/users" />
          <SubItem icon={Tag} label="Roles" href="/admin/roles" />
          <SubItem icon={Settings} label="Configuration" href="/admin/configuration" />
          <SubItem icon={Briefcase} label="Clients" href="/admin/clients" />
          <SubItem icon={Gavel} label="Punishments" href="/admin/punishments" />
          <SubItem icon={Book} label="Tasks" href="/admin/tasks" />
          <SubItem icon={Calendar} label="Leave types" href="/admin/leave-types" />
          <SubItem icon={Building2} label="Branches" href="/admin/branches" />
          <SubItem icon={FileText} label="Position" href="/admin/position" />
          <SubItem icon={LayoutGrid} label="Capability" href="/admin/capability" />
          <SubItem icon={Sliders} label="Capability setting" href="/admin/capability-setting" />
          <SubItem icon={Calendar} label="Off day setting" href="/admin/off-day-setting" />
          <SubItem icon={Clock} label="Overtime settings" href="/admin/overtime-settings" />
          <SubItem icon={History} label="Audit logs" href="/admin/audit-logs" />
          <SubItem icon={RefreshCcw} label="Background Job" href="/admin/background-job" />
        </Section>

        {/* Personal timesheet */}
        <Section
          label="Personal timesheet"
          icon={User}
          open={openTimesheet}
          onToggle={() => setOpenTimesheet(!openTimesheet)}
        >
          <SubItem icon={Clock} label="My timesheet" href="/admin" />
          <SubItem icon={Calendar} label="My off/remote/onsite requests" href="/admin/my-requests" />
          <SubItem icon={Users} label="Team working calendar" href="/admin/team-calendar" />
          <SubItem icon={Clock} label="My working time" href="/admin/my-working-time" />
        </Section>

        {/* Management */}
        <Section
          label="Management"
          icon={Briefcase}
          open={openManagement}
          onToggle={() => setOpenManagement(!openManagement)}
        >
          <SubItem icon={Calendar} label="Manage off/remote/onsite requests" href="/admin/manage-requests" />
          <SubItem icon={Clock} label="Timesheet management" href="/admin/timesheet-management" />
          <SubItem icon={Users} label="Timesheets monitoring" href="/admin/timesheets-monitoring" />
          <SubItem icon={Briefcase} label="Project management" href="/admin/project-management" />
          <SubItem icon={Book} label="Review Interns" href="/admin/review-interns" />
          <SubItem icon={History} label="Retrospectives" href="/admin/retrospectives" />
          <SubItem icon={Clock} label="Manage employee working times" href="/admin/manage-working-times" />
        </Section>
      </nav>

      {/* FOOTER */}
      <div className="border-t px-4 py-3 text-xs text-gray-500">
        <div>
          © 2026 <span className="text-pink-600">Timesheet</span>.
        </div>
        <div className="mt-1">Version 4.3.0.0 [20260302]</div>
      </div>
    </aside>
  );
}

/* ================= COMPONENTS ================= */

function Section({
  label,
  icon: Icon,
  open,
  onToggle,
  children,
}: any) {
  return (
    <div>
      <div
        onClick={onToggle}
        className="flex items-center justify-between px-5 py-2.5 cursor-pointer text-gray-700 hover:bg-gray-100"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-gray-500" />
          <span className="font-medium">{label}</span>
        </div>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>

      {open && <div className="ml-10">{children}</div>}
    </div>
  );
}

function SubItem({
  icon: Icon,
  label,
  href,
}: {
  icon: any;
  label: string;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 py-2 cursor-pointer transition-colors
        ${isActive ? 'text-pink-600 font-medium' : 'text-gray-600'}
        hover:text-pink-600`}
      >
        <Icon
          size={16}
          className={isActive ? 'text-pink-600' : 'text-gray-400'}
        />
        {label}
      </div>
    </Link>
  );
}
