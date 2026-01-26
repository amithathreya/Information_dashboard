import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import logger from './src/utils/logger.js';

const PORT = process.env.PORT || 8080;

// Start server only after database connection is established
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();