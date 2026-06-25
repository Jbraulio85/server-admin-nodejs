import mongoose from 'mongoose';

let listenersRegistered = false;

const registerListeners = () => {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  mongoose.connection.on('error', () => {
    console.log('MongoDB | no se pudo conectar a mongoDB');
    mongoose.disconnect();
  });

  mongoose.connection.on('connecting', () => {
    console.log('MongoDB | intentando conectar a mongoDB');
  });

  mongoose.connection.on('connected', () => {
    console.log('MongoDB | conectado a mongoDB');
  });

  mongoose.connection.on('open', () => {
    console.log('MongoDB | conectado a la base de datos kinalSports');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB | reconectado a mongoDB');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB | desconectado de mongoDB');
  });
};

export const dbConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    registerListeners();

    await mongoose.connect(process.env.URI_MONGODB, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
  } catch (error) {
    console.log(`Error al conectar la db: ${error}`);
    process.exit(1);
  }
};

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`MongoDB | Received ${signal}. Closing database connection...`);
  try {
    await mongoose.connection.close();
    console.log('MongoDB | Database connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('MongoDB | Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

// Handle different termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon restarts
