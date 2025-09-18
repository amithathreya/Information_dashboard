import app from './src/app.js';
import { connectDB } from './src/config/db.js';
connectDB();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});