export const tables: Record<string, string> = {
  "create.title": "Enter task title: ",
  "create.description": "Enter task description: ",

  "create.dueDate": "Enter task due date (YYYY-MM-DD) [Default: {{value}}]",
  "create.dueTime": "Enter task due time (HH:MM) [Default: {{value}}]",
  "create.invalidDateTime":
    "Invalid date or time format. Please use YYYY-MM-DD for date and HH:MM for time.",
  "create.priority":
    "Enter task priority (1: Low, 2: Medium, 3: High) [Default: 1]: ",
  "create.invalidPriority": "Invalid priority. Default to Low (1)",
  "create.success": "Task added successfully!",

  "update.id": "Enter task ID to update: ",
  "update.title": "Update title (current: {{value}}):\n\t",

  "update.description": "Update description (current: {{value}}):\n\t",
  "update.dueDate":
    "Update due date (YYYY-MM-DD HH:mm, current: ${value}):\n\t",
  "update.priority":
    "Update priority (1: Low, 2: Medium, 3: High, current: {{value}) \n\t",
  "update.notFound": "Task not found.",
  "update.skipField": "Press Enter to skip updating a field.",
  "update.success": "Task updated successfully.",
  "general.taskNotFound": "No task found with the id started with {{value}}",

  "delete.confirm":
    '\t⚠️ WARNING: This action is irreversible.\n\tAre you sure you want to permanently delete the task "{{title}}" (ID: {{id}})? (y/N): ',
  "delete.notFound": "No task found with the provided ID.",
  "delete.success": "\tTask deleted successfully.",
  "delete.canceled": "\tDelete operation canceled.",

  start: "Starting on task {{value}}",
  version: "TODO node CLI, version {{value}}",
  finish: "Finished task {{value}}",
  "general.taskEmpty": "No task found",

  "detail.header": "\nTask Details:\n---------------",
  "detail.id": "ID         : {{value}}",
  "detail.title": "Title      : {{value}}",
  "detail.description": "Description: {{value}}",
  "detail.createdAt": "Created at : {{value}}",
  "detail.updatedAt": "Updated at : {{value}}",
  "detail.due": "Due        : {{value}}",
  "detail.status": "Status     : {{value}}",
  "detail.priority": "Priority   : {{value}}",

  "general.notAvailable": "Not Available",

  "help.usage": "Usage: todo <command> [args]",
  "help.commands": "Commands:",
  "help.add": "  -a | --add           - Add a new task",
  "help.update": "  -u | --update        - Update an existing task",
  "help.delete": "  -d | --delete <id>   - Delete a task by ID",
  "help.finish": "  -f | --finish <id>   - Mark a task as done by ID",
  "help.list": "  -l | --list <status>  - List all tasks",
  "help.start": "  -s | --start <id>    - Start working on a task",
  "help.detail": "  -e | --detail <id>   - View task details",
  "help.version": "  -v | --version       - View version number",
  "e.idNotString": "Provided ID prefix must be a string",
  "e.taskNotFound": "No task found with ID starting with: {{value}}",
  "e.duplicateIdPrefix":
    "Multiple tasks found widht ID starting with: {{value}}",
  "e.loadTaskFile": "Error loading tasks from {{path}}: {{message}}",
  "e.unknownErr": "Unkown error occured while loading tasks.",
  "e.loadStatusFile": "Could not load statuses from {{path}}: {{message}}",
  "e.loadPrioFile": "Could not load priorites from {{path}}: {{message}}",

  "e.idToMarkDone": "Please provide a task ID to mark as done.",
  "e.idToStart": "Please provide a task ID to start.",
  "e.idToDelete": "Please provide a task ID to delete.",
  "e.idToView": "Please provide a task ID to view.",
};
