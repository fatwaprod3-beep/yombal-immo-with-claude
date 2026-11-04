'use client';
import PrivateImage from './private-image';
import type {Profile} from '../lib/model';

/** One rendering for the header, sidebar and profile preview. */
export default function ProfileAvatar({profile,fallback='',className=''}:{profile:Profile;fallback?:string;className?:string}){
 const style=profile.imageStyle||(profile.mode==='agency'?'logo':'photo');
 return <span className={'avatar profile-image '+className} data-image-style={style} data-has-image={!!profile.image}>{profile.image?<PrivateImage src={profile.image} alt=""/>:fallback}</span>;
}
