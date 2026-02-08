import * as Icons from 'lucide-react';

export default function Icon({ name, size = 18, ...props }) {
  const LucideIcon = Icons[name];
  if (!LucideIcon) return <Icons.Circle size={size} {...props} />;
  return <LucideIcon size={size} {...props} />;
}
