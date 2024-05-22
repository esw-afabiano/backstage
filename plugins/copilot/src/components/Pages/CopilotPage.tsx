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
import React from 'react';
import { Header, Page, Content } from '@backstage/core-components';
import { OrganizationMetrics } from '../Metrics';
import { CopilotTabs } from '../Tabs';
import { LanguageCards, OrganizationCards } from '../Cards';
import { LanguageCharts, OrganizationCharts } from '../Charts';
import dayjs from 'dayjs';
import { createStateContext } from 'react-use';
import { SnackbarProvider } from '../Snackbar/SnackbarProvider';
import { SnackbarWrapper } from '../Snackbar';

const today = dayjs();

export const [useSharedDateRange, SharedDateRangeProvider] = createStateContext(
  [
    {
      startDate: today.add(-27, 'day').toDate(),
      endDate: today.add(-1, 'day').toDate(),
      key: 'selection',
    },
  ],
);

export const CopilotPage = () => (
  <Page themeId="tool">
    <Header
      title="Copilot Adoption"
      subtitle="Exploring the Impact and Integration of AI Assistance in Development Workflows"
    />
    <Content>
      <SharedDateRangeProvider>
        <SnackbarProvider>
          <CopilotTabs
            tabs={[
              {
                label: 'Organization',
                children: (
                  <OrganizationMetrics
                    Cards={OrganizationCards}
                    Charts={OrganizationCharts}
                  />
                ),
              },
              {
                label: 'Languages',
                children: (
                  <OrganizationMetrics
                    Cards={LanguageCards}
                    Charts={LanguageCharts}
                  />
                ),
              },
            ]}
          />

          <SnackbarWrapper />
        </SnackbarProvider>
      </SharedDateRangeProvider>
    </Content>
  </Page>
);
