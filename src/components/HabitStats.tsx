
const HabitStats = () => {
  const goodHabits = [
    { name: "WORKOUT", score: "21/30" },
    { name: "WATER", score: "30/30" },
    { name: "LANGUAGE", score: "25/30" },
  ];

  const badHabits = [
    { name: "RUN", score: "4/30" },
    { name: "DEVOTION", score: "6/30" },
    { name: "SLEEP GOAL", score: "11/30" },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-center text-2xl font-bold text-green-800 mb-6">BEST/WORST HABITS OVER THE LAST MONTH</h2>
      
      <div className="flex justify-center gap-16">
        {/* Good Habits */}
        <div className="text-center">
          <div className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-4xl">☺</div>
          </div>
          <div className="space-y-1">
            {goodHabits.map((habit) => (
              <p key={habit.name} className="text-green-500 font-bold">
                {habit.name}: {habit.score}
              </p>
            ))}
          </div>
        </div>
        
        {/* Bad Habits */}
        <div className="text-center">
          <div className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-4xl">☹</div>
          </div>
          <div className="space-y-1">
            {badHabits.map((habit) => (
              <p key={habit.name} className="text-red-500 font-bold">
                {habit.name}: {habit.score}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitStats;
