const {chromium,devices}=require('playwright');const fs=require('fs');
fs.mkdirSync('captures',{recursive:true});
const wait=async()=>{for(let i=0;i<40;i++){const r=await fetch('https://yombal-immo.pro/',{cache:'no-store'});const t=await r.text();if(t.includes('lp-sm-hide'))return;await new Promise(r=>setTimeout(r,15000));}};
(async()=>{await wait();const b=await chromium.launch();
 const p=await (await b.newContext({...devices['iPhone 13']})).newPage();await p.goto('https://yombal-immo.pro/',{waitUntil:'networkidle'});await p.waitForTimeout(2500);
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);const vh=p.viewportSize().height;
 for(let i=0,y=0;y<H;i++,y+=vh){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(400);await p.screenshot({path:`captures/iphone-${String(i).padStart(2,'0')}.jpg`,type:'jpeg',quality:80});}
 fs.writeFileSync('captures/info.json',JSON.stringify(await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,H:document.documentElement.scrollHeight}))));
 const ctx=await b.newContext({...devices['iPhone 13']});await ctx.addInitScript(()=>{try{localStorage.setItem('yombal-tour-done','1')}catch{}});const m=await ctx.newPage();
 await m.goto('https://yombal-immo.pro/?demo=1#accueil',{waitUntil:'networkidle'});await m.waitForTimeout(3000);await m.screenshot({path:'captures/home-m.jpg',type:'jpeg',quality:85});
 await m.click('.overview-demo');await m.waitForTimeout(2500);await m.screenshot({path:'captures/modal-m.jpg',type:'jpeg',quality:85});
 const d=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();await d.goto('https://yombal-immo.pro/?demo=1#accueil',{waitUntil:'networkidle'});await d.waitForTimeout(3000);await d.screenshot({path:'captures/home-d.jpg',type:'jpeg',quality:85});
 await d.click('.overview-demo');await d.waitForTimeout(2500);await d.screenshot({path:'captures/modal-d.jpg',type:'jpeg',quality:85});
 await b.close();})();
