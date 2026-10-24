import {locationIsResolved,type BookingLocation} from './locationData';
export default function LocationDetails({location}:{location?:BookingLocation}){
 if(!location)return null;
 return <div className="saved-location">{locationIsResolved(location)?<><p>{location.formattedAddress}</p><details className="location-metadata"><summary>Location details</summary><dl><dt>Latitude</dt><dd>{location.latitude}</dd><dt>Longitude</dt><dd>{location.longitude}</dd><dt>Google Place ID</dt><dd>{location.placeId}</dd></dl></details><div className="google-attribution"><img src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png" alt="Powered by Google" width="120" height="14"/></div></>:<p className="location-unverified">Typed location · not verified</p>}{location.instructions&&<p className="saved-instructions"><strong>Instructions:</strong> {location.instructions}</p>}</div>;
}
