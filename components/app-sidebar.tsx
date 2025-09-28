"use client"

import * as React from "react"
import Link from "next/link"
import { useSession, signOut } from "@/lib/auth-client"
import {
  IconDashboard,
  IconFile,
  IconFolder,
  IconMoneybag,
  IconReport,
  IconSettings,
  IconTrendingUp,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  
  const handleSignOut = async () => {
    await signOut()
    router.push("/sign-in")
  }

  const userData = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email,
    avatar: session.user.image || "/codeguide-logo.png",
  } : {
    name: "Guest",
    email: "guest@example.com", 
    avatar: "/codeguide-logo.png",
  }

  // Translated navigation items
  const translatedNavMain = [
    {
      title: t('dashboard'),
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: t('transactions'),
      url: "/dashboard/transactions",
      icon: IconMoneybag,
    },
    {
      title: t('assets'),
      url: "/dashboard/assets",
      icon: IconFolder,
    },
    {
      title: t('investments'),
      url: "/dashboard/investments",
      icon: IconTrendingUp,
    },
    {
      title: t('documents'),
      url: "/dashboard/documents",
      icon: IconFile,
    },
    {
      title: t('reports'),
      url: "/dashboard/reports",
      icon: IconReport,
    },
  ]

  const translatedNavSecondary = [
    {
      title: t('settings'),
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <span className="text-base font-semibold font-parkinsans">{t('finance_app')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={translatedNavMain} />
        <NavSecondary items={translatedNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser 
          user={userData} 
          onSignOut={handleSignOut}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
