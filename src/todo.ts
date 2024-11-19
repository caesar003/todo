#!/usr/bin/env node

import { Todo } from "./lib/core";
import { createTask, updateTask, deleteTask, showHelp } from "./lib/commands";
import { rl } from "./lib/utils";

const todo: Todo = new Todo();

const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case "-a":
  case "--add":
    createTask(todo);
    break;
  case "-u":
  case "--update":
    updateTask(todo);
    break;
  case "-d":
  case "--delete":
    if (arg) {
      deleteTask(todo, arg);
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
    showHelp();
    rl.close();
}
