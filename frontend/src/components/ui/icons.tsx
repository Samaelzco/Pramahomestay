import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: ReactNode }) {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>;
}

export const HomeIcon = (props: IconProps) => <Icon {...props}><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></Icon>;
export const GridIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></Icon>;
export const CalendarIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="5" width="18" height="16" /><path d="M8 3v4M16 3v4M3 10h18" /></Icon>;
export const BedIcon = (props: IconProps) => <Icon {...props}><path d="M3 19v-8M21 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2h18M7 11V7h5a3 3 0 0 1 3 3v1" /></Icon>;
export const UsersIcon = (props: IconProps) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>;
export const ChartIcon = (props: IconProps) => <Icon {...props}><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></Icon>;
export const SearchIcon = (props: IconProps) => <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>;
export const PlusIcon = (props: IconProps) => <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>;
export const ArrowLeftIcon = (props: IconProps) => <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>;
export const LogOutIcon = (props: IconProps) => <Icon {...props}><path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /></Icon>;
export const MenuIcon = (props: IconProps) => <Icon {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;
export const XIcon = (props: IconProps) => <Icon {...props}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
export const ImageIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></Icon>;
export const TrashIcon = (props: IconProps) => <Icon {...props}><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" /></Icon>;
export const WalletIcon = (props: IconProps) => <Icon {...props}><path d="M4 6.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2h11" /><path d="M15 11h6v5h-6a2.5 2.5 0 0 1 0-5Z" /><path d="M16.5 13.5h.01" /></Icon>;
