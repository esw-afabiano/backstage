/*
 * Copyright 2022 The Backstage Authors
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

import { ResponseError } from '@backstage/errors';
import { Config } from '@backstage/config';
import { Metric } from '@backstage/plugin-copilot-common';
import fetch from 'node-fetch';

interface GithubApi {
  getCopilotUsageDataForOrganization: () => Promise<Metric[]>;
}

type CustomConfig = {
  baseUrl: string;
  orgName: string;
  token: string;
};

export class GithubClient implements GithubApi {
  private baseUrl: string;
  private orgName: string;
  private token: string;

  private constructor({ baseUrl, orgName, token }: CustomConfig) {
    this.baseUrl = baseUrl;
    this.orgName = orgName;
    this.token = token;
  }

  static fromConfig(config: Config) {
    return new GithubClient({
      baseUrl:
        config.getOptionalString('copilot.baseUrl') || 'https://api.github.com',
      orgName: config.getString('copilot.organization'),
      token: config.getString('copilot.token'),
    });
  }

  async getCopilotUsageDataForOrganization(): Promise<Metric[]> {
    const path = `/orgs/${this.orgName}/copilot/usage`;

    return this.get(path);
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json() as Promise<T>;
  }
}
