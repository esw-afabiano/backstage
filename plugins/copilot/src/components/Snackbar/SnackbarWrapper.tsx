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
import { Snackbar } from '@material-ui/core';
import { useSharedSnackbar, getSnackbarContext } from './SnackbarProvider';
import Alert from '@material-ui/lab/Alert';

export function SnackbarWrapper() {
  const { toast, setToast } = useSharedSnackbar();

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={!!toast.message}
      autoHideDuration={6000}
      onClose={() => setToast({ message: '' })}
    >
      <Alert severity="error" variant="filled">
        {toast.message}
      </Alert>
    </Snackbar>
  );
}

// Static method to show an alert
SnackbarWrapper.Alert = function AlertMessage(message: string) {
  const { setToast } = getSnackbarContext();
  setToast({ message });
};
