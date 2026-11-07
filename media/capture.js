const {chromium,devices}=require('playwright');const fs=require('fs');
fs.mkdirSync('captures',{recursive:true});
(async()=>{const b=await chromium.launch();
 for(const [n,dev] of [['iphone',devices['iPhone 13']],['android',devices['Pixel 5']]]){
  const p=await (await b.newContext({...dev})).newPage();await p.goto('https://yombal-immo.pro/',{waitUntil:'networkidle'});await p.waitForTimeout(2500);
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);const vh=p.viewportSize().height;
  for(let i=0,y=0;y<H;i++,y+=vh){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(500);await p.screenshot({path:`captures/${n}-${String(i).padStart(2,'0')}.jpg`,type:'jpeg',quality:80});}
  const info=await p.evaluate(()=>{const o=[];for(const e of document.querySelectorAll('.lp *')){const r=e.getBoundingClientRect();if(r.right>innerWidth+1&&r.width>0)o.push(e.className+' '+Math.round(r.right));}return {sw:document.documentElement.scrollWidth,iw:innerWidth,over:o.slice(0,15)};});
  fs.writeFileSync(`captures/${n}.json`,JSON.stringify(info));}
 await b.close();})();
