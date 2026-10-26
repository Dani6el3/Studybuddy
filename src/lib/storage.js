import {defaultStart} from '../data/courses.js';
export const freshData = () => ({version:1,startDate:defaultStart,notes:{},links:{},cards:{},topics:{},sessions:{},focusLog:[],timer:null});
const object = x => !!x && typeof x==='object' && !Array.isArray(x);
export function validateData(x){
 if(!object(x)||x.version!==1||!/^\d{4}-\d{2}-\d{2}$/.test(x.startDate)||Number.isNaN(Date.parse(x.startDate))||new Date(x.startDate).toISOString().slice(0,10)!==x.startDate)throw Error('Choose a valid StudyBuddy version 1 backup.');
 for(const k of ['notes','links','cards','topics','sessions'])if(!object(x[k]))throw Error(`Invalid backup: ${k}`);
 if(Object.values(x.notes).some(v=>typeof v!=='string')||Object.values(x.topics).some(v=>typeof v!=='boolean'))throw Error('Invalid notes or topic progress.');
 for(const list of Object.values(x.links)){if(!Array.isArray(list)||list.some(v=>!object(v)||typeof v.id!=='string'||typeof v.title!=='string'||typeof v.url!=='string'||!/^https?:\/\//.test(v.url)))throw Error('Invalid saved links.');}
 for(const list of Object.values(x.cards)){if(!Array.isArray(list)||list.some(v=>!object(v)||typeof v.id!=='string'||typeof v.question!=='string'||typeof v.answer!=='string'||!['new','got it','again'].includes(v.status)))throw Error('Invalid flashcards.');}
 if(Object.values(x.sessions).some(v=>!object(v)||typeof v.date!=='string')||!Array.isArray(x.focusLog)||x.focusLog.some(v=>!object(v)||typeof v.id!=='string'||!Number.isFinite(v.minutes)||v.minutes<0))throw Error('Invalid study history.');
 if(x.timer!==null&&(!object(x.timer)||typeof x.timer.id!=='string'||!Number.isFinite(x.timer.remainingMs)||!Number.isFinite(x.timer.totalMs)||x.timer.totalMs<0||x.timer.remainingMs<0||!(x.timer.endsAt===null||Number.isFinite(x.timer.endsAt))))throw Error('Invalid timer.');
 return {...freshData(),...x};
}
export function loadData(){try{const raw=localStorage.getItem('studybuddy');return {data:raw?validateData(JSON.parse(raw)):freshData(),error:''};}catch{return {data:freshData(),error:'Saved data could not be read. Export a backup before making changes if browser storage is unavailable.'};}}
export function saveData(data){try{localStorage.setItem('studybuddy',JSON.stringify(data));return '';}catch{return 'Your changes are in memory only. Browser storage is full or unavailable; export a backup now.';}}
