/**
 * PED CDS Shared Shell
 * 
 * Provides persistent header + patient banner across ALL pages.
 * Include after theme-bridge.js:
 *   <script src="../shell.js"></script>   (from subdirectory)
 *   <script src="./shell.js"></script>    (from root)
 * 
 * Reads patient state from localStorage (ped-cds-patient, ped-cds-mode).
 * Renders a compact summary bar at the top of every page.
 */
(function(){
  'use strict';
  var MODE_KEY='ped-cds-mode', PAT_KEY='ped-cds-patient';

  var BROSELOW=[
    {min:0,max:5,color:"Grey",hex:"#9CA3AF",ett:3.0},
    {min:5,max:7,color:"Pink",hex:"#F472B6",ett:3.5},
    {min:7,max:9,color:"Red",hex:"#EF4444",ett:3.5},
    {min:9,max:11,color:"Purple",hex:"#A855F7",ett:4.0},
    {min:11,max:13,color:"Yellow",hex:"#EAB308",ett:4.0},
    {min:13,max:16,color:"White",hex:"#D1D5DB",ett:4.5},
    {min:16,max:19,color:"Blue",hex:"#3B82F6",ett:5.0},
    {min:19,max:24,color:"Orange",hex:"#F97316",ett:5.5},
    {min:24,max:30,color:"Green",hex:"#22C55E",ett:6.0},
    {min:30,max:999,color:"Adult",hex:"#6B7280",ett:7.0},
  ];

  function getMode(){try{return localStorage.getItem(MODE_KEY)}catch(e){return null}}
  function getPatient(){try{var s=localStorage.getItem(PAT_KEY);return s?JSON.parse(s):null}catch(e){return null}}

  function render(){
    var mode=getMode(), pat=getPatient();
    if(!pat||!pat.weight) return; // no patient loaded — don't show banner

    // Don't double-inject
    if(document.getElementById('ped-shell-banner')) return;

    var isNeo=mode==='neonatal';
    var bar=document.createElement('div');
    bar.id='ped-shell-banner';
    bar.style.cssText='display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:7px 16px;font-family:"IBM Plex Sans",sans-serif;font-size:12px;border-bottom:1px solid var(--border,#D6D3D1);background:var(--surface2,#F5F5F4);position:fixed;top:0;left:0;right:0;z-index:250;box-shadow:0 1px 3px var(--shadow,rgba(28,25,23,.06))';

    // Mode badge
    var badge=document.createElement('span');
    badge.style.cssText='font-family:"IBM Plex Mono",monospace;font-size:10px;font-weight:600;padding:3px 8px;border-radius:12px;';
    if(isNeo){badge.textContent='👶 Neo';badge.style.background='var(--obg,#FFF7ED)';badge.style.color='var(--orange,#EA580C)';badge.style.border='1px solid var(--orange,#EA580C)';}
    else{badge.textContent='🧒 Peds';badge.style.background='var(--bbg,#EFF6FF)';badge.style.color='var(--blue,#2563EB)';badge.style.border='1px solid var(--blue,#2563EB)';}
    bar.appendChild(badge);

    function addStat(label,value){
      var s=document.createElement('div');s.style.cssText='display:flex;flex-direction:column;align-items:center;gap:0px';
      var l=document.createElement('span');l.style.cssText='font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--text3,#78716C)';l.textContent=label;
      var v=document.createElement('span');v.style.cssText='font-family:"IBM Plex Mono",monospace;font-size:13px;font-weight:600;color:var(--text,#1C1917)';v.textContent=value;
      s.appendChild(l);s.appendChild(v);bar.appendChild(s);
    }

    // Weight
    var wt=pat.weight;
    addStat('Weight',isNeo&&wt<10?(Math.round(wt*1000)+'g'):(wt+'kg'));

    // Age
    if(isNeo){
      if(pat.gaWeeks) addStat('GA',pat.gaWeeks+'+'+(pat.gaDays||0));
      addStat('DOL',''+(pat.dol||0));
    }else{
      var am=pat.ageMonths||0;
      addStat('Age',am<24?(am+' mo'):(Math.floor(am/12)+' yr'));
    }

    // Sex
    addStat('Sex',pat.sex==='male'?'M':'F');

    // Broselow for peds
    if(!isNeo){
      var b=BROSELOW.find(function(br){return wt>=br.min&&wt<br.max})||BROSELOW[BROSELOW.length-1];
      if(b){
        var bd=document.createElement('div');bd.style.cssText='display:flex;align-items:center;gap:4px;font-family:"IBM Plex Mono",monospace;font-size:11px;color:var(--text2,#44403C)';
        var dot=document.createElement('span');dot.style.cssText='width:10px;height:10px;border-radius:50%;background:'+b.hex+';border:1px solid var(--border,#D6D3D1)';
        bd.appendChild(dot);bd.appendChild(document.createTextNode(b.color+' · ETT '+b.ett));
        bar.appendChild(bd);
      }
    }

    // Home link
    var home=document.createElement('a');
    home.href='../';home.textContent='← PED CDS';
    home.style.cssText='margin-left:auto;font-size:11px;font-weight:500;color:var(--accent,#1D4ED8);text-decoration:none';
    bar.appendChild(home);

    // Insert at top of body
    document.body.insertBefore(bar,document.body.firstChild);

    // Push content down
    document.body.style.paddingTop='38px';
  }

  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',render);}else{render();}
  window.pedShell={render:render};
})();
