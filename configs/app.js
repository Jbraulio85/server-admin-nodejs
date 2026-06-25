'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { errorHandler } from '../middlewares/handle-errors.js';

import fieldRoutes from '../src/fields/field.routes.js';
import reservationRoutes from '../src/reservations/reservation.routes.js';
import teamRoutes from '../src/teams/team.routes.js';
import tournamentRoutes from '../src/tournaments/tournaments.routes.js';

const BASE_PATH = '/kinalSportsAdmin/v1';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(express.json({ limit: '10mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(requestLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

const routes = (app) => {
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      service: 'KinalSports Admin API',
      version: '1.0.0',
      status: 'online',
      message: 'API en línea. Usa los endpoints documentados abajo.',
      endpoints: {
        health: `${BASE_PATH}/health`,
        fields: `${BASE_PATH}/fields`,
        reservations: `${BASE_PATH}/reservations`,
        teams: `${BASE_PATH}/teams`,
        tournaments: `${BASE_PATH}/tournaments`,
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.use(`${BASE_PATH}/fields`, fieldRoutes);
  app.use(`${BASE_PATH}/reservations`, reservationRoutes);
  app.use(`${BASE_PATH}/teams`, teamRoutes);
  app.use(`${BASE_PATH}/tournaments`, tournamentRoutes);

  app.get(`${BASE_PATH}/health`, (req, res) => {
    res.status(200).json({
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      service: 'KinalSports Admin Server',
    });
  });

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado en Admin API',
    });
  });
};

export const createApp = async () => {
  const app = express();
  app.set('trust proxy', 1);

  await dbConnection();
  middlewares(app);
  routes(app);
  app.use(errorHandler);

  return app;
};

export const initServer = async () => {
  const PORT = process.env.PORT || 3009;

  try {
    const app = await createApp();

    app.listen(PORT, () => {
      console.log(`KinalSports Admin Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
    });
  } catch (err) {
    console.error(`Error starting Admin Server: ${err.message}`);
    process.exit(1);
  }
};
