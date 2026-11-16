import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { JfrFile } from '../../core/models/analysis.models';
import { JfrFileService } from '../../core/services/jfr-file.service';
import { HttpErrorService } from '../../core/services/http-error.service';
@Component({standalone:true, imports:[CommonModule], selector:'app-dashboard', templateUrl:'./dashboard.html', styleUrl:'./dashboard.css'})
export class DashboardComponent implements OnInit { files=signal<JfrFile[]>([]); loading=signal(true); error=signal(''); selected=signal<JfrFile|null>(null); starting=signal(false); constructor(private filesApi:JfrFileService,private router:Router,private errors:HttpErrorService){} ngOnInit(){this.load();} load(){this.loading.set(true);this.error.set('');this.filesApi.list().subscribe({next:f=>{this.files.set(f);this.loading.set(false)},error:e=>{this.error.set(this.errors.message(e));this.loading.set(false)}})} start(){const f=this.selected();if(!f)return;this.starting.set(true);this.router.navigate(['/analysis',f.id||f.path||f.name],{queryParams:{file:f.id||f.path||f.name}});} }
