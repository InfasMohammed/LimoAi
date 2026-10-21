import {useState} from 'react';
import {formatKm,type FleetLogs} from './fleetData';
export default function FleetHistory({vehicleId,logs}:{vehicleId:string;logs:FleetLogs}){
const [tab,setTab]=useState('Mileage history');
const shifts=logs.shifts.filter(s=>s.vehicleId===vehicleId).sort((a,b)=>b.startAt.localeCompare(a.startAt));
const services=logs.services.filter(s=>s.vehicleId===vehicleId).sort((a,b)=>b.date.localeCompare(a.date));
return <div className="fleet-history"><div className="tabs">{['Mileage history','Maintenance history'].map(t=><button type="button" key={t} className={t===tab?'selected':''} onClick={()=>setTab(t)}>{t}</button>)}</div>
{tab==='Mileage history'?shifts.length?shifts.map(s=><div className="history-record" key={s.id}><strong>{s.driver} <span className="status">{s.status}</span></strong><p>{s.startAt.replace('T',' ')} → {s.endAt.replace('T',' ')||'Shift open'}</p><p>{formatKm(s.startKm)} → {s.endKm===null?'Awaiting end reading':formatKm(s.endKm)} {s.endKm!==null&&`· ${formatKm(s.endKm-s.startKm)} driven`}</p><small>{s.source} · {s.submittedBy}{s.reviewedBy&&` · Reviewed by ${s.reviewedBy}`}</small>{s.notes&&<p>{s.notes}</p>}</div>):<p>No mileage entries yet.</p>:services.length?services.map(s=><div className="history-record" key={s.id}><strong>{s.work}</strong><p>{s.date} · {formatKm(s.km)} · {s.workshop||'Workshop not recorded'}</p><p>AED {s.cost.toLocaleString()} · Next: {formatKm(s.nextKm)} or {s.nextDate}</p>{s.notes&&<p>{s.notes}</p>}</div>):<p>No services recorded yet.</p>}
</div>;
}
