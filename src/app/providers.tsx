'use client'

import Link, { LinkProps } from 'next/link'
import { SaasProvider, ModalsProvider } from '@saas-ui/react'
import React from 'react'
import { theme } from './theme';
const NextLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link ref={ref} {...props} />
);

NextLink.displayName = 'NextLink'; // Add display name

export function Providers({ children }: { children: React.ReactNode }) {
  return <SaasProvider theme={theme} linkComponent={NextLink}><ModalsProvider>{children}</ModalsProvider></SaasProvider>;
}
