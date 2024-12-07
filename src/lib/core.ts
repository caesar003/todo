import * as fs from "fs";
import * as path from "path";
import { TaskInterface, PriorityInterface, StatusInterface } from "./types";
import { VERSION, CONFIG_DIR } from "./constants";

class Todo {
  private filePath: string;
  private statuses: StatusInterface[];
  private tasks: TaskInterface[];
  private priorities: PriorityInterface[];

  constructor(filePath = "tasks.json") {
    const statusFilePath = "/etc/todo/status.json";
    const priorityFilePath = "/etc/todo/priority.json";
    this.filePath = path.join(CONFIG_DIR, filePath);

    try {
      const statusTextData = fs.readFileSync(statusFilePath, "utf-8");
      this.statuses = JSON.parse(statusTextData);
    } catch (error) {
      console.log(`Could not load statuses from ${statusFilePath}:`, error);
      this.statuses = [];
    }

    try {
      const priorityTextData = fs.readFileSync(priorityFilePath, "utf-8");
      this.priorities = JSON.parse(priorityTextData);
    } catch (error) {
      console.error(`Could not load statuses from ${statusFilePath}:`, error);
      this.priorities = [];
    }

    this.tasks = this.load();
  }

  private getPriorityById(
    priorityId: PriorityInterface["id"]
  ): PriorityInterface {
    return this.priorities.find((priority) => priority.id === priorityId)!;
  }

  private getStatusById(statusId: number): StatusInterface {
    return this.statuses.find((status) => status.id === statusId)!;
  }

  public findTaskByIdPrefix(idPrefix: string): TaskInterface | null {
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

  public add(task: TaskInterface): void {
    if (this.tasks.some((t) => t.id === task.id)) {
      console.log(`Task with ID ${task.id} already exists.`);
      return;
    }
    this.tasks.push(task);
    this.save();
    console.log(`Added task: ${task.title}`);
  }

  public delete(idPrefix: string): void {
    const task = this.findTaskByIdPrefix(idPrefix);
    if (task) {
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
      this.save();
      console.log(`Deleted task with ID: ${task.id}`);
    }
  }
  public list(
    status: string | "all" | StatusInterface["name"] | undefined = "all"
  ): void {
    const filteredTasks =
      status === "all"
        ? this.tasks
        : this.tasks.filter((task) => {
            const taskStatus = this.getStatusById(task.status_id).name;
            return taskStatus === status;
          });

    if (filteredTasks.length === 0) {
      console.log(`No tasks found with status "${status}".`);
    } else {
      filteredTasks.forEach((task) => {
        const { icon: priorityIcon } = this.getPriorityById(
          task.priority_id || 1
        );
        const { icon: statusIcon } = this.getStatusById(task.status_id);
        console.log(
          `[${statusIcon}] ${task.id} - ${task.title} [${priorityIcon}]`
        );
      });
    }
  }
  public update(idPrefix: string, updatedFields: Partial<TaskInterface>): void {
    const task = this.findTaskByIdPrefix(idPrefix);
    if (task) {
      Object.assign(task, { ...updatedFields, last_updated_at: new Date() });
      this.save();
      console.log(`Updated task with ID: ${task.id}`);
    }
  }
  public start(idPrefix: string): void {
    const task = this.findTaskByIdPrefix(idPrefix);
    if (task) {
      this.update(idPrefix, { status_id: 2 });
      console.log(`Started task with ID: ${task.id}`);
    }
  }

  public detail(idPrefix: string): void {
    const task = this.findTaskByIdPrefix(idPrefix);
    if (task) {
      const {
        id,
        title,
        description,
        created_at,
        last_updated_at,
        status_id,
        priority_id,
        due,
      } = task;
      const { label: statusLabel, icon: statusIcon } =
        this.getStatusById(status_id);
      const { label: priorityLabel, icon: priorityIcon } =
        this.getPriorityById(priority_id);
      console.log(`\nTask Details:\n-------------`);
      console.log(`ID         : ${id}`);
      console.log(`Title      : ${title}`);
      console.log(`Description: ${description}`);
      console.log(`Created at : ${created_at}`);
      console.log(`Updated at : ${last_updated_at}`);
      console.log(`Due        : ${due}`);
      console.log(`Status     : ${statusIcon} ${statusLabel}`);
      console.log(`Priority   : ${priorityIcon} ${priorityLabel}`);
      console.log(`-------------\n`);
    }
  }
  public finish(idPrefix: string): void {
    this.update(idPrefix, { status_id: 3 });
  }
  private save(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.tasks, null, 2));
  }
  public printVersion() {
    console.log(`TODO node CLI, version ${VERSION}`);
  }
}

export { Todo };
