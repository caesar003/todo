#!/usr/bin/env node

import { TaskManager } from "./lib/TaskManager";
import { rl } from "./lib/utils";
import { useLabels } from "./lib/utils/labels/useLabels";

const taskManager: TaskManager = new TaskManager();

const { l } = useLabels();

const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case "-a":
  case "--add":
    taskManager.createTask();
    break;
  case "-u":
  case "--update":
    taskManager.updateTask();
    break;
  case "-d":
  case "--delete":
    if (arg) {
      taskManager.deleteTask(arg);
    } else {
      console.log(l("e.idToDelete"));
      rl.close();
    }
    break;
  case "-f":
  case "--finish":
    if (arg) {
      taskManager.finish(arg);
    } else {
      console.log(l("e.idToMarkDone"));
    }
    rl.close();
    break;
  case "-l":
  case "--list":
    taskManager.list(arg || "all");
    rl.close();
    break;
  case "-e":
  case "--detail":
    if (arg) {
      taskManager.detail(arg);
    } else {
      console.log(l("e.idToView"));
    }
    rl.close();
    break;
  case "-v":
  case "--version":
    taskManager.printVersion();
    rl.close();
    break;

  case "-s":
  case "--start":
    if (arg) {
      taskManager.start(arg);
    } else {
      console.log(l("e.idToStart"));
    }
    rl.close();
    break;
  default:
    taskManager.showHelp();
    rl.close();
}
