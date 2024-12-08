export interface TaskInterface {
  id: string;
  title: string;
  description: string;
  created_at: Date;
  updated_at: Date;
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

export type MergedTask = TaskInterface & {
  priority: PriorityInterface | null;
  status: StatusInterface | null;
};
