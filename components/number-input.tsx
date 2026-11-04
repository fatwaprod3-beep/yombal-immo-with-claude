'use client';
import type {InputHTMLAttributes} from 'react';
export default function NumberInput({value,onFocus,...props}:InputHTMLAttributes<HTMLInputElement>){return <input {...props} type="number" value={value===0||value==='0'?'':value} placeholder={props.placeholder??'0'} onFocus={e=>{e.currentTarget.select();onFocus?.(e);}}/>;}
