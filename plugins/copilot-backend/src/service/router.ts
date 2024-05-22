/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { PluginDatabaseManager } from '@backstage/backend-common';
import { MiddlewareFactory } from '@backstage/backend-app-api';
import { LoggerService, SchedulerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { DatabaseHandler } from '../db/DatabaseHandler';
import JobScheduler from '../task/JobScheduler';
import dayjs from 'dayjs';
import { GithubClient } from '../client/GithubClient';
import { Metric } from '@backstage/plugin-copilot-common';

/** @public */
export interface RouterOptions {
  logger: LoggerService;
  database: PluginDatabaseManager;
  scheduler: SchedulerService;
  config: Config;
}

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, database, scheduler, config } = options;

  const db = await DatabaseHandler.create({ database });
  const api = await GithubClient.fromConfig(config);

  await scheduler.scheduleTask({
    id: 'copilot-metrics',
    frequency: { cron: '0 2 * * *' },
    timeout: { minutes: 10 },
    initialDelay: { minutes: 1 },
    scope: 'local',
    fn: async () =>
      await JobScheduler.create({ db, logger, api, config }).run(),
  });

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/metrics', async (request, response) => {
    const { startDate, endDate } = request.query;

    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      return response.status(400).json('Invalid query parameters');
    }

    const parsedStartDate = dayjs(startDate);
    const parsedEndDate = dayjs(endDate);

    if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
      return response.status(400).json('Invalid date format');
    }

    // eslint-disable-next-line testing-library/no-await-sync-queries
    const result = await db.getByPeriod(startDate, endDate);

    const metrics: Metric[] = result.map(metric => ({
      ...metric,
      breakdown: JSON.parse(metric.breakdown),
    }));

    return response.json(metrics);
  });

  router.get('/metrics/period-range', async (_, response) => {
    const result = await db.getPeriodRange();

    if (!result) {
      return response.status(400).json('No available data');
    }

    return response.json(result);
  });

  router.use(MiddlewareFactory.create({ config, logger }).error);
  return router;
}
