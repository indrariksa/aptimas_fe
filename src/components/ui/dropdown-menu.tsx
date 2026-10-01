import type { ComponentProps, ReactNode } from 'react'
import * as Menu from '@radix-ui/react-dropdown-menu'
import { cn } from '../../lib/utils.ts'

export function DropdownMenu({ trigger, children, align = 'end' }: { trigger: ReactNode; children: ReactNode; align?: 'start' | 'end' }) {
  return <Menu.Root><Menu.Trigger asChild>{trigger}</Menu.Trigger><Menu.Portal>
    <Menu.Content className="dropdown-content" align={align} sideOffset={8}>{children}</Menu.Content>
  </Menu.Portal></Menu.Root>
}

export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof Menu.Item>) {
  return <Menu.Item className={cn('dropdown-item', className)} {...props} />
}
export function DropdownMenuLabel({ children }: { children: ReactNode }) { return <Menu.Label className="dropdown-label">{children}</Menu.Label> }
export function DropdownMenuSeparator() { return <Menu.Separator className="dropdown-separator" /> }
