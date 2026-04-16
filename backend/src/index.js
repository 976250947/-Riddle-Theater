import "dotenv/config";
import { createApp } from "./app.js";

const port = Number(process.env.PORT || 3000);
const app = createApp();

const server = app.listen(port, () => {
  console.log(`Riddle Theatre API running at http://localhost:${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Trying ${port + 1}...`);
    app.listen(port + 1, () => {
      console.log(`Riddle Theatre API running at http://localhost:${port + 1}`);
    });
  } else {
    throw err;
  }
});
