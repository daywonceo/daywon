
import { getHabitActivities } from "./habitActivity";

export const generateHabitReport = async (userHabits: string[]) => {
  const activities = getHabitActivities();
  const now = new Date();
  
  // Get data for the last 30 days
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  // Filter activities for the last 30 days
  const recentActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate >= thirtyDaysAgo && activityDate <= now;
  });
  
  // Create CSV content
  const csvHeaders = ['Date', ...userHabits, 'Total Completed', 'Completion Rate'];
  let csvContent = csvHeaders.join(',') + '\n';
  
  // Generate data for each day in the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const formattedDate = date.toLocaleDateString();
    
    const row = [formattedDate];
    let completedCount = 0;
    
    userHabits.forEach(habit => {
      const activity = recentActivities.find(
        a => a.habitName === habit && a.date === dateStr
      );
      const status = activity ? activity.status : 'empty';
      row.push(status === 'completed' ? 'Yes' : status === 'failed' ? 'No' : 'Not Tracked');
      if (status === 'completed') completedCount++;
    });
    
    row.push(completedCount.toString());
    row.push(Math.round((completedCount / userHabits.length) * 100) + '%');
    
    csvContent += row.join(',') + '\n';
  }
  
  // Add summary statistics
  csvContent += '\n--- SUMMARY STATISTICS ---\n';
  
  userHabits.forEach(habit => {
    const habitActivities = recentActivities.filter(a => a.habitName === habit);
    const completedActivities = habitActivities.filter(a => a.status === 'completed');
    const failedActivities = habitActivities.filter(a => a.status === 'failed');
    const totalTracked = completedActivities.length + failedActivities.length;
    const completionRate = totalTracked > 0 ? Math.round((completedActivities.length / totalTracked) * 100) : 0;
    
    csvContent += `${habit},${completedActivities.length} completed,${failedActivities.length} failed,${completionRate}% success rate\n`;
  });
  
  // Calculate overall statistics
  const totalPossible = userHabits.length * 30;
  const totalCompleted = recentActivities.filter(a => a.status === 'completed').length;
  const overallRate = Math.round((totalCompleted / totalPossible) * 100);
  
  csvContent += `\nOVERALL,${totalCompleted}/${totalPossible} completed,${overallRate}% completion rate\n`;
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `habit-progress-report-${now.toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
