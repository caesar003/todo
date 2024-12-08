import * as fs from "fs";
import * as path from "path";

import { TaskInterface, PriorityInterface, StatusInterface } from "./types";
import { VERSION, CONFIG_DIR } from "./constants";



class Task {
  private filePath: string;
  private statuses: Status;
  private priorities: Priority;
  private tasks: TaskInterface[];

  constructor(filePath = "tasks.json") {
    this.filePath = path.join(CONFIG_DIR, filePath);
    this.statuses = new Status();
    this.priorities = new Priority();
    this.tasks = this.load();
  }

  private load(): TaskInterface[] {
    try {
      const data = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          `Error loading tasks from ${this.filePath}: ${error.message}`
        );
      } else {
        console.error("Unknown error occurred while loading tasks.");
      }
      return [];
    }
  }

  private save(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.tasks, null, 2));
  }

  public findTaskByIdPrefix(idPrefix: string): TaskInterface | null {
    const matches = this.tasks.filter((task) => task.id.startsWith(idPrefix));
    if (matches.length === 1) return matches[0];
    console.log(matches.length === 0 ? "No match found." : "Multiple matches found.");
    return null;
  }

  public list(status: string | "all" | undefined = "all"): void {
    const filteredTasks =
      status === "all"
        ? this.tasks
        : this.tasks.filter((task) => {
            const taskStatus = this.statuses.getById(task.status_id)?.name;
            return taskStatus === status;
          });

    filteredTasks.forEach((task) => {
      const { icon: priorityIcon } =
        this.priorities.getById(task.priority_id || 1) || {};
      const { icon: statusIcon } =
        this.statuses.getById(task.status_id) || {};
      console.log(
        `[${statusIcon}] ${task.id} - ${task.title} [${priorityIcon}]`
      );
    });
  }

  // Other methods remain largely unchanged...
}

export { Task, Priority, Status };
