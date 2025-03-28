import React, { useState } from 'react'

import { Box } from '@mui/material'

import Table from '../../components/Table/Table'
import Filter from '../../components/Filter/Filter'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'

const Staff = () => {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	const headers = [
		{
			id: 'first_name',
			numeric: false,
			disablePadding: false,
			label: t('staff'),
			type: 'avatar',
			minWidth: '220px',
		},
		{
			id: 'email',
			numeric: false,
			disablePadding: false,
			label: t('email'),
			type: 'email',
			minWidth: '160px',
		},
		{
			id: 'department',
			numeric: false,
			disablePadding: false,
			label: t('department'),
			minWidth: '160px',
		},
		{
			id: 'position',
			numeric: false,
			disablePadding: false,
			label: t('position'),
			minWidth: '160px',
		},
		{
			id: 'phone',
			numeric: true,
			disablePadding: false,
			label: t('phone_number'),
			minWidth: '200px',
		},
	]

	const [filterState, setFilterState] = useState({})
	const filterProps = [
		{ key: 'name', label: t('name'), type: 'text', minWidth: '160px' },
	]

	const tableProps = {
		headers: headers,
		dataLink: '/api/staff',
		filter: filterState,
	}

	const handleFilterChange = value => {
		setFilterState(value)
	}

	return (
		<div>
			<Box sx={{ width: '100%', height: '100px' }}>
				<Filter
					fields={filterProps}
					filterState={filterState}
					onFilterChange={handleFilterChange}
				/>
			</Box>
			<Table tableProps={tableProps} />
		</div>
	)
}

export default Staff
