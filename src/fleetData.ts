import {useEffect,useState} from 'react';
export type Vehicle=Record<string,string>;
export type Shift={id:string;vehicleId:string;driver:string;source:string;submittedBy:string;startAt:string;endAt:string;startKm:number;endKm:number|null;notes:string;status:'Open'|'Completed'|'Review required';reviewedBy?:string};
export type Service={id:string;vehicleId:string;date:string;km:number;work:string;workshop:string;cost:number;nextKm:number;nextDate:string;notes:string};
function read<T>(key:string):T[]{try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data:[]}catch{return []}}
export function useFleetLogs(){
  const [shifts,setShifts]=useState(()=>read<Shift>('limo-shifts'));
  const [services,setServices]=useState(()=>read<Service>('limo-services'));
  useEffect(()=>localStorage.setItem('limo-shifts',JSON.stringify(shifts)),[shifts]);
  useEffect(()=>localStorage.setItem('limo-services',JSON.stringify(services)),[services]);
  return {shifts,setShifts,services,setServices};
}
export type FleetLogs=ReturnType<typeof useFleetLogs>;
export const gstNow=()=>{
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
  const part=(type:string)=>parts.find(p=>p.type===type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
};
export const formatKm=(value:number|string|undefined)=>value!==undefined&&value!==''?Number(value).toLocaleString()+' km':'Not recorded';
export function serviceDue(v:Vehicle){return Boolean((v.km&&v.serviceKm&&Number(v.km)>=Number(v.serviceKm))||(v.serviceDate&&v.serviceDate<=gstNow().slice(0,10)));}
export function validateShiftStart(v:Vehicle,shifts:Shift[],driver:string,startAt:string,startKm:number){
  if(v.status==='Maintenance'||v.status==='Inactive')return 'This vehicle is unavailable. Update its status before starting a shift.';
  if(!Number.isInteger(startKm)||startKm<0)return 'Enter a valid whole-number odometer reading.';
  if(shifts.some(s=>s.vehicleId===v.id&&s.status!=='Completed'))return 'This vehicle already has an open shift or a reading awaiting review.';
  if(shifts.some(s=>s.status==='Open'&&s.driver.toLowerCase()===driver.toLowerCase()))return 'This driver already has an open shift.';
  if(!startAt||startAt>gstNow())return 'Starting time cannot be in the future.';
  if(startKm<Number(v.km||0))return 'Starting KM cannot be below the vehicle’s current mileage.';
  if(shifts.some(s=>s.endAt&&startAt<s.endAt&&(s.vehicleId===v.id||s.driver.toLowerCase()===driver.toLowerCase())))return 'This shift overlaps an existing vehicle or driver shift. Enter shifts in chronological order.';
  return '';
}
export function validateShiftEnd(v:Vehicle,shift:Shift,endAt:string,endKm:number){
  if(!Number.isInteger(endKm)||endKm<shift.startKm||endKm<Number(v.km||0))return 'Ending KM cannot be below the starting reading or current mileage.';
  if(!endAt||endAt<=shift.startAt||endAt>gstNow())return 'Ending time must be after the start and cannot be in the future.';
  return '';
}
export const needsReview=(v:Vehicle,shift:Shift,endKm:number)=>endKm-shift.startKm>1000||shift.startKm>Number(v.km||shift.startKm);
