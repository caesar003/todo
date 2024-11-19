import { Todo } from "../core";
import { rl } from "../utils";

export default function deleteTask(todo: Todo, taskId: string) {
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
