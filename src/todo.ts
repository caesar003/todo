#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";
import * as readline from "readline";

const VERSION = "1.0.6";

export interface TaskInterface {
  id: string;
  title: string;
  description: string;
  created_at: Date;
  last_updated_at: Date;
  due: Date;
  status_id: StatusInterface["id"];
  priority_id: PriorityInterface["id"];
}

export interface StatusInterface {
  id: 1 | 2 | 3;
  name: "todo" | "in-progress" | "done";
  label: "Todo" | "In progress" | "Done";
  icon: string;
}

export interface PriorityInterface {
  id: 1 | 2 | 3;
  name: "low" | "medium" | "high";
  label: "Low" | "Medium" | "High";
  icon: string;
}

export interface TaskGenerator {
  hash: string;
  description: string;
  title: string;
  due: Date;
}

const E = console.log;

class Todo {
  private filePath: string;
  private statuses: StatusInterface[];
  private tasks: TaskInterface[];
  private priorities: PriorityInterface[];

  constructor(filePath = "tasks.json") {
    const statusFilePath = "/etc/todo/status.json";
    const priorityFilePath = "/etc/todo/priority.json";
    const configDir = path.join(os.homedir(), ".config", "todo");
    this.filePath = path.join(configDir, filePath);

    try {
      const statusTextData = fs.readFileSync(statusFilePath, "utf-8");
      this.statuses = JSON.parse(statusTextData);
    } catch (error) {
      E(`Could not load statuses from ${statusFilePath}:`, error);
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
      E(`Provided ID prefix must be a string.`);
      return null;
    }

    const matches = this.tasks.filter((task) => task.id.startsWith(idPrefix));

    if (matches.length === 0) {
      E(`No task found with ID starting with: ${idPrefix}`);
      return null;
    }
    if (matches.length > 1) {
      E(`Multiple tasks found with ID starting with: ${idPrefix}`);
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
      E(`Task with ID ${task.id} already exists.`);
      return;
    }
    this.tasks.push(task);
    this.save();
    E(`Added task: ${task.title}`);
  }

  public delete(idPrefix: string): void {
    const task = this.findTaskByIdPrefix(idPrefix);
    if (task) {
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
      this.save();
      E(`Deleted task with ID: ${task.id}`);
    }
  }
  public list(
    status: string | "all" | "in-progress" | "todo" | "done" | undefined = "all"
  ): void {
    const filteredTasks =
      status === "all"
        ? this.tasks
        : this.tasks.filter((task) => {
            const taskStatus = this.getStatusById(task.status_id).name;
            return taskStatus === status;
          });

    if (filteredTasks.length === 0) {
      E(`No tasks found with status "${status}".`);
    } else {
      filteredTasks.forEach((task) => {
        const { icon: priorityIcon } = this.getPriorityById(
          task.priority_id || 1
        );
        const { icon: statusIcon } = this.getStatusById(task.status_id);
        E(`[${statusIcon}] ${task.id} - ${task.title} [${priorityIcon}]`);
      });
    }
  }
  public update(idPrefix: string, updatedFields: Partial<TaskInterface>): void {
    const task = this.findTaskByIdPrefix(idPrefix);
    if (task) {
      Object.assign(task, { ...updatedFields, last_updated_at: new Date() });
      this.save();
      E(`Updated task with ID: ${task.id}`);
    }
  }
  public start(idPrefix: string): void {
    const task = this.findTaskByIdPrefix(idPrefix);
    if (task) {
      this.update(idPrefix, { status_id: 2 });
      E(`Started task with ID: ${task.id}`);
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
      E(`\nTask Details:\n-------------`);
      E(`ID         : ${id}`);
      E(`Title      : ${title}`);
      E(`Description: ${description}`);
      E(`Created at : ${created_at}`);
      E(`Updated at : ${last_updated_at}`);
      E(`Due        : ${due}`);
      E(`Status     : ${statusIcon} ${statusLabel}`);
      E(`Priority   : ${priorityIcon} ${priorityLabel}`);
      E(`-------------\n`);
    }
  }
  public finish(idPrefix: string): void {
    this.update(idPrefix, { status_id: 3 });
  }
  private save(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.tasks, null, 2));
  }
  public printVersion() {
    E(`TODO node CLI, version ${VERSION}`);
  }
}

const todo = new Todo();

function generateHash() {
  return crypto
    .createHash("sha1")
    .update(Date.now().toString() + Math.random())
    .digest("hex");
}

function generateTask(input: TaskGenerator): TaskInterface {
  const { hash, description, title } = input;
  return {
    id: hash,
    title,
    description: description,
    due: new Date(),
    created_at: new Date(),
    status_id: 1,
    last_updated_at: new Date(),
    priority_id: 1,
  };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function createTask() {
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
                E(
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
                    E("Invalid priority. Default to Low (1)");
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
                  E("Task added successfully!");
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

function updateTask() {
  rl.question("Enter task ID to update: ", (id: string) => {
    const task = todo.findTaskByIdPrefix(id);
    if (!task) {
      E("Task not found.");
      rl.close();
      return;
    }

    E("Press Enter to skip updating a field.");

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
                    E("Task updated successfully.");
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

function deleteTask(taskId: string) {
  const task = todo.findTaskByIdPrefix(taskId);
  if (!task) {
    E("No task found with the provided ID.");
    rl.close();
    return;
  }

  rl.question(
    `\t⚠️ WARNING: This action is irreversible.\n\tAre you sure you want to permanently delete the task "${task.title}" (ID: ${task.id})? (y/n): `,
    (answer: string) => {
      if (answer.toLowerCase() === "y") {
        todo.delete(taskId);
        E("\tTask deleted successfully.");
      } else {
        E("\tDelete operation canceled.");
      }
      rl.close();
    }
  );
}

const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case "-a":
  case "--add":
    createTask();
    break;
  case "-u":
  case "--update":
    updateTask();
    break;
  case "-d":
  case "--delete":
    if (arg) {
      deleteTask(arg);
    } else {
      E("Please provide a task ID to delete.");
      rl.close();
    }
    break;
  case "-f":
  case "--finish":
    if (arg) {
      todo.finish(arg);
    } else {
      E("Please provide a task ID to mark as done.");
    }
    rl.close();
    break;
  case "-l":
  case "--list":
    todo.list(arg || "all");
    rl.close();
    break;
  case "-e":
  case "--detail":
    if (arg) {
      todo.detail(arg);
    } else {
      E("Please provide a task ID to view.");
    }
    rl.close();
    break;
  case "-v":
  case "--version":
    todo.printVersion();
    rl.close();
    break;

  case "-s":
  case "--start":
    if (arg) {
      todo.start(arg);
    } else {
      E("Please provide a task ID to start.");
    }
    rl.close();
    break;
  default:
    E("Usage: todo <command> [args]");
    E("Commands:");
    E("  -a | --add           - Add a new task");
    E("  -u | --update        - Update an existing task");
    E("  -d | --delete <id>   - Delete a task by ID");
    E("  -f | --finish <id>   - Mark a task as done by ID");
    E("  -l | --list          - List all tasks");
    E("  -s | --start <id>    - Start working on a task");
    E("  -e | --detail <id>   - View task details");
    E("  -v | --version       - View version number");
    rl.close();
}
