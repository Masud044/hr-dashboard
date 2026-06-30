import React, { useEffect, useState } from "react";
import {
  BadgeCheckIcon,
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  SparklesIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";

export default function UserDropDown() {
  const { user, logout } = useAuthV2();
  const navigate = useNavigate();
  const BASE = import.meta.env.VITE_API_BASE_URL;

  const [avatarTs, setAvatarTs] = useState(() => Date.now());

  useEffect(() => {
    const handler = () => setAvatarTs(Date.now());
    window.addEventListener("avatar-updated", handler);
    return () => window.removeEventListener("avatar-updated", handler);
  }, []);

  const avatarSrc = user?.id
    ? `${BASE}/api/emp-images/person/${user.id}?t=${avatarTs}`
    : user?.avatar;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 rounded-none cursor-pointer">
          <AvatarImage src={avatarSrc} alt={user.username} />
          <AvatarFallback className="rounded-md bg-primary text-primary-foreground font-bold">
            {user.username?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

    <DropdownMenuContent
  className="w-56 rounded-md border-border shadow-lg p-0 overflow-hidden z-[200]"
  sideOffset={4}
  align="end"
>
        {/* ── Identity Header ── */}
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-3 py-3">
            <Avatar className="size-8 rounded-md shrink-0">
              <AvatarImage src={avatarSrc} alt={user.username} />
              <AvatarFallback className="rounded-md bg-primary text-primary-foreground font-bold text-sm">
                {user.username?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-bold text-sm text-foreground">
                {user.username}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                Role: {user.roles} user
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="m-0" />

        {/* ── Upgrade ── */}
        <DropdownMenuGroup>
          <DropdownMenuItem className="rounded-none px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-primary focus:bg-accent focus:text-primary cursor-pointer gap-2.5">
            <SparklesIcon className="size-4" />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="m-0" />

        {/* ── Account group ── */}
        <DropdownMenuGroup>
          <DropdownMenuItem className="rounded-none px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground cursor-pointer gap-2.5">
            <BadgeCheckIcon className="size-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-none px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground cursor-pointer gap-2.5">
            <CreditCardIcon className="size-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-none px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground cursor-pointer gap-2.5">
            <BellIcon className="size-4" />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="m-0" />

        {/* ── Logout ── */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-none px-3 py-2 text-sm text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2.5"
        >
          <LogOutIcon className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
