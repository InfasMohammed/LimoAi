export type Supplier={id:string;companyId:string;name:string;contact:string;phone:string;email:string;city:string;license:string;status:'Active'|'Inactive';notes:string};
export function readSuppliers():Supplier[]{try{const data=JSON.parse(localStorage.getItem('limo-suppliers')||'[]');return Array.isArray(data)?data:[]}catch{return []}}
