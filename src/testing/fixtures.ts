import type {
  BatchDashboard,
  BatchResponse,
  ConfigResponse,
  HistoryPage,
  RecordingDashboard,
  SoftwareResponse,
} from '../app/core/api/models';
import batchCompleted from './fixtures/batch-completed.json';
import batchDashboardPartial from './fixtures/batch-dashboard-partial.json';
import batchDashboard from './fixtures/batch-dashboard.json';
import batchPartial from './fixtures/batch-partial.json';
import config from './fixtures/config.json';
import errorInvalid from './fixtures/error-invalid-parameter.json';
import errorNotReady from './fixtures/error-not-ready.json';
import history from './fixtures/history.json';
import recordingDashboard from './fixtures/recording-dashboard.json';
import software from './fixtures/software.json';

/** Respostas reais da API, gravadas a partir dos 3 .jfr de exemplo (T-W02.2). */
export const FIXTURES = {
  batchCompleted: batchCompleted as unknown as BatchResponse,
  batchPartial: batchPartial as unknown as BatchResponse,
  recordingDashboard: recordingDashboard as unknown as RecordingDashboard,
  batchDashboard: batchDashboard as unknown as BatchDashboard,
  batchDashboardPartial: batchDashboardPartial as unknown as BatchDashboard,
  history: history as unknown as HistoryPage,
  software: software as unknown as SoftwareResponse[],
  config: config as unknown as ConfigResponse,
  errorNotReady,
  errorInvalid,
};

/** Cópia profunda, para testes poderem alterar o fixture sem afetar os outros. */
export function clone<T>(value: T): T {
  return structuredClone(value);
}
