export type AnalysisState = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
export type StageState = AnalysisState;
export interface JfrFile { id?: string; name: string; path?: string; sizeBytes?: number; size?: number; modifiedAt?: string; durationMs?: number; }
export interface AnalysisStage { name: string; label?: string; state: StageState; message?: string; startedAt?: string; completedAt?: string; }
export interface AnalysisSummary { diagnosticCount?: number; highestSeverity?: string; highestScore?: number; maxGcPauseMs?: number; totalGcPauseMs?: number; heapBeforeBytes?: number; heapAfterBytes?: number; topCpuPercent?: number; totalContentionMs?: number; exceptionCount?: number; }
export interface RuleDiagnostic { rule: string; score?: number; severity?: string; summary?: string; solution?: string; stackTrace?: string; }
export interface HotMethod { method: string; cpuPercent?: number; samples?: number; durationMs?: number; }
export interface AllocatedClass { className: string; bytes?: number; count?: number; }
export interface GcMemorySummary { maxPauseMs?: number; totalPauseMs?: number; heapBeforeBytes?: number; heapAfterBytes?: number; allocations?: AllocatedClass[]; }
export interface LockContention { lockClass: string; durationMs?: number; count?: number; stackTrace?: string; }
export interface FrequentException { exceptionClass: string; count?: number; message?: string; stackTrace?: string; }
export interface AiFinding { title: string; severity?: string; evidence?: string; hypothesis?: string; }
export interface AiRecommendation { title: string; description?: string; priority?: string; finding?: string; }
export interface AiInterpretation { state: 'PENDING'|'COMPLETED'|'FAILED'|'UNAVAILABLE'; executiveSummary?: string; overallSeverity?: string; findings?: AiFinding[]; hypotheses?: string[]; recommendations?: AiRecommendation[]; model?: string; provider?: string; promptVersion?: string; errorMessage?: string; }
export interface AnalysisSession { id: string; file?: JfrFile; state: AnalysisState; stages?: AnalysisStage[]; summary?: AnalysisSummary; diagnostics?: RuleDiagnostic[]; hotMethods?: HotMethod[]; cpu?: HotMethod[]; gcMemory?: GcMemorySummary; locks?: LockContention[]; exceptions?: FrequentException[]; interpretation?: AiInterpretation; createdAt?: string; completedAt?: string; errorMessage?: string; }
export interface Page<T> { content: T[]; totalElements?: number; totalPages?: number; number?: number; }

/** Wire format exposed by the Spring REST API. Result payloads remain JSON because
 * the backend intentionally keeps MCP result schemas provider-neutral. */
export interface ApiAnalysis { session: { analysisId: string; fileId: string; fileName: string; fileSizeBytes: number; fileModifiedAt?: string; status: string; startedAt?: string; finishedAt?: string; createdAt?: string; errorCount: number }; stages: Array<{ stageId: string; name: string; status: string; startedAt?: string; finishedAt?: string; error?: { code: string; message: string } | null }>; results: Array<{ resultId: string; type: string; payload: unknown; createdAt?: string }>; errors: Array<{ code: string; message: string }>; interpretation?: { interpretationId: string; status: string; provider: string; model: string; promptVersion: string; executiveSummary?: string; overallSeverity?: string; payload?: unknown; error?: { code: string; message: string } | null; createdAt?: string } | null; }
export interface ApiStatus { analysisId: string; status: string; errorCount: number; stages: ApiAnalysis['stages']; }
