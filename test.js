  // connect.js
  import { MongoClient } from "mongodb";
  import dotenv from "dotenv";

  dotenv.config();

  const uri = process.env.MONGO_URI;

  // Create a MongoClient instance
  const client = new MongoClient(uri);

  async function main() {
    try {
      // Connect to the Atlas cluster
      await client.connect();
      console.log("✅ Connected to MongoDB Atlas successfully!");

      // Access the 'academic_data' database
      const db = client.db("academic_data");

      // List all collections in the database
      const collections = await db.listCollections().toArray();
      console.log("📚 Collections in academic_data:");
      collections.forEach(c => console.log(" -", c.name));

      // Example: access one collection and view sample data
      const semester4 = db.collection("semester_4");
      const sample = await semester4.find().toArray();
      console.log("\n🧾 Sample document from semester_4:", sample);

    } catch (err) {
      console.error("❌ Connection error:", err);
    } finally {
      // Close the connection when done
      await client.close();
    }
  }

  main();
