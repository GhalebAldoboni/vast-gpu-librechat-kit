const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('node:path');

const librechatDir = process.env.LIBRECHAT_DIR || path.join(process.env.HOME || '.', 'LibreChat');

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'LibreChat',
      dbPath: path.join(librechatDir, 'data', 'mongodb'),
      storageEngine: 'wiredTiger',
    },
  });

  console.log(`MongoDB ready at ${mongod.getUri()}`);

  const shutdown = async () => {
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
