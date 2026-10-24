import test from 'node:test';
import assert from 'node:assert/strict';
import {assignOutsource,assignOwnDriver,outsourcePending,bookingVehicle,bookingDriver,type Booking} from '../src/bookingData.ts';
import type {Supplier} from '../src/supplierData.ts';
const booking:Booking={id:'LM-1',name:'Test',initials:'T',company:'Customer',time:'10:00',pickup:'Airport',dropoff:'Hotel',type:'Transfer',vehicle:'Own sedan',driver:'Ahmed',status:'Confirmed',price:300};
const supplier:Supplier={id:'s1',companyId:'CO-1001',name:'Partner Limo',contact:'Ali',phone:'123456789',email:'',city:'Dubai',license:'',status:'Active',notes:''};
const empty={driverName:'',driverPhone:'',vehicleModel:'',vehiclePlate:'',reference:''};
test('supplier can be assigned before driver and vehicle details arrive',()=>{
 const saved=assignOutsource(booking,supplier,empty,'2026-10-24T10:00');
 assert.equal(saved.fulfilment,'outsource');assert.equal(outsourcePending(saved),true);
 assert.equal(bookingDriver(saved),'Awaiting driver details');assert.equal(bookingVehicle(saved),'Awaiting vehicle details');
 assert.equal(saved.vehicle,booking.vehicle);assert.equal(saved.price,booking.price);assert.equal(saved.driver,'Unassigned');
 assert.equal(saved.assignmentHistory?.[0].driver,'Ahmed');assert.equal(saved.assignmentHistory?.[0].kind,'own');
});
test('changes keep prior assignment snapshots, with no colour or supplier cost fields',()=>{
 const first=assignOutsource(booking,supplier,{...empty,driverName:'First driver',driverPhone:'123',vehicleModel:'Sedan',vehiclePlate:'D 1'},'2026-10-24T10:00');
 const changed=assignOutsource(first,{...supplier,name:'Updated partner'},{...empty,driverName:'New driver',driverPhone:'456',vehicleModel:'Van',vehiclePlate:'D 2',reference:'REF1'},'2026-10-24T11:00');
 assert.equal(outsourcePending(changed),false);assert.equal(bookingDriver(changed),'New driver');assert.equal(bookingVehicle(changed),'Van');
 assert.equal(changed.assignmentHistory?.[1].outsource?.driverName,'First driver');
 assert.equal(changed.assignmentHistory?.[1].outsource?.supplierName,'Partner Limo');
 assert.equal(first.outsource?.driverName,'First driver');assert.equal('cost' in changed.outsource!,false);assert.equal('colour' in changed.outsource!,false);
});
test('return to own fleet clears the outsource assignment while retaining history',()=>{
 const outsourced=assignOutsource(booking,supplier,empty,'2026-10-24T10:00');
 const own=assignOwnDriver(outsourced,'Omar','2026-10-24T11:00');
 assert.equal(own.outsource,undefined);assert.equal(own.fulfilment,'own');assert.equal(bookingDriver(own),'Omar');assert.equal(bookingVehicle(own),'Own sedan');
 assert.equal(own.assignmentHistory?.at(-1)?.outsource?.supplierId,'s1');
});
test('reject inactive suppliers for new assignments and prevent terminal booking reassignment',()=>{
 assert.throws(()=>assignOutsource(booking,{...supplier,status:'Inactive'},empty,'2026-10-24T10:00'),/active supplier/);
 for(const status of ['Completed','Cancelled']){
  assert.throws(()=>assignOutsource({...booking,status},supplier,empty,'2026-10-24T10:00'),/Closed bookings/);
  assert.throws(()=>assignOwnDriver({...booking,status},'Omar','2026-10-24T10:00'),/Closed bookings/);
 }
});
