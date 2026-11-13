// Enregistre une étape du parcours (installation, notifications…). Silencieux : ne bloque jamais l'interface.
export type TrackedEvent='install_prompt_shown'|'install_prompt_accepted'|'install_prompt_dismissed'|'app_installed'|'app_open_standalone'|'push_granted'|'push_denied'|'push_opened'|'onboarding_example_saved'|'onboarding_example_skipped'|'document_locked'|'device_seen'|'ios_coach_step'|'browser_switch';
export function trackEvent(kind:TrackedEvent,detail?:string){
 try{void fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',keepalive:true,body:JSON.stringify(detail?{kind,detail}:{kind})}).catch(()=>{});}catch{}
}

/** Note une fois par jour le type de téléphone (modèle exact quand Android le donne). */
export async function trackDevice(){
 try{const {describeDevice}=await import('./device');let model='';
  const uad=(navigator as Navigator&{userAgentData?:{getHighEntropyValues:(h:string[])=>Promise<{model?:string}>}}).userAgentData;
  if(uad)model=((await uad.getHighEntropyValues(['model'])).model||'').trim();
  trackEvent('device_seen',describeDevice(navigator.userAgent,model).label);}catch{}
}
