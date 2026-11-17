import type { components } from './generated/api';

type Schemas = components['schemas'];

export type BatchResponse = Schemas['BatchResponse'];
export type RecordingStatus = Schemas['RecordingStatusResponse'];
export type SoftwareResponse = Schemas['SoftwareResponse'];
export type SoftwareUpdateRequest = Schemas['SoftwareUpdateRequest'];
export type HistoryItem = Schemas['HistoryItemResponse'];
export type HistoryPage = Schemas['PagedModelHistoryItemResponse'];
export type ConfigResponse = Schemas['ConfigResponse'];
export type RecordingDashboard = Schemas['RecordingDashboard'];
export type BatchDashboard = Schemas['BatchDashboard'];
export type DiagnosisView = Schemas['DiagnosisView'];
export type LocationView = Schemas['LocationView'];
export type CoverageView = Schemas['CoverageView'];
export type CoverageItemView = Schemas['CoverageItemView'];
export type FindingView = Schemas['FindingView'];
export type MetadataView = Schemas['MetadataView'];
export type BatchMetadataView = Schemas['BatchMetadataView'];
export type GcView = Schemas['GcView'];
export type LocksView = Schemas['LocksView'];
export type HotMethodsView = Schemas['HotMethodsView'];
export type AllocationView = Schemas['AllocationView'];
export type ExceptionsView = Schemas['ExceptionsView'];
export type IoView = Schemas['IoView'];
export type LeaksView = Schemas['LeaksView'];
export type ThreadCpuView = Schemas['ThreadCpuView'];
export type ComparisonRow = Schemas['ComparisonRow'];
export type RecordingRef = Schemas['RecordingRef'];
export type StackFrame = Schemas['StackFrame'];
export type Point = Schemas['Point'];

export type Priority = NonNullable<DiagnosisView['priority']>;
export type CoverageStatus = NonNullable<CoverageItemView['status']>;
export type Environment = 'PROD' | 'HML' | 'DEV' | 'LOCAL';
export type BatchStatus = NonNullable<BatchResponse['status']>;
export type AnalysisStatus = NonNullable<RecordingStatus['status']>;

export type MetricType =
  | 'CPU_JVM_USER'
  | 'CPU_JVM_SYSTEM'
  | 'CPU_MACHINE'
  | 'HEAP_USED'
  | 'HEAP_COMMITTED'
  | 'THREADS_ACTIVE'
  | 'THREADS_DAEMON';

/** Séries de uma gravação, por métrica. */
export type MetricSeries = Partial<Record<MetricType, Point[]>>;
/** Séries do lote: uma entrada por gravação (recordingId). */
export type BatchSeries = Record<string, MetricSeries>;

/** Campos de texto do upload. */
export interface UploadForm {
  software: string;
  softwareVersion?: string;
  environment?: Environment;
  description?: string;
}

export const ENVIRONMENTS: readonly Environment[] = ['PROD', 'HML', 'DEV', 'LOCAL'];
