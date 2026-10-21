import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDropoff,displayBookingTime,type Booking} from '../src/bookingData.ts';
const booking:Booking={id:'LM-1',name:'Test',initials:'T',company:'Private',time:'09:30',date:'2026-10-21',pickup:'Airport',dropoff:'Hotel',type:'Transfer',vehicle:'Sedan',driver:'Ahmed',status:'In progress',price:100};
test('drop-off must be recorded and fall between pickup and the current GST time',()=>{
 assert.match(validateDropoff(booking,'','2026-10-21T12:00'),/Enter/);
 assert.match(validateDropoff(booking,'2026-10-21T09:00','2026-10-21T12:00'),/before/);
 assert.match(validateDropoff(booking,'2026-10-21T13:00','2026-10-21T12:00'),/future/);
 assert.equal(validateDropoff(booking,'2026-10-21T10:30','2026-10-21T12:00'),'');
 assert.equal(validateDropoff(booking,'2026-10-22T00:30','2026-10-22T01:00'),'');
});
test('missing legacy drop-off times stay unknown and display uses Dubai time without a timezone suffix',()=>{
 assert.equal(displayBookingTime(), 'Not recorded');
 assert.match(displayBookingTime('2026-10-21T10:30'),/10:30$/);
});
