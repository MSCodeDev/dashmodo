import { AppShell, Group, NavLink, Text } from '@mantine/core';
import { NavLink as RouterNavLink, Outlet, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
	{ label: 'Dashboard', to: '/' },
	{ label: 'Servers', to: '/servers' },
	{ label: 'Stacks', to: '/stacks' },
	{ label: 'Settings', to: '/settings' }
];

export function Shell() {
	const location = useLocation();

	return (
		<AppShell header={{ height: 56 }} navbar={{ width: 200, breakpoint: 'sm' }} padding="md">
			<AppShell.Header>
				<Group h="100%" px="md">
					<Text fw={700}>dashmodo</Text>
				</Group>
			</AppShell.Header>
			<AppShell.Navbar p="xs">
				{NAV_ITEMS.map((item) => (
					<NavLink
						key={item.to}
						component={RouterNavLink}
						to={item.to}
						label={item.label}
						active={location.pathname === item.to}
					/>
				))}
			</AppShell.Navbar>
			<AppShell.Main>
				<Outlet />
			</AppShell.Main>
		</AppShell>
	);
}
