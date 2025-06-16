import UpcomingTasks from '@/components/pages/UpcomingTasks';
import OverdueTasks from '@/components/pages/OverdueTasks';
import CompletedTasks from '@/components/pages/CompletedTasks';

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
  }
};

export const routeArray = Object.values(routes);
export default routes;