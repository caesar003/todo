import { PriorityInterface } from "../types";
import { Todo } from "../core";
import { generateHash, generateTask, rl } from "../utils";

export default function createTask(todo: Todo) {
  rl.question("Enter task title: ", (title: string) => {
    rl.question("Enter task description: ", (description: string) => {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 1);
      const defaultDateStr = defaultDate.toISOString().split("T")[0];

      rl.question(
        `Enter task due date (YYYY-MM-DD) [Default: ${defaultDateStr}]: `,
        (dateInput: string) => {
          const dueDate = dateInput || defaultDateStr;

          const defaultTimeStr = "17:00";
          rl.question(
            `Enter task due time (HH:MM) [Default: ${defaultTimeStr}]: `,
            (timeInput: string) => {
              const dueTime = timeInput || defaultTimeStr;

              const dueDateTime = new Date(`${dueDate}T${dueTime}:00`);

              if (isNaN(dueDateTime.getTime())) {
                console.log(
                  "Invalid date or time format. Please use YYYY-MM-DD for date and HH:MM for time."
                );
                rl.close();
                return;
              }

              rl.question(
                "Enter task priority (1: Low, 2: Medium, 3: High) [Default: 1]: ",
                (priorityInput: string) => {
                  let priorityId = parseInt(priorityInput) || 1;

                  if (![1, 2, 3].includes(priorityId)) {
                    console.log("Invalid priority. Default to Low (1)");
                    priorityId = 1;
                  }

                  const hash = generateHash();
                  const newTask = generateTask({
                    title,
                    hash,
                    description,
                    due: dueDateTime,
                  });
                  newTask.priority_id = priorityId as PriorityInterface["id"];
                  todo.add(newTask);
                  console.log("Task added successfully!");
                  rl.close();
                }
              );
            }
          );
        }
      );
    });
  });
}
