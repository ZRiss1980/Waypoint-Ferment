// /src/components/TaskEditModal.jsx
import React, { useState, useEffect } from "react";
import "./TaskEditModal.css";

function TaskEditModal({ task, onClose, onSave }) {
  const [taskName, setTaskName] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("");

  useEffect(() => {
    if (task) {
      setTaskName(task.taskName || "");
      setScheduledDate(task.scheduledDate?.split("T")[0] || "");
      setPriorityLevel(task.priorityLevel || "Normal");
    }
  }, [task]);

  const handleSave = () => {
    onSave({
      ...task,
      taskName,
      scheduledDate,
      priorityLevel,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edit Task</h2>

        <label>
          Task Name:
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
        </label>

        <label>
          Scheduled Date:
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
        </label>

        <label>
          Priority:
          <select
            value={priorityLevel}
            onChange={(e) => setPriorityLevel(e.target.value)}
          >
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>
        </label>

        <div className="modal-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default TaskEditModal;
