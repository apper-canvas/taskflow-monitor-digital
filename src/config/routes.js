import UpcomingTasks from '@/components/pages/UpcomingTasks';
import OverdueTasks from '@/components/pages/OverdueTasks';
import CompletedTasks from '@/components/pages/CompletedTasks';
import CalendarView from '@/components/pages/CalendarView';
import Login from '@/components/pages/Login';
import Signup from '@/components/pages/Signup';
export const routes = {
  upcoming: {
    id: 'upcoming',
    label: 'Upcoming',
    path: '/upcoming',
    icon: 'Clock',
    component: UpcomingTasks
  },
  overdue: {
    id: 'overdue',
    label: 'Overdue',
    path: '/overdue',
    icon: 'AlertCircle',
    component: OverdueTasks
  },
completed: {
    id: 'completed',
    label: 'Completed',
    path: '/completed',
    icon: 'CheckCircle',
    component: CompletedTasks
  },
  calendar: {
    id: 'calendar',
    label: 'Calendar',
    path: '/calendar',
    icon: 'Calendar',
    component: CalendarView
  }
};

export const authRoutes = [
  {
    id: 'login',
    path: '/login',
    component: Login
  },
  {
    id: 'signup',
    path: '/signup',
    component: Signup
  }
];

export const routeArray = Object.values(routes);
export default routes;