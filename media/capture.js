const {chromium,devices}=require('playwright');const fs=require('fs');
fs.mkdirSync('captures',{recursive:true});
(async()=>{const b=await chromium.launch();
 const m=await (await b.newContext({...devices['iPhone 13']})).newPage();
 for(const [n,u] of [['m-index','/ressources'],['m-contrat','/ressources/modele-contrat-de-bail-senegal']]){await m.goto('https://yombal-immo.pro'+u,{waitUntil:'networkidle'});await m.waitForTimeout(1500);await m.screenshot({path:`captures/${n}.jpg`,type:'jpeg',quality:80});await m.evaluate(()=>scrollTo(0,1400));await m.waitForTimeout(400);await m.screenshot({path:`captures/${n}-2.jpg`,type:'jpeg',quality:80});}
 const d=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
 await d.goto('https://yombal-immo.pro/ressources/caution-avance-loyer-senegal',{waitUntil:'networkidle'});await d.waitForTimeout(1500);await d.screenshot({path:'captures/d-art.jpg',type:'jpeg',quality:80});
 await d.evaluate(()=>scrollTo(0,1100));await d.waitForTimeout(400);await d.screenshot({path:'captures/d-art2.jpg',type:'jpeg',quality:80});
 await b.close();})();
