
interface ListViewProps {
  activities: Array<{
    day: number;
    text: string;
  }>;
}

const ListView = ({ activities }: ListViewProps) => {
  return (
    <div className="space-y-2 py-2">
      {activities.map(activity => (
        <div key={`list-${activity.day}`} className="border border-green-100 dark:border-green-800 rounded-lg p-3 flex items-center">
          <div className="w-10 h-10 flex items-center justify-center bg-green-50 dark:bg-green-900 rounded-full mr-3">
            <span className="font-bold text-green-800 dark:text-green-200">{activity.day}</span>
          </div>
          <div>{activity.text}</div>
        </div>
      ))}
    </div>
  );
};

export default ListView;
