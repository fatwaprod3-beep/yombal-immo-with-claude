'use client';
import ImageField from './image-field';
export default function TenantPhoto(props:{value:string;onChange:(v:string)=>void;demo:boolean;onBusy?:(v:boolean)=>void}){return <ImageField {...props} label="Photo du locataire (facultative)"/>;}
