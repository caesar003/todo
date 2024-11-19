import { Todo } from "../core";
import { PriorityInterface, TaskInterface } from "../types";
import { rl } from "../utils";

export default function updateTask(todo: Todo) {
  rl.question("Enter task ID to update: ", (id: string) => {
    const task = todo.findTaskByIdPrefix(id);
    if (!task) {
      console.log("Task not found.");
      rl.close();
      return;
    }

    console.log("Press Enter to skip updating a field.");

    rl.question(
      `Update title (current: ${task.title}):\n\t`,
      (title: string) => {
        rl.question(
          `Update description (current: ${task.description}):\n\t`,
          (description: string) => {
            rl.question(
              `Update due date (YYYY-MM-DD HH:mm, current: ${task.due}):\n\t`,
              (dueInput: string) => {
                let due: Date | undefined = dueInput
                  ? new Date(dueInput)
                  : undefined;

                rl.question(
                  `Update priority (1: Low, 2: Medium, 3: High, current: ${task.priority_id || 1}) \n\t`,
                  (priorityInput: string) => {
                    const priorityId = (
                      [1, 2, 3].includes(parseInt(priorityInput))
                        ? parseInt(priorityInput)
                        : task.priority_id
                    ) as PriorityInterface["id"];

                    const updates: Partial<TaskInterface> = {
                      priority_id: priorityId,
                      title: title || task.title,
                      description: description || task.description,
                      due: due || task.due,
                      last_updated_at: new Date(),
                    };
                    todo.update(id, updates);
                    console.log("Task updated successfully.");
                    rl.close();
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}
