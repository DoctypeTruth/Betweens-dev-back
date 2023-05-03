const { MongoClient } = require('mongodb');

const mongodbConnexion = () => {

  // retryWrites=true : Enables automatic retrying of a write operation in case of failure.
  // 'w=majority' specifies the write concern for database operations, ensuring data consistency across the replica set. 
  const uri = "mongodb+srv://" + process.env.MONGODB_USER + ":" + process.env.MONGODB_PASSWORD + "@betweendevs.1emcuo1.mongodb.net/?retryWrites=true&w=majority";

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  async function main() {
    try {
      await client.connect();
      console.log('Connected to MongoDB!');
    } catch (err) {
      console.error(err);
    } finally {
      await client.close();
    }
  }

  main().catch(console.error);

}

module.exports = mongodbConnexion;