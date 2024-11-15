#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";
import * as readline from "readline";

const VERSION = "1.0.5";

export interface TaskInterface {
  id: string;
  title: string;
  description: string;
  created_at: Date;
  last_updated_at: Date;
  due: Date;
  status_id: number;
  priority_id: number;
}

export interface StatusInterface {
  id: number;
  name: "todo" | "in-progress" | "done";
  label: "Todo" | "In progress" | "Done";
  icon: string;
}

export interface PriorityInterface {
  id: number;
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

const echo = console.log;

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
      echo(`Could not load statuses from ${statusFilePath}:`, error);
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

  private getPriorityById(priorityId: number): PriorityInterface {
    return this.priorities.find((priority) => priority.id === priorityId)!;
  }

  private getStatusById(statusId: number): StatusInterface {
    return this.statuses.find((status) => status.id === statusId)!;
  }

  public findTaskByIdPrefix(idPrefix: string): TaskInterface | null {
    if (typeof idPrefix !== "string") {
      echo(`Provided ID prefix must be a string.`);
      return null;
    }

    const matches = this.tasks.filter((task) => task.id.startsWith(idPrefix));

    if (matches.length === 0) {
      echo(`No task found with ID starting with: ${idPrefix}`);
      return null;
    }
    if (matches.length > 1) {
      echo(`Multiple tasks found with ID starting with: ${idPrefix}`);
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
      echo(`Task with ID ${task.id} already exists.`);
      return;
    }
    this.tasks.push(task);
    this.save();
    echo(`Added task: ${task.title}`);
  }

  public delete(idPrefix: string): void {
    const task = this.findTaskByIdPrefix(idPrefix);
    if (task) {
      this.tasks = this.tasks.filter((t) => t.id !== task.id);
      this.save();
      echo(`Deleted task with ID: ${task.id}`);
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
      echo(`No tasks found with status "${status}".`);
    } else {
      filteredTasks.forEach((task) => {
        const { icon: priorityIcon } = this.getPriorityById(
          task.priority_id || 1
        );
        const { icon: statusIcon } = this.getStatusById(task.status_id);
        echo(`[${statusIcon}] ${task.id} - ${task.title} [${priorityIcon}]`);
      });
    }
  }
  public update(idPrefix: string, updatedFields: Partial<TaskInterface>): void {
    const task = this.findTaskByIdPrefix(idPrefix);
    if (task) {
      Object.assign(task, { ...updatedFields, last_updated_at: new Date() });
      this.save();
      echo(`Updated task with ID: ${task.id}`);
    }
  }
  public start(idPrefix: string): void {
    const task = this.findTaskByIdPrefix(idPrefix);
    if (task) {
      this.update(idPrefix, { status_id: 2 });
      echo(`Started task with ID: ${task.id}`);
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
      echo(`\nTask Details:\n-------------`);
      echo(`ID         : ${id}`);
      echo(`Title      : ${title}`);
      echo(`Description: ${description}`);
      echo(`Created at : ${created_at}`);
      echo(`Updated at : ${last_updated_at}`);
      echo(`Due        : ${due}`);
      echo(`Status     : ${statusIcon} ${statusLabel}`);
      echo(`Priority   : ${priorityIcon} ${priorityLabel}`);
      echo(`-------------\n`);
    }
  }
  public finish(idPrefix: string): void {
    this.update(idPrefix, { status_id: 3 });
  }
  private save(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.tasks, null, 2));
  }
  public printVersion() {
    echo(`TODO node CLI, version ${VERSION}`);
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
                echo(
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
                    echo("Invalid priority. Default to Low (1)");
                    priorityId = 1;
                  }

                  const hash = generateHash();
                  const newTask = generateTask({
                    title,
                    hash,
                    description,
                    due: dueDateTime,
                  });
                  newTask.priority_id = priorityId;
                  todo.add(newTask);
                  echo("Task added successfully!");
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
      echo("Task not found.");
      rl.close();
      return;
    }

    echo("Press Enter to skip updating a field.");

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
                    const priorityId =
                      parseInt(priorityInput) || task.priority_id;

                    const updates: Partial<TaskInterface> = {
                      priority_id: priorityId,
                      title: title || task.title,
                      description: description || task.description,
                      due: due || task.due,
                      last_updated_at: new Date(),
                    };
                    todo.update(id, updates);
                    echo("Task updated successfully.");
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
    echo("No task found with the provided ID.");
    rl.close();
    return;
  }

  rl.question(
    `\t⚠️ WARNING: This action is irreversible.\n\tAre you sure you want to permanently delete the task "${task.title}" (ID: ${task.id})? (y/n): `,
    (answer: string) => {
      if (answer.toLowerCase() === "y") {
        todo.delete(taskId);
        echo("\tTask deleted successfully.");
      } else {
        echo("\tDelete operation canceled.");
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
      echo("Please provide a task ID to delete.");
      rl.close();
    }
    break;
  case "-f":
  case "--finish":
    if (arg) {
      todo.finish(arg);
    } else {
      echo("Please provide a task ID to mark as done.");
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
      echo("Please provide a task ID to view.");
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
      echo("Please provide a task ID to start.");
    }
    rl.close();
    break;
  default:
    echo("Usage: todo <command> [args]");
    echo("Commands:");
    echo("  -a | --add           - Add a new task");
    echo("  -u | --update        - Update an existing task");
    echo("  -d | --delete <id>   - Delete a task by ID");
    echo("  -f | --finish <id>   - Mark a task as done by ID");
    echo("  -l | --list          - List all tasks");
    echo("  -s | --start <id>    - Start working on a task");
    echo("  -e | --detail <id>   - View task details");
    echo("  -v | --version       - View version number");
    rl.close();
}
