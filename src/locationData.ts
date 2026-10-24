export type BookingLocation={name:string;formattedAddress:string;placeId:string|null;latitude:number|null;longitude:number|null;provider:'google'|'manual';resolvedAt:string|null;instructions:string};
export const manualLocation=(name:string):BookingLocation=>({name,formattedAddress:'',placeId:null,latitude:null,longitude:null,provider:'manual',resolvedAt:null,instructions:''});
export function validCoordinates(latitude:unknown,longitude:unknown):boolean{return typeof latitude==='number'&&Number.isFinite(latitude)&&latitude>=-90&&latitude<=90&&typeof longitude==='number'&&Number.isFinite(longitude)&&longitude>=-180&&longitude<=180;}
export function readLocation(raw:string,text:string,instructions:string):BookingLocation{
 try{const location=JSON.parse(raw) as BookingLocation;if(location.provider==='google'&&location.name===text&&location.placeId&&validCoordinates(location.latitude,location.longitude))return {...location,instructions:instructions.trim()};}catch{/* Typed locations remain explicitly unverified. */}
 return {...manualLocation(text.trim()),instructions:instructions.trim()};
}
export function locationIsResolved(location?:BookingLocation):boolean{return !!(location?.provider==='google'&&location.placeId&&validCoordinates(location.latitude,location.longitude));}
