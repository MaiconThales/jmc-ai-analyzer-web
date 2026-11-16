import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
@Injectable({ providedIn: 'root' }) export class HttpErrorService { message(error: unknown): string { const e = error as HttpErrorResponse; return e?.error?.message || e?.message || 'Não foi possível comunicar com a API. Tente novamente.'; } }
