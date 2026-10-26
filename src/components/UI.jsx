import {ArrowUpRight} from 'lucide-react';
export const ProgressBar=({value,max=4,label='Progress'})=><progress aria-label={label} value={value} max={max}/>;
export const External=({href,children})=><a className="resource" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={17}/></a>;
export const PageHead=({eyebrow,title,children})=><header className="page-head"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children&&<p className="muted">{children}</p>}</header>;
