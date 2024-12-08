import * as fs from "fs";
import { PriorityInterface } from "./types";

export class Priority {
  private priorities: PriorityInterface[];

  constructor(filePath = "/etc/todo/priority.json") {
    try {
      const priorityTextData = fs.readFileSync(filePath, "utf-8");
      this.priorities = JSON.parse(priorityTextData);
    } catch (error) {
      console.error(`Could not load priorities from ${filePath}:`, error);
      this.priorities = [];
    }
  }

  public getById(
    priorityId: PriorityInterface["id"]
  ): PriorityInterface | null {
    return (
      this.priorities.find((priority) => priority.id === priorityId) || null
    );
  }

  public getAll(): PriorityInterface[] {
    return this.priorities;
  }
}
