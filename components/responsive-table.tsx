'use client';
import {Children,cloneElement,isValidElement,type ReactNode} from 'react';

type ElementProps={children?:ReactNode;role?:string;scope?:string;'data-label'?:string};
function labelText(children:ReactNode):string {
  return Children.toArray(children).map(child=>typeof child==='string'||typeof child==='number'?String(child):isValidElement<ElementProps>(child)?labelText(child.props.children):'').join(' ').trim();
}
/** Keep table semantics on desktop; label each value when rows stack on mobile. */
export default function ResponsiveTable({children,className='',label}:{children:ReactNode;className?:string;label?:string}) {
  const parts=Children.toArray(children);
  const head=parts.find(child=>isValidElement(child)&&child.type==='thead');
  const headers:string[]=[];
  if(isValidElement<ElementProps>(head))Children.forEach(head.props.children,row=>{
    if(isValidElement<ElementProps>(row))Children.toArray(row.props.children).forEach(cell=>{if(isValidElement<ElementProps>(cell))headers.push(labelText(cell.props.children)||'Actions');});
  });
  const sections=parts.map(part=>{
    if(!isValidElement<ElementProps>(part)||!['thead','tbody','tfoot'].includes(String(part.type)))return part;
    const heading=part.type==='thead';
    return cloneElement(part,{role:'rowgroup'},Children.map(part.props.children,row=>{
      if(!isValidElement<ElementProps>(row)||row.type!=='tr')return row;
      return cloneElement(row,{role:'row'},Children.toArray(row.props.children).map((cell,index)=>{
        if(!isValidElement<ElementProps>(cell)||!['th','td'].includes(String(cell.type)))return cell;
        return cloneElement(cell,heading?{role:'columnheader',scope:'col'}:{role:'cell','data-label':headers[index]||'Actions'});
      }));
    }));
  });
  return <table className={'data-table responsive-table '+className} role="table" aria-label={label}>{sections}</table>;
}
