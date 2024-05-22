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
import React, { memo, useState } from 'react';
import dayjs from 'dayjs';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  EmptyState,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { Box, Grid, makeStyles } from '@material-ui/core';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { useMetrics, usePeriodRange } from '../../hooks';
import { CardsProps, ChartsProps } from '../../types';
import { useSharedDateRange } from '../Pages/CopilotPage';
import { SnackbarWrapper } from '../Snackbar';

const useStyles = makeStyles(theme => ({
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
  dateRange: {
    borderRadius: 25,
  },
}));

type State = {
  startDate: Date;
  endDate: Date;
  key: string;
};

type OrganizationMetricsProps = {
  Cards: React.ElementType<CardsProps>;
  Charts: React.ElementType<ChartsProps>;
};
export const OrganizationMetrics = ({
  Cards,
  Charts,
}: OrganizationMetricsProps) => {
  const [state, setState] = useSharedDateRange();

  const [period, setPeriod] = useState({
    startDate: state[0].startDate,
    endDate: state[0].endDate,
  });

  const { item } = usePeriodRange();

  const { items, loading, error } = useMetrics(
    period.startDate,
    period.endDate,
  );

  const classes = useStyles();

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  } else if (!items || !item) {
    return <EmptyState title="No metrics found" missing="data" />;
  }

  const MemoizedCards = memo(Cards);
  const MemoizedCharts = memo(Charts);

  return (
    <Box className={classes.main}>
      <Grid container>
        <Grid item xs={6} sm={5} md={5} lg={3} xl={3}>
          <DateRange
            onChange={({ selection }: RangeKeyDict) => {
              const dateIsBefore = dayjs(selection.startDate).isBefore(
                selection.endDate,
              );

              if (dateIsBefore) {
                setPeriod(selection as State);
              }
              const diffInDays = dayjs(selection.endDate).diff(
                selection.startDate,
                'days',
              );

              if (diffInDays > 27) {
                // eslint-disable-next-line new-cap
                SnackbarWrapper.Alert(
                  'Period cannot be selected longer than 27 days',
                );
                return;
              }

              setState([selection as State]);
            }}
            scroll={{ enabled: true }}
            minDate={dayjs(item.minDate).toDate()}
            maxDate={dayjs(item.maxDate).toDate()}
            ranges={state}
            showDateDisplay={false}
            editableDateInputs
            moveRangeOnFirstSelection={false}
            className={classes.dateRange}
            classNames={{
              infiniteMonths: classes.dateRange,
            }}
          />
        </Grid>
        <Grid item xs={6} sm={7} md={7} lg={9} xl={9}>
          <MemoizedCards
            startDate={period.startDate}
            endDate={period.endDate}
            metrics={items}
          />
        </Grid>
      </Grid>
      <MemoizedCharts metrics={items} />
    </Box>
  );
};
