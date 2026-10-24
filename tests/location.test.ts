import test from 'node:test';
import assert from 'node:assert/strict';
import {manualLocation,readLocation,locationIsResolved,validCoordinates,type BookingLocation} from '../src/locationData.ts';
const location:BookingLocation={name:'A hotel',formattedAddress:'Dubai, UAE',placeId:'test-place',latitude:25.1,longitude:55.2,provider:'google',resolvedAt:'2026-10-24T00:00:00Z',instructions:''};
test('selected places retain structured metadata and separate instructions',()=>{
 const saved=readLocation(JSON.stringify(location),'A hotel',' Main entrance ');
 assert.equal(saved.placeId,'test-place');assert.equal(saved.latitude,25.1);assert.equal(saved.longitude,55.2);assert.equal(saved.instructions,'Main entrance');assert.equal(locationIsResolved(saved),true);
});
test('editing selected text invalidates metadata rather than leaving stale coordinates',()=>{
 const saved=readLocation(JSON.stringify(location),'A different hotel','');
 assert.equal(saved.provider,'manual');assert.equal(saved.latitude,null);assert.equal(saved.placeId,null);assert.equal(locationIsResolved(saved),false);
});
test('manual, missing, and invalid location metadata never receives invented coordinates',()=>{
 assert.equal(readLocation('invalid JSON','Airport','Door 2').placeId,null);
 assert.equal(locationIsResolved(manualLocation('Airport')),false);
 assert.equal(readLocation(JSON.stringify({...location,latitude:200}),'A hotel','').latitude,null);
 assert.equal(validCoordinates(0,0),true);assert.equal(validCoordinates(NaN,55),false);assert.equal(validCoordinates(25,181),false);
});
