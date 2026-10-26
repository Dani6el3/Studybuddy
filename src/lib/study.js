import {courses,defaultStart,modes,schedule} from '../data/courses.js';
export const dateKey = (d=new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function dayNumber(value) {const [y,m,d]=value.split('-').map(Number);return Date.UTC(y,m-1,d)/86400000;}
export function cycle(date=new Date(),start=defaultStart) {
 // Calendar days (rather than elapsed hours) keep the cycle stable across DST.
 const elapsed=dayNumber(dateKey(date))-dayNumber(start);
 const week=Math.max(1,Math.floor(elapsed/7)+1);
 return {week,topic:(week-1)%4,mode:modes[week<=4?0:week<=8?1:2],beforeStart:elapsed<0};
}
export const minutes = time => {const [h,m]=time.split(':').map(Number);return h*60+m;};
export const duration = s => minutes(s.end)-minutes(s.start);
export const sessionsFor = (date=new Date()) => schedule[date.getDay()].map((s,i)=>({...s,id:`${dateKey(date)}:${i}`,courses:s.codes.map(code=>courses.find(c=>c.code===code))}));
export const topicKey = (code,i) => `${code}:${i}`;
export function youtubeId(value) {try {const u=new URL(value);if(u.hostname==='youtu.be')return /^[\w-]{11}$/.test(u.pathname.slice(1))?u.pathname.slice(1):null;if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)){const id=u.searchParams.get('v')||u.pathname.split('/').filter(Boolean)[1];return /^[\w-]{11}$/.test(id||'')?id:null;}}catch{}return null;}
export function safeUrl(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
export function remaining(timer,now=Date.now()){return timer?.endsAt?Math.max(0,timer.endsAt-now):timer?.remainingMs||0;}
