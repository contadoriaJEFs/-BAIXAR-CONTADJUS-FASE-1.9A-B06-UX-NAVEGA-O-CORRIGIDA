const fs=require('fs'), vm=require('vm');
const sandbox={console, window:{}, document:{getElementById:()=>null, querySelectorAll:()=>[], querySelector:()=>null, addEventListener:()=>{}}, Blob:function(){}, URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}}, Number, Math, String, Date, parseInt, parseFloat, isNaN, isFinite};
sandbox.window=sandbox.window;
vm.createContext(sandbox);
for (const f of ['data/indexadores-juros.js','js/admin-encadeamentos.js']) vm.runInContext(fs.readFileSync('/mnt/data/workb18/b08/'+f,'utf8'),sandbox,{filename:f});
vm.runInContext('window._enc=ENCADEAMENTOS_OFICIAIS; window._j=guia5CalcularJurosIntervalo;',sandbox);
const enc=sandbox.window._enc['MC-PREVID-2026'];
console.log('JUROS 2026:', enc.juros.periodos);
console.log('CORR 2026:', enc.correcao.periodos[0], enc.correcao.periodos.at(-1));
console.log('SELIC 2026:', enc.selic.periodos);
console.log('JUROS 2022:', sandbox.window._enc['MC-PREVID-2022'].juros.periodos);
const enc22=sandbox.window._enc['MC-PREVID-2022'];
const r22=sandbox.window._j({competenciaISO:'1994-07',valorCorrigido:1000},'1994-07','2021-11',{periodos:enc22.juros.periodos});
console.log('2022 07/1994-11/2021 juros %:',r22.percentual,'valor:',r22.valor,'meses:',r22.meses,'criterios:',r22.criterios);
// Direct test of interest interval: base corrected 1000, from 07/1994 to 11/2021 (before SELIC)
const item={competenciaISO:'1994-07',valorCorrigido:1000};
const r=sandbox.window._j(item,'1994-07','2021-11', {periodos:enc.juros.periodos});
console.log('07/1994-11/2021 juros %:',r.percentual,'valor:',r.valor,'meses:',r.meses,'criterios:',r.criterios);
// tax legal starts 09/2025, should be applied from 10/2025 using Sep rate
const item2={competenciaISO:'2025-09',valorCorrigido:1000};
const r2=sandbox.window._j(item2,'2025-09','2025-10',{periodos:enc.juros.periodos});
console.log('09/2025-10/2025 tax legal:',r2.percentual,r2.detalhamento);
