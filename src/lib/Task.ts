import * as fs from "fs";
import * as path from "path";

import { TaskInterface, StatusInterface, MergedTask } from "./types";
import { CONFIG_DIR } from "./constants";

import { Priority } from "./Priority";
import { Status } from "./Status";

type TaskListParam = string | "all" | StatusInterface["name"] | undefined;

class Task {
  private filePath: string;
  private tasks: TaskInterface[];

  private priorityInstance: Priority;
  private statusInstance: Status;

  constructor(filePath = "tasks.json") {
    this.filePath = path.join(CONFIG_DIR, filePath);
    this.priorityInstance = new Priority();
    this.statusInstance = new Status();

    this.tasks = this.load();
  }

  public findByIdPrefix(idPrefix: string): TaskInterface | null {
    if (typeof idPrefix !== "string") {
      console.log(`Provided ID prefix must be a string.`);
      return null;
    }

    const matches = this.tasks.filter((task) => task.id.startsWith(idPrefix));

    if (matches.length === 0) {
      console.log(`No task found with ID starting with: ${idPrefix}`);
      return null;
    }
    if (matches.length > 1) {
      console.log(`Multiple tasks found with ID starting with: ${idPrefix}`);
      return null;
    }

    return matches[0];
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

  public add(task: TaskInterface): boolean {
    if (this.tasks.some((t) => t.id === task.id)) {
      return false;
    }

    this.tasks.push(task);
    this.save();
    return true;
  }

  public delete(idPrefix: string): boolean {
    const task = this.findByIdPrefix(idPrefix);
    if (task) {
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
      this.save();
      return true;
    }
    return false;
  }

  public list(status: TaskListParam = "all"): MergedTask[] {
    const filteredTasks =
      status === "all"
        ? this.tasks
        : this.tasks.filter((task) => {
            const taskStatus = this.statusInstance.getById(
              task.status_id
            )?.name;
            return taskStatus === status;
          });

    return filteredTasks.map((task) => {
      const priority = this.priorityInstance.getById(task.priority_id);
      const status = this.statusInstance.getById(task.status_id);
      return { ...task, priority, status };
    });
  }

  public detail(idPrefix: string): MergedTask | null {
    const task = this.findByIdPrefix(idPrefix);
    if (!task) return null;
    const priority = this.priorityInstance.getById(task.priority_id);
    const status = this.statusInstance.getById(task.status_id);

    return { ...task, priority, status };
  }

  public update(idPrefix: string, fields: Partial<TaskInterface>): boolean {
    const task = this.findByIdPrefix(idPrefix);
    if (task) {
      Object.assign(task, { ...fields, updated_at: new Date() });
      this.save();
      return true;
    }

    return false;
  }

  private save(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.tasks, null, 2));
  }
}

export { Task };
