import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Box } from '@mui/material'

import Table from '../../components/Table/Table'
import Filter from '../../components/Filter/Filter'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'

const Recruiter = () => {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key
	const navigate = useNavigate()

	const navigateToCompanyProfile = recruiter => {
		navigate(`/companyprofile`, {
			state: { recruiterId: recruiter.id }, // passing state
		})
	}

	const deleteRecruiter = async recruiterId => {
		try {
			await axios.delete(`/api/recruiters/${recruiterId}`)

			// Refresh the table by updating a state that triggers re-fetch
			setRefreshTrigger(prev => prev + 1)
		} catch (error) {
			console.error('Error deleting recruiter:', error)
			alert('リクルーターの削除に失敗しました。')
		}
	}

	const [refreshTrigger, setRefreshTrigger] = useState(0)

	const headers = [
		{
			id: 'name',
			numeric: false,
			disablePadding: true,
			label: t('recruiter'),
			type: 'avatar',
			minWidth: '160px',
			onClickAction: navigateToCompanyProfile,
		},
		{
			id: 'company_name',
			numeric: false,
			disablePadding: false,
			label: t('company_name'),
			minWidth: '220px',
		},
		{
			id: 'phone',
			numeric: true,
			disablePadding: false,
			label: t('phone_number'),
			minWidth: '160px',
		},
		{
			id: 'email',
			numeric: false,
			disablePadding: false,
			label: t('email'),
			type: 'email',
			minWidth: '220px',
			visibleTo: ['Admin', 'Staff'],
		},
		{
			id: 'delete',
			numeric: false,
			disablePadding: true,
			label: '削除',
			type: 'delete_icon',
			minWidth: '80px',
			visibleTo: ['Admin'],
			onClickAction: deleteRecruiter,
		},
	]

	const [filterState, setFilterState] = useState({})
	// must match with db table col names
	const filterProps = [
		{ key: 'name', label: t('name'), type: 'text', minWidth: '160px' },
	]

	const tableProps = {
		headers: headers,
		dataLink: '/api/recruiters',
		filter: filterState,
		refreshTrigger: refreshTrigger,
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

export default Recruiter
