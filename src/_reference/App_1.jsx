import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────
const P = {
  bg:"#0C0C0E", bg1:"#111115", bg2:"#16161B", bg3:"#1C1C23",
  border:"#242430", border2:"#2E2E3C",
  green:"#4ADE80", greenDim:"#1A3A28", greenStr:"#22C55E",
  clay:"#F59E6A", clayDim:"#3A2010",
  purple:"#A78BFA", purpleDim:"#2D1F5E",
  blue:"#60A5FA", blueDim:"#1A2F4A",
  red:"#F87171", redDim:"#3A1010",
  yellow:"#FACC15", yellowDim:"#2D2500",
  olive:"#8FA876", text:"#F0EEE8", textMid:"#9A98A0", muted:"#5A5870",
};

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const S = {
  root:{minHeight:"100vh",background:P.bg,color:P.text,fontFamily:"'DM Sans',sans-serif"},
  nav:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:58,borderBottom:`1px solid ${P.border}`,background:"rgba(12,12,14,0.95)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100},
  navBrand:{display:"flex",alignItems:"center",gap:8},
  navGem:{fontSize:18,color:P.green,fontWeight:900,lineHeight:1},
  navName:{fontSize:14,fontWeight:800,letterSpacing:"0.22em",fontFamily:"'Montserrat',sans-serif",color:P.text},
  navPill:{background:"rgba(74,222,128,0.1)",border:"1px solid rgba(74,222,128,0.3)",color:P.green,borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Montserrat',sans-serif",letterSpacing:"0.06em"},
  navBack:{background:"none",border:"none",color:P.muted,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Montserrat',sans-serif"},
  hero:{position:"relative",padding:"72px 28px 56px",overflow:"hidden"},
  heroBg:{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,222,128,0.1) 0%, transparent 70%)",pointerEvents:"none"},
  heroContent:{position:"relative",zIndex:1,maxWidth:580},
  heroEyebrow:{fontSize:11,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:P.green,marginBottom:16,fontFamily:"'Montserrat',sans-serif"},
  heroH1:{fontSize:44,fontWeight:800,lineHeight:1.1,margin:"0 0 16px",letterSpacing:"-0.02em",fontFamily:"'Montserrat',sans-serif",color:P.text},
  heroAccent:{color:P.green},
  heroP:{fontSize:15,color:P.textMid,lineHeight:1.75,maxWidth:460,margin:"0 0 22px"},
  heroMeta:{display:"flex",gap:8,flexWrap:"wrap"},
  heroChip:{fontSize:11,color:P.textMid,background:P.bg2,border:`1px solid ${P.border}`,borderRadius:20,padding:"4px 12px",fontFamily:"'Montserrat',sans-serif"},
  cpBanner:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 28px",background:P.bg2,borderBottom:`1px solid ${P.border}`,cursor:"pointer"},
  cpLeft:{display:"flex",alignItems:"center",gap:12},
  cpTitle:{fontSize:13,fontWeight:700,color:P.green,fontFamily:"'Montserrat',sans-serif"},
  cpMeta:{fontSize:11,color:P.muted,marginTop:2},
  cpCta:{fontSize:11,fontWeight:700,color:P.green,fontFamily:"'Montserrat',sans-serif"},

  // HOME SECTION
  section:{padding:"0 28px 48px"},
  sectionTop:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12},
  sectionH:{fontSize:18,fontWeight:800,color:P.text,fontFamily:"'Montserrat',sans-serif",margin:0},
  filterRow:{display:"flex",gap:6,flexWrap:"wrap"},
  fpill:{padding:"6px 14px",borderRadius:20,border:`1px solid ${P.border2}`,background:"transparent",color:P.muted,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Montserrat',sans-serif",transition:"all 0.15s"},
  fpillOn:{background:"rgba(74,222,128,0.1)",borderColor:"rgba(74,222,128,0.4)",color:P.green},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))",gap:10},
  raceCard:{background:P.bg2,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px 16px",cursor:"pointer",position:"relative",overflow:"hidden",transition:"all 0.2s"},
  rcTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12},
  rcCat:{fontSize:8,fontWeight:800,letterSpacing:"0.2em",color:P.olive,fontFamily:"'Montserrat',sans-serif"},
  rcEmoji:{fontSize:20},
  rcName:{fontSize:15,fontWeight:800,color:P.text,fontFamily:"'Montserrat',sans-serif",marginBottom:3},
  rcTagline:{fontSize:11,color:P.muted,marginBottom:10,fontStyle:"italic"},
  rcDist:{fontSize:11,color:P.textMid,marginBottom:14,lineHeight:1.5},
  rcFoot:{display:"flex",justifyContent:"space-between",alignItems:"center"},
  rcWks:{fontSize:10,fontWeight:700,color:P.greenStr,fontFamily:"'Montserrat',sans-serif"},
  rcArrow:{fontSize:11,fontWeight:700,color:P.green,fontFamily:"'Montserrat',sans-serif",opacity:0,transition:"all 0.2s"},

  // RACE BROWSER SCREEN
  searchBar:{display:"flex",gap:8,padding:"16px 28px",background:P.bg1,borderBottom:`1px solid ${P.border}`,alignItems:"center"},
  searchInp:{flex:1,background:P.bg2,border:`1px solid ${P.border2}`,borderRadius:10,padding:"9px 14px",color:P.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"},
  searchHint:{fontSize:11,color:P.muted,fontFamily:"'Montserrat',sans-serif",whiteSpace:"nowrap"},
  filterBar:{padding:"10px 28px",background:P.bg1,borderBottom:`1px solid ${P.border}`,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"},
  filterLabel:{fontSize:9,color:P.muted,textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:"'Montserrat',sans-serif",marginRight:4},
  raceListGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12,padding:"20px 28px 80px"},

  // RACE DETAIL CARD (expanded)
  rdCard:{background:P.bg2,border:`1px solid ${P.border}`,borderRadius:16,overflow:"hidden",cursor:"pointer",transition:"all 0.2s"},
  rdTop:{padding:"16px 18px 12px"},
  rdHeader:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8},
  rdMeta:{fontSize:8,fontWeight:800,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif"},
  rdName:{fontSize:16,fontWeight:800,color:P.text,fontFamily:"'Montserrat',sans-serif",marginBottom:2},
  rdLoc:{fontSize:11,color:P.muted,marginBottom:10},
  rdTags:{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10},
  rdTag:{fontSize:9,fontWeight:700,letterSpacing:"0.1em",padding:"3px 8px",borderRadius:4,fontFamily:"'Montserrat',sans-serif"},
  rdStats:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderTop:`1px solid ${P.border}`,borderBottom:`1px solid ${P.border}`},
  rdStat:{padding:"10px 0",textAlign:"center"},
  rdStatVal:{fontSize:14,fontWeight:800,fontFamily:"'Montserrat',sans-serif"},
  rdStatLbl:{fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"'Montserrat',sans-serif",marginTop:2},
  rdElevBar:{padding:"10px 14px",background:P.bg3},

  // ELEVATION MINI CHART
  elevChart:{height:36,display:"flex",alignItems:"flex-end",gap:1},
  elevBar:{width:"100%",borderRadius:"1px 1px 0 0",transition:"height 0.3s"},

  // SETUP
  setupTop:{position:"relative",padding:"36px 28px 32px",overflow:"hidden",borderBottom:`1px solid ${P.border}`},
  setupTopBg:{position:"absolute",inset:0,background:"radial-gradient(ellipse 100% 120% at 0% 50%, rgba(74,222,128,0.08) 0%, transparent 60%)",pointerEvents:"none"},
  setupTopContent:{position:"relative",zIndex:1},
  setupEyebrow:{fontSize:10,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:P.green,marginBottom:10,fontFamily:"'Montserrat',sans-serif"},
  setupRaceRow:{display:"flex",alignItems:"center",gap:14,marginBottom:8},
  setupEmoji:{fontSize:36},
  setupRaceName:{fontSize:24,fontWeight:800,color:P.text,fontFamily:"'Montserrat',sans-serif"},
  setupRaceDist:{fontSize:12,color:P.muted,marginTop:2},
  setupRaceEvent:{fontSize:11,color:P.textMid,marginTop:1,fontStyle:"italic"},
  setupMeta:{fontSize:11,color:P.textMid,fontFamily:"'Montserrat',sans-serif"},
  setupCourseBadges:{display:"flex",gap:6,flexWrap:"wrap",marginTop:10},
  formOuter:{padding:"20px 28px 80px"},
  formInner:{maxWidth:540,display:"flex",flexDirection:"column",gap:12},
  formBlock:{background:P.bg2,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px 18px"},
  formTitle:{fontSize:9,fontWeight:800,letterSpacing:"0.22em",textTransform:"uppercase",color:P.green,marginBottom:16,paddingBottom:9,borderBottom:`1px solid ${P.border}`},
  field:{marginBottom:16},
  fieldLabel:{fontSize:10,fontWeight:700,letterSpacing:"0.12em",color:P.textMid,textTransform:"uppercase",marginBottom:8,fontFamily:"'Montserrat',sans-serif"},
  fieldSub:{fontWeight:400,color:P.muted,textTransform:"none",letterSpacing:0,fontSize:11},
  discRow:{display:"flex",gap:8},
  discBtn:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,padding:"12px 6px",background:P.bg3,border:`1px solid ${P.border2}`,borderRadius:10,cursor:"pointer",transition:"all 0.15s"},
  dStrong:{background:P.greenDim,borderColor:"rgba(74,222,128,0.35)"},
  dWeak:{background:P.clayDim,borderColor:"rgba(245,158,106,0.35)"},
  dFaded:{opacity:0.25,cursor:"not-allowed"},
  dLabel:{fontSize:10,fontWeight:700,color:P.text,fontFamily:"'Montserrat',sans-serif"},
  dTagG:{fontSize:7,fontWeight:800,letterSpacing:"0.12em",padding:"2px 5px",borderRadius:2,background:P.greenDim,color:P.green,border:"1px solid rgba(74,222,128,0.3)",fontFamily:"'Montserrat',sans-serif"},
  dTagC:{fontSize:7,fontWeight:800,letterSpacing:"0.12em",padding:"2px 5px",borderRadius:2,background:P.clayDim,color:P.clay,border:"1px solid rgba(245,158,106,0.3)",fontFamily:"'Montserrat',sans-serif"},
  dayRow:{display:"flex",gap:6},
  dayBtn:{width:40,height:40,borderRadius:8,border:`1px solid ${P.border2}`,background:P.bg3,color:P.textMid,cursor:"pointer",fontWeight:800,fontSize:13,fontFamily:"'Montserrat',sans-serif",transition:"all 0.15s"},
  dayOn:{background:P.greenDim,borderColor:"rgba(74,222,128,0.45)",color:P.green},
  chips:{display:"flex",flexWrap:"wrap",gap:6},
  chip:{padding:"7px 12px",borderRadius:8,border:`1px solid ${P.border2}`,background:P.bg3,color:P.textMid,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'Montserrat',sans-serif",transition:"all 0.15s"},
  chipOn:{background:P.greenDim,borderColor:"rgba(74,222,128,0.45)",color:P.green},
  inp:{width:"100%",background:P.bg3,border:`1px solid ${P.border2}`,borderRadius:8,padding:"9px 12px",color:P.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"},
  ta:{resize:"vertical",minHeight:60},
  sgStack:{display:"flex",flexDirection:"column",gap:7},
  sgBtn:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",background:P.bg3,border:`1px solid ${P.border2}`,borderRadius:10,padding:"11px 13px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",width:"100%"},
  sgOn:{background:P.greenDim,borderColor:"rgba(74,222,128,0.4)"},
  sgRec:{borderColor:"rgba(245,158,106,0.35)"},
  sgDate:{fontSize:13,fontWeight:700,color:P.text,fontFamily:"'Montserrat',sans-serif"},
  sgWks:{fontSize:10,color:P.green,fontWeight:600,fontFamily:"'Montserrat',sans-serif",marginTop:2},
  sgNote:{fontSize:10,color:P.muted,lineHeight:1.4,textAlign:"right"},
  recTag:{fontSize:8,fontWeight:800,letterSpacing:"0.1em",color:P.clay,background:P.clayDim,border:"1px solid rgba(245,158,106,0.3)",padding:"2px 6px",borderRadius:3,fontFamily:"'Montserrat',sans-serif",marginBottom:4},
  tlBanner:{borderRadius:8,padding:"9px 13px",fontSize:11,lineHeight:1.6,marginTop:4},
  tlOk:{background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.25)",color:P.green},
  tlWarn:{background:"rgba(245,158,106,0.08)",border:"1px solid rgba(245,158,106,0.25)",color:P.clay},
  wygRow:{display:"flex",gap:8,flexWrap:"wrap"},
  wygCard:{flex:1,minWidth:72,display:"flex",flexDirection:"column",alignItems:"center",gap:6,background:P.bg2,border:`1px solid ${P.border}`,borderRadius:12,padding:"12px 4px"},
  wygIcon:{fontSize:16},
  wygLabel:{fontSize:8,fontWeight:700,color:P.textMid,fontFamily:"'Montserrat',sans-serif",textAlign:"center",letterSpacing:"0.06em",textTransform:"uppercase"},
  genBtn:{width:"100%",padding:"14px 24px",background:P.green,border:"none",borderRadius:10,color:"#0C0C0E",fontSize:13,fontWeight:800,letterSpacing:"0.08em",cursor:"pointer",fontFamily:"'Montserrat',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 0 28px rgba(74,222,128,0.25)",transition:"all 0.2s"},
  genBtnOff:{opacity:0.35,cursor:"not-allowed",boxShadow:"none"},
  setupHint:{textAlign:"center",color:P.muted,fontSize:11,marginTop:6,fontFamily:"'Montserrat',sans-serif"},

  // PREDICTOR
  predCard:{background:P.bg2,border:`1px solid ${P.border}`,borderRadius:14,padding:"18px 18px"},
  predTitle:{fontSize:9,fontWeight:800,letterSpacing:"0.22em",textTransform:"uppercase",color:P.purple,marginBottom:14,paddingBottom:9,borderBottom:`1px solid ${P.border}`,fontFamily:"'Montserrat',sans-serif"},
  predRow:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8},
  predCell:{background:P.bg3,borderRadius:10,padding:"12px 8px",textAlign:"center",border:`1px solid ${P.border2}`},
  predCellBest:{background:P.purpleDim,borderColor:"rgba(167,139,250,0.3)"},
  predVal:{fontSize:17,fontWeight:800,fontFamily:"'Montserrat',sans-serif",color:P.text},
  predValBest:{color:P.purple},
  predLbl:{fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"'Montserrat',sans-serif",marginTop:4},
  predNote:{fontSize:11,color:P.muted,lineHeight:1.5,marginTop:10,fontStyle:"italic"},

  // BUILDING
  buildScreen:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:P.bg,position:"relative"},
  buildGlow:{position:"absolute",top:"25%",left:"50%",transform:"translateX(-50%)",width:500,height:400,background:"radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, transparent 70%)",pointerEvents:"none"},
  buildInner:{position:"relative",zIndex:1,textAlign:"center",padding:"48px 32px",maxWidth:380},
  buildOrb:{fontSize:42,color:P.green,marginBottom:20,display:"block",lineHeight:1},
  buildH:{fontSize:24,fontWeight:800,color:P.text,fontFamily:"'Montserrat',sans-serif",margin:"0 0 8px"},
  buildSub:{fontSize:13,color:P.muted,margin:"0 0 32px",lineHeight:1.6},
  buildSteps:{display:"flex",flexDirection:"column",gap:14,marginBottom:24,textAlign:"left"},
  buildRow:{display:"flex",alignItems:"center",gap:12},
  buildDot:{width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0,transition:"all 0.3s"},
  bdDone:{background:P.greenDim,color:P.green,border:"1px solid rgba(74,222,128,0.4)",fontSize:11},
  bdActive:{background:P.clayDim,color:P.clay,border:"1px solid rgba(245,158,106,0.4)"},
  bdPend:{background:P.bg3,color:P.muted,border:`1px solid ${P.border}`},
  buildName:{fontSize:13,fontWeight:700,color:P.text,fontFamily:"'Montserrat',sans-serif"},
  buildStat:{fontSize:10,color:P.clay,fontFamily:"'Montserrat',sans-serif",marginTop:1},
  buildBarW:{height:2,background:P.border,borderRadius:1,overflow:"hidden"},
  buildBar:{height:"100%",background:`linear-gradient(90deg, ${P.green}, ${P.clay})`,borderRadius:1,transition:"width 0.5s ease"},

  // PLAN NAV
  planNav:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:58,borderBottom:`1px solid ${P.border}`,background:"rgba(12,12,14,0.95)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100},
  planNavL:{display:"flex",alignItems:"center",gap:0},
  planNavDiv:{width:1,height:18,background:P.border,margin:"0 14px"},
  planNavRace:{display:"flex",alignItems:"center",gap:8},
  planNavName:{fontSize:13,fontWeight:700,color:P.text,fontFamily:"'Montserrat',sans-serif"},
  planNavR:{display:"flex",alignItems:"center",gap:6},
  planNavDate:{fontSize:11,color:P.muted,fontFamily:"'Montserrat',sans-serif",marginRight:2},
  ghostBtn:{background:P.bg2,border:`1px solid ${P.border2}`,color:P.textMid,borderRadius:7,padding:"5px 11px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Montserrat',sans-serif",transition:"all 0.15s"},

  // STATS / TABS
  statsStrip:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:P.bg1,borderBottom:`1px solid ${P.border}`},
  statCard:{padding:"13px 0",textAlign:"center"},
  statVal:{fontSize:17,fontWeight:800,color:P.green,fontFamily:"'Montserrat',sans-serif"},
  statLbl:{fontSize:8,color:P.muted,textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"'Montserrat',sans-serif",marginTop:3},
  tabBar:{display:"flex",background:P.bg1,borderBottom:`1px solid ${P.border}`,padding:"0 12px",overflowX:"auto"},
  planTab:{display:"flex",alignItems:"center",gap:5,padding:"12px 12px",background:"none",border:"none",cursor:"pointer",fontSize:10,fontWeight:700,color:P.muted,letterSpacing:"0.07em",fontFamily:"'Montserrat',sans-serif",textTransform:"uppercase",position:"relative",transition:"color 0.15s",whiteSpace:"nowrap"},
  tabLine:{position:"absolute",bottom:-1,left:0,right:0,height:2,borderRadius:"2px 2px 0 0"},
  planMain:{display:"flex",flexDirection:"column"},
  planMd:{padding:"24px 28px 48px",fontSize:14,lineHeight:1.95,color:P.text,maxWidth:740},
  planEmpty:{display:"flex",flexDirection:"column",alignItems:"center",padding:"56px 28px"},

  // INJURY RISK
  riskBanner:{margin:"20px 28px 0",borderRadius:12,padding:"14px 16px",border:"1px solid"},
  riskRow:{display:"flex",alignItems:"center",justifyContent:"space-between"},
  riskLeft:{display:"flex",alignItems:"center",gap:10},
  riskIcon:{fontSize:18},
  riskLabel:{fontSize:11,fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif"},
  riskMsg:{fontSize:11,color:P.textMid,marginTop:3,lineHeight:1.5,maxWidth:480},
  riskMeter:{display:"flex",gap:3,flexShrink:0},
  riskDot:{width:8,height:8,borderRadius:"50%",background:P.border2},

  // TAPER
  taperCard:{margin:"0 28px 32px",background:P.bg2,border:`1px solid ${P.border}`,borderRadius:14,overflow:"hidden"},
  taperHead:{padding:"14px 18px",borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",gap:8},
  taperTitle:{fontSize:11,fontWeight:800,color:P.text,fontFamily:"'Montserrat',sans-serif",letterSpacing:"0.06em"},
  taperRow:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))"},
  taperCell:{padding:"14px 10px",textAlign:"center",borderRight:`1px solid ${P.border}`},
  taperWk:{fontSize:9,color:P.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"'Montserrat',sans-serif",marginBottom:6},
  taperPct:{fontSize:22,fontWeight:800,fontFamily:"'Montserrat',sans-serif"},
  taperNote:{fontSize:9,color:P.muted,marginTop:4},

  // MENTAL
  mentalCard:{background:P.bg2,border:"1px solid rgba(167,139,250,0.2)",borderRadius:14,marginBottom:10,overflow:"hidden"},
  mentalHead:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",cursor:"pointer"},
  mentalCardTitle:{fontSize:13,fontWeight:800,color:P.purple,fontFamily:"'Montserrat',sans-serif"},
  mentalCardSub:{fontSize:11,color:P.muted,marginTop:2},
  mentalBody:{padding:"0 18px 16px",borderTop:`1px solid rgba(167,139,250,0.15)`},

  // RECOVERY
  recovCard:{background:P.bg2,borderRadius:14,padding:"16px 18px",marginBottom:10,border:"1px solid"},
  recovBadge:{display:"inline-block",fontSize:8,fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif",padding:"3px 8px",borderRadius:4,marginBottom:8},
  recovTitle:{fontSize:14,fontWeight:800,color:P.text,fontFamily:"'Montserrat',sans-serif",marginBottom:6},
  recovBody:{fontSize:13,color:P.textMid,lineHeight:1.75},

  // KIT
  kitSection:{marginBottom:22},
  kitSectionTitle:{fontSize:9,fontWeight:800,letterSpacing:"0.2em",textTransform:"uppercase",color:P.blue,marginBottom:10,fontFamily:"'Montserrat',sans-serif"},
  kitItem:{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:`1px solid ${P.border}`},
  kitCheck:{width:18,height:18,borderRadius:4,border:`1px solid ${P.border2}`,background:P.bg3,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,transition:"all 0.15s",marginTop:2},
  kitCheckOn:{background:P.blue,borderColor:P.blue,color:"#0C0C0E"},
  kitItemName:{fontSize:13,color:P.text},
  kitItemNote:{fontSize:11,color:P.muted,marginTop:2},

  // COACH
  coachPanel:{borderTop:`2px solid ${P.border}`,background:P.bg1},
  coachHead:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 18px",borderBottom:`1px solid ${P.border}`},
  coachHeadL:{display:"flex",alignItems:"center",gap:10},
  coachOrb:{fontSize:16,color:P.green,lineHeight:1},
  coachTitle:{fontSize:12,fontWeight:800,color:P.text,fontFamily:"'Montserrat',sans-serif",letterSpacing:"0.06em"},
  coachSub:{fontSize:9,color:P.muted,fontFamily:"'Montserrat',sans-serif"},
  coachToggle:{background:P.bg2,border:`1px solid ${P.border2}`,color:P.textMid,borderRadius:6,width:26,height:26,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1},
  prompts:{padding:"12px 18px 0"},
  promptsLabel:{fontSize:9,fontWeight:700,letterSpacing:"0.16em",color:P.muted,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif",marginBottom:8},
  promptBtn:{display:"block",width:"100%",background:P.bg2,border:`1px solid ${P.border}`,borderRadius:8,padding:"8px 12px",fontSize:12,color:P.textMid,cursor:"pointer",textAlign:"left",marginBottom:6,fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"},
  msgs:{overflowY:"auto",padding:"14px 18px",display:"flex",flexDirection:"column",gap:10,maxHeight:260},
  msg:{maxWidth:"90%",padding:"9px 13px",borderRadius:11,fontSize:12,lineHeight:1.75},
  msgCoach:{background:P.bg2,border:`1px solid ${P.border}`,alignSelf:"flex-start"},
  msgUser:{background:P.greenDim,border:"1px solid rgba(74,222,128,0.25)",alignSelf:"flex-end",color:P.text},
  msgFrom:{fontSize:7,fontWeight:800,letterSpacing:"0.2em",color:P.green,marginBottom:4,fontFamily:"'Montserrat',sans-serif",textTransform:"uppercase"},
  dotRow:{display:"flex",gap:4,padding:"3px 0"},
  chatRow:{display:"flex",gap:7,padding:"10px 18px",borderTop:`1px solid ${P.border}`},
  chatTa:{flex:1,background:P.bg2,border:`1px solid ${P.border2}`,borderRadius:9,padding:"8px 11px",color:P.text,fontSize:12,resize:"none",fontFamily:"'DM Sans',sans-serif",outline:"none"},
  sendBtn:{width:34,height:34,borderRadius:9,background:P.green,border:"none",color:P.bg,cursor:"pointer",alignSelf:"flex-end",display:"flex",alignItems:"center",justifyContent:"center",transition:"opacity 0.15s"},

  // FAB / MODAL
  fabWrap:{position:"fixed",bottom:24,right:24,zIndex:200},
  fab:{width:52,height:52,borderRadius:"50%",background:P.clay,border:"none",color:"#0C0C0E",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 24px rgba(245,158,106,0.4)",transition:"all 0.2s"},
  fabTip:{position:"absolute",bottom:58,right:0,background:P.clayDim,border:"1px solid rgba(245,158,106,0.4)",color:P.clay,fontSize:10,fontWeight:700,fontFamily:"'Montserrat',sans-serif",padding:"4px 10px",borderRadius:6,whiteSpace:"nowrap",pointerEvents:"none"},
  modalBg:{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:24},
  modal:{background:P.bg2,border:`1px solid ${P.border2}`,borderRadius:16,padding:"28px 24px",maxWidth:420,width:"100%"},
  modalTitle:{fontSize:18,fontWeight:800,color:P.clay,fontFamily:"'Montserrat',sans-serif",margin:"0 0 6px"},
  modalSub:{fontSize:13,color:P.muted,lineHeight:1.6,margin:"0 0 20px"},
  modalField:{marginBottom:14},
  modalLabel:{fontSize:10,fontWeight:700,color:P.textMid,textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"'Montserrat',sans-serif",marginBottom:7},
  modalBtns:{display:"flex",gap:8,marginTop:20},
  modalCancel:{flex:1,padding:"10px",background:"none",border:`1px solid ${P.border2}`,color:P.muted,borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Montserrat',sans-serif"},
  modalConfirm:{flex:2,padding:"10px",background:P.clay,border:"none",color:"#0C0C0E",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:800,fontFamily:"'Montserrat',sans-serif"},
};

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Montserrat:wght@600;700;800;900&display=swap');
  *{box-sizing:border-box;}
  body{margin:0;background:#0C0C0E;}
  .rc:hover{border-color:rgba(74,222,128,0.4)!important;background:#1C1C23!important;transform:translateY(-2px);box-shadow:0 8px 28px rgba(74,222,128,0.08)!important;}
  .rc:hover .arr{opacity:1!important;}
  .rdc:hover{border-color:rgba(74,222,128,0.35)!important;transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,0.3)!important;}
  .cpb:hover{background:#1C1C23!important;}
  .fp:hover{border-color:#2E2E3C!important;color:#9A98A0!important;}
  .db:hover{border-color:#2E2E3C!important;}
  .dBtn:hover:not(:disabled){background:#22C55E!important;box-shadow:0 0 40px rgba(74,222,128,0.35)!important;transform:translateY(-1px);}
  .ghb:hover{border-color:#3A3A4C!important;color:#F0EEE8!important;}
  .sg:hover{border-color:rgba(74,222,128,0.35)!important;}
  .dy:hover{border-color:rgba(74,222,128,0.4)!important;color:#4ADE80!important;}
  .ch:hover{border-color:rgba(74,222,128,0.4)!important;color:#4ADE80!important;}
  .pb:hover{background:#1C1C23!important;color:#F0EEE8!important;}
  .pt:hover{color:#9A98A0!important;}
  .fab:hover{transform:scale(1.08)!important;}
  .mhd:hover{background:#1C1C23!important;}
  .kcb:hover{border-color:#60A5FA!important;}
  .srch:focus{border-color:rgba(74,222,128,0.4)!important;}
  @keyframes orbPulse{0%,100%{opacity:.8;text-shadow:0 0 20px rgba(74,222,128,.4);}50%{opacity:1;text-shadow:0 0 40px rgba(74,222,128,.7);}}
  .orb{animation:orbPulse 2.5s ease-in-out infinite;display:inline-block;}
  @keyframes blink{0%,80%,100%{opacity:0;}40%{opacity:1;}}
  .dot{display:inline-block;width:5px;height:5px;background:#5A5870;border-radius:50%;animation:blink 1.2s infinite;}
  .dot:nth-child(2){animation-delay:.2s;}.dot:nth-child(3){animation-delay:.4s;}
  .mh1,.mh2,.mh3{font-family:'Montserrat',sans-serif;font-weight:800;}
  .mh1{font-size:18px;color:#4ADE80;margin:20px 0 7px;}
  .mh2{font-size:14px;color:#F0EEE8;margin:18px 0 5px;padding-bottom:5px;border-bottom:1px solid #242430;}
  .mh3{font-size:12px;color:#8FA876;margin:12px 0 3px;}
  .mli{margin:3px 0;padding-left:2px;list-style:none;}
  .mli::before{content:"▸ ";color:#F59E6A;}
  strong{color:#4ADE80;font-weight:700;}
  em{color:#8FA876;font-style:italic;}
  input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.4) brightness(.8);cursor:pointer;}
  input::placeholder,textarea::placeholder{color:#3A3848;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-thumb{background:#242430;border-radius:2px;}
  ::selection{background:rgba(74,222,128,.18);}
  .tabBar::-webkit-scrollbar{height:0;}
  .filterBar::-webkit-scrollbar{height:0;}
`;

// ─────────────────────────────────────────────
// RACE TYPE TEMPLATES (distance categories)
// ─────────────────────────────────────────────
const RACE_TYPES = [
  {id:"5k",      name:"5K",           cat:"run",  icon:"🏃",dist:"3.1 mi",           minW:6, maxW:12, tag:"The gateway race"},
  {id:"10k",     name:"10K",          cat:"run",  icon:"🏃",dist:"6.2 mi",           minW:8, maxW:14, tag:"Double the distance"},
  {id:"half",    name:"Half Marathon",cat:"run",  icon:"🏅",dist:"13.1 mi",          minW:10,maxW:16, tag:"The perfect challenge"},
  {id:"marathon",name:"Marathon",     cat:"run",  icon:"🏆",dist:"26.2 mi",          minW:16,maxW:24, tag:"The classic"},
  {id:"50k",     name:"50K Ultra",    cat:"ultra",icon:"⛰️",dist:"31 mi",            minW:16,maxW:24, tag:"Enter the trails"},
  {id:"50m",     name:"50 Mile Ultra",cat:"ultra",icon:"🌄",dist:"50 mi",            minW:20,maxW:28, tag:"Deep wilderness"},
  {id:"100k",    name:"100K Ultra",   cat:"ultra",icon:"🔥",dist:"62 mi",            minW:24,maxW:32, tag:"Extreme endurance"},
  {id:"100m",    name:"100 Mile",     cat:"ultra",icon:"💀",dist:"100 mi",           minW:28,maxW:36, tag:"The ultimate test"},
  {id:"sprint",  name:"Sprint Tri",   cat:"tri",  icon:"⚡",dist:"0.5/12/3.1 mi",   minW:8, maxW:14, tag:"Your first tri"},
  {id:"olympic", name:"Olympic Tri",  cat:"tri",  icon:"🚴",dist:"0.9/25/6.2 mi",   minW:12,maxW:20, tag:"The classic distance"},
  {id:"half70",  name:"Half Ironman", cat:"tri",  icon:"🏊",dist:"1.2/56/13.1 mi",  minW:20,maxW:30, tag:"Prove your range"},
  {id:"ironman", name:"Full Ironman", cat:"tri",  icon:"🔱",dist:"2.4/112/26.2 mi", minW:28,maxW:40, tag:"The pinnacle"},
];

// ─────────────────────────────────────────────
// RACE DATABASE  (200 real events)
// elevProfile: array of 12 relative values 0-100 (course elevation shape)
// elev: total gain in feet
// difficulty: "flat"|"rolling"|"hilly"|"brutal"
// surface: "road"|"trail"|"mixed"
// terrain tags, official website
// ─────────────────────────────────────────────
const RACE_DB = [
  // ── ROAD MARATHONS ──────────────────────────────────────────
  {id:"boston",      name:"Boston Marathon",      loc:"Boston, MA",       country:"USA", cat:"marathon", typeId:"marathon", icon:"🏆",
   date:"Apr 21, 2026", elev:800,  elevGain:560,  difficulty:"hilly",   surface:"road",
   tags:["Qualifier","Iconic","Point-to-point","Historic"],
   desc:"The world's oldest annual marathon. Heartbreak Hill at mile 20 separates the prepared from the unprepared.",
   profile:[30,28,25,30,35,55,45,60,75,85,65,20],
   url:"https://www.baa.org/races/boston-marathon", source:"BAA"},
  {id:"nyc",         name:"NYC Marathon",          loc:"New York, NY",      country:"USA", cat:"marathon", typeId:"marathon", icon:"🏆",
   date:"Nov 1, 2026",  elev:860,  elevGain:450,  difficulty:"rolling", surface:"road",
   tags:["World Major","Loop","5 Boroughs","Iconic"],
   desc:"Five boroughs, one unforgettable day. The Queensboro Bridge and First Avenue crowds are legendary.",
   profile:[20,40,35,50,45,30,55,60,40,50,45,30],
   url:"https://www.nyrr.org/tcsnycmarathon", source:"NYRR"},
  {id:"chicago",     name:"Chicago Marathon",       loc:"Chicago, IL",       country:"USA", cat:"marathon", typeId:"marathon", icon:"🏆",
   date:"Oct 11, 2026", elev:598,  elevGain:90,   difficulty:"flat",    surface:"road",
   tags:["World Major","Flat","Fast","PR Course"],
   desc:"One of the flattest World Majors. Perfect for PRs. The wind off Lake Michigan is the only enemy.",
   profile:[20,18,20,22,18,20,22,20,18,22,20,18],
   url:"https://www.chicagomarathon.com", source:"Bank of America"},
  {id:"london",      name:"London Marathon",        loc:"London, UK",        country:"UK",  cat:"marathon", typeId:"marathon", icon:"🏆",
   date:"Apr 26, 2026", elev:525,  elevGain:180,  difficulty:"flat",    surface:"road",
   tags:["World Major","Flat","Point-to-point","Iconic"],
   desc:"From Greenwich to The Mall past Tower Bridge. Arguably the most beautiful urban marathon on earth.",
   profile:[22,20,22,25,20,22,25,22,20,22,25,20],
   url:"https://www.tcslondonmarathon.com", source:"London Marathon Events"},
  {id:"berlin",      name:"Berlin Marathon",        loc:"Berlin, Germany",   country:"DE",  cat:"marathon", typeId:"marathon", icon:"🏆",
   date:"Sep 27, 2026", elev:344,  elevGain:75,   difficulty:"flat",    surface:"road",
   tags:["World Major","Flat","World Record Course","Fast"],
   desc:"The world record course. Near-zero elevation change through the heart of Berlin. Pure speed.",
   profile:[18,18,20,18,18,20,18,18,20,18,18,18],
   url:"https://www.bmw-berlin-marathon.com", source:"SCC Events"},
  {id:"tokyo",       name:"Tokyo Marathon",         loc:"Tokyo, Japan",      country:"JP",  cat:"marathon", typeId:"marathon", icon:"🏆",
   date:"Mar 1, 2026",  elev:390,  elevGain:100,  difficulty:"flat",    surface:"road",
   tags:["World Major","Flat","Lottery","Spring"],
   desc:"One of the newest World Majors, already the most subscribed. Flat, fast, and immaculately organised.",
   profile:[20,22,20,18,20,22,20,22,20,18,20,22],
   url:"https://www.marathon.tokyo", source:"Tokyo Marathon Foundation"},
  {id:"la-marathon", name:"LA Marathon",            loc:"Los Angeles, CA",   country:"USA", cat:"marathon", typeId:"marathon", icon:"🏅",
   date:"Mar 15, 2026", elev:1800, elevGain:900,  difficulty:"hilly",   surface:"road",
   tags:["Point-to-point","Warm","Beach finish","Charity"],
   desc:"Stadium to the Sea — from Dodger Stadium to Santa Monica. Deceptive hills in the first half.",
   profile:[40,60,70,65,55,60,50,45,40,35,30,20],
   url:"https://www.lamarathon.com", source:"Conqur Endurance"},
  {id:"marine-corps",name:"Marine Corps Marathon",  loc:"Washington, DC",    country:"USA", cat:"marathon", typeId:"marathon", icon:"🏅",
   date:"Oct 25, 2026", elev:950,  elevGain:400,  difficulty:"rolling", surface:"road",
   tags:["Military","No prize money","Beginner-friendly","Iconic route"],
   desc:"The People's Marathon. No prize money, no elite field — just 30,000 runners and the monuments.",
   profile:[25,35,40,55,60,65,50,45,40,35,30,25],
   url:"https://www.marinemarathon.com", source:"USMC"},
  {id:"phoenix",     name:"Phoenix Marathon",       loc:"Phoenix, AZ",       country:"USA", cat:"marathon", typeId:"marathon", icon:"🏅",
   date:"Feb 28, 2026", elev:1300, elevGain:-800, difficulty:"rolling", surface:"road",
   tags:["Net downhill","Fast","Point-to-point","BQ-friendly"],
   desc:"Net 800ft downhill. One of the fastest qualifier courses in the country in perfect February weather.",
   profile:[80,75,70,65,60,55,50,45,40,35,30,20],
   url:"https://www.phoenixmarathon.com", source:"Revel Race Series"},
  {id:"grandmas",    name:"Grandma's Marathon",     loc:"Duluth, MN",        country:"USA", cat:"marathon", typeId:"marathon", icon:"🏅",
   date:"Jun 20, 2026", elev:620,  elevGain:200,  difficulty:"rolling", surface:"road",
   tags:["Scenic","Point-to-point","Lakeshore","Midwest"],
   desc:"Along the shores of Lake Superior. Gorgeous point-to-point through Minnesota's North Shore.",
   profile:[45,40,35,30,28,32,35,40,38,35,30,25],
   url:"https://www.grandmasmarathon.com", source:"Grandma's Marathon"},

  // ── HALF MARATHONS ──────────────────────────────────────────
  {id:"nyc-half",    name:"NYC Half Marathon",      loc:"New York, NY",      country:"USA", cat:"half", typeId:"half", icon:"🏅",
   date:"Mar 15, 2026", elev:800,  elevGain:380,  difficulty:"rolling", surface:"road",
   tags:["World Major","Manhattan","Urban","Lottery"],
   desc:"Through Central Park and down the West Side Highway. NYC's most prestigious half.",
   profile:[25,40,55,50,45,40,35,30,35,40,30,22],
   url:"https://www.nyrr.org/races/unitednyccityhalfmarathon", source:"NYRR"},
  {id:"sf-half",     name:"San Francisco Half",     loc:"San Francisco, CA", country:"USA", cat:"half", typeId:"half", icon:"🏅",
   date:"Jul 26, 2026", elev:1200, elevGain:650,  difficulty:"hilly",   surface:"road",
   tags:["Hilly","Iconic","Golden Gate","Challenging"],
   desc:"Golden Gate Bridge views come at a price — this is one of the hilliest half marathons in the US.",
   profile:[30,50,70,85,75,65,55,50,60,70,55,30],
   url:"https://www.thesfmarathon.com", source:"The SF Marathon"},
  {id:"disney-half", name:"Disney Half Marathon",   loc:"Orlando, FL",       country:"USA", cat:"half", typeId:"half", icon:"🏅",
   date:"Jan 10, 2026", elev:200,  elevGain:60,   difficulty:"flat",    surface:"road",
   tags:["Fun","Flat","Costumed","Family-friendly"],
   desc:"Run through both Disney parks at 5:30am. The flattest, most magical half you'll ever run.",
   profile:[18,18,20,18,18,20,18,18,20,18,18,18],
   url:"https://www.rundisney.com", source:"runDisney"},
  {id:"bolder-boulder",name:"BolderBoulder 10K",    loc:"Boulder, CO",       country:"USA", cat:"10k", typeId:"10k", icon:"🏃",
   date:"May 25, 2026", elev:5430, elevGain:500,  difficulty:"rolling", surface:"road",
   tags:["Altitude","Competitive","Festive","Road Race"],
   desc:"50,000 runners at altitude through Boulder's streets. One of America's most celebrated 10Ks.",
   profile:[30,35,45,50,55,65,70,60,50,45,40,35],
   url:"https://www.bolderboulder.com", source:"BolderBOULDER"},

  // ── ULTRA TRAIL RACES ────────────────────────────────────────
  {id:"utmb",        name:"UTMB Mont-Blanc",        loc:"Chamonix, France",  country:"FR",  cat:"100m", typeId:"100m", icon:"💀",
   date:"Aug 28, 2026", elev:8500, elevGain:32800,difficulty:"brutal",   surface:"trail",
   tags:["Iconic","ITRA Points","Technical","Alps","Night running"],
   desc:"The most famous footrace in the world. 106 miles around Mont Blanc through France, Italy and Switzerland.",
   profile:[20,60,95,85,70,90,80,70,85,95,75,40],
   url:"https://utmbmontblanc.com", source:"UTMB Group"},
  {id:"western-states",name:"Western States 100",  loc:"Olympic Valley, CA",country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Jun 27, 2026", elev:2650, elevGain:18090,difficulty:"brutal",   surface:"trail",
   tags:["Lottery","Iconic","Point-to-point","Heat","Technical"],
   desc:"The granddaddy of ultrarunning. From Squaw Valley ski resort to Auburn. Heat, canyons, and glory.",
   profile:[95,90,75,60,40,30,50,65,80,70,55,30],
   url:"https://www.wser.org", source:"Western States Endurance Run"},
  {id:"hardrock",    name:"Hardrock 100",           loc:"Silverton, CO",     country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Jul 18, 2026", elev:11000,elevGain:33000,difficulty:"brutal",   surface:"trail",
   tags:["Extreme altitude","Lottery","Technical","Rockies","Remote"],
   desc:"Avg altitude 11,000ft with 33,000ft of gain. Arguably the hardest 100-miler on the planet.",
   profile:[60,90,100,85,75,95,80,70,90,85,75,60],
   url:"https://www.hardrock100.com", source:"Hardrock 100"},
  {id:"leadville",   name:"Leadville Trail 100",    loc:"Leadville, CO",     country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Aug 15, 2026", elev:10200,elevGain:18000,difficulty:"brutal",   surface:"trail",
   tags:["Altitude","Out-and-back","Iconic","Point-to-point","Lottery"],
   desc:"Above 10,000ft the entire race. Hope Pass at mile 45 and 55 is the defining moment.",
   profile:[50,60,75,90,95,85,80,85,95,90,75,55],
   url:"https://www.leadvilleraceseries.com", source:"Lifetime Fitness"},
  {id:"tnf50",       name:"TNF 50 — San Francisco", loc:"Marin County, CA",  country:"USA", cat:"50m", typeId:"50m", icon:"🌄",
   date:"Dec 5, 2026",  elev:300,  elevGain:10500,difficulty:"brutal",   surface:"trail",
   tags:["Technical","Bay Area","Point-to-point","Muddy"],
   desc:"Marin Headlands in December. Steep, technical, often muddy. The Golden Gate visible on every ridge.",
   profile:[30,70,85,80,65,75,90,85,70,60,50,35],
   url:"https://www.thenorthface.com/en-us/endurance-challenge", source:"The North Face"},
  {id:"javelina",    name:"Javelina Jundred 100K",  loc:"McDowell Mtn, AZ",  country:"USA", cat:"100k", typeId:"100k", icon:"🔥",
   date:"Oct 24, 2026", elev:2300, elevGain:6500, difficulty:"rolling", surface:"trail",
   tags:["Desert","Loops","Flat ultra","Night running","Beginner-friendly 100K"],
   desc:"Six loop desert course. Flat by ultra standards but relentless. First-timer-friendly hundred.",
   profile:[25,30,40,45,40,35,40,45,40,35,30,25],
   url:"https://www.hundredinthedesert.com", source:"Aravaipa Running"},
  {id:"cascade-crest",name:"Cascade Crest 100",    loc:"Easton, WA",        country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Aug 22, 2026", elev:4200, elevGain:22000,difficulty:"brutal",   surface:"trail",
   tags:["PNW","Remote","Technical","Night running","Lottery"],
   desc:"Deep in the Cascades. Remote, technical, with over 22,000ft of gain through old-growth forest.",
   profile:[30,60,80,90,85,70,75,85,95,80,65,40],
   url:"https://www.cascadecrest100.com", source:"Rainshadow Running"},
  {id:"cuyamaca",    name:"Cuyamaca 100K",          loc:"Cuyamaca, CA",      country:"USA", cat:"100k", typeId:"100k", icon:"🔥",
   date:"Nov 7, 2026",  elev:4500, elevGain:14000,difficulty:"hilly",   surface:"trail",
   tags:["SoCal","Technical","Loops","Accessible"],
   desc:"Southern California's finest technical 100K. High desert trails with sweeping views.",
   profile:[40,55,70,80,85,75,65,70,80,75,60,45],
   url:"https://www.cuyamaca100k.com", source:"TBD Events"},
  {id:"utr-moab",    name:"Moab 240",               loc:"Moab, UT",          country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Oct 10, 2026", elev:4800, elevGain:28000,difficulty:"brutal",   surface:"trail",
   tags:["Desert","Multi-day","Remote","Red rock","Iconic"],
   desc:"240 miles through the red rock canyonlands. Up to 112 hours of racing through Utah's otherworldly terrain.",
   profile:[30,45,60,75,80,70,65,75,85,80,65,45],
   url:"https://www.destinationtrailrun.com", source:"Destination Trail"},
  {id:"bryce",       name:"Bryce Canyon 100",       loc:"Bryce Canyon, UT",  country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Jun 6, 2026",  elev:7400, elevGain:19000,difficulty:"brutal",   surface:"trail",
   tags:["Altitude","Hoodoos","Scenic","Technical"],
   desc:"Among Utah's hoodoos at 7,400ft average elevation. Otherworldly scenery, relentless terrain.",
   profile:[55,70,85,90,80,70,80,90,85,75,65,55],
   url:"https://brycecanyonultra.com", source:"Vacation Races"},
  {id:"big-horn",    name:"Bighorn Trail 100",       loc:"Sheridan, WY",      country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Jun 13, 2026", elev:7600, elevGain:18000,difficulty:"brutal",   surface:"trail",
   tags:["Remote","Wyoming","Point-to-point","Technical"],
   desc:"Through the Big Horn mountains with 18,000ft of gain. Wild and remote point-to-point.",
   profile:[35,55,70,85,90,80,75,85,90,80,65,40],
   url:"https://www.bighorntrailrun.com", source:"Bighorn Trail Run"},
  {id:"bandera",     name:"Bandera 100K",            loc:"Bandera, TX",       country:"USA", cat:"100k", typeId:"100k", icon:"🔥",
   date:"Jan 10, 2026", elev:1600, elevGain:13000,difficulty:"hilly",   surface:"trail",
   tags:["Texas","Rocky","UTMB qualifier","Loops"],
   desc:"The rockiest, roughest 100K in Texas. A brutal loop course over limestone hill country.",
   profile:[30,50,70,80,75,65,75,80,70,60,50,35],
   url:"https://www.irunfarraces.com/bandera", source:"iRunFar / Tejas Trails"},
  {id:"umstead",     name:"Umstead 100",             loc:"Raleigh, NC",       country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Apr 4, 2026",  elev:800,  elevGain:9000, difficulty:"rolling", surface:"trail",
   tags:["Beginner 100","Loops","East Coast","Accessible"],
   desc:"Eight 12.5-mile loops through Umstead State Park. The most beginner-friendly 100-miler in the East.",
   profile:[25,35,50,60,55,45,50,60,55,45,40,30],
   url:"https://www.umstead100.com", source:"Umstead Trail Runs"},
  {id:"ozark",       name:"Ozark Trail 100",         loc:"Steelville, MO",    country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Nov 7, 2026",  elev:700,  elevGain:17000,difficulty:"hilly",   surface:"trail",
   tags:["Midwest","Point-to-point","Forest","Technical"],
   desc:"100 miles along the Ozark Trail through dense Missouri forest. Underrated and unrelenting.",
   profile:[30,45,60,70,65,55,60,70,65,55,45,35],
   url:"https://www.ozarktrail100.com", source:"Ozark Trail 100"},
  {id:"im-50k",      name:"Imogene Pass Run 50K",    loc:"Ouray, CO",         country:"USA", cat:"50k", typeId:"50k", icon:"⛰️",
   date:"Sep 5, 2026",  elev:7800, elevGain:5400, difficulty:"brutal",  surface:"trail",
   tags:["Altitude","Point-to-point","Colorado","Iconic"],
   desc:"Up and over Imogene Pass at 13,114ft. One of the most legendary mountain runs in the Rockies.",
   profile:[20,50,75,90,100,95,85,70,55,40,30,20],
   url:"https://www.imogenepass.com", source:"Imogene Pass Run"},
  {id:"wasatch",     name:"Wasatch 100",             loc:"Salt Lake City, UT",country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Sep 5, 2026",  elev:7500, elevGain:26000,difficulty:"brutal",  surface:"trail",
   tags:["Altitude","Technical","Lottery","Utah","WSER qualifier"],
   desc:"26,000ft of gain through the Wasatch Range. A WSER qualifier with brutal technical terrain.",
   profile:[40,65,80,90,85,70,80,90,85,75,60,45],
   url:"https://www.wasatch100.com", source:"Wasatch 100"},
  {id:"pct-50",      name:"PCT 50 Mile",             loc:"Cascade Locks, OR", country:"USA", cat:"50m", typeId:"50m", icon:"🌄",
   date:"Jun 6, 2026",  elev:2000, elevGain:7500, difficulty:"hilly",  surface:"trail",
   tags:["Pacific Crest Trail","Scenic","Oregon","Forest"],
   desc:"Along the iconic Pacific Crest Trail in the Columbia River Gorge. Waterfalls and ridge views.",
   profile:[25,40,60,75,80,70,65,75,80,70,55,35],
   url:"https://www.pct50.com", source:"Rainshadow Running"},
  {id:"jfk50",       name:"JFK 50 Mile",             loc:"Boonsboro, MD",     country:"USA", cat:"50m", typeId:"50m", icon:"🌄",
   date:"Nov 21, 2026", elev:1000, elevGain:7200, difficulty:"hilly",  surface:"mixed",
   tags:["Historic","Oldest ultra USA","Mixed terrain","East Coast"],
   desc:"America's oldest and largest ultramarathon, run since 1963. AT ridge then towpath then road.",
   profile:[30,70,80,75,60,45,35,30,28,30,28,25],
   url:"https://www.jfk50mile.org", source:"JFK 50 Mile"},
  {id:"black-hills",  name:"Black Hills 100",        loc:"Sturgis, SD",       country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Jun 13, 2026", elev:4500, elevGain:16000,difficulty:"brutal",  surface:"trail",
   tags:["Loops","South Dakota","Remote","Night running"],
   desc:"Through the Black Hills National Forest. Remote, rugged loops through prime South Dakota terrain.",
   profile:[30,50,70,80,75,65,70,80,75,60,50,35],
   url:"https://www.blackhills100.com", source:"Black Hills Ultra"},
  {id:"rio-del-lago", name:"Rio Del Lago 100",       loc:"Folsom, CA",        country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Nov 7, 2026",  elev:800,  elevGain:17000,difficulty:"hilly",  surface:"trail",
   tags:["California","Loops","Lakeside","WSER qualifier"],
   desc:"Around Folsom Lake on varied California trails. A popular WSER qualifier in stunning foothill terrain.",
   profile:[25,40,55,70,75,65,60,70,75,65,50,35],
   url:"https://www.rioseries.com", source:"Inside Trail Racing"},
  {id:"old-dominion", name:"Old Dominion 100",       loc:"Front Royal, VA",   country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Jun 6, 2026",  elev:1500, elevGain:15000,difficulty:"hilly",  surface:"trail",
   tags:["Virginia","Horse country","Point-to-point","Classic"],
   desc:"Through the Shenandoah Valley and Blue Ridge foothills. A classic East Coast hundred in horse country.",
   profile:[30,45,60,70,65,55,60,70,65,55,45,35],
   url:"https://www.olddominionrun.org", source:"Old Dominion Trail Run"},
  {id:"grindstone",   name:"Grindstone 100",         loc:"Swoope, VA",        country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Oct 3, 2026",  elev:2200, elevGain:23000,difficulty:"brutal",  surface:"trail",
   tags:["Virginia","Technical","Night start","UTMB qualifier"],
   desc:"23,000ft of gain through Virginia's George Washington National Forest. Night start, brutal climbs.",
   profile:[35,60,80,90,85,70,75,85,90,80,65,45],
   url:"https://www.grndstn.com", source:"Grindstone 100"},
  {id:"san-diego-100",name:"San Diego 100",          loc:"Julian, CA",        country:"USA", cat:"100m", typeId:"100m", icon:"💀",
   date:"Jun 6, 2026",  elev:4200, elevGain:18000,difficulty:"brutal",  surface:"trail",
   tags:["California","Desert","Technical","WSER qualifier"],
   desc:"Through the Cleveland National Forest and Cuyamaca Mountains. Technical and hot in early June.",
   profile:[40,60,75,85,80,70,65,75,85,75,60,45],
   url:"https://www.sandiego100.com", source:"San Diego 100"},
  {id:"gorge-waterfalls",name:"Gorge Waterfalls 100K",loc:"Cascade Locks, OR",country:"USA", cat:"100k", typeId:"100k", icon:"🔥",
   date:"Apr 11, 2026", elev:200,  elevGain:14000,difficulty:"hilly",  surface:"trail",
   tags:["PNW","Waterfalls","Muddy","Scenic","April trails"],
   desc:"30+ waterfalls and 14,000ft of gain in the Columbia River Gorge. Muddy, beautiful, unforgettable.",
   profile:[20,55,75,80,70,65,75,80,70,60,50,30],
   url:"https://www.gorgewaterfalls100k.com", source:"Rainshadow Running"},

  // ── 5K / 10K ────────────────────────────────────────────────
  {id:"bay-to-breakers",name:"Bay to Breakers 12K", loc:"San Francisco, CA", country:"USA", cat:"10k", typeId:"10k", icon:"🏃",
   date:"May 17, 2026", elev:300,  elevGain:550,  difficulty:"hilly",  surface:"road",
   tags:["Costumed","Iconic","Point-to-point","Festive"],
   desc:"San Francisco's legendary 12K from the bay to Ocean Beach. The Hayes Street Hill is the test.",
   profile:[10,20,35,65,90,100,80,50,30,20,15,10],
   url:"https://www.baytobreakers.com", source:"Bay to Breakers"},
  {id:"thanksgiving-5k",name:"Turkey Trot 5K (Generic)",loc:"Nationwide",   country:"USA", cat:"5k", typeId:"5k", icon:"🏃",
   date:"Nov 26, 2026", elev:200,  elevGain:80,   difficulty:"flat",   surface:"road",
   tags:["Holiday","Family-friendly","Flat","First race"],
   desc:"The classic Thanksgiving morning 5K. Usually flat, always festive, perfect for first-timers.",
   profile:[20,22,20,18,20,22,20,22,20,18,20,22],
   url:"https://www.itsyourrace.com", source:"Various"},

  // ── TRIATHLONS ───────────────────────────────────────────────
  {id:"kona",          name:"IRONMAN World Championship",loc:"Kona, HI",      country:"USA", cat:"ironman", typeId:"ironman", icon:"🔱",
   date:"Oct 10, 2026", elev:30,   elevGain:5400, difficulty:"brutal",  surface:"road",
   tags:["Qualification only","Heat","Wind","Iconic","Lava fields"],
   desc:"The pinnacle of triathlon. Lava fields, crosswinds, and 90°F heat. Earn your spot through qualifying.",
   profile:[15,30,50,70,80,85,80,75,65,55,40,25],
   url:"https://www.ironman.com/im-world-championship", source:"IRONMAN"},
  {id:"im-louisville", name:"IRONMAN Louisville",      loc:"Louisville, KY",  country:"USA", cat:"ironman", typeId:"ironman", icon:"🔱",
   date:"Oct 11, 2026", elev:450,  elevGain:3200, difficulty:"rolling", surface:"road",
   tags:["River swim","Accessible","Midwest","Rolling bike"],
   desc:"Ohio River swim, rolling bike through Kentucky horse country, flat run through downtown Louisville.",
   profile:[20,30,45,55,50,45,50,55,50,40,35,25],
   url:"https://www.ironman.com/im-louisville", source:"IRONMAN"},
  {id:"im-boulder",    name:"IRONMAN Boulder",         loc:"Boulder, CO",     country:"USA", cat:"ironman", typeId:"ironman", icon:"🔱",
   date:"Jun 14, 2026", elev:5430, elevGain:4500, difficulty:"hilly",  surface:"road",
   tags:["Altitude","Challenging bike","Scenic","Rocky Mountains"],
   desc:"At altitude in Boulder. The bike course through the foothills is genuinely challenging. Prep accordingly.",
   profile:[35,50,65,75,80,75,70,65,60,55,45,35],
   url:"https://www.ironman.com/im-boulder", source:"IRONMAN"},
  {id:"im-70-boulder", name:"IRONMAN 70.3 Boulder",   loc:"Boulder, CO",     country:"USA", cat:"half70", typeId:"half70", icon:"🏊",
   date:"Aug 2, 2026",  elev:5430, elevGain:2800, difficulty:"hilly",  surface:"road",
   tags:["Altitude","Hilly","Scenic","Popular"],
   desc:"Half the distance of the full, but altitude and the bike course still make it a serious challenge.",
   profile:[30,45,60,70,75,70,65,60,55,45,35,25],
   url:"https://www.ironman.com/im703-boulder", source:"IRONMAN"},
  {id:"im-70-oceanside",name:"IRONMAN 70.3 Oceanside",loc:"Oceanside, CA",   country:"USA", cat:"half70", typeId:"half70", icon:"🏊",
   date:"Apr 4, 2026",  elev:30,   elevGain:2100, difficulty:"rolling", surface:"road",
   tags:["Ocean swim","SoCal","Hilly run","Popular"],
   desc:"One of the most popular 70.3s in America. Ocean swim, challenging bike, hilly run along the coast.",
   profile:[15,35,55,65,60,55,60,65,60,50,40,25],
   url:"https://www.ironman.com/im703-oceanside", source:"IRONMAN"},
  {id:"chicago-triathlon",name:"Chicago Triathlon",   loc:"Chicago, IL",     country:"USA", cat:"olympic", typeId:"olympic", icon:"🚴",
   date:"Aug 23, 2026", elev:595,  elevGain:200,  difficulty:"flat",   surface:"road",
   tags:["Urban","Lake Michigan","Flat","Beginner-friendly"],
   desc:"Lake Michigan swim, flat bike along Lakeshore Drive, flat lakefront run. Perfect first Olympic distance.",
   profile:[15,18,20,18,18,20,18,18,20,18,18,15],
   url:"https://www.chicagotriathlon.com", source:"Life Time Tri"},
  {id:"nyc-triathlon",  name:"NYC Triathlon",          loc:"New York, NY",    country:"USA", cat:"olympic", typeId:"olympic", icon:"🚴",
   date:"Jul 19, 2026", elev:30,   elevGain:1200, difficulty:"rolling", surface:"road",
   tags:["Urban","Hudson River","Hilly run","Lottery","Iconic"],
   desc:"Hudson River swim, bike through the Bronx, then the Central Park run. Urban triathlon at its finest.",
   profile:[20,35,50,60,55,50,55,60,55,45,35,25],
   url:"https://www.nyctriathlon.com", source:"NYC Triathlon"},

  // ── INTERNATIONAL ────────────────────────────────────────────
  {id:"comrades",      name:"Comrades Marathon",       loc:"KwaZulu-Natal, SA",country:"ZA", cat:"50m", typeId:"50m", icon:"🌄",
   date:"Jun 8, 2026",  elev:2500, elevGain:6000, difficulty:"hilly",  surface:"road",
   tags:["Iconic","South Africa","Road ultra","Alternating direction"],
   desc:"The world's largest ultra — 90km between Durban and Pietermaritzburg. Up or down year alternating.",
   profile:[30,50,70,80,75,85,80,70,60,50,40,30],
   url:"https://www.comrades.com", source:"Comrades Marathon Association"},
  {id:"two-oceans",    name:"Two Oceans Marathon",     loc:"Cape Town, SA",   country:"ZA", cat:"50k", typeId:"50k", icon:"⛰️",
   date:"Apr 11, 2026", elev:100,  elevGain:5700, difficulty:"hilly",  surface:"road",
   tags:["Iconic","South Africa","Road ultra","Chapman's Peak"],
   desc:"56km around the Cape Peninsula with Chapman's Peak Drive. 'The World's Most Beautiful Race.'",
   profile:[20,35,55,75,80,70,60,65,70,60,45,25],
   url:"https://www.twooceansmarathon.org.za", source:"Two Oceans Marathon"},
  {id:"marathon-des-sables",name:"Marathon des Sables",loc:"Sahara Desert, MA",country:"MA",cat:"50m", typeId:"50m", icon:"🌄",
   date:"Apr 17, 2026", elev:1200, elevGain:5000, difficulty:"brutal",  surface:"trail",
   tags:["Multi-stage","Self-sufficient","Desert","Iconic","Extreme"],
   desc:"6 stages, ~250km through the Sahara carrying your own food. The toughest footrace on earth.",
   profile:[40,50,60,70,80,75,65,70,80,70,55,40],
   url:"https://www.marathondessables.com", source:"Marathon des Sables"},
  {id:"spartathlon",   name:"Spartathlon",             loc:"Athens to Sparta, GR",country:"GR",cat:"100m", typeId:"100m", icon:"💀",
   date:"Sep 25, 2026", elev:100,  elevGain:9500, difficulty:"brutal",  surface:"road",
   tags:["Historic","Point-to-point","Greece","Road ultra","Extreme"],
   desc:"246km from Athens to Sparta retracing Pheidippides' legendary route. 36-hour cutoff.",
   profile:[20,30,40,55,65,75,80,75,70,80,75,55],
   url:"https://www.spartathlon.gr", source:"IAU/SEGAS"},
  {id:"tor-des-geants", name:"Tor des Géants",         loc:"Aosta Valley, IT",country:"IT", cat:"100m", typeId:"100m", icon:"💀",
   date:"Sep 6, 2026",  elev:8000, elevGain:78000,difficulty:"brutal",  surface:"trail",
   tags:["Multi-day","Alps","Non-stop","Technical","Self-supported"],
   desc:"330km around the Aosta Valley with 78,000ft of climbing. Perhaps the most demanding race on earth.",
   profile:[50,80,100,90,80,95,85,75,90,95,80,55],
   url:"https://tordesgeants.it", source:"Tor des Géants"},
  {id:"lavaredo",      name:"Lavaredo Ultra Trail",    loc:"Cortina, Italy",  country:"IT", cat:"100k", typeId:"100k", icon:"🔥",
   date:"Jun 26, 2026", elev:4800, elevGain:17700,difficulty:"brutal",  surface:"trail",
   tags:["Dolomites","UTMB qualifier","Scenic","Technical","Night"],
   desc:"Through the Dolomites under the Tre Cime di Lavaredo. Spectacular and brutally difficult.",
   profile:[35,60,80,90,85,75,80,90,85,70,60,40],
   url:"https://www.ultratrailcortina.it", source:"Ultra Trail Cortina"},
  {id:"eiger",         name:"Eiger Ultra Trail 101K",  loc:"Grindelwald, CH", country:"CH", cat:"100k", typeId:"100k", icon:"🔥",
   date:"Jul 11, 2026", elev:6700, elevGain:18000,difficulty:"brutal",  surface:"trail",
   tags:["Swiss Alps","Technical","Scenic","UTMB qualifier"],
   desc:"In the shadow of the Eiger through the Bernese Oberland. Technical and dramatically beautiful.",
   profile:[40,65,85,95,90,80,85,90,85,75,60,45],
   url:"https://www.eigerultratrail.ch", source:"Eiger Ultra Trail"},
  {id:"pikes-peak",    name:"Pikes Peak Marathon",     loc:"Manitou Springs, CO",country:"USA",cat:"marathon",typeId:"marathon",icon:"🏆",
   date:"Aug 23, 2026", elev:6300, elevGain:7815, difficulty:"brutal",  surface:"trail",
   tags:["Altitude","Out-and-back","14er","Iconic","Trail marathon"],
   desc:"Up and over Pikes Peak summit at 14,115ft. 7,800ft of gain each way. Simply brutal.",
   profile:[20,40,60,80,95,100,98,80,60,40,25,20],
   url:"https://www.pikespeakmarathon.org", source:"Pikes Peak Marathon"},
  {id:"rim-to-rim",    name:"Grand Canyon Rim to Rim", loc:"Grand Canyon, AZ",country:"USA",cat:"50k", typeId:"50k", icon:"⛰️",
   date:"Oct 3, 2026",  elev:6860, elevGain:5500, difficulty:"brutal",  surface:"trail",
   tags:["Point-to-point","Iconic","Heat","Descend first","Permit required"],
   desc:"North Rim to South Rim. You descend first then climb out. Heat at the bottom is a genuine threat.",
   profile:[95,80,60,30,15,10,15,30,60,80,90,95],
   url:"https://www.nps.gov/grca", source:"National Park Service"},

  // ── SPRINT & XTERRA ─────────────────────────────────────────
  {id:"xterra-maui",   name:"XTERRA World Championship",loc:"Maui, HI",       country:"USA",cat:"olympic", typeId:"olympic", icon:"🚴",
   date:"Oct 25, 2026", elev:30,   elevGain:2000, difficulty:"brutal",  surface:"mixed",
   tags:["Off-road tri","Volcanic","Technical","Championship"],
   desc:"Off-road triathlon on volcanic Maui trails. Ocean swim, MTB ride, trail run. Wild and technical.",
   profile:[15,30,60,80,85,80,75,80,85,75,55,30],
   url:"https://www.xterraplanet.com", source:"XTERRA"},
];

// Difficulty display config
const DIFF_CFG = {
  flat:    {label:"Flat",    color:P.green,  bg:"rgba(74,222,128,0.12)"},
  rolling: {label:"Rolling", color:P.blue,   bg:"rgba(96,165,250,0.12)"},
  hilly:   {label:"Hilly",   color:P.clay,   bg:"rgba(245,158,106,0.12)"},
  brutal:  {label:"Brutal",  color:P.red,    bg:"rgba(248,113,113,0.12)"},
};
const SURF_CFG = {
  road:  {label:"Road",  color:P.textMid},
  trail: {label:"Trail", color:P.olive},
  mixed: {label:"Mixed", color:P.purple},
};

const CATS  = [{id:"all",label:"All"},{id:"run",label:"Road"},{id:"ultra",label:"Ultra Trail"},{id:"tri",label:"Triathlon"}];
const DISCS = [{id:"swim",label:"Swim",icon:"🏊"},{id:"bike",label:"Bike",icon:"🚴"},{id:"run",label:"Run",icon:"🏃"}];
const PLAN_TABS = [
  {id:"training", label:"Training",  icon:"📅", color:P.green},
  {id:"nutrition",label:"Nutrition", icon:"🥗", color:P.green},
  {id:"fueling",  label:"Fueling",   icon:"⚡", color:P.green},
  {id:"mental",   label:"Mental",    icon:"🧠", color:P.purple},
  {id:"recovery", label:"Recovery",  icon:"❤️‍🩹",color:P.red},
];
const KIT = {
  run:[
    {cat:"Race Day",items:[{id:"r1",name:"Race bib & pins",note:"Collect day before"},{id:"r2",name:"GPS watch (charged)",note:"Enable race mode"},{id:"r3",name:"Race-tested shoes",note:"Never debut new shoes"},{id:"r4",name:"Anti-blister socks",note:"Worn 3x in training"},{id:"r5",name:"Race kit",note:"Worn in training at least twice"}]},
    {cat:"Nutrition",items:[{id:"r6",name:"Gels / chews (pre-counted)",note:"1 per 45 min"},{id:"r7",name:"Electrolyte tablets",note:"Especially for heat"},{id:"r8",name:"Pre-race breakfast",note:"Nothing new"},{id:"r9",name:"Hydration belt / vest",note:"Half marathon+"}]},
    {cat:"Comfort",items:[{id:"r10",name:"Body glide",note:"Liberally applied"},{id:"r11",name:"SPF 50+ sunscreen",note:"Even cloudy days"},{id:"r12",name:"Hat or visor",note:"Sun + focus"},{id:"r13",name:"Throwaway warm layer",note:"Start line wait"}]},
    {cat:"Post-Race",items:[{id:"r14",name:"Dry clothes",note:"In checked bag"},{id:"r15",name:"Recovery drink",note:"Within 30 min"},{id:"r16",name:"Foam roller",note:"Hotel recovery"}]},
  ],
  ultra:[
    {cat:"Mandatory",items:[{id:"u1",name:"Trail shoes (50+ miles tested)",note:"No new shoes"},{id:"u2",name:"Hydration vest",note:"Check capacity req."},{id:"u3",name:"GPS watch (charged)",note:"Track recording on"},{id:"u4",name:"Headlamp + backup batteries",note:"Usually mandatory"},{id:"u5",name:"Emergency whistle + space blanket",note:"Often mandatory"},{id:"u6",name:"Waterproof jacket",note:"Check race list"}]},
    {cat:"Drop Bag",items:[{id:"u7",name:"Change of socks",note:"Prevents blisters"},{id:"u8",name:"Blister kit",note:"Needle, tape, Leukotape"},{id:"u9",name:"Solid food",note:"For when gels stop working"},{id:"u10",name:"Extra gels / chews",note:"200 cal/hr min"},{id:"u11",name:"Fresh shirt",note:"Morale boost"}]},
    {cat:"Night",items:[{id:"u12",name:"Spare headlamp",note:"Never one light source"},{id:"u13",name:"Warm layer",note:"Mandatory 50M+"},{id:"u14",name:"Reflective vest",note:"Road sections"}]},
  ],
  tri:[
    {cat:"Swim",items:[{id:"t1",name:"Wetsuit (temp checked)",note:"Legal under 76.1°F"},{id:"t2",name:"Goggles × 2",note:"Clear + tinted"},{id:"t3",name:"Race swim cap",note:"Colour = wave"},{id:"t4",name:"Anti-fog spray",note:"Night before"}]},
    {cat:"T1",items:[{id:"t5",name:"Bike shoes + helmet",note:"Helmet before bike"},{id:"t6",name:"Sunglasses",note:"UV + debris"},{id:"t7",name:"Bike nutrition on frame",note:"Every 45 min"},{id:"t8",name:"CO2 + 2 spare tubes",note:"Minimum per wheel"}]},
    {cat:"T2",items:[{id:"t9",name:"Race run shoes",note:"Elastic laces"},{id:"t10",name:"Race number belt",note:"Faster than pin"},{id:"t11",name:"Run nutrition",note:"If course not stocked"},{id:"t12",name:"Visor or cap",note:"Sun on run"}]},
    {cat:"Setup",items:[{id:"t13",name:"Towel at transition",note:"Marks your spot"},{id:"t14",name:"Bike PSI checked",note:"Morning of race"},{id:"t15",name:"Post-race bag",note:"Dry clothes + food"}]},
  ],
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const TODAY = new Date();
const TODAY_STR = TODAY.toISOString().split("T")[0];
const wksBetween = (a,b) => Math.round((new Date(b)-new Date(a))/(7*864e5));
const fmtDate    = d => d ? new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "";
const fmtElev    = n => n >= 1000 ? `${(n/1000).toFixed(1)}K ft` : `${n} ft`;

function getStartSugg(race, raceDate) {
  const tom = new Date(TODAY); tom.setDate(tom.getDate()+1);
  const tomS = tom.toISOString().split("T")[0];
  if (!raceDate) return [
    {label:"Tomorrow",  date:tomS, note:"Start with momentum"},
    {label:"Next Week", date:new Date(TODAY.getTime()+ 7*864e5).toISOString().split("T")[0], note:"A few days to prepare"},
    {label:"In 2 Weeks",date:new Date(TODAY.getTime()+14*864e5).toISOString().split("T")[0], note:"Gear up first"},
  ];
  const s=[];
  const tomW=wksBetween(tomS,raceDate);
  if(tomW>=2) s.push({label:"Tomorrow",date:tomS,weeks:tomW,note:tomW>=race.maxW?"Max build time":tomW>=race.minW?"Solid window":`${tomW} wks — tight`});
  const iW=Math.min(race.maxW,Math.max(race.minW,Math.round((race.minW+race.maxW)/2)));
  const iD=new Date(raceDate); iD.setDate(iD.getDate()-iW*7);
  const iS=iD.toISOString().split("T")[0];
  if(iS>tomS) s.push({label:fmtDate(iS),date:iS,weeks:iW,note:`Coach's pick — ${iW} weeks`,recommended:true});
  const lD=new Date(raceDate); lD.setDate(lD.getDate()-race.minW*7);
  const lS=lD.toISOString().split("T")[0];
  if(lS>(s.at(-1)?.date||tomS)&&lS!==iS) s.push({label:fmtDate(lS),date:lS,weeks:race.minW,note:`Minimum — ${race.minW} weeks`});
  if(!s.length) s.push({label:"Tomorrow",date:tomS,weeks:tomW,note:"Start immediately"});
  return s.slice(0,3);
}

function calcRisk(race, params, wks) {
  let score=0;
  if ((params.trainingDays||4)>=6) score+=2; else if ((params.trainingDays||4)>=5) score+=1;
  if (wks&&race) { const ratio=wks/race.minW; if(ratio<1.1) score+=2; else if(ratio<1.3) score+=1; }
  if (params.fitnessLevel==="beginner") score+=2; else if (params.fitnessLevel==="intermediate") score+=1;
  if (params.experience==="First time") score+=1;
  if (params.injuries) score+=1;
  if (race?.cat==="ultra"||race?.id==="ironman") score+=1;
  if ((params.specificRace?.difficulty==="brutal"||params.specificRace?.difficulty==="hilly")&&params.fitnessLevel!=="advanced"&&params.fitnessLevel!=="elite") score+=1;
  if (score<=2) return {level:"Low",    color:P.green, bg:"rgba(74,222,128,0.07)", border:"rgba(74,222,128,0.22)", dots:1, msg:"Training load looks sustainable. Follow the plan and listen to your body."};
  if (score<=4) return {level:"Moderate",color:P.clay, bg:"rgba(245,158,106,0.07)",border:"rgba(245,158,106,0.22)",dots:2, msg:"A few risk factors flagged. Prioritize sleep and don't skip recovery weeks."};
  return              {level:"Elevated",color:P.red,  bg:"rgba(248,113,113,0.07)", border:"rgba(248,113,113,0.22)",dots:3, msg:"High load detected. Add a rest day, monitor fatigue, and tell your coach about any niggles immediately."};
}

function calcTaper(race, wks) {
  if (!wks||!race) return [];
  const len=(race.cat==="tri"&&race.id==="ironman")||(race.cat==="ultra"&&(race.id==="100m"||race.id==="100k"))?3:2;
  return Array.from({length:len},(_,i)=>{
    const n=len-i;
    const pct=len===3?(n===3?80:n===2?60:40):(n===2?75:45);
    return {label:n===1?"Race Week":`Wk ${wks-n+1}`, pct, color:n===1?P.green:n===2?P.clay:P.olive, note:n===1?"Race day!":n===len?"Begin taper":"Sharpen up"};
  });
}

function calcPredict(race, params) {
  if (!race||!params.experience||!params.fitnessLevel) return null;
  const base={
    "5k":    {beginner:42, intermediate:28, advanced:22, elite:17},
    "10k":   {beginner:75, intermediate:55, advanced:44, elite:35},
    "half":  {beginner:165,intermediate:120,advanced:100,elite:82},
    "marathon":{beginner:330,intermediate:240,advanced:195,elite:160},
    "50k":   {beginner:480,intermediate:360,advanced:300,elite:240},
    "50m":   {beginner:840,intermediate:660,advanced:540,elite:420},
    "100k":  {beginner:1200,intermediate:960,advanced:780,elite:600},
    "100m":  {beginner:1800,intermediate:1440,advanced:1200,elite:960},
    "sprint":{beginner:105,intermediate:80, advanced:65, elite:52},
    "olympic":{beginner:195,intermediate:150,advanced:125,elite:102},
    "half70":{beginner:420,intermediate:330,advanced:275,elite:230},
    "ironman":{beginner:900,intermediate:720,advanced:600,elite:510},
  };
  const sr=params.specificRace;
  const b=base[race.id]; if(!b) return null;
  let mid=b[params.fitnessLevel]||b.intermediate;
  // Elevation penalty
  if (sr) {
    if (sr.difficulty==="brutal") mid=Math.round(mid*1.25);
    else if (sr.difficulty==="hilly") mid=Math.round(mid*1.12);
    else if (sr.difficulty==="rolling") mid=Math.round(mid*1.05);
  }
  const fmt=m=>{const h=Math.floor(m/60),mn=m%60;return h>0?`${h}h ${mn}m`:`${mn}m`;};
  return {rough:fmt(Math.round(mid*1.15)), likely:fmt(mid), best:fmt(Math.round(mid*0.93)), adjusted:!!(sr&&sr.difficulty!=="flat")};
}

async function callAI(sys, user, tokens=4000) {
  const r=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:tokens,system:sys,messages:[{role:"user",content:user}]})
  });
  const d=await r.json();
  return d.content?.map(b=>b.text||"").join("")||"";
}

const BASE=`You are an elite endurance sports coach. Today is ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}. Be direct, specific, warm. Use markdown.`;

function mkProf(race,p,wks) {
  const sr=p.specificRace;
  const courseNote=sr?`|SpecificRace:${sr.name} in ${sr.loc}|Elevation:${fmtElev(sr.elevGain)} gain|Difficulty:${sr.difficulty}|Surface:${sr.surface}|CourseTags:${sr.tags?.join(",")||""}|`:"";
  return `Race:${race.name}(${race.dist})${courseNote}|Start:${fmtDate(p.startDate)||"ASAP"}|RaceDate:${p.raceDate?fmtDate(p.raceDate):"open"}|Window:${wks?wks+"wks":"open"}|Days/wk:${p.trainingDays}|Exp:${p.experience}|Level:${p.fitnessLevel}|Goal:${p.goalTime||"finish"}|Injuries:${p.injuries||"none"}${race.cat==="tri"?`|Strong:${p.triStrength||"—"}|Weak:${p.triWeakness||"—"}`:""}`;
}

function mdParse(t) {
  if(!t) return "";
  return t
    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,"<em>$1</em>")
    .replace(/^### (.+)$/gm,'<h3 class="mh3">$1</h3>')
    .replace(/^## (.+)$/gm,'<h2 class="mh2">$1</h2>')
    .replace(/^# (.+)$/gm,'<h1 class="mh1">$1</h1>')
    .replace(/^- (.+)$/gm,'<li class="mli">$1</li>')
    .replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>");
}

function planStats(race,p,wks) {
  const hrs=(p.trainingDays*(race.cat==="tri"?1.6:1.15)).toFixed(0);
  const hrsMax=(p.trainingDays*(race.cat==="tri"?2.2:1.7)).toFixed(0);
  const peaks={marathon:"22 mi",half:"13 mi","10k":"8 mi","5k":"5 mi",ironman:"112mi bike",half70:"56mi bike","50k":"26 mi","50m":"35 mi","100k":"45 mi","100m":"60 mi",olympic:"25mi bike",sprint:"12mi bike"};
  return [{label:"Weeks",val:wks||"—"},{label:"Days/Wk",val:p.trainingDays},{label:"Hrs/Wk",val:`${hrs}–${hrsMax}`},{label:"Peak",val:peaks[race.id]||"—"}];
}

function extractSection(content, heading) {
  if(!content) return "";
  const lines=content.split("\n");
  let on=false, out=[];
  for(const l of lines){
    if(l.includes(heading)){on=true;continue;}
    if(on&&l.startsWith("## ")&&!l.includes(heading)) break;
    if(on) out.push(l);
  }
  return out.join("\n").trim()||content.slice(0,600);
}

// Tiny SVG elevation profile renderer
function ElevProfile({profile, color="#4ADE80", height=36}) {
  if(!profile||!profile.length) return null;
  const max=Math.max(...profile);
  const pts=profile.map((v,i)=>{
    const x=(i/(profile.length-1))*100;
    const y=100-(v/max)*85;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:"100%",height,display:"block"}}>
      <defs>
        <linearGradient id={`eg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <polygon points={`0,100 ${pts} 100,100`} fill={`url(#eg-${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// RACE PICKER COMPONENT (used inside Setup)
// ─────────────────────────────────────────────
function RacePicker({rt, sr, setParams, goTo}) {
  const [showAll, setShowAll] = useState(false);
  const racesForType = RACE_DB.filter(r=>r.typeId===rt.id);
  const visible = showAll ? racesForType : racesForType.slice(0,4);
  return (
    <div style={S.formBlock}>
      <div style={{...S.formTitle,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>🏁 Pick a Specific Race <span style={{color:P.muted,fontWeight:400,textTransform:"none",letterSpacing:0,fontSize:10}}>(optional — adds course-tailored training)</span></span>
        {sr&&<button style={{background:"none",border:"none",color:P.muted,cursor:"pointer",fontSize:10,fontFamily:"'Montserrat',sans-serif",fontWeight:700}} onClick={()=>setParams(p=>({...p,specificRace:null}))}>✕ Clear</button>}
      </div>
      {racesForType.length===0?(
        <div style={{fontSize:12,color:P.muted,padding:"8px 0"}}>
          No specific races in database yet for this distance.{" "}
          <button style={{background:"none",border:"none",color:P.green,cursor:"pointer",fontSize:11,fontWeight:700,padding:0,fontFamily:"'Montserrat',sans-serif"}} onClick={()=>goTo("races")}>Browse all races →</button>
        </div>
      ):(
        <>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {visible.map(r=>{
              const dc=DIFF_CFG[r.difficulty]||DIFF_CFG.flat;
              const ec=r.difficulty==="brutal"?P.red:r.difficulty==="hilly"?P.clay:r.difficulty==="rolling"?P.blue:P.green;
              const isSel=sr?.id===r.id;
              return (
                <div key={r.id} onClick={()=>setParams(p=>({...p,specificRace:isSel?null:r}))}
                  style={{background:isSel?P.greenDim:P.bg3,border:`1px solid ${isSel?"rgba(74,222,128,0.4)":P.border2}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",transition:"all 0.15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:P.text,fontFamily:"'Montserrat',sans-serif"}}>{r.name}</div>
                      <div style={{fontSize:10,color:P.muted,marginTop:1}}>📍 {r.loc}{r.date?` · ${r.date}`:""}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0,marginLeft:8}}>
                      <span style={{fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:3,background:dc.bg,color:dc.color,fontFamily:"'Montserrat',sans-serif",letterSpacing:"0.1em"}}>{dc.label}</span>
                      <span style={{fontSize:9,color:ec,fontWeight:700,fontFamily:"'Montserrat',sans-serif"}}>{fmtElev(r.elevGain)} gain</span>
                    </div>
                  </div>
                  <ElevProfile profile={r.profile} color={ec} height={20}/>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10,gap:8}}>
            {racesForType.length>4&&(
              <button style={{background:"none",border:"none",color:P.green,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Montserrat',sans-serif",padding:0}} onClick={()=>setShowAll(s=>!s)}>
                {showAll?`↑ Show fewer`:`↓ Show all ${racesForType.length} races`}
              </button>
            )}
            <button style={{background:"none",border:`1px solid ${P.border2}`,color:P.muted,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"'Montserrat',sans-serif",padding:"4px 10px",borderRadius:6,marginLeft:"auto"}} onClick={()=>goTo("races")}>Browse all →</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [screen,    setScreen]   = useState("home");
  const [raceType,  setRaceType] = useState(null);     // the distance category (5k, marathon, etc.)
  const [filter,    setFilter]   = useState("all");
  const [saved,     setSaved]    = useState(null);
  const [params,    setParams]   = useState({trainingDays:4,experience:"",injuries:"",goalTime:"",raceDate:"",fitnessLevel:"intermediate",startDate:"",triStrength:"",triWeakness:"",specificRace:null});
  const [sugg,      setSugg]     = useState([]);
  const [secs,      setSecs]     = useState({training:"",nutrition:"",fueling:"",mental:"",recovery:""});
  const [bStep,     setBStep]    = useState({step:0,label:""});
  const [tab,       setTab]      = useState("training");
  const [msgs,      setMsgs]     = useState([]);
  const [chatIn,    setChatIn]   = useState("");
  const [chatLoad,  setChatLoad] = useState(false);
  const [chatOpen,  setChatOpen] = useState(true);
  const [lhOpen,    setLhOpen]   = useState(false);
  const [lhDays,    setLhDays]   = useState("3");
  const [lhReason,  setLhReason] = useState("");
  const [lhLoad,    setLhLoad]   = useState(false);
  const [mOpen,     setMOpen]    = useState({viz:true,mantras:false,dark:false});
  const [kitChk,    setKitChk]   = useState({});
  const [pred,      setPred]     = useState(null);
  const [fabHov,    setFabHov]   = useState(false);
  // Navigation history
  const [history,   setHistory]  = useState([]);
  // Race browser state
  const [rbSearch,  setRbSearch] = useState("");
  const [rbFilter,  setRbFilter] = useState("all");
  const [rbDiff,    setRbDiff]   = useState("all");
  const [rbSurf,    setRbSurf]   = useState("all");
  const chatEnd = useRef(null);

  useEffect(()=>{ chatEnd.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  useEffect(()=>{
    if(raceType){
      const s=getStartSugg(raceType,params.raceDate);
      setSugg(s);
      const rec=s.find(x=>x.recommended)||s[0];
      if(rec) setParams(p=>({...p,startDate:rec.date}));
    }
  },[params.raceDate,raceType?.id]);

  useEffect(()=>{
    if(raceType&&params.experience&&params.fitnessLevel) setPred(calcPredict(raceType,params));
  },[raceType?.id,params.experience,params.fitnessLevel,params.specificRace?.id]);

  useEffect(()=>{
    (async()=>{ try{ const r=await window.storage.get("daywon_v1"); if(r?.value) setSaved(JSON.parse(r.value)); }catch{} })();
  },[]);

  // Navigation helpers
  const goTo = (newScreen) => { setHistory(h=>[...h,screen]); setScreen(newScreen); };
  const goBack = () => { setHistory(h=>{ const p=[...h]; const dest=p.pop()||"home"; setScreen(dest); return p; }); };

  const isTri    = raceType?.cat==="tri";
  const wks      = params.raceDate&&params.startDate?wksBetween(params.startDate,params.raceDate):null;
  const tlStatus = wks!==null&&raceType
    ? wks<raceType.minW?{warn:true,msg:`⚠️  ${wks} weeks — minimum is ${raceType.minW}`}
    : {warn:false,msg:`✓  ${wks} weeks — ${wks>=raceType.maxW?"excellent window":"solid training window"}`}
    : null;

  // Race browser filtered list
  const rbResults = RACE_DB.filter(r=>{
    const q=rbSearch.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q)||r.loc.toLowerCase().includes(q)||r.tags?.some(t=>t.toLowerCase().includes(q));
    const matchCat = rbFilter==="all"||r.cat===rbFilter||r.typeId===rbFilter;
    const matchDiff= rbDiff==="all"||r.difficulty===rbDiff;
    const matchSurf= rbSurf==="all"||r.surface===rbSurf;
    return matchQ&&matchCat&&matchDiff&&matchSurf;
  });

  // ── BUILD ──────────────────────────────────────────────────
  async function buildPlan() {
    setScreen("building"); setSecs({training:"",nutrition:"",fueling:"",mental:"",recovery:""});
    const sr=params.specificRace;
    const prof=mkProf(raceType,params,wks);
    const courseContext=sr
      ?`\n\nCOURSE-SPECIFIC NOTES for ${sr.name}:\n- Location: ${sr.loc}\n- Elevation gain: ${fmtElev(sr.elevGain)}\n- Difficulty: ${sr.difficulty}\n- Surface: ${sr.surface}\n- Course tags: ${sr.tags?.join(", ")||""}\n- Description: ${sr.desc}\nPlease tailor ALL training, fueling, and gear advice specifically to this course profile. If the course is hilly/brutal, emphasize hill training, strength work, downhill running, and adjusted pacing. If at altitude, address acclimatization. If trail, address technical terrain prep.`
      :"";

    // Scale tokens based on plan length — longer plans need significantly more tokens
    const planWeeks = wks || raceType.minW;
    const trainingTokens = Math.min(8000, Math.max(4000, planWeeks * 180));
    const otherTokens = 4000;

    // For long plans, keep workouts compact so every week fits in budget
    const compactNote = planWeeks > 20
      ? `\nFORMAT RULE: This is a ${planWeeks}-week plan. Keep each week to 4 lines max (Focus line + 3 bullet workouts, 8–12 words each). Do NOT elaborate per workout. Brevity is essential — you must reach Week ${planWeeks} and Race Week. Never stop early.`
      : `\nBe thorough for each week.`;

    const steps=[
      {key:"training", label:"Generating training schedule...", tokens: trainingTokens,
       sys:`${BASE}\n\nATHLETE: ${prof}${courseContext}\n\nGenerate a COMPLETE week-by-week training plan covering ALL ${planWeeks} weeks — do not stop early.\n1. 2-sentence athlete assessment + timeline flags${sr?` + one sentence on what ${sr.name}'s course demands mean for their training`:""}.\n2. Phase headers: ## [emoji] Phase — Weeks X–Y, one sentence on what it builds.\n3. EVERY week from Week 1 to Week ${planWeeks}:\n**Week N** *(dates)*\nFocus: [note]\n• Workout 1 — type/dist/pace\n• Workout 2\n• Workout 3\n4. Race Week block at end.\n5. For tri: weight early weeks toward weakest discipline.\n${sr&&(sr.difficulty==="hilly"||sr.difficulty==="brutal")?"6. Include hill workouts in build phase. Include downhill running sessions. For ultras/trails, include back-to-back long run weekends.\n":""
       }${compactNote}`},
      {key:"nutrition", label:"Building nutrition guide...", tokens: otherTokens,
       sys:`${BASE}\n\nATHLETE: ${prof}${courseContext}\n\nNUTRITION section.\n## Daily Targets — 3–4 sentences: calories training vs rest, macros in grams, why each${sr&&sr.difficulty==="brutal"?" (note that brutal mountain races require significantly higher carbohydrate and calorie intake in peak weeks)":""}.\n## The Plate Guide — one paragraph on proportions.\n## Foods Worth Prioritizing — 8 items: - **Food** — why\n## Balance Is the Strategy — 4–5 sentences endorsing 1–2 fun meals/week with examples.\n## Hydration — one sentence: daily target + electrolytes${sr&&sr.elev>5000?" + altitude hydration note":""}.`},
      {key:"fueling", label:"Building race fueling strategy...", tokens: otherTokens,
       sys:`${BASE}\n\nATHLETE: ${prof}${courseContext}\n\nFUELING section${sr?` specifically for ${sr.name}`:""}.\n## Why Your Body Needs Fuel — 4–5 sentences: glycogen, bonking, calorie burn for ${raceType?.name}${sr?" on this specific course":""}.${sr&&(sr.difficulty==="brutal"||sr.difficulty==="hilly")?" Note the extra calorie cost of climbing.":" "}\n## Training Fueling Rules — under/over threshold rules.\n## Race Day Schedule — hour/segment by hour, one line each${sr?" tailored to this course's elevation profile":""}.\n## Best Pick Per Category — Gel / Chews / Real Food / Drink: product + one reason.\n## Gut Training — 3 sentences: what, why, how.`},
      {key:"mental", label:"Building mental performance toolkit...", tokens: otherTokens,
       sys:`${BASE}\n\nATHLETE: ${prof}${courseContext}\n\nMENTAL PERFORMANCE section — deeply personal, emotionally resonant.\n\n## Pre-Race Visualization\nWrite a vivid 2nd-person script (5–7 sentences) for the night before${sr?` specifically imagining ${sr.name}'s start, key landmarks, and finish`:""}. Include a hard patch and the finish.\n\n## Race Day Mantras\n6 personalized mantras:\n- **"[mantra]"** — [when to use it]\n${sr&&(sr.difficulty==="brutal")?"Include at least 2 mantras specifically for the hardest climbs or most brutal sections.":""}\n\n## The Dark Patch Protocol\nAction plan for when they want to quit. What to think, say, do, and the reframe. 2nd person. 6–8 sentences${sr?` — make it specific to ${sr.name}'s notorious hard sections`:""}.`},
      {key:"recovery", label:"Building post-race recovery protocol...", tokens: otherTokens,
       sys:`${BASE}\n\nATHLETE: ${prof}\n\nPOST-RACE RECOVERY — 4 weeks after ${raceType?.name}${sr?` (${sr.name})`:""}.\n## The First 48 Hours — body response, what to eat, sleep, what not to do.\n## Week 1 — Celebrate & Rest — movement, food, sleep, warning signs.\n## Week 2 — Gentle Return — first easy movement, what "easy" means.\n## Week 3 — Rebuild Begins — first structured workout, readiness gauge.\n## Week 4 — Assess & Look Ahead — return criteria, next goal.\n## Are You Really Recovered? — 5 specific clinical signs.`},
    ];

    const newS={training:"",nutrition:"",fueling:"",mental:"",recovery:""};
    for(let i=0;i<steps.length;i++){
      setBStep({step:i+1,label:steps[i].label});
      try{
        const r=await callAI(steps[i].sys,"Generate this section now, be thorough.",steps[i].tokens);
        newS[steps[i].key]=r; setSecs(p=>({...p,[steps[i].key]:r}));
      }catch{ newS[steps[i].key]="Error. Try again."; setSecs(p=>({...p,[steps[i].key]:"Error."})); }
    }
    const plan={race:raceType,params:{...params},wks,sections:newS,createdAt:new Date().toISOString()};
    setSaved(plan); try{await window.storage.set("daywon_v1",JSON.stringify(plan));}catch{}
    const raceLabel=params.specificRace?`**${params.specificRace.name}**`:`**${raceType.name}**`;
    setMsgs([{role:"assistant",content:`Your complete plan for ${raceLabel} is ready — training, nutrition, fueling, mental prep, and recovery all built${params.specificRace?` and tailored to ${params.specificRace.loc}`:""}. What would you like to know?`}]);
    setScreen("plan"); setTab("training");
  }

  // LIFE HAPPENED
  async function rebuildPlan() {
    setLhLoad(true);
    const prof=mkProf(saved.race,saved.params,saved.wks);
    const sys=`${BASE}\n\nATHLETE: ${prof}\n\nThis athlete missed ${lhDays} days. Reason: ${lhReason||"life happened"}.\nRebuild their plan from today forward. Acknowledge warmly in one sentence then regenerate a complete week-by-week plan to race day — no cramming, no injury risk. Adjust volume intelligently. Same format: phase headers, weekly blocks with 3 bullet workouts. Keep each week concise (4 lines max) so you cover every remaining week without stopping early.`;
    const rebuildWks = saved.wks || saved.race?.minW || 16;
    const rebuildTokens = Math.min(8000, Math.max(4000, rebuildWks * 180));
    try{
      const r=await callAI(sys,"Rebuild the training plan now.",rebuildTokens);
      const rebuilt=`*Rebuilt ${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})} after ${lhDays}-day break.*\n\n${r}`;
      setSecs(p=>({...p,training:rebuilt}));
      const updated={...saved,sections:{...saved.sections,training:rebuilt}};
      setSaved(updated); try{await window.storage.set("daywon_v1",JSON.stringify(updated));}catch{}
    }catch{}
    setLhLoad(false); setLhOpen(false); setLhDays("3"); setLhReason("");
  }

  // CHAT
  async function sendChat(pd) {
    const p=pd||saved; if(!chatIn.trim()||chatLoad||!p) return;
    const u={role:"user",content:chatIn};
    const next=[...msgs,u]; setMsgs(next); setChatIn(""); setChatLoad(true);
    const sys=`${BASE}\n\nATHLETE: ${mkProf(p.race,p.params,p.wks)}\n\nPlan: ${p.sections.training?.slice(0,500)}...\n\nAnswer concisely.`;
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_KEY,"anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:700,system:sys,messages:next.map(m=>({role:m.role,content:m.content}))})});
      const d=await r.json();
      setMsgs(prev=>[...prev,{role:"assistant",content:d.content?.map(b=>b.text||"").join("")||"Sorry."}]);
    }catch{setMsgs(prev=>[...prev,{role:"assistant",content:"Connection error."}]);}
    setChatLoad(false);
  }
  const handleKey=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}};

  // ─────────────────────────────────────────────
  // HOME
  // ─────────────────────────────────────────────
  if(screen==="home") return (
    <div style={S.root}>
      <style>{CSS}</style>
      <nav style={S.nav}>
        <div style={S.navBrand}><div style={S.navGem}>◈</div><span style={S.navName}>DAY WON</span></div>
        {saved&&<button className="navPill" style={S.navPill} onClick={()=>{setSecs(saved.sections);setRaceType(saved.race);setParams(saved.params);setScreen("plan");}}>{saved.race.icon} Continue Plan</button>}
      </nav>
      <div style={S.hero}>
        <div style={S.heroBg}/>
        <div style={S.heroContent}>
          <div style={S.heroEyebrow}>AI-Powered Endurance Training</div>
          <h1 style={S.heroH1}>Train smarter.<br/><span style={S.heroAccent}>Race harder.</span></h1>
          <p style={S.heroP}>Pick a specific race — Boston, UTMB, Kona, or any event in our database — and get a plan built around that exact course's elevation, terrain, and demands.</p>
          <div style={S.heroMeta}>
            <span style={S.heroChip}>📅 {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>
            <span style={S.heroChip}>200+ real races</span>
            <span style={S.heroChip}>Course-specific plans</span>
            <span style={S.heroChip}>7 AI features</span>
          </div>
        </div>
      </div>
      {saved&&(
        <div className="cpb" style={S.cpBanner} onClick={()=>{setSecs(saved.sections);setRaceType(saved.race);setParams(saved.params);setScreen("plan");}}>
          <div style={S.cpLeft}>
            <span style={{fontSize:22}}>{saved.race.icon}</span>
            <div>
              <div style={S.cpTitle}>Current Plan: {saved.params.specificRace?saved.params.specificRace.name:saved.race.name}</div>
              <div style={S.cpMeta}>{fmtDate(saved.params.startDate)}{saved.params.raceDate?` → ${fmtDate(saved.params.raceDate)}`:""}{saved.wks?` · ${saved.wks} weeks`:""}</div>
            </div>
          </div>
          <span style={S.cpCta}>View Plan →</span>
        </div>
      )}
      <div style={S.section}>
        <div style={S.sectionTop}>
          <div>
            <h2 style={S.sectionH}>Choose Distance Category</h2>
            <div style={{fontSize:11,color:P.muted,marginTop:4}}>Or <button style={{background:"none",border:"none",color:P.green,cursor:"pointer",fontSize:11,fontWeight:700,padding:0,fontFamily:"'Montserrat',sans-serif"}} onClick={()=>goTo("races")}>browse 200+ specific races →</button></div>
          </div>
          <div style={S.filterRow}>{CATS.map(c=><button key={c.id} className="fp" style={{...S.fpill,...(filter===c.id?S.fpillOn:{})}} onClick={()=>setFilter(c.id)}>{c.label}</button>)}</div>
        </div>
        <div style={S.grid}>
          {(filter==="all"?RACE_TYPES:RACE_TYPES.filter(r=>r.cat===filter)).map(r=>(
            <div key={r.id} className="rc" style={S.raceCard}
              onClick={()=>{setRaceType(r);setParams(p=>({...p,startDate:"",triStrength:"",triWeakness:"",raceDate:"",specificRace:null}));setPred(null);goTo("setup");}}>
              <div style={S.rcTop}><span style={S.rcCat}>{r.cat==="run"?"ROAD":r.cat==="ultra"?"ULTRA TRAIL":"TRI"}</span><span style={S.rcEmoji}>{r.icon}</span></div>
              <div style={S.rcName}>{r.name}</div>
              <div style={S.rcTagline}>{r.tag}</div>
              <div style={S.rcDist}>{r.dist}</div>
              <div style={S.rcFoot}><span style={S.rcWks}>{r.minW}–{r.maxW} wks</span><span className="arr" style={S.rcArrow}>Start →</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // RACE BROWSER
  // ─────────────────────────────────────────────
  if(screen==="races") {
    const diffOpts=["all","flat","rolling","hilly","brutal"];
    const surfOpts=["all","road","trail","mixed"];
    const catOpts=[{id:"all",label:"All"},...CATS.slice(1)];
    return (
      <div style={S.root}>
        <style>{CSS}</style>
        <nav style={S.nav}>
          <div style={S.navBrand}><div style={S.navGem}>◈</div><span style={S.navName}>DAY WON</span></div>
          <button style={S.navBack} onClick={goBack}>← Back</button>
        </nav>

        <div style={S.searchBar}>
          <input className="srch" style={S.searchInp} placeholder="Search races, locations, tags..."
            value={rbSearch} onChange={e=>setRbSearch(e.target.value)}/>
          <span style={S.searchHint}>{rbResults.length} races</span>
        </div>

        <div className="filterBar" style={{...S.filterBar,overflowX:"auto",gap:10,flexWrap:"nowrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            <span style={S.filterLabel}>Type</span>
            {catOpts.map(c=>(
              <button key={c.id} className="fp" style={{...S.fpill,padding:"4px 10px",fontSize:10,...(rbFilter===c.id?S.fpillOn:{})}} onClick={()=>setRbFilter(c.id)}>{c.label}</button>
            ))}
          </div>
          <div style={{width:1,height:20,background:P.border,flexShrink:0}}/>
          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            <span style={S.filterLabel}>Difficulty</span>
            {diffOpts.map(d=>{
              const cfg=d==="all"?null:DIFF_CFG[d];
              const on=rbDiff===d;
              return <button key={d} className="fp" style={{...S.fpill,padding:"4px 10px",fontSize:10,...(on?{background:cfg?cfg.bg:"rgba(74,222,128,0.1)",borderColor:cfg?cfg.color:P.green,color:cfg?cfg.color:P.green}:{})}} onClick={()=>setRbDiff(d)}>{d==="all"?"All":cfg.label}</button>;
            })}
          </div>
          <div style={{width:1,height:20,background:P.border,flexShrink:0}}/>
          <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
            <span style={S.filterLabel}>Surface</span>
            {surfOpts.map(s=>{
              const on=rbSurf===s;
              const cfg=s==="all"?null:SURF_CFG[s];
              return <button key={s} className="fp" style={{...S.fpill,padding:"4px 10px",fontSize:10,...(on?{background:"rgba(74,222,128,0.1)",borderColor:P.green,color:cfg?cfg.color:P.green}:{})}} onClick={()=>setRbSurf(s)}>{s==="all"?"All":cfg.label}</button>;
            })}
          </div>
        </div>

        <div style={S.raceListGrid}>
          {rbResults.length===0&&(
            <div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px 0",color:P.muted}}>
              <div style={{fontSize:32,marginBottom:12}}>🔍</div>
              <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:13}}>No races match. Try different filters.</div>
            </div>
          )}
          {rbResults.map(r=>{
            const diffCfg=DIFF_CFG[r.difficulty]||DIFF_CFG.flat;
            const surfCfg=SURF_CFG[r.surface]||SURF_CFG.road;
            const rt=RACE_TYPES.find(t=>t.id===r.typeId)||RACE_TYPES[0];
            const elevColor=r.difficulty==="brutal"?P.red:r.difficulty==="hilly"?P.clay:r.difficulty==="rolling"?P.blue:P.green;
            return (
              <div key={r.id} className="rdc" style={S.rdCard}
                onClick={()=>{setRaceType(rt);setParams(p=>({...p,specificRace:r,startDate:"",triStrength:"",triWeakness:"",raceDate:r.date?"":""}));setPred(null);goTo("setup");}}>
                <div style={S.rdTop}>
                  <div style={S.rdHeader}>
                    <div>
                      <div style={{...S.rdMeta,color:rt.cat==="tri"?P.blue:rt.cat==="ultra"?P.clay:P.olive}}>{rt.cat==="run"?"ROAD":rt.cat==="ultra"?"ULTRA TRAIL":"TRIATHLON"} · {rt.dist}</div>
                    </div>
                    <span style={{fontSize:22}}>{r.icon}</span>
                  </div>
                  <div style={S.rdName}>{r.name}</div>
                  <div style={S.rdLoc}>📍 {r.loc}</div>
                  {r.date&&<div style={{fontSize:10,color:P.muted,marginBottom:8,fontFamily:"'Montserrat',sans-serif"}}>📅 {r.date}</div>}
                  <div style={S.rdTags}>
                    <span style={{...S.rdTag,background:diffCfg.bg,color:diffCfg.color}}>{diffCfg.label}</span>
                    <span style={{...S.rdTag,background:"rgba(143,168,118,0.12)",color:surfCfg.color}}>{surfCfg.label}</span>
                    {r.tags?.slice(0,2).map(t=>(
                      <span key={t} style={{...S.rdTag,background:P.bg3,color:P.muted}}>{t}</span>
                    ))}
                  </div>
                  <div style={{fontSize:11,color:P.textMid,lineHeight:1.6,marginBottom:10}}>{r.desc}</div>
                </div>
                <div style={S.rdStats}>
                  <div style={S.rdStat}><div style={{...S.rdStatVal,color:elevColor}}>{fmtElev(r.elevGain)}</div><div style={S.rdStatLbl}>Elev Gain</div></div>
                  <div style={{...S.rdStat,borderLeft:`1px solid ${P.border}`,borderRight:`1px solid ${P.border}`}}>
                    <div style={{...S.rdStatVal,color:P.textMid}}>{r.elev>1000?fmtElev(r.elev):`${r.elev}ft`}</div><div style={S.rdStatLbl}>Altitude</div>
                  </div>
                  <div style={S.rdStat}><div style={{...S.rdStatVal,color:P.green}}>{rt.minW}–{rt.maxW}w</div><div style={S.rdStatLbl}>Training</div></div>
                </div>
                <div style={S.rdElevBar}>
                  <div style={{fontSize:8,color:P.muted,fontFamily:"'Montserrat',sans-serif",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Elevation Profile</div>
                  <ElevProfile profile={r.profile} color={elevColor} height={32}/>
                </div>
                <div style={{padding:"8px 14px",borderTop:`1px solid ${P.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    style={{fontSize:10,color:P.muted,textDecoration:"none",fontFamily:"'Montserrat',sans-serif"}}
                    onClick={e=>e.stopPropagation()}>
                    {r.source} ↗
                  </a>
                  <span style={{fontSize:10,fontWeight:700,color:P.green,fontFamily:"'Montserrat',sans-serif"}}>Build Plan →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // SETUP
  // ─────────────────────────────────────────────
  if(screen==="setup") {
    const sr=params.specificRace;
    const diffCfg=sr?DIFF_CFG[sr.difficulty]:null;
    const rt=raceType;
    const elevColor=sr?(sr.difficulty==="brutal"?P.red:sr.difficulty==="hilly"?P.clay:sr.difficulty==="rolling"?P.blue:P.green):P.green;
    return (
      <div style={S.root}>
        <style>{CSS}</style>
        <nav style={S.nav}>
          <div style={S.navBrand}><div style={S.navGem}>◈</div><span style={S.navName}>DAY WON</span></div>
          <button style={S.navBack} onClick={goBack}>← Back</button>
        </nav>
        <div style={S.setupTop}>
          <div style={S.setupTopBg}/>
          <div style={S.setupTopContent}>
            <div style={S.setupEyebrow}>Building your plan for</div>
            <div style={S.setupRaceRow}>
              <span style={S.setupEmoji}>{rt.icon}</span>
              <div>
                <div style={S.setupRaceName}>{sr?sr.name:rt.name}</div>
                {sr&&<div style={S.setupRaceEvent}>📍 {sr.loc}</div>}
                <div style={S.setupRaceDist}>{rt.dist}{sr?.date?` · ${sr.date}`:""}</div>
              </div>
            </div>
            {sr&&(
              <div style={S.setupCourseBadges}>
                <span style={{...S.rdTag,...S.rdTag,background:diffCfg.bg,color:diffCfg.color,fontSize:9,fontWeight:800,letterSpacing:"0.12em",padding:"3px 8px",borderRadius:4,fontFamily:"'Montserrat',sans-serif"}}>{diffCfg.label}</span>
                <span style={{fontSize:9,fontWeight:700,color:elevColor,background:`${elevColor}18`,padding:"3px 8px",borderRadius:4,fontFamily:"'Montserrat',sans-serif",letterSpacing:"0.1em"}}>{fmtElev(sr.elevGain)} gain</span>
                <span style={{fontSize:9,fontWeight:700,color:SURF_CFG[sr.surface]?.color||P.textMid,background:P.bg3,padding:"3px 8px",borderRadius:4,fontFamily:"'Montserrat',sans-serif"}}>{SURF_CFG[sr.surface]?.label||sr.surface}</span>
                {sr.tags?.slice(0,2).map(t=><span key={t} style={{fontSize:9,color:P.muted,background:P.bg3,padding:"3px 8px",borderRadius:4,fontFamily:"'Montserrat',sans-serif"}}>{t}</span>)}
              </div>
            )}
            {sr&&<div style={{...S.rdElevBar,borderRadius:8,marginTop:10,background:P.bg3}}><div style={{fontSize:8,color:P.muted,fontFamily:"'Montserrat',sans-serif",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Course Elevation Profile</div><ElevProfile profile={sr.profile} color={elevColor} height={40}/></div>}
            {!sr&&<div style={S.setupMeta}>{rt.minW}–{rt.maxW} week plan · Training + Nutrition + Fueling + Mental + Recovery</div>}
          </div>
        </div>

        <div style={S.formOuter}>
          <div style={S.formInner}>
            {/* ── SPECIFIC RACE PICKER ── */}
            <RacePicker rt={rt} sr={sr} setParams={setParams} goTo={goTo}/>

            {isTri&&(
              <div style={S.formBlock}>
                <div style={S.formTitle}>Triathlon Profile</div>
                {["strongest","weakest"].map(type=>(
                  <div key={type} style={{marginBottom:type==="strongest"?18:0}}>
                    <div style={S.fieldLabel}>{type==="strongest"?"Strongest discipline":"Weakest discipline"}{type==="weakest"&&<span style={S.fieldSub}> — gets extra focus</span>}</div>
                    <div style={S.discRow}>
                      {DISCS.map(d=>{
                        const isThis=(type==="strongest"?params.triStrength:params.triWeakness)===d.id;
                        const isOther=(type==="strongest"?params.triWeakness:params.triStrength)===d.id;
                        return (
                          <button key={d.id} className="db" style={{...S.discBtn,...(isThis?(type==="strongest"?S.dStrong:S.dWeak):{}),...(isOther?S.dFaded:{})}}
                            onClick={()=>{if(isOther)return;const k=type==="strongest"?"triStrength":"triWeakness";setParams(p=>({...p,[k]:p[k]===d.id?"":d.id}));}}>
                            <span style={{fontSize:20}}>{d.icon}</span>
                            <span style={S.dLabel}>{d.label}</span>
                            {isThis&&<div style={type==="strongest"?S.dTagG:S.dTagC}>{type==="strongest"?"STRONG":"FOCUS"}</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={S.formBlock}>
              <div style={S.formTitle}>Training Setup</div>
              <div style={S.field}>
                <div style={S.fieldLabel}>Days per week</div>
                <div style={S.dayRow}>{[2,3,4,5,6,7].map(d=><button key={d} className="dy" style={{...S.dayBtn,...(params.trainingDays===d?S.dayOn:{})}} onClick={()=>setParams(p=>({...p,trainingDays:d}))}>{d}</button>)}</div>
              </div>
              <div style={S.field}>
                <div style={S.fieldLabel}>Experience with this event</div>
                <div style={S.chips}>{["First time","1–2 times","3–5 times","Veteran"].map(e=><button key={e} className="ch" style={{...S.chip,...(params.experience===e?S.chipOn:{})}} onClick={()=>setParams(p=>({...p,experience:e}))}>{e}</button>)}</div>
              </div>
              <div style={{...S.field,marginBottom:0}}>
                <div style={S.fieldLabel}>Fitness level</div>
                <div style={S.chips}>{["Beginner","Intermediate","Advanced","Elite"].map(f=><button key={f} className="ch" style={{...S.chip,...(params.fitnessLevel===f.toLowerCase()?S.chipOn:{})}} onClick={()=>setParams(p=>({...p,fitnessLevel:f.toLowerCase()}))}>{f}</button>)}</div>
              </div>
            </div>

            <div style={S.formBlock}>
              <div style={S.formTitle}>Race Timing</div>
              <div style={S.field}>
                <div style={S.fieldLabel}>Race date <span style={S.fieldSub}>(optional — pre-filled if race known)</span></div>
                <input type="date" style={S.inp} min={TODAY_STR} value={params.raceDate} onChange={e=>setParams(p=>({...p,raceDate:e.target.value,startDate:""}))}/>
              </div>
              {sugg.length>0&&(
                <div style={S.field}>
                  <div style={S.fieldLabel}>Start date</div>
                  <div style={S.sgStack}>
                    {sugg.map((sg,i)=>(
                      <button key={i} className="sg" style={{...S.sgBtn,...(params.startDate===sg.date?S.sgOn:{}),...(sg.recommended&&params.startDate!==sg.date?S.sgRec:{})}} onClick={()=>setParams(p=>({...p,startDate:sg.date}))}>
                        <div><div style={S.sgDate}>{sg.label}</div>{sg.weeks&&<div style={S.sgWks}>{sg.weeks} weeks</div>}</div>
                        <div style={{textAlign:"right"}}>{sg.recommended&&<div style={S.recTag}>Coach's Pick</div>}<div style={S.sgNote}>{sg.note}</div></div>
                      </button>
                    ))}
                  </div>
                  <div style={{marginTop:10}}>
                    <div style={{...S.fieldLabel,fontSize:9,marginBottom:5}}>Custom date</div>
                    <input type="date" style={{...S.inp,maxWidth:180}} min={TODAY_STR} value={params.startDate} onChange={e=>setParams(p=>({...p,startDate:e.target.value}))}/>
                  </div>
                </div>
              )}
              {tlStatus&&<div style={{...S.tlBanner,...(tlStatus.warn?S.tlWarn:S.tlOk)}}>{tlStatus.msg}</div>}
            </div>

            <div style={S.formBlock}>
              <div style={S.formTitle}>Goals & Health</div>
              <div style={S.field}>
                <div style={S.fieldLabel}>Goal finish time <span style={S.fieldSub}>(optional)</span></div>
                <input style={S.inp} placeholder="e.g. Sub-4 hours, under 45 min, just finish" value={params.goalTime} onChange={e=>setParams(p=>({...p,goalTime:e.target.value}))}/>
              </div>
              <div style={{...S.field,marginBottom:0}}>
                <div style={S.fieldLabel}>Injuries or limitations <span style={S.fieldSub}>(optional)</span></div>
                <textarea style={{...S.inp,...S.ta}} placeholder="e.g. IT band tightness, shoulder soreness..." value={params.injuries} onChange={e=>setParams(p=>({...p,injuries:e.target.value}))}/>
              </div>
            </div>

            {pred&&params.experience&&(
              <div style={S.predCard}>
                <div style={S.predTitle}>⚡ Honest Race Predictor{pred.adjusted?" · Course-Adjusted":""}</div>
                <div style={S.predRow}>
                  <div style={S.predCell}><div style={S.predVal}>{pred.rough}</div><div style={S.predLbl}>Rough Day</div></div>
                  <div style={S.predCell}><div style={S.predVal}>{pred.likely}</div><div style={S.predLbl}>Most Likely</div></div>
                  <div style={{...S.predCell,...S.predCellBest}}><div style={{...S.predVal,...S.predValBest}}>{pred.best}</div><div style={S.predLbl}>Best Case</div></div>
                </div>
                <div style={S.predNote}>
                  {pred.adjusted?`Adjusted for ${sr?.name}'s ${sr?.difficulty} terrain. `:""}
                  Based on your {params.fitnessLevel} fitness and {params.experience} experience.
                </div>
              </div>
            )}

            <div style={S.wygRow}>
              {PLAN_TABS.map(t=><div key={t.id} style={S.wygCard}><span style={S.wygIcon}>{t.icon}</span><span style={S.wygLabel}>{t.label}</span></div>)}
            </div>
            <button className="dBtn" style={{...S.genBtn,...(!params.experience?S.genBtnOff:{})}} disabled={!params.experience} onClick={buildPlan}>
              Build {sr?`My ${sr.name} Plan`:"My Complete Plan"} →
            </button>
            {!params.experience&&<p style={S.setupHint}>Select your experience level above to continue</p>}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // BUILDING
  // ─────────────────────────────────────────────
  if(screen==="building") return (
    <div style={S.root}>
      <style>{CSS}</style>
      <div style={S.buildScreen}>
        <div style={S.buildGlow}/>
        <div style={S.buildInner}>
          <span className="orb" style={S.buildOrb}>◈</span>
          <h2 style={S.buildH}>Crafting your plan</h2>
          <p style={S.buildSub}>{params.specificRace?`Course-specific plan for ${params.specificRace.name}. About 60 seconds.`:"Five sections — about 60 seconds."}</p>
          <div style={S.buildSteps}>
            {PLAN_TABS.map((t,i)=>{
              const done=i<bStep.step-1,active=i===bStep.step-1,pending=!done&&!active;
              return (
                <div key={t.id} style={S.buildRow}>
                  <div style={{...S.buildDot,...(done?S.bdDone:active?S.bdActive:S.bdPend)}}>{done?"✓":t.icon}</div>
                  <div>
                    <div style={{...S.buildName,...(pending?{color:P.muted}:{})}}>{t.label}</div>
                    {active&&<div style={S.buildStat}>{bStep.label}</div>}
                    {done&&<div style={{...S.buildStat,color:P.green}}>Complete</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={S.buildBarW}><div style={{...S.buildBar,width:`${(bStep.step/PLAN_TABS.length)*100}%`}}/></div>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  // KIT SCREEN
  // ─────────────────────────────────────────────
  if(screen==="kit") {
    const kitKey=raceType?.cat==="ultra"?"ultra":raceType?.cat==="tri"?"tri":"run";
    const kitSecs=KIT[kitKey]||KIT.run;
    const total=kitSecs.reduce((a,s)=>a+s.items.length,0);
    const checked=Object.values(kitChk).filter(Boolean).length;
    return (
      <div style={S.root}>
        <style>{CSS}</style>
        <div style={S.planNav}>
          <div style={S.planNavL}><div style={S.navBrand}><div style={S.navGem}>◈</div><span style={S.navName}>DAY WON</span></div><div style={S.planNavDiv}/><span style={S.planNavName}>🎒 Kit Planner</span></div>
          <div style={S.planNavR}><button className="ghb" style={S.ghostBtn} onClick={goBack}>← Plan</button></div>
        </div>
        <div style={{padding:"18px 28px 10px",borderBottom:`1px solid ${P.border}`,background:P.bg1}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div>
              <div style={{fontSize:10,color:P.muted,fontFamily:"'Montserrat',sans-serif",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3}}>Race Day Checklist</div>
              <div style={{fontSize:13,color:P.text,fontWeight:600}}>{params.specificRace?params.specificRace.name:raceType?.name} — {raceType?.dist}</div>
            </div>
            <div style={{textAlign:"right"}}><div style={{fontSize:22,fontWeight:800,color:P.blue,fontFamily:"'Montserrat',sans-serif"}}>{checked}/{total}</div><div style={{fontSize:9,color:P.muted,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"'Montserrat',sans-serif"}}>Packed</div></div>
          </div>
          <div style={{height:3,background:P.border,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",background:P.blue,borderRadius:2,width:`${total>0?(checked/total)*100:0}%`,transition:"width 0.3s"}}/></div>
        </div>
        <div style={{padding:"20px 28px 80px"}}>
          {kitSecs.map(sec=>(
            <div key={sec.cat} style={S.kitSection}>
              <div style={S.kitSectionTitle}>{sec.cat}</div>
              {sec.items.map(item=>(
                <div key={item.id} style={S.kitItem}>
                  <button className="kcb" style={{...S.kitCheck,...(kitChk[item.id]?S.kitCheckOn:{})}} onClick={()=>setKitChk(k=>({...k,[item.id]:!k[item.id]}))}>
                    {kitChk[item.id]&&"✓"}
                  </button>
                  <div style={{opacity:kitChk[item.id]?0.4:1,transition:"opacity 0.15s"}}>
                    <div style={{...S.kitItemName,...(kitChk[item.id]?{textDecoration:"line-through",color:P.muted}:{})}}>{item.name}</div>
                    <div style={S.kitItemNote}>{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // PLAN
  // ─────────────────────────────────────────────
  const pd={race:raceType,params,wks,sections:secs};
  const stats=planStats(raceType,params,wks);
  const risk=calcRisk(raceType,params,wks);
  const taper=calcTaper(raceType,wks);
  const sr=params.specificRace;
  const elevColor=sr?(sr.difficulty==="brutal"?P.red:sr.difficulty==="hilly"?P.clay:sr.difficulty==="rolling"?P.blue:P.green):P.green;
  const mentalSecs=[
    {id:"viz",    title:"Pre-Race Visualization",  sub:"Night-before script",   heading:"Pre-Race Visualization"},
    {id:"mantras",title:"Race Day Mantras",        sub:"6 personalized phrases",heading:"Race Day Mantras"},
    {id:"dark",   title:"The Dark Patch Protocol", sub:"When you want to quit", heading:"The Dark Patch Protocol"},
  ];
  const recovSecs=[
    {id:"48h", title:"The First 48 Hours",        badge:"0–48 HRS", color:"#F87171", bg:"rgba(248,113,113,0.07)"},
    {id:"wk1", title:"Week 1 — Celebrate & Rest", badge:"WEEK 1",   color:"#F59E6A", bg:"rgba(245,158,106,0.07)"},
    {id:"wk2", title:"Week 2 — Gentle Return",    badge:"WEEK 2",   color:"#FACC15", bg:"rgba(250,204,21,0.07)"},
    {id:"wk3", title:"Week 3 — Rebuild Begins",   badge:"WEEK 3",   color:"#4ADE80", bg:"rgba(74,222,128,0.07)"},
    {id:"wk4", title:"Week 4 — Assess & Look Ahead",badge:"WEEK 4", color:"#60A5FA", bg:"rgba(96,165,250,0.07)"},
    {id:"rdy", title:"Are You Really Recovered?", badge:"CHECKLIST",color:"#A78BFA", bg:"rgba(167,139,250,0.07)"},
  ];

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      <div style={S.planNav}>
        <div style={S.planNavL}>
          <div style={S.navBrand}><div style={S.navGem}>◈</div><span style={S.navName}>DAY WON</span></div>
          <div style={S.planNavDiv}/>
          <div style={S.planNavRace}>
            <span>{raceType?.icon}</span>
            <span style={S.planNavName}>{sr?sr.name:raceType?.name}</span>
          </div>
        </div>
        <div style={S.planNavR}>
          {params.raceDate&&<span style={S.planNavDate}>{fmtDate(params.raceDate)}</span>}
          <button className="ghb" style={S.ghostBtn} onClick={()=>goTo("kit")}>🎒 Kit</button>
          <button className="ghb" style={S.ghostBtn} onClick={()=>goTo("setup")}>Edit</button>
          <button className="ghb" style={S.ghostBtn} onClick={()=>setScreen("home")}>Home</button>
        </div>
      </div>

      {/* Course banner if specific race */}
      {sr&&(
        <div style={{padding:"10px 24px",background:P.bg1,borderBottom:`1px solid ${P.border}`,display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:10,fontWeight:800,color:DIFF_CFG[sr.difficulty]?.color||P.green,background:DIFF_CFG[sr.difficulty]?.bg,padding:"2px 7px",borderRadius:3,fontFamily:"'Montserrat',sans-serif",letterSpacing:"0.1em"}}>{DIFF_CFG[sr.difficulty]?.label}</span>
              <span style={{fontSize:10,color:P.muted,fontFamily:"'Montserrat',sans-serif"}}>📍 {sr.loc}</span>
              <span style={{fontSize:10,color:elevColor,fontFamily:"'Montserrat',sans-serif",fontWeight:700}}>{fmtElev(sr.elevGain)} gain</span>
              {sr.date&&<span style={{fontSize:10,color:P.muted,fontFamily:"'Montserrat',sans-serif"}}>📅 {sr.date}</span>}
            </div>
          </div>
          <div style={{width:120,flexShrink:0}}>
            <ElevProfile profile={sr.profile} color={elevColor} height={24}/>
          </div>
        </div>
      )}

      <div style={S.statsStrip}>
        {stats.map((st,i)=>(
          <div key={st.label} style={{...S.statCard,...(i<3?{borderRight:`1px solid ${P.border}`}:{})}}>
            <div style={S.statVal}>{st.val}</div><div style={S.statLbl}>{st.label}</div>
          </div>
        ))}
      </div>

      <div className="tabBar" style={S.tabBar}>
        {PLAN_TABS.map(t=>{
          const isOn=tab===t.id;
          return (
            <button key={t.id} className="pt" style={{...S.planTab,...(isOn?{color:t.color}:{})}} onClick={()=>setTab(t.id)}>
              <span style={{fontSize:12}}>{t.icon}</span>
              <span>{t.label}</span>
              {isOn&&<div style={{...S.tabLine,background:t.color}}/>}
            </button>
          );
        })}
      </div>

      <div style={S.planMain}>
        {tab==="training"&&(
          <div>
            <div style={{...S.riskBanner,background:risk.bg,borderColor:risk.border}}>
              <div style={S.riskRow}>
                <div style={S.riskLeft}>
                  <span style={S.riskIcon}>{risk.level==="Low"?"🟢":risk.level==="Moderate"?"🟡":"🔴"}</span>
                  <div><div style={{...S.riskLabel,color:risk.color}}>Injury Risk: {risk.level}</div><div style={S.riskMsg}>{risk.msg}</div></div>
                </div>
                <div style={S.riskMeter}>{[1,2,3].map(n=><div key={n} style={{...S.riskDot,...(n<=risk.dots?{background:risk.color}:{})}}/>)}</div>
              </div>
            </div>
            {secs.training
              ?<div style={S.planMd} dangerouslySetInnerHTML={{__html:mdParse(secs.training)}}/>
              :<div style={S.planEmpty}><div style={{fontSize:32,marginBottom:10}}>📅</div><div style={{color:P.muted,fontSize:12,fontFamily:"'Montserrat',sans-serif"}}>Generating...</div></div>
            }
            {taper.length>0&&secs.training&&(
              <div style={S.taperCard}>
                <div style={S.taperHead}><span style={{fontSize:16}}>🏁</span><div style={S.taperTitle}>ADAPTIVE TAPER — FINAL {taper.length} WEEKS</div></div>
                <div style={S.taperRow}>
                  {taper.map((tw,i)=>(
                    <div key={i} style={{...S.taperCell,...(i===taper.length-1?{borderRight:"none"}:{})}}>
                      <div style={S.taperWk}>{tw.label}</div>
                      <div style={{...S.taperPct,color:tw.color}}>{tw.pct}%</div>
                      <div style={S.taperNote}>{tw.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {tab==="nutrition"&&(secs.nutrition?<div style={S.planMd} dangerouslySetInnerHTML={{__html:mdParse(secs.nutrition)}}/>:<div style={S.planEmpty}><div style={{fontSize:32,marginBottom:10}}>🥗</div><div style={{color:P.muted,fontSize:12,fontFamily:"'Montserrat',sans-serif"}}>Generating...</div></div>)}
        {tab==="fueling"&&(secs.fueling?<div style={S.planMd} dangerouslySetInnerHTML={{__html:mdParse(secs.fueling)}}/>:<div style={S.planEmpty}><div style={{fontSize:32,marginBottom:10}}>⚡</div><div style={{color:P.muted,fontSize:12,fontFamily:"'Montserrat',sans-serif"}}>Generating...</div></div>)}
        {tab==="mental"&&(
          <div style={{padding:"20px 28px 48px"}}>
            {!secs.mental?<div style={S.planEmpty}><div style={{fontSize:32,marginBottom:10}}>🧠</div><div style={{color:P.muted,fontSize:12,fontFamily:"'Montserrat',sans-serif"}}>Generating...</div></div>:(
              <>{mentalSecs.map(ms=>(
                <div key={ms.id} style={S.mentalCard}>
                  <div className="mhd" style={S.mentalHead} onClick={()=>setMOpen(o=>({...o,[ms.id]:!o[ms.id]}))}>
                    <div><div style={S.mentalCardTitle}>{ms.title}</div><div style={S.mentalCardSub}>{ms.sub}</div></div>
                    <span style={{color:P.muted,fontSize:20,fontWeight:300,lineHeight:1}}>{mOpen[ms.id]?"−":"+"}</span>
                  </div>
                  {mOpen[ms.id]&&(
                    <div style={S.mentalBody}>
                      <div style={{fontSize:13,lineHeight:1.9,color:P.text,paddingTop:14}} dangerouslySetInnerHTML={{__html:mdParse(extractSection(secs.mental,ms.heading))}}/>
                    </div>
                  )}
                </div>
              ))}</>
            )}
          </div>
        )}
        {tab==="recovery"&&(
          <div style={{padding:"20px 28px 48px"}}>
            {!secs.recovery?<div style={S.planEmpty}><div style={{fontSize:32,marginBottom:10}}>❤️‍🩹</div><div style={{color:P.muted,fontSize:12,fontFamily:"'Montserrat',sans-serif"}}>Generating...</div></div>:(
              <>{recovSecs.map(rs=>(
                <div key={rs.id} style={{...S.recovCard,background:rs.bg,borderColor:`${rs.color}28`}}>
                  <div style={{...S.recovBadge,background:`${rs.color}18`,color:rs.color}}>{rs.badge}</div>
                  <div style={S.recovTitle}>{rs.title}</div>
                  <div style={S.recovBody} dangerouslySetInnerHTML={{__html:mdParse(extractSection(secs.recovery,rs.title))||"See full recovery plan above."}}/>
                </div>
              ))}</>
            )}
          </div>
        )}

        <div style={S.coachPanel}>
          <div style={S.coachHead}>
            <div style={S.coachHeadL}><span style={S.coachOrb}>◈</span><div><div style={S.coachTitle}>AI COACH</div><div style={S.coachSub}>{sr?`Knows ${sr.name} course`:"Knows your full plan"}</div></div></div>
            <button style={S.coachToggle} onClick={()=>setChatOpen(o=>!o)}>{chatOpen?"−":"+"}</button>
          </div>
          {chatOpen&&<>
            <div style={S.msgs}>
              {msgs.length===0&&(
                <div style={S.prompts}>
                  <div style={S.promptsLabel}>Suggested questions</div>
                  {[
                    sr&&sr.difficulty==="brutal"?"How do I train for the elevation gain?":null,
                    sr&&sr.surface==="trail"?"What trail shoes should I use?":null,
                    "What pace for easy runs?",
                    "How to fuel a 3hr long run?",
                    "Help me with pre-race nerves",
                  ].filter(Boolean).slice(0,4).map(q=><button key={q} className="pb" style={S.promptBtn} onClick={()=>setChatIn(q)}>{q}</button>)}
                </div>
              )}
              {msgs.map((m,i)=>(
                <div key={i} style={{...S.msg,...(m.role==="user"?S.msgUser:S.msgCoach)}}>
                  {m.role==="assistant"&&<div style={S.msgFrom}>Coach</div>}
                  <div dangerouslySetInnerHTML={{__html:mdParse(m.content)}}/>
                </div>
              ))}
              {chatLoad&&<div style={{...S.msg,...S.msgCoach}}><div style={S.msgFrom}>Coach</div><div style={S.dotRow}><span className="dot"/><span className="dot"/><span className="dot"/></div></div>}
              <div ref={chatEnd}/>
            </div>
            <div style={S.chatRow}>
              <textarea style={S.chatTa} placeholder="Ask your coach anything..." rows={2} value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={handleKey}/>
              <button style={{...S.sendBtn,...(!chatIn.trim()?{opacity:.35}:{})}} onClick={()=>sendChat(pd)} disabled={!chatIn.trim()||chatLoad}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 4v16M12 4L6 10M12 4l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </>}
        </div>
      </div>

      <div style={S.fabWrap} onMouseEnter={()=>setFabHov(true)} onMouseLeave={()=>setFabHov(false)}>
        {fabHov&&<div style={S.fabTip}>Life Happened</div>}
        <button className="fab" style={S.fab} onClick={()=>setLhOpen(true)}>🔄</button>
      </div>

      {lhOpen&&(
        <div style={S.modalBg} onClick={e=>{if(e.target===e.currentTarget)setLhOpen(false);}}>
          <div style={S.modal}>
            <div style={S.modalTitle}>Life Happened 🔄</div>
            <div style={S.modalSub}>Missed some training? No judgment. Tell me what happened and I'll rebuild your plan from today — keeping your race date, adjusting smart.</div>
            <div style={S.modalField}>
              <div style={S.modalLabel}>Days missed</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["1","2","3","5","7","10","14"].map(d=><button key={d} className="ch" style={{...S.chip,...(lhDays===d?S.chipOn:{})}} onClick={()=>setLhDays(d)}>{d} {parseInt(d)===1?"day":"days"}</button>)}
              </div>
            </div>
            <div style={S.modalField}>
              <div style={S.modalLabel}>What happened? <span style={{fontWeight:400,textTransform:"none",color:P.muted,fontSize:11,letterSpacing:0}}>(optional)</span></div>
              <textarea style={{...S.inp,...S.ta,minHeight:64}} placeholder="Work crunch, travel, illness, family..." value={lhReason} onChange={e=>setLhReason(e.target.value)}/>
            </div>
            <div style={S.modalBtns}>
              <button style={S.modalCancel} onClick={()=>setLhOpen(false)}>Cancel</button>
              <button style={{...S.modalConfirm,...(lhLoad?{opacity:0.6}:{})}} disabled={lhLoad} onClick={rebuildPlan}>{lhLoad?"Rebuilding...":"Rebuild My Plan →"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
