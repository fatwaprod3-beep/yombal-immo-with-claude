const {chromium,devices}=require('playwright');const fs=require('fs');
fs.rmSync('captures',{recursive:true,force:true});fs.mkdirSync('captures',{recursive:true});
(async()=>{const b=await chromium.launch();
 const init=()=>{try{localStorage.setItem('yombal-tour-done','1');localStorage.setItem('yombal-video-done','1');sessionStorage.setItem('yombal-video-shown','1')}catch{}};
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:devices['iPhone 13'].userAgent});
 await ctx.addInitScript(init);const m=await ctx.newPage();
 for(const pg of ['biens','locataires','loyers']){
  await m.goto('https://yombal-immo.pro/?demo=1#'+pg,{waitUntil:'networkidle'});await m.waitForTimeout(4000);
  await m.addStyleTag({content:'.demo-banner,.demo-bar{display:none!important}'});
  await m.screenshot({path:'captures/'+pg+'.png',fullPage:true});
  await m.screenshot({path:'captures/'+pg+'-view.png'});
 }
 await b.close();})();
