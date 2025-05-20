import React, { useEffect, useState } from "react";
import { format, addDays } from "date-fns";

const DailyScheduleGrid = () => {
  const [schedule, setSchedule] = useState({});
  const [warnings, setWarnings] = useState({});

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/schedule?range=60");
        const data = await res.json();
        console.log("📦 Schedule Fetched:", data);
        setSchedule(data.schedule);
        setWarnings(data.warnings);
      } catch (err) {
        console.error("❌ Failed to fetch schedule:", err);
      }
    };
    fetchSchedule();
  }, []);

  const days = Array.from({ length: 60 }, (_, i) => format(addDays(new Date(), i), "yyyy-MM-dd"));

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-4">Scheduled Tasks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {days.map((day) => (
          <div key={day} className="bg-zinc-800 p-4 rounded-2xl shadow">
            <h3 className="text-lg font-bold text-amber-300 mb-2">{day}</h3>
            {warnings[day]?.length > 0 && (
              <div className="text-red-400 text-sm mb-2">
                {warnings[day].map((warn, i) => (
                  <div key={i}>{warn}</div>
                ))}
              </div>
            )}
            {schedule[day]?.length > 0 ? (
              schedule[day].map((task, i) => (
                <div key={i} className="bg-zinc-700 rounded p-2 mb-2">
                  <div className="text-white font-semibold">{task.taskType}</div>
                  <div className="text-sm text-zinc-300">{task.beerName}</div>
                  <div className="text-xs text-zinc-400">
                    {task.skillRequired || "Any"} · {task.duration} min · {task.points} pts
                  </div>
                  <div className="text-xs text-zinc-500">
                    {task.startTime?.slice(11, 16)} - {task.endTime?.slice(11, 16)}
                    {task.requiredTank ? ` • Tank: ${task.requiredTank}` : ""}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-zinc-500">No tasks</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyScheduleGrid;
