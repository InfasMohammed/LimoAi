export type Booking={date?:string;phone?:string;notes?:string;dropoffAt?:string;cancelledAt?:string;cancellationReason?:string;id:string;name:string;initials:string;company:string;time:string;pickup:string;dropoff:string;type:string;vehicle:string;driver:string;status:string;price:number};
export function validateDropoff(booking:Booking,dropoffAt:string,now:string){
 if(!dropoffAt)return 'Enter the actual drop-off date and time.';
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dropoffAt)||Number.isNaN(Date.parse(dropoffAt+'+04:00')))return 'Enter a valid drop-off date and time.';
 if(dropoffAt<`${booking.date||'2026-10-21'}T${booking.time}`)return 'Drop-off time cannot be before the pickup time.';
 if(dropoffAt>now)return 'Actual drop-off time cannot be in the future.';
 return '';
}
export function displayBookingTime(at?:string){return at?new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dubai',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(at+'+04:00')):'Not recorded';}
