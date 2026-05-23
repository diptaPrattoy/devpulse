import { app } from './app.js';
import { checkDatabaseConnection } from './config/db.js';
import { env } from './config/env.js';

const startServer = async (): Promise<void> => {
  try {
    await checkDatabaseConnection();
    app.listen(env.port, () => {
      console.log(`DevPulse API running on port ${env.port}`);
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown startup error';
    console.error(`Failed to start server: ${message}`);
    process.exit(1);
  }
};

void startServer();
