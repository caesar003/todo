import { TaskInterface, TaskGenerator } from "../types";

export default function generateTask(input: TaskGenerator): TaskInterface {
  const { hash, description, title } = input;
  return {
    id: hash,
    title,
    description: description,
    due: new Date(),
    created_at: new Date(),
    status_id: 1,
    updated_at: new Date(),
    priority_id: 1,
  };
}
