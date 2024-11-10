# Todo Node CLI

A simple command-line to-do list manager built with Node.js. It allows users to manage their tasks with ease directly from the terminal, supporting operations like adding, deleting, marking tasks as done, listing tasks, and viewing task details.

## Features

-   **Add tasks**: Easily add new tasks with a title and description.
-   **Delete tasks**: Remove tasks by their unique ID.
-   **Mark tasks as done**: Track progress by marking tasks as done.
-   **List tasks**: View all tasks with their current status.
-   **View task details**: Get detailed information about any task.

## Installation

To install and use this to-do CLI tool, follow the steps below:

### 1. Clone the repository

```bash
git clone https://github.com/caesar003/todo-node.git
cd todo-node
```

### 2. Make the script executable

You can run the `todo` command globally from any directory after setting up the following steps:

```bash
chmod +x todo.js
```

### 3. Add the script to your PATH (optional)

Move `todo.js` to a directory that's in your `$PATH` (e.g., `/usr/local/bin`):

```bash
sudo mv todo.js /usr/local/bin/todo
```

Now you can run `todo` from anywhere in the terminal.

## Usage

The `todo` command accepts the following subcommands:

### `add`

Adds a new task to the to-do list.

```bash
todo add
```

Prompts for task title and description. After the task is added, you will see the confirmation message: `Added task: <task title>`.

### `delete <id>`

Deletes a task by its unique ID.

```bash
todo delete <task_id>
```

For example:

```bash
todo delete abc123
```

### `markDone <id>`

Marks a task as done by its unique ID.

```bash
todo markDone <task_id>
```

For example:

```bash
todo markDone abc123
```

### `list`

Lists all tasks with their current status.

```bash
todo list
```

This will display tasks with their IDs and current statuses.

### `detail <id>`

Displays detailed information about a task.

```bash
todo detail <task_id>
```

For example:

```bash
todo detail abc123
```

## Example Workflow

```bash
$ todo add
Enter task title: Finish homework
Enter task description: Complete all exercises in chapter 3
Added task: Finish homework

$ todo list
[] ID: abc123, Title: Finish homework

$ todo markDone abc123
Updated task with ID: abc123

$ todo list
[] ID: abc123, Title: Finish homework
```

## Man Page

To view the manual for the `todo` command, use:

```bash
man todo
```

Or access it directly in the [GitHub repository](https://github.com/caesar003/todo.git).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Caesar003, [GitHub Profile](https://github.com/caesar003/)
