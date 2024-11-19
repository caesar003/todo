export default function showHelp() {
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
}
