import type {Supplier} from './supplierData';
export type OutsourceAssignment={supplierId:string;supplierName:string;driverName:string;driverPhone:string;vehicleModel:string;vehiclePlate:string;reference:string};
export type AssignmentHistory={at:string;kind:'own'|'outsource';driver:string;vehicle:string;outsource?:OutsourceAssignment};
export type Booking={fulfilment?:'own'|'outsource';outsource?:OutsourceAssignment;assignmentHistory?:AssignmentHistory[];date?:string;phone?:string;notes?:string;dropoffAt?:string;cancelledAt?:string;cancellationReason?:string;id:string;name:string;initials:string;company:string;time:string;pickup:string;dropoff:string;type:string;vehicle:string;driver:string;status:string;price:number};
export function validateDropoff(booking:Booking,dropoffAt:string,now:string){
 if(!dropoffAt)return 'Enter the actual drop-off date and time.';
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dropoffAt)||Number.isNaN(Date.parse(dropoffAt+'+04:00')))return 'Enter a valid drop-off date and time.';
 if(dropoffAt<`${booking.date||'2026-10-21'}T${booking.time}`)return 'Drop-off time cannot be before the pickup time.';
 if(dropoffAt>now)return 'Actual drop-off time cannot be in the future.';
 return '';
}
export function displayBookingTime(at?:string){return at?new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dubai',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(at+'+04:00')):'Not recorded';}

export const outsourcePending=(b:Booking)=>b.fulfilment==='outsource'&&(!b.outsource?.driverName||!b.outsource?.driverPhone||!b.outsource?.vehicleModel||!b.outsource?.vehiclePlate);
export const bookingDriver=(b:Booking)=>b.fulfilment==='outsource'?b.outsource?.driverName||'Awaiting driver details':b.driver;
export const bookingVehicle=(b:Booking)=>b.fulfilment==='outsource'?b.outsource?.vehicleModel||'Awaiting vehicle details':b.vehicle;
export function assignOutsource(b:Booking,supplier:Supplier,details:Omit<OutsourceAssignment,'supplierId'|'supplierName'>,at:string):Booking{
 if(b.status==='Completed'||b.status==='Cancelled')throw new Error('Closed bookings cannot be reassigned.');
 if(supplier.status!=='Active'&&supplier.id!==b.outsource?.supplierId)throw new Error('Select an active supplier.');
 const outsource={...details,supplierId:supplier.id,supplierName:supplier.name};
 const previous:AssignmentHistory={at,kind:b.fulfilment==='outsource'?'outsource':'own',driver:bookingDriver(b),vehicle:bookingVehicle(b),...(b.outsource?{outsource:{...b.outsource}}:{})};
 return {...b,fulfilment:'outsource',driver:'Unassigned',outsource,status:b.status==='In progress'?'In progress':'Confirmed',assignmentHistory:[...(b.assignmentHistory||[]),previous]};
}
export function assignOwnDriver(b:Booking,driver:string,at:string):Booking{
 if(b.status==='Completed'||b.status==='Cancelled')throw new Error('Closed bookings cannot be reassigned.');
 const previous:AssignmentHistory={at,kind:b.fulfilment==='outsource'?'outsource':'own',driver:bookingDriver(b),vehicle:bookingVehicle(b),...(b.outsource?{outsource:{...b.outsource}}:{})};
 return {...b,fulfilment:'own',outsource:undefined,driver,status:driver==='Unassigned'?'Unassigned':b.status==='In progress'?'In progress':'Confirmed',assignmentHistory:[...(b.assignmentHistory||[]),previous]};
}
