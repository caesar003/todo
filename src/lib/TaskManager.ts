import { rl, generateHash, generateTask, formatDate } from "./utils";
import { PriorityInterface, TaskInterface } from "./types";

import { VERSION } from "./constants";
import { Task } from "./Task";

export class TaskManager {
  private taskInstance: Task;

  constructor() {
    this.taskInstance = new Task();
  }

  public createTask() {
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
                    this.taskInstance.add(newTask);
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

  public updateTask() {
    rl.question("Enter task ID to update: ", (id: string) => {
      const task = this.taskInstance.findByIdPrefix(id);
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
                        updated_at: new Date(),
                      };
                      this.taskInstance.update(id, updates);
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

  public deleteTask(taskId: string) {
    const task = this.taskInstance.findByIdPrefix(taskId);
    if (!task) {
      console.log("No task found with the provided ID.");
      rl.close();
      return;
    }

    rl.question(
      `\t⚠️ WARNING: This action is irreversible.\n\tAre you sure you want to permanently delete the task "${task.title}" (ID: ${task.id})? (y/N): `,
      (answer: string) => {
        if (answer.toLowerCase() === "y") {
          this.taskInstance.delete(taskId);
          console.log("\tTask deleted successfully.");
        } else {
          console.log("\tDelete operation canceled.");
        }
        rl.close();
      }
    );
  }

  public detail(taskId: string): void {
    const task = this.taskInstance.detail(taskId);

    if (!task) return;

    const {
      id,
      title,
      description,
      created_at,
      updated_at: updated_at,
      due,
      status,
      priority,
    } = task;

    console.log(`\nTask Details:\n-------------`);
    console.log(`ID         : ${id}`);
    console.log(`Title      : ${title}`);
    console.log(`Description: ${description}`);
    console.log(`Created at : ${formatDate(created_at)}`);
    console.log(`Updated at : ${formatDate(updated_at)}`);
    console.log(`Due        : ${formatDate(due)}`);

    if (status) {
      console.log(`Status     : ${status.icon} ${status.label}`);
    } else {
      console.log(`Status     : Not available`);
    }

    if (priority) {
      console.log(`Priority   : ${priority.icon} ${priority.label}`);
    } else {
      console.log(`Priority   : Not available`);
    }

    console.log(`-------------\n`);
    rl.close();
  }

  public list(status: string): void {
    const tasks = this.taskInstance.list(status);
    if (!tasks.length) {
      console.log("No tasks found");
      rl.close();
      return;
    }

    tasks.forEach(({ id, title, priority, status }) => {
      console.log(
        `[${status?.icon || ""}] ${id} - ${title} [${priority?.icon || ""}]`
      );
    });
  }

  public showHelp() {
    console.log("Usage: todo <command> [args]");
    console.log("Commands:");
    console.log("  -a | --add           - Add a new task");
    console.log("  -u | --update        - Update an existing task");
    console.log("  -d | --delete <id>   - Delete a task by ID");
    console.log("  -f | --finish <id>   - Mark a task as done by ID");
    console.log("  -l | --list          - List all tasks");
    console.log("  -s | --start <id>    - Start working on a task");
    console.log("  -e | --detail <id>   - View task details");
    console.log("  -v | --version       - View version number");
  }
  public printVersion() {
    console.log(`TODO node CLI, version ${VERSION}`);
  }

  public finish(idPrefix: string): void {
    const success: boolean = this.taskInstance.update(idPrefix, {
      status_id: 3,
    });

    if (success) {
      console.log(`Finished task ${idPrefix}`);
      return;
    }

    console.log(`Task not found!`);
  }

  public start(idPrefix: string): void {
    const success: boolean = this.taskInstance.update(idPrefix, {
      status_id: 2,
    });

    if (success) {
      console.log(`Starting on task ${idPrefix}`);
      return;
    }

    console.log(`Task not found!`);
  }
}
