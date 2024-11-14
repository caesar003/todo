#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";
import * as readline from "readline";

const VERSION = "1.0.4";

export interface Task {
  id: string;
  title: string;
  description: string;
  created_at: Date;
  last_updated_at: Date;
  due: Date;
  status_id: number;
  priority_id?: number;
}

export interface Status {
  id: number;
  name: "todo" | "in-progress" | "done";
  label: "Todo" | "In progress" | "Done";
  icon: string;
}

// we want to leave this for now
export interface Priority { 
  id: number;
  name: "low" | "medium" | "high";
  label: "Low" | "Medium" | "High";
  icon : string;
}

export interface TaskGenerator {
  hash: string;
  description: string;
  title: string;
  due: Date;
}

class Todo {
  private filePath: string;
  private statuses: Status[];
  private tasks: Task[];
  constructor(filePath = "tasks.json") {
    const statusFilePath = "/etc/todo/status.json";
    const configDir = path.join(os.homedir(), ".config", "todo");
    this.filePath = path.join(configDir, filePath);

    try {
      const data = fs.readFileSync(statusFilePath, "utf-8");
      this.statuses = JSON.parse(data);
    } catch (error) {
      console.error(`Could not load statuses from ${statusFilePath}:`, error);
      this.statuses = [];
    }

    this.tasks = this.load();
  }

  private getStatusById(statusId: number): Status {
    return this.statuses.find((status) => status.id === statusId)!;
  }

  public findTaskByIdPrefix(idPrefix: string): Task | null {
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

  private load(): Task[] {
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

  public add(task: Task): void {
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
      console.log(`No tasks found with status "${status}".`);
    } else {
      filteredTasks.forEach((task) => {
        const { label, icon } = this.getStatusById(task.status_id);
        console.log(`[${icon}] ${task.id} - ${task.title} [${label}]`);
      });
    }
  }
  public update(idPrefix: string, updatedFields: Partial<Task>): void {
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
        due,
      } = task;
      const { label, icon } = this.getStatusById(status_id);
      console.log(`\nTask Details:\n-------------`);
      console.log(`ID         : ${id}`);
      console.log(`Title      : ${title}`);
      console.log(`Description: ${description}`);
      console.log(`Created at : ${created_at}`);
      console.log(`Updated at : ${last_updated_at}`);
      console.log(`Due        : ${due}`);
      console.log(`Status     : ${icon} ${label}`);
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

const todo = new Todo();

function generateHash() {
  return crypto
    .createHash("sha1")
    .update(Date.now().toString() + Math.random())
    .digest("hex");
}

function generateTask(input: TaskGenerator): Task {
  const { hash, description, title } = input;
  return {
    id: hash,
    title,
    description: description,
    due: new Date(),
    created_at: new Date(),
    status_id: 1,
    last_updated_at: new Date(),
  };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function createTask() {
  rl.question("Enter task title: ", (title: string) => {
    rl.question("Enter task description: ", (description: string) => {
      // Set default date to tomorrow
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 1);
      const defaultDateStr = defaultDate.toISOString().split("T")[0]; // YYYY-MM-DD

      rl.question(
        `Enter task due date (YYYY-MM-DD) [Default: ${defaultDateStr}]: `,
        (dateInput: string) => {
          const dueDate = dateInput || defaultDateStr;

          // Set default time to 17:00
          const defaultTimeStr = "17:00";
          rl.question(
            `Enter task due time (HH:MM) [Default: ${defaultTimeStr}]: `,
            (timeInput: string) => {
              const dueTime = timeInput || defaultTimeStr;

              const dueDateTime = new Date(`${dueDate}T${dueTime}:00`);

              // Validate the combined due date and time
              if (isNaN(dueDateTime.getTime())) {
                console.log(
                  "Invalid date or time format. Please use YYYY-MM-DD for date and HH:MM for time."
                );
                rl.close();
                return;
              }

              const hash = generateHash();
              const newTask = generateTask({
                title,
                hash,
                description,
                due: dueDateTime,
              });
              todo.add(newTask);
              console.log("Task added successfully!");
              rl.close();
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
      console.log("Task not found.");
      rl.close();
      return;
    }

    console.log("Press Enter to skip updating a field.");

    rl.question(`Update title (current: ${task.title}): `, (title: string) => {
      rl.question(
        `Update description (current: ${task.description}): `,
        (description: string) => {
          rl.question(
            `Update due date (YYYY-MM-DD HH:mm, current: ${task.due}): `,
            (dueInput: string) => {
              // Parse `due` date only if provided
              let due: Date | undefined = dueInput
                ? new Date(dueInput)
                : undefined;

              // Create an object of updates, avoiding undefined fields
              const updates: Partial<Task> = {
                title: title || task.title,
                description: description || task.description,
                due: due || task.due,
                last_updated_at: new Date(), // auto-set the last updated timestamp
              };

              // Perform the update using the internal update method
              todo.update(id, updates);
              console.log("Task updated successfully.");
              rl.close();
            }
          );
        }
      );
    });
  });
}

function deleteTask(taskId: string) {
  const task = todo.findTaskByIdPrefix(taskId);
  if (!task) {
    console.log("No task found with the provided ID.");
    rl.close();
    return;
  }

  rl.question(
    `\t⚠️ WARNING: This action is irreversible.\n\tAre you sure you want to permanently delete the task "${task.title}" (ID: ${task.id})? (y/n): `,
    (answer: string) => {
      if (answer.toLowerCase() === "y") {
        todo.delete(taskId);
        console.log("\tTask deleted successfully.");
      } else {
        console.log("\tDelete operation canceled.");
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
      console.log("Please provide a task ID to delete.");
      rl.close();
    }
    break;
  case "-f":
  case "--finish":
    if (arg) {
      todo.finish(arg);
    } else {
      console.log("Please provide a task ID to mark as done.");
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
      console.log("Please provide a task ID to view.");
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
      console.log("Please provide a task ID to start.");
    }
    rl.close();
    break;
  default:
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
    rl.close();
}
