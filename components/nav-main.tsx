"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/language-context"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

  const handleQuickCreate = () => {
    // Navigate to transactions page and trigger the modal
    router.push("/dashboard/transactions?quickCreate=true")
    toast.info(t("quick_add_transaction"), {
      description: t("redirecting_to_transactions"),
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip={t("quick_add")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              onClick={handleQuickCreate}
            >
              <IconCirclePlusFilled />
              <span>{t("quick_add")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url))
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={t(item.title.toLowerCase())}
                  className={isActive ? "bg-muted" : ""}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{t(item.title.toLowerCase())}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
