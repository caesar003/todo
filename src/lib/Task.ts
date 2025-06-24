import * as fs from "fs";
import * as path from "path";

import { TaskInterface, StatusInterface, MergedTask } from "./types";
import { useLabels } from "./utils/labels/useLabels";
import { CONFIG_DIR } from "./constants";

import { Priority } from "./Priority";
import { Status } from "./Status";

type TaskError = "NOT_FOUND" | "DUPLICATE_PREFIX" | "INVALID_ID";

interface TaskResult<T> {
  success: boolean;
  data?: T;
  error?: TaskError;
  errorMessage?: string;
}

type TaskListParam = string | "all" | StatusInterface["name"] | undefined;

class Task {
  private filePath: string;
  private tasks: TaskInterface[];

  private priorityInstance: Priority;
  private statusInstance: Status;

  private l: (key: string, values?: Record<string, string>) => string;

  constructor(filePath = "tasks.json") {
    this.filePath = path.join(CONFIG_DIR, filePath);
    this.priorityInstance = new Priority();
    this.statusInstance = new Status();

    this.tasks = this.load();
    this.l = useLabels().l;
  }

  public findByIdPrefix(idPrefix: string): TaskResult<TaskInterface> {
    if (typeof idPrefix !== "string") {
      return {
        success: false,
        error: "INVALID_ID",
        errorMessage: this.l("e.idNotString"),
      };
    }

    const matches = this.tasks.filter((task) => task.id.startsWith(idPrefix));

    if (matches.length === 0) {
      return {
        success: false,
        error: "NOT_FOUND",
        errorMessage: this.l("e.taskNotFound", { value: idPrefix }),
      };
    }

    if (matches.length > 1) {
      return {
        success: false,
        error: "DUPLICATE_PREFIX",
        errorMessage: this.l("e.duplicateIdPrefix", { value: idPrefix }),
      };
    }

    return {
      success: true,
      data: matches[0],
    };
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
        const eProps = { path: this.filePath, message: error.message };
        const ePrompt = this.l("e.duplicateIdPrefix", eProps);
        console.log(ePrompt);
      } else {
        console.error(this.l("e.unknownErr"));
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
    const result = this.findByIdPrefix(idPrefix);
    if (result.success && result.data) {
      this.tasks = this.tasks.filter((t) => t.id !== result.data!.id);
      this.save();
      return true;
    }
    return false;
  }

  public detail(idPrefix: string): MergedTask | null {
    const result = this.findByIdPrefix(idPrefix);
    if (!result.success || !result.data) {
      return null;
    }

    const task = result.data;
    const priority = this.priorityInstance.getById(task.priority_id);
    const status = this.statusInstance.getById(task.status_id);

    return { ...task, priority, status };
  }

  public list(status: TaskListParam = "all"): MergedTask[] {
    const filteredTasks =
      status === "all"
        ? this.tasks
        : this.tasks.filter((task) => {
            const taskStatus = this.statusInstance.getById(task.status_id)
              ?.name;
            return taskStatus === status;
          });

    return filteredTasks.map((task) => {
      const priority = this.priorityInstance.getById(task.priority_id);
      const status = this.statusInstance.getById(task.status_id);
      return { ...task, priority, status };
    });
  }

  public update(idPrefix: string, fields: Partial<TaskInterface>): boolean {
    const result = this.findByIdPrefix(idPrefix);
    if (result.success && result.data) {
      Object.assign(result.data, { ...fields, updated_at: new Date() });
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
