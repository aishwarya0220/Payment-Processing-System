import { spawn } from "node:child_process";

const services = [
  ["order-service", "3001"],
  ["payment-service", "3002"],
];

const processes = services.map(([name]) => {
    const child = spawn(
        "cmd.exe",
        ["/d", "/s", "/c", `npm run dev -w ${name}`],
        {
          stdio: "inherit",
        }
      );

  child.on("exit", (code) => {
    console.log(`${name} exited with code ${code}`);
  });

  return child;
});

process.on("SIGINT", () => {
  for (const child of processes) {
    child.kill();
  }
  process.exit();
});