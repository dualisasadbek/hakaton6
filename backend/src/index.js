import config from "./config/env.js";
import { db } from "./config/database.js";
import { app } from "./app.js";

async function start() {
  await db.connect();

  const server = app.listen(config.PORT, () => {
    console.log(`FixMyCity server: http://localhost:${config.PORT}`);
    console.log(`Swagger docs: http://localhost:${config.PORT}/api-docs`);
  });

  const shutdown = async () => {
    server.close();
    await db.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Server start xatosi:", err);
  process.exit(1);
});
