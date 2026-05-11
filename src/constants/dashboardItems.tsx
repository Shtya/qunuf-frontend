import { LuLayoutDashboard } from 'react-icons/lu';
import { FaHeadset, FaRegNewspaper } from 'react-icons/fa';
import { MdOutlineFactCheck, MdOutlinePayments, MdOutlineSettingsApplications } from 'react-icons/md';
import { Role } from '@/types/global';
import { ComponentType, SVGProps } from 'react';
import { TbBuildingCommunity, TbContract } from 'react-icons/tb';
import { PiBuildingApartment } from 'react-icons/pi';
import { IoAnalytics, IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';
import { getDashboardHref } from '@/utils/dashboardPaths';
import { GrContact } from 'react-icons/gr';
import { HiOutlineUserGroup, HiOutlineUsers } from 'react-icons/hi2';

export type SidebarLink = {
    href: string;
    order: number;
    key: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    className?: string;
    disabled?: boolean;
};



export function getDashboardItems(role: Role, adminUserId?: string): SidebarLink[] {
    const commonLinks: SidebarLink[] = [
        { href: getDashboardHref('root'), key: 'dashboard', Icon: LuLayoutDashboard, order: 1 },
        { href: getDashboardHref('settings'), key: 'settings', Icon: IoSettingsOutline,  order: 20 },
        // { href: getDashboardHref('logout') , key: 'logout', Icon: IoLogOutOutline,  order: 20 } as any,
    ]
    const tenantLinks: SidebarLink[] = [
        { href: getDashboardHref('contracts'), key: 'contracts', Icon: TbContract, order: 2 },
        { href: getDashboardHref('renewRequests'), key: 'renewRequests', Icon: MdOutlineFactCheck, order: 3 },
        // { href: getDashboardHref('paymentHistory'), key: 'paymentHistory', Icon: MdOutlinePayments, order: 4 },
        { href: getDashboardHref('chats', { user: adminUserId }), key: 'support', Icon: FaHeadset, order: 20, disabled: !adminUserId },
    ];


    const landlordLinks: SidebarLink[] = [
        { href: getDashboardHref('contracts'), key: 'contracts', Icon: TbContract, order: 2 },
        { href: getDashboardHref('properties'), key: 'properties', Icon: PiBuildingApartment, order: 3 },
        // { href: getDashboardHref('renewRequests'), key: 'renewRequests', Icon: MdOutlineFactCheck, order: 4 },
        // { href: getDashboardHref('revenueSummary'), key: 'revenueSummary', Icon: IoAnalytics, order: 5 },
        { href: getDashboardHref('chats', { user: adminUserId }), key: 'support', Icon: FaHeadset, order: 20, disabled: !adminUserId },
    ];

    const adminLinks: SidebarLink[] = [
        { href: getDashboardHref('properties'), key: 'properties', Icon: PiBuildingApartment, order: 1 },
        { href: getDashboardHref('contracts'), key: 'contracts', Icon: TbContract, order: 3 },
        { href: getDashboardHref('users'), key: 'users', Icon: HiOutlineUsers, order: 4 },
        { href: getDashboardHref('contactUs'), key: 'contactUs', Icon: GrContact, order: 5 },
        { href: getDashboardHref('blogs'), key: 'blogs', Icon: FaRegNewspaper, order: 6 },
        { href: getDashboardHref('teamMembers'), key: 'teamMembers', Icon: HiOutlineUsers, order: 7 },
        { href: getDashboardHref('aboutUs'), key: 'aboutUs', Icon: HiOutlineUserGroup, order: 8 },
        { href: getDashboardHref('departments'), key: 'departments', Icon: TbBuildingCommunity, order: 9 },
        { href: getDashboardHref('websiteSettings'), key: 'websiteSettings', Icon: MdOutlineSettingsApplications, order: 10 }
    ];


    switch (role) {
        case "tenant":
            return [...commonLinks, ...tenantLinks];
        case "landlord":
            return [...commonLinks, ...landlordLinks];
        case "admin":
            return [...commonLinks, ...adminLinks];
        default:
            return commonLinks; // fallback if role is missing
    }
}
