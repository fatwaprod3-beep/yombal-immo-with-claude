const {chromium,devices}=require('playwright');const fs=require('fs');
fs.rmSync('captures',{recursive:true,force:true});fs.mkdirSync('captures',{recursive:true});
(async()=>{const b=await chromium.launch();
 const init=()=>{try{localStorage.setItem('yombal-tour-done','1');localStorage.setItem('yombal-video-done','1');sessionStorage.setItem('yombal-video-shown','1')}catch{}};
 const ctx=await b.newContext({...devices['iPhone 13'],deviceScaleFactor:2});await ctx.addInitScript(init);const m=await ctx.newPage();
 for(const pg of ['loyers','locataires']){await m.goto('https://yombal-immo.pro/?demo=1#'+pg,{waitUntil:'networkidle'});await m.waitForTimeout(3500);await m.addStyleTag({content:'.mobile-nav{display:none!important}'});await m.screenshot({path:'captures/m-'+pg+'.jpg',type:'jpeg',quality:85,fullPage:true});}
 const d=await b.newContext({viewport:{width:1440,height:900}});await d.addInitScript(init);const p=await d.newPage();
 for(const pg of ['loyers','locataires']){await p.goto('https://yombal-immo.pro/?demo=1#'+pg,{waitUntil:'networkidle'});await p.waitForTimeout(3500);await p.screenshot({path:'captures/d-'+pg+'.jpg',type:'jpeg',quality:85,fullPage:true});}
 await p.goto('https://yombal-immo.pro/essai',{waitUntil:'networkidle'});await p.waitForTimeout(1500);await p.screenshot({path:'captures/d-essai.jpg',type:'jpeg',quality:80});
 await b.close();})();
