import {dateKey,dayNumber} from './study.js';
export function stats(data,now=new Date()){
 const today=dayNumber(dateKey(now));const days=new Set(Object.values(data.sessions).map(s=>dayNumber(s.date)));
 let day=days.has(today)?today:today-1;let streak=0;while(days.has(day)){streak++;day--;}
 const monday=today-(now.getDay()+6)%7;
 return {streak,weekSessions:Object.values(data.sessions).filter(s=>{const d=dayNumber(s.date);return d>=monday&&d<monday+7;}).length,minutes:Math.round(data.focusLog.reduce((n,s)=>n+s.minutes,0))};
}
