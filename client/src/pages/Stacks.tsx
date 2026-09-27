import { useMemo, useState } from 'react';
import { Loader, Stack, Text, TextInput, Title } from '@mantine/core';
import { useStacks } from '../hooks/useStacks';
import { StackTable } from '../components/stacks/StackTable';
import { ApiErrorAlert } from '../components/common/ApiErrorAlert';

export function Stacks() {
	const { data, isLoading, isError, error } = useStacks();
	const [search, setSearch] = useState('');

	const filtered = useMemo(() => {
		if (!data) return [];
		const q = search.trim().toLowerCase();
		if (!q) return data;
		return data.filter(
			(s) => s.name.toLowerCase().includes(q) || s.info.server_name?.toLowerCase().includes(q)
		);
	}, [data, search]);

	return (
		<Stack>
			<Title order={2}>Stacks</Title>

			<TextInput
				placeholder="Search stacks..."
				value={search}
				onChange={(e) => setSearch(e.currentTarget.value)}
				maw={320}
			/>

			{isLoading ? <Loader /> : null}

			{isError ? <ApiErrorAlert error={error} /> : null}

			{data && data.length === 0 ? <Text c="dimmed">No stacks found.</Text> : null}
			{data && data.length > 0 && filtered.length === 0 ? (
				<Text c="dimmed">No stacks match "{search}".</Text>
			) : null}

			{filtered.length > 0 ? <StackTable stacks={filtered} /> : null}
		</Stack>
	);
}
