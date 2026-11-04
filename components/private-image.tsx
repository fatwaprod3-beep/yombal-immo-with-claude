'use client';
import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { ImageOff } from 'lucide-react';
import { privateImageData } from '../lib/api-fetch';

/** Authenticated image transport; the private storage URL stays unchanged in the record. */
export default function PrivateImage({src, alt='', ...props}: ImgHTMLAttributes<HTMLImageElement> & {src:string}) {
  const [image,setImage] = useState({src:'', data:''});
  const [failed,setFailed] = useState(false);
  const privateFile = src.startsWith('/api/files?key=');
  useEffect(() => {
    if (!privateFile) return;
    const controller = new AbortController();
    setFailed(false);
    privateImageData(src,controller.signal).then(data => {
      if (!controller.signal.aborted) setImage({src,data});
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  },[src,privateFile]);
  if (failed) return <span className="private-image-error" role="img" aria-label={alt+' · image indisponible'} title="Image indisponible. Ouvrez la fiche pour la réimporter."><ImageOff size={19}/></span>;
  const resolved = privateFile ? image.src===src ? image.data : '' : src;
  return resolved ? <img {...props} src={resolved} alt={alt} onError={()=>setFailed(true)}/> : <span className="private-image-loading" role="status" aria-label="Chargement de l’image"/>;
}
