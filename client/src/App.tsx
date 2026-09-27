import { Route, Routes } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './pages/Dashboard';
import { Servers } from './pages/Servers';
import { Stacks } from './pages/Stacks';
import { Settings } from './pages/Settings';

export default function App() {
	return (
		<Routes>
			<Route element={<Shell />}>
				<Route index element={<Dashboard />} />
				<Route path="servers" element={<Servers />} />
				<Route path="stacks" element={<Stacks />} />
				<Route path="settings" element={<Settings />} />
			</Route>
		</Routes>
	);
}
