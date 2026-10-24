import {setOptions,importLibrary} from '@googlemaps/js-api-loader';
import {validCoordinates,type BookingLocation} from './locationData';
const key=import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
export const placesConfigured=Boolean(key);
let library:Promise<google.maps.PlacesLibrary>|undefined;
export function loadPlaces():Promise<google.maps.PlacesLibrary>{
 if(!key)return Promise.reject(new Error('Google Places is not configured.'));
 if(!library){setOptions({key,v:'weekly',language:'en',region:'AE'});library=importLibrary('places').catch(error=>{library=undefined;throw error});}
 return library;
}
export async function searchPlaces(input:string,token:google.maps.places.AutocompleteSessionToken){
 const {AutocompleteSuggestion}=await loadPlaces();
 const result=await AutocompleteSuggestion.fetchAutocompleteSuggestions({input,sessionToken:token,includedRegionCodes:['ae'],locationBias:{center:{lat:25.2048,lng:55.2708},radius:50000},language:'en',region:'ae'});
 return result.suggestions.flatMap(s=>s.placePrediction?[s.placePrediction]:[]);
}
export async function resolvePlace(prediction:google.maps.places.PlacePrediction):Promise<BookingLocation>{
 const place=prediction.toPlace();
 await place.fetchFields({fields:['id','displayName','formattedAddress','location']});
 const latitude=place.location?.lat(),longitude=place.location?.lng();
 if(!place.id||!validCoordinates(latitude,longitude))throw new Error('Coordinates were not returned for this place.');
 return {name:place.displayName||prediction.mainText?.toString()||prediction.text.toString(),formattedAddress:place.formattedAddress||prediction.text.toString(),placeId:place.id,latitude:latitude!,longitude:longitude!,provider:'google',resolvedAt:new Date().toISOString(),instructions:''};
}
