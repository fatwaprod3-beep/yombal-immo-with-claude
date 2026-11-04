import {AlarmClock,CalendarClock,CheckCircle2} from 'lucide-react';
import {deadlineInfo} from '../lib/dates';
import {today,dateLabel} from '../lib/model';
export default function Deadline({due,paid=false}:{due:string;paid?:boolean}){const d=deadlineInfo(due,today());return <div className={'deadline-alert deadline-'+(paid?'green':d.tone)} role={d.days<=0&&!paid?'status':undefined}>{paid?<CheckCircle2 size={22}/>:d.days<=0?<AlarmClock size={24}/>:<CalendarClock size={21}/>}<div><strong>{paid?'Paiement réglé':d.label}</strong><span>{paid?'Échéance réglée':'Échéance'} : {dateLabel(due,true)}</span></div>{!paid&&<b>{d.days<0?'-'+Math.abs(d.days):d.days}<small>jour{Math.abs(d.days)!==1?'s':''}</small></b>}</div>;}
