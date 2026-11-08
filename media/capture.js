const {chromium,devices}=require('playwright');const fs=require('fs');
fs.mkdirSync('captures',{recursive:true});
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13'],deviceScaleFactor:3});
 await ctx.addInitScript(()=>{try{localStorage.setItem('yombal-tour-done','1');localStorage.setItem('yombal-video-done','1')}catch{}});const m=await ctx.newPage();
 for(const pg of ['accueil','biens','locataires','loyers']){await m.goto('https://yombal-immo.pro/?demo=1#'+pg,{waitUntil:'networkidle'});await m.waitForTimeout(3000);await m.screenshot({path:'captures/m-'+pg+'.jpg',type:'jpeg',quality:90});await m.addStyleTag({content:'.mobile-nav{display:none!important}'});await m.waitForTimeout(300);await m.screenshot({path:'captures/f-'+pg+'.jpg',type:'jpeg',quality:90,fullPage:true});}
 await b.close();})();
