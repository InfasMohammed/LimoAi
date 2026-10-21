import {useEffect,useState} from 'react';
import {Plus,X,Check,Search,AlertCircle} from 'lucide-react';
import {gstNow,formatKm,serviceDue,validateShiftStart,validateShiftEnd,needsReview,type Vehicle,type FleetLogs} from './fleetData';
type Props={tab:string;vehicles:Vehicle[];logs:FleetLogs;onVehicleChange:(id:string,patch:Vehicle)=>void};
export default function FleetOperations({tab,vehicles,logs,onVehicleChange}:Props){
const [form,setForm]=useState<'start'|'end'|'service'|'review'|null>(null);
const [vehicleId,setVehicleId]=useState(vehicles[0]?.id||''),[shiftId,setShiftId]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState(''),[query,setQuery]=useState(''),[page,setPage]=useState(1);
const vehicle=vehicles.find(v=>v.id===vehicleId),shift=logs.shifts.find(s=>s.id===shiftId);
const close=()=>{setForm(null);setError('')};
useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(e.key==='Escape')close()};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[]);
const matches=(id:string,extra='')=>[vehicles.find(v=>v.id===id)?.name,vehicles.find(v=>v.id===id)?.plate,extra].join(' ').toLowerCase().includes(query.toLowerCase());
const shifts=logs.shifts.filter(s=>matches(s.vehicleId,s.driver+' '+s.status)).sort((a,b)=>b.startAt.localeCompare(a.startAt));
const schedules=vehicles.filter(v=>matches(v.id)).sort((a,b)=>Number(serviceDue(b))-Number(serviceDue(a))||a.name.localeCompare(b.name));
const services=logs.services.filter(s=>matches(s.vehicleId,s.work)).sort((a,b)=>b.date.localeCompare(a.date));
const open=(mode:typeof form,id?:string,sid?:string)=>{setVehicleId(id||vehicles[0]?.id||'');setShiftId(sid||'');setError('');setForm(mode)};
const mileage=tab==='Mileage & shifts',count=mileage?shifts.length:schedules.length,pages=Math.max(1,Math.ceil(count/10)),current=Math.min(page,pages);
return <><section className="panel directory"><div className="panel-heading"><div><h2>{tab}</h2><p>{mileage?'Start and close vehicle shifts':'Service due by mileage or date, whichever comes first.'}</p></div><button className="button primary" disabled={!vehicles.length} onClick={()=>open(mileage?'start':'service')}><Plus size={15}/>{mileage?'Start shift':'Record service'}</button></div>
<div className="directory-toolbar"><label className="search"><Search size={15}/><input aria-label="Search fleet activity" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder="Search vehicle, plate or activity…"/></label><span className="activity-note">{mileage?`${logs.shifts.filter(s=>s.status==='Open').length} open shifts · ${logs.shifts.filter(s=>s.status==='Review required').length} awaiting review`:`${vehicles.filter(serviceDue).length} vehicles due for service`}</span></div>
{message&&<div className="company-message" role="status"><Check size={15}/>{message}<button aria-label="Dismiss fleet message" onClick={()=>setMessage('')}><X size={14}/></button></div>}
<div className="table-scroll"><table><thead>{mileage?<tr><th>Vehicle / driver</th><th>Shift</th><th>Odometer</th><th>Distance</th><th>Submitted by</th><th>Status</th><th>Action</th></tr>:<tr><th>Vehicle</th><th>Current mileage</th><th>Next service KM</th><th>Next service date</th><th>Status</th><th>Action</th></tr>}</thead><tbody>
{mileage?shifts.slice((current-1)*10,current*10).map(s=><tr key={s.id}><td><strong>{vehicles.find(v=>v.id===s.vehicleId)?.name||'Unknown vehicle'}</strong><small>{s.driver}</small></td><td>{s.startAt.replace('T',' ')}<small>{s.endAt.replace('T',' ')||'Awaiting end of shift'}</small></td><td>{formatKm(s.startKm)}<small>{s.endKm===null?'—':formatKm(s.endKm)}</small></td><td>{s.endKm===null?'—':formatKm(s.endKm-s.startKm)}</td><td>{s.submittedBy}<small>{s.source}</small></td><td><span className={'status '+(s.status==='Completed'?'completed':s.status==='Open'?'in-progress':'unassigned')}>{s.status}</span></td><td>{s.status!=='Completed'&&<button className="button" onClick={()=>open(s.status==='Open'?'end':'review',s.vehicleId,s.id)}>{s.status==='Open'?'End shift':'Review'}</button>}</td></tr>):schedules.slice((current-1)*10,current*10).map(v=><tr key={v.id}><td><strong>{v.name}</strong><small>{v.plate}</small></td><td>{formatKm(v.km)}</td><td>{formatKm(v.serviceKm)}</td><td>{v.serviceDate||'Not set'}</td><td><span className={'status '+(serviceDue(v)?'unassigned':'confirmed')}>{serviceDue(v)?'Service due':v.serviceKm||v.serviceDate?'Scheduled':'Not scheduled'}</span><small>{v.status}</small></td><td><div className="company-actions"><button className="button" onClick={()=>open('service',v.id)}>Record service</button>{v.status!=='Maintenance'&&<button className="text-button" onClick={()=>{onVehicleChange(v.id,{status:'Maintenance'});setMessage(`${v.name} marked under maintenance.`)}}>Mark maintenance</button>}</div></td></tr>)}
</tbody></table>{!count&&<div className="empty"><h3>{mileage?'No shifts found':'No vehicles found'}</h3><p>{mileage?'Start a shift to record starting mileage.':'Add a vehicle from the Vehicles section.'}</p></div>}</div>
<div className="table-footer"><span>{count?`${(current-1)*10+1}–${Math.min(current*10,count)}`:'0'} of {count}</span><div><button aria-label="Previous activity page" disabled={current===1} onClick={()=>setPage(current-1)}>‹</button><span>Page {current} of {pages}</span><button aria-label="Next activity page" disabled={current===pages} onClick={()=>setPage(current+1)}>›</button></div></div></section>
{!mileage&&<section className="panel directory maintenance-history"><div className="panel-heading"><h2>Recent service history</h2></div><div className="table-scroll"><table><thead><tr><th>Vehicle</th><th>Date / odometer</th><th>Work completed</th><th>Workshop</th><th>Cost</th></tr></thead><tbody>{services.slice(0,20).map(s=><tr key={s.id}><td>{vehicles.find(v=>v.id===s.vehicleId)?.name}</td><td>{s.date}<small>{formatKm(s.km)}</small></td><td>{s.work}</td><td>{s.workshop||'—'}</td><td>AED {s.cost.toLocaleString()}</td></tr>)}</tbody></table>{!services.length&&<div className="empty">No services recorded yet.</div>}</div><p className="form-note">Latest 20 entries. Full history is available in each vehicle profile.</p></section>}
{form&&<div className="overlay" onClick={close}><section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="fleet-form-title" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><h2 id="fleet-form-title">{form==='start'?'Start shift':form==='end'?'End shift':form==='review'?'Review mileage':'Record service'}</h2></div><button aria-label="Close fleet form" onClick={close}><X size={21}/></button></div>
<form onSubmit={e=>{
 e.preventDefault();if(!vehicle){setError('Select a vehicle.');return}
 const f=new FormData(e.currentTarget),value=(k:string)=>String(f.get(k)||'').trim();
 const fail=(m:string)=>setError(m);
 if(form==='start'){
  const startKm=Number(value('startKm')),startAt=value('startAt'),driver=value('driver');
  if(!driver||!value('submittedBy'))return fail('Enter the driver and submitter names.');
  const problem=validateShiftStart(vehicle,logs.shifts,driver,startAt,startKm);if(problem)return fail(problem);
  logs.setShifts([...logs.shifts,{id:crypto.randomUUID(),vehicleId:vehicle.id,driver,source:value('source'),submittedBy:value('submittedBy'),startAt,endAt:'',startKm,endKm:null,notes:value('notes'),status:'Open'}]);
  setMessage('Shift started. Enter the ending reading when the vehicle returns.');
 }else if(form==='end'&&shift){
  const endKm=Number(value('endKm')),endAt=value('endAt');
  const problem=validateShiftEnd(vehicle,shift,endAt,endKm);if(problem)return fail(problem);
  const review=needsReview(vehicle,shift,endKm);
  logs.setShifts(logs.shifts.map(s=>s.id===shift.id?{...s,endKm,endAt,status:review?'Review required':'Completed',notes:[s.notes,value('notes')].filter(Boolean).join('\n')}:s));
  if(!review)onVehicleChange(vehicle.id,{km:String(endKm)});
  setMessage(review?'Reading saved for review. Vehicle mileage has not changed.':'Shift completed. Vehicle mileage and service reminders updated.');
 }else if(form==='review'&&shift&&shift.endKm!==null){
  if(!value('reviewer'))return fail('Enter the reviewer’s name.');
  const endKm=Number(value('endKm')),endAt=value('endAt');
  const problem=validateShiftEnd(vehicle,shift,endAt,endKm);if(problem)return fail(problem);
  logs.setShifts(logs.shifts.map(s=>s.id===shift.id?{...s,endKm,endAt,status:'Completed',reviewedBy:value('reviewer'),notes:[s.notes,value('reviewNotes')].filter(Boolean).join('\n')}:s));
  onVehicleChange(vehicle.id,{km:String(endKm)});setMessage('Reading accepted and vehicle mileage updated.');
 }else if(form==='service'){
  const km=Number(value('km')),nextKm=Number(value('nextKm'));
  if(logs.shifts.some(s=>s.vehicleId===vehicle.id&&s.status!=='Completed'))return fail('Complete or review this vehicle’s shifts before recording service.');
  if(!Number.isInteger(km)||km<Number(vehicle.km||0))return fail('Service mileage cannot reduce current mileage.');
  if(!Number.isInteger(nextKm)||nextKm<=km)return fail('Next service KM must be greater than service mileage.');
  const previous=logs.services.filter(s=>s.vehicleId===vehicle.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
  if(value('date')>gstNow().slice(0,10)||(previous&&value('date')<previous.date))return fail('Enter a service date after the previous service and not in the future.');
  if(value('nextDate')<=value('date'))return fail('Next service date must be after the completed service.');
  if(!value('work'))return fail('Enter the work completed.');
  logs.setServices([...logs.services,{id:crypto.randomUUID(),vehicleId:vehicle.id,date:value('date'),km,work:value('work'),workshop:value('workshop'),cost:Number(value('cost')),nextKm,nextDate:value('nextDate'),notes:value('notes')}]);
  onVehicleChange(vehicle.id,{km:String(km),serviceKm:String(nextKm),serviceDate:value('nextDate'),lastService:value('date'),...(f.has('available')?{status:'Available'}:{})});
  setMessage('Service recorded and next service schedule updated.');
 }
 close();
}}>
<div className="form-grid"><label className="full">Vehicle *<select aria-label="Activity vehicle" value={vehicleId} disabled={form==='end'||form==='review'} onChange={e=>{setVehicleId(e.target.value);setError('')}}>{vehicles.map(v=><option value={v.id} key={v.id}>{v.name} · {v.plate}</option>)}</select></label>
{form==='start'?<><label>Driver *<input name="driver" required defaultValue={vehicle?.driver||''} key={'driver'+vehicleId}/></label><label>Submitted by *<input name="submittedBy" required placeholder="Person entering the reading"/></label><label>Entry source<select name="source"><option>QC</option><option>Driver</option></select></label><label>Start date & time *<input name="startAt" type="datetime-local" required defaultValue={gstNow()}/></label><label>Starting KM *<input name="startKm" type="number" min="0" step="1" defaultValue={vehicle?.km||''} key={'km'+vehicleId} required/></label></>:
form==='end'?<><div className="form-note full">{shift?.driver} · Started {shift?.startAt.replace('T',' ')} · {formatKm(shift?.startKm)}</div><label>End date & time *<input name="endAt" type="datetime-local" required defaultValue={gstNow()}/></label><label>Ending KM *<input name="endKm" type="number" min="0" step="1" required/></label><div className="form-note full">Distances over 1,000 km per shift or gaps before the starting reading require review.</div></>:
form==='review'?<><div className="form-note full"><AlertCircle size={16}/>Check before applying: {formatKm(shift?.startKm)} → {formatKm(shift?.endKm??undefined)}. Driver: {shift?.driver}.</div><label>Ending KM *<input name="endKm" type="number" min="0" step="1" required defaultValue={shift?.endKm??''}/></label><label>End date & time *<input name="endAt" type="datetime-local" required defaultValue={shift?.endAt}/></label><label className="full">Reviewed by *<input name="reviewer" required/></label><label className="full">Review notes<textarea name="reviewNotes" placeholder="Explain any correction or confirm the reading"/></label></>:
<><label>Service date *<input name="date" type="date" required defaultValue={gstNow().slice(0,10)}/></label><label>Service mileage (KM) *<input name="km" type="number" min="0" step="1" required defaultValue={vehicle?.km||''} key={'service'+vehicleId}/></label><label>Work completed *<input name="work" required placeholder="e.g. Oil, filters and brake inspection"/></label><label>Workshop<input name="workshop"/></label><label>Cost (AED) *<input name="cost" type="number" min="0" step="0.01" defaultValue="0" required/></label><label>Next service KM *<input name="nextKm" type="number" min="0" step="1" required/></label><label>Next service date *<input name="nextDate" type="date" required/></label><label className="maintenance-checkbox"><input name="available" type="checkbox" defaultChecked/>Mark vehicle available after service</label></>}
{form!=='review'&&<label className="full">Notes<textarea name="notes"/></label>}</div>
{error&&<p className="company-error" role="alert">{error}</p>}<div className="modal-actions"><button className="button" type="button" onClick={close}>Cancel</button><button className="button primary" type="submit">{form==='start'?'Start shift':form==='end'?'Complete shift':form==='review'?'Accept reading':'Save service'}<Check size={15}/></button></div></form></section></div>}
<p className="form-note">Frontend demo · shifts and services are saved in this browser. Driver identity and QC permissions will be verified by the future backend.</p></>;
}
