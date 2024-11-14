# Todo Node CLI

A command-line to-do list manager built with Node.js. This tool allows users to manage tasks directly from the terminal, with options for adding, deleting, updating, listing, and viewing task details. It also supports starting and finishing tasks, making it easy to track progress.

## Features

-   **Add tasks**: Quickly add tasks with a title, description, and optional due date.
-   **Delete tasks**: Remove tasks by their unique ID prefix.
-   **Start/Finish tasks**: Update task status to track progress.
-   **List tasks**: View all tasks, filtered by status if needed.
-   **View task details**: Get detailed information about any task by ID prefix.
-   **View version**: Check the current version of the CLI tool.

## Installation

To install and use this to-do CLI tool, follow the steps below:

### 1. Clone the repository

```bash
git clone https://github.com/caesar003/todo.git
cd todo
```

### 2. Make the script executable

```bash
chmod +x todo
```

### 3. Add the script to your PATH (optional)

Move `todo.js` to a directory in your `$PATH` (e.g., `/usr/local/bin`):

```bash
sudo mv todo.js /usr/local/bin/todo
```

Now you can run `todo` from anywhere in the terminal.

## Usage

The `todo` command accepts the following subcommands:

### `-a` or `--add`

Adds a new task to the to-do list. Prompts for task title and description.

```bash
todo -a
```

### `-d` or `--delete <id>`

Deletes a task by its unique ID prefix.

```bash
todo -d <id_prefix>
```

Example:

```bash
todo -d abc123
```

### `-f` or `--finish <id>`

Marks a task as finished by ID prefix.

```bash
todo -f <id_prefix>
```

Example:

```bash
todo -f abc123
```

### `-l` or `--list`

Lists all tasks, optionally filtered by status (`all`, `todo`, `in-progress`, `done`).

```bash
todo -l [status]
```

Example:

```bash
todo -l todo
```

### `-e` or `--detail <id>`

Displays detailed information about a task by ID prefix.

```bash
todo -e <id_prefix>
```

Example:

```bash
todo -e abc123
```

### `-s` or `--start <id>`

Updates the status of a task to "in-progress."

```bash
todo -s <id_prefix>
```

Example:

```bash
todo -s abc123
```

### `-v` or `--version`

Displays the current version of the CLI.

```bash
todo -v
```

## Example Workflow

```bash
$ todo -a
Enter task title: Finish homework
Enter task description: Complete exercises in chapter 3
Added task: Finish homework

$ todo -l
[📝] ID: abc123 - Finish homework [Todo]

$ todo -s abc123
Started task with ID: abc123

$ todo -l in-progress
[] ID: abc123 - Finish homework [In Progress]

$ todo -f abc123
Updated task with ID: abc123

$ todo -l done
[✅] ID: abc123 - Finish homework [Done]
```

## Configuration

Task statuses are stored in a JSON file at `/etc/todo/status.json`. Customizing this file lets you adjust status labels and icons for task statuses like "todo," "in-progress," and "done."

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Caesar003 - [GitHub Profile](https://github.com/caesar003/)
