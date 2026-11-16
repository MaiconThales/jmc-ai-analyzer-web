export function formatBytes(value?:number):string { if(value == null) return '—'; if(value<1024) return `${value} B`; const units=['KB','MB','GB','TB']; let n=value, i=-1; do {n/=1024;i++;} while(n>=1024&&i<units.length-1); return `${n.toFixed(n>=100?0:1)} ${units[i]}`; }
export function formatDuration(value?:number):string { if(value==null)return '—'; return value<1000?`${Math.round(value)} ms`:`${(value/1000).toFixed(value>=10000?0:2)} s`; }
export function formatPercent(value?:number):string { return value==null?'—':`${value.toFixed(2)}%`; }
