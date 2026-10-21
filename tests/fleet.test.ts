import test from 'node:test';
import assert from 'node:assert/strict';
import {validateShiftStart,validateShiftEnd,needsReview,serviceDue,type Shift} from '../src/fleetData.ts';
const vehicle={id:'v1',name:'Vehicle',status:'Available',km:'38000',serviceKm:'40000'};
const shift:Shift={id:'s1',vehicleId:'v1',driver:'Ahmed',source:'QC',submittedBy:'QC Admin',startAt:'2000-01-01T08:00',endAt:'',startKm:38000,endKm:null,notes:'',status:'Open'};
test('valid readings are accepted and normal mileage does not need review',()=>{
 assert.equal(validateShiftStart(vehicle,[],'Ahmed','2000-01-01T08:00',38000),'');
 assert.equal(validateShiftEnd(vehicle,shift,'2000-01-01T12:00',38200),'');
 assert.equal(needsReview(vehicle,shift,38200),false);
});
test('reject lower or invalid odometer readings and invalid end times',()=>{
 assert.match(validateShiftStart(vehicle,[],'Ahmed','2000-01-01T08:00',37999),/below/);
 assert.match(validateShiftStart(vehicle,[],'Ahmed','2000-01-01T08:00',NaN),/valid/);
 assert.match(validateShiftEnd(vehicle,shift,'2000-01-01T12:00',37999),/below/);
 assert.match(validateShiftEnd(vehicle,shift,'2000-01-01T07:00',38200),/after/);
 assert.match(validateShiftStart(vehicle,[],'Ahmed','2999-01-01T08:00',38000),/future/);
});
test('prevent duplicate vehicle shifts, overlapping drivers, and shifts during maintenance',()=>{
 assert.match(validateShiftStart(vehicle,[shift],'Other driver','2000-01-01T09:00',38000),/open shift/);
 assert.match(validateShiftStart({...vehicle,id:'v2'},[shift],'Ahmed','2000-01-01T09:00',38000),/driver/);
 assert.match(validateShiftStart({...vehicle,status:'Maintenance'},[],'Ahmed','2000-01-01T08:00',38000),/unavailable/);
 const completed={...shift,status:'Completed' as const,endAt:'2000-01-01T12:00',endKm:38200};
 assert.match(validateShiftStart({...vehicle,km:'38200'},[completed],'Ahmed','2000-01-01T10:00',38200),/overlaps/);
 assert.equal(validateShiftStart({...vehicle,km:'38200'},[completed],'Ahmed','2000-01-01T12:00',38200),'');
});
test('unusual distances and gaps require review; pending review blocks next shift',()=>{
 assert.equal(needsReview(vehicle,shift,39501),true);
 assert.equal(needsReview(vehicle,{...shift,startKm:38100},38200),true);
 assert.match(validateShiftStart(vehicle,[{...shift,status:'Review required',endAt:'2000-01-01T12:00',endKm:39501}],'Other driver','2000-01-01T13:00',39501),/awaiting review/);
});
test('service is due by either date or mileage',()=>{
 assert.equal(serviceDue(vehicle),false);
 assert.equal(serviceDue({...vehicle,km:'40000'}),true);
 assert.equal(serviceDue({...vehicle,serviceDate:'2000-01-01'}),true);
 assert.equal(serviceDue({...vehicle,serviceDate:'2999-01-01'}),false);
 assert.equal(serviceDue({...vehicle,serviceKm:''}),false);
});
