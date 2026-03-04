import TimesheetHeader from './components/TimesheetHeader';
import SummaryTable from './components/SummaryTable';
import CheckInPunishments from './components/WeekTabs';

export default function AdminTimesheetPage() {
  return (
    <>
      <TimesheetHeader />
      <SummaryTable />
      <CheckInPunishments />
    </>
  );
}

