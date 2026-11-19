import mongoose from 'mongoose';

// Reuse one connection (and in-flight connection attempt) per warm serverless instance.
const cache = globalThis.__storeHubMongooseCache || (globalThis.__storeHubMongooseCache = {
  promise: null,
});

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing');

  if (mongoose.connection.readyState === 1) return mongoose;

  // A previous connection may have disconnected after its promise resolved.
  if (mongoose.connection.readyState === 0) cache.promise = null;

  if (!cache.promise) {
    mongoose.set('bufferCommands', false);
    cache.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 0,
    }).catch((error) => {
      cache.promise = null; // allow a later invocation to retry
      throw error;
    });
  }

  await cache.promise;
  return mongoose;
}
