import { rl, generateHash, generateTask, formatDate } from "./utils";
import { PriorityInterface, TaskInterface } from "./types";
import { useLabels } from "./utils/labels/useLabels";

import { VERSION } from "./constants";
import { Task } from "./Task";
type Status = 1 | 2 | 3;

export class TaskManager {
  private taskInstance: Task;
  private l: (key: string, values?: Record<string, string>) => string;
  private statuses: Status[];
  private DONE: Status;
  private IN_PROGRESS: Status;

  constructor() {
    this.taskInstance = new Task();
    this.l = useLabels().l;
    this.statuses = [1, 3, 3];
    this.DONE = this.statuses[2];
    this.IN_PROGRESS = this.statuses[1];
  }

  public createTask() {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    const defaultDateStr = defaultDate.toISOString().split("T")[0];
    const defaultTimeStr = "17:00";
    const ddProps = { value: defaultDateStr };
    const dtProps = { value: defaultTimeStr };

    const prioPrompt = this.l("create.priority");
    const titlePrompt = this.l("create.title");
    const descPrompt = this.l("create.description");
    const ddPrompt = this.l("create.dueDate", ddProps);

    const dtPrompt = this.l("create.dueTime", dtProps);

    rl.question(titlePrompt, (title: string) => {
      rl.question(descPrompt, (description: string) => {
        rl.question(ddPrompt, (dateInput: string) => {
          const dueDate = dateInput || defaultDateStr;

          rl.question(dtPrompt, (timeInput: string) => {
            const dueTime = timeInput || defaultTimeStr;
            const dueDateTime = new Date(`${dueDate}T${dueTime}:00`);

            if (isNaN(dueDateTime.getTime())) {
              console.log(this.l("create.invalidDateTime"));
              rl.close();
              return;
            }

            rl.question(prioPrompt, (priorityInput: string) => {
              let priorityId = parseInt(priorityInput) || 1;

              if (![1, 2, 3].includes(priorityId)) {
                console.log(this.l("create.invalidPriority"));
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
              console.log(this.l("create.success"));
              rl.close();
            });
          });
        });
      });
    });
  }

  public updateTask() {
    rl.question(this.l("update.id"), (id: string) => {
      const result = this.taskInstance.findByIdPrefix(id);

      if (!result.success) {
        console.log(result.errorMessage);
        rl.close();
        return;
      }

      const task = result.data!; // We know it exists because success is true

      console.log(this.l("update.skipField"));

      const titlePrompt = this.l("update.title", { value: task.title });
      const descProps = { value: task.description };
      const descPrompt = this.l("update.description", descProps);
      const dueProps = { value: new Date(task.due).toLocaleString() };
      const duePrompt = this.l("update.dueDate", dueProps);

      const prioProps = {
        value: String(task.priority_id) || "1",
      };
      const prioPrompt = this.l("update.priority", prioProps);

      rl.question(titlePrompt, (title: string) => {
        rl.question(descPrompt, (description: string) => {
          rl.question(duePrompt, (dueInput: string) => {
            let due: Date | undefined = dueInput
              ? new Date(dueInput)
              : undefined;

            rl.question(prioPrompt, (priorityInput: string) => {
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

              const updateSuccess = this.taskInstance.update(id, updates);
              if (updateSuccess) {
                console.log(this.l("update.success"));
              } else {
                console.log(this.l("general.taskNotFound"));
              }
              rl.close();
            });
          });
        });
      });
    });
  }

  public deleteTask(taskId: string) {
    const result = this.taskInstance.findByIdPrefix(taskId);

    if (!result.success) {
      console.log(result.errorMessage);
      rl.close();
      return;
    }

    const task = result.data!; // We know it exists because success is true

    const deleteProps = { title: task.title, id: task.id };
    const deletePrompt = this.l("delete.confirm", deleteProps);

    rl.question(deletePrompt, (answer: string) => {
      if (answer.toLowerCase() === "y") {
        const deleteSuccess = this.taskInstance.delete(taskId);
        if (deleteSuccess) {
          console.log(this.l("delete.success"));
        } else {
          console.log(this.l("general.taskNotFound"));
        }
      } else {
        console.log(this.l("delete.cancelled")); // This should probably be "cancelled" not "success"
      }
      rl.close();
    });
  }

  public detail(taskId: string): void {
    const task = this.taskInstance.detail(taskId);

    if (!task) return;

    const { id, title, description, created_at, updated_at, due } = task;

    const formCreatAt = formatDate(created_at);
    const formUpdatAt = formatDate(updated_at);
    const formDue = formatDate(due);

    let status: string | undefined;
    let priority: string | undefined;

    if (task.status) {
      status = `${task.status.icon} ${task.status.label}`;
    } else {
      status = this.l("general.notAvailable");
    }

    if (task.priority) {
      priority = `${task.priority.icon} ${task.priority.label}`;
    } else {
      priority = this.l("general.notAvailable");
    }

    console.log(this.l("detail.header"));
    console.log(this.l("detail.id", { value: id }));
    console.log(this.l("detail.title", { value: title }));
    console.log(this.l("detail.description", { value: description }));
    console.log(this.l("detail.createdAt", { value: formCreatAt }));
    console.log(this.l("detail.updatedAt", { value: formUpdatAt }));
    console.log(this.l("detail.due", { value: formDue }));

    console.log(this.l("detail.status", { value: status }));
    console.log(this.l("detail.priorty", { value: priority }));

    console.log(`-------------\n`);
    rl.close();
  }

  public list(status: string): void {
    const tasks = this.taskInstance.list(status);
    if (!tasks.length) {
      console.log(this.l("general.taskEmpty"));
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
    console.log(this.l("help.usage"));
    console.log(this.l("help.commands"));
    console.log(this.l("help.add"));
    console.log(this.l("help.update"));
    console.log(this.l("help.delete"));
    console.log(this.l("help.finish"));
    console.log(this.l("help.list"));
    console.log(this.l("help.start"));
    console.log(this.l("help.detail"));
    console.log(this.l("help.version"));
  }

  public printVersion() {
    console.log(this.l("version", { value: VERSION }));
  }

  public finish(idPrefix: string): void {
    const result = this.taskInstance.findByIdPrefix(idPrefix);

    if (!result.success) {
      console.log(result.errorMessage);
      return;
    }

    const success: boolean = this.taskInstance.update(idPrefix, {
      status_id: this.DONE,
    });

    if (success) {
      console.log(this.l("finish", { value: idPrefix }));
    } else {
      console.log(this.l("general.taskNotFound"));
    }
  }

  public start(idPrefix: string): void {
    const result = this.taskInstance.findByIdPrefix(idPrefix);

    if (!result.success) {
      console.log(result.errorMessage);
      return;
    }

    // Task exists, proceed with update
    const success: boolean = this.taskInstance.update(idPrefix, {
      status_id: this.IN_PROGRESS,
    });

    if (success) {
      console.log(this.l("start", { value: idPrefix }));
    } else {
      // This should rarely happen since we already verified the task exists
      console.log(this.l("general.taskNotFound"));
    }
  }
}
