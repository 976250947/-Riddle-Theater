import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";

const tasks = [
  { name: "web", color: "\x1b[35m", command: npmCommand, args: ["run", "dev:web"] },
  { name: "api", color: "\x1b[36m", command: npmCommand, args: ["run", "dev:api"] },
];

const children = [];
let shuttingDown = false;

function prefixAndWrite(task, chunk, writer) {
  const text = chunk.toString();
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line && index === lines.length - 1) continue;
    writer.write(`${task.color}[${task.name}]\x1b[0m ${line}\n`);
  }
}

function stopChildren(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }
    process.exit(exitCode);
  }, 300);
}

for (const task of tasks) {
  const child = isWindows
    ? spawn(process.env.comspec || "cmd.exe", ["/d", "/s", "/c", `"${task.command} ${(task.args || []).join(" ")}"`], {
        cwd: process.cwd(),
        env: process.env,
        shell: false,
        stdio: ["inherit", "pipe", "pipe"],
      })
    : spawn(task.command, task.args || [], {
        cwd: process.cwd(),
        env: process.env,
        shell: false,
        stdio: ["inherit", "pipe", "pipe"],
      });

  child.stdout.on("data", (chunk) => prefixAndWrite(task, chunk, process.stdout));
  child.stderr.on("data", (chunk) => prefixAndWrite(task, chunk, process.stderr));

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const failed = code && code !== 0;
    if (failed || signal) {
      stopChildren(code || 1);
    }
  });

  child.on("error", (error) => {
    if (shuttingDown) return;
    process.stderr.write(`${task.color}[${task.name}]\x1b[0m ${error.message}\n`);
    stopChildren(1);
  });

  children.push(child);
}

process.on("SIGINT", () => stopChildren(0));
process.on("SIGTERM", () => stopChildren(0));