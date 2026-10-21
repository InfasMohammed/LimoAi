// Demo workspace context. Replace with the signed-in user's Supabase company later.
export type Workspace={id:string;name:string};
export function readWorkspace():Workspace{
  try{
    const saved=JSON.parse(localStorage.getItem('limo-workspace')||'null');
    if(saved?.id&&saved?.name)return {id:saved.id,name:saved.name};
    // Keep the original company's ID so existing local customer records remain accessible.
    const previous=JSON.parse(localStorage.getItem('limo-companies')||'null');
    if(Array.isArray(previous)&&previous[0]?.id&&previous[0]?.name)return {id:previous[0].id,name:previous[0].name};
  }catch{/* Use the default demo workspace. */}
  return {id:'CO-1001',name:'Prestige Limousine'};
}
