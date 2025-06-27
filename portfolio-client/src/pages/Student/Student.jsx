import { Box } from '@mui/material'
import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Filter from '../../components/Filter/Filter'
import Table from '../../components/Table/Table'

import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'

// localStorage dan viewMode ni o'qish yoki default qiymat
const getInitialViewMode = () => {
	try {
		const saved = localStorage.getItem('studentTableViewMode')
		return saved || 'table'
	} catch (error) {
		console.error('Error reading viewMode from localStorage:', error)
		return 'table'
	}
}

const Student = ({ OnlyBookmarked = false }) => {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	// Initial filter state
	const initialFilterState = {
		search: '',
		it_skills: [],
		jlpt: [],
		jdu_japanese_certification: [],
		partner_university: [],
		other_information: '',
	}

	const [filterState, setFilterState] = useState(initialFilterState)
	const [students, setStudents] = useState([])
	const [viewMode, setViewMode] = useState(getInitialViewMode()) // localStorage dan olish
	const [updatedBookmark, setUpdatedBookmark] = useState({
		studentId: null,
		timestamp: new Date().getTime(),
	})
	const recruiterId = JSON.parse(sessionStorage.getItem('loginUser')).id

	// localStorage ga viewMode ni saqlash
	useEffect(() => {
		try {
			localStorage.setItem('studentTableViewMode', viewMode)
		} catch (error) {
			console.error('Error saving viewMode to localStorage:', error)
		}
	}, [viewMode])

	const filterFields = [
		{
			key: 'it_skills',
			label: t('programming_languages'),
			type: 'checkbox',
			options: ['JS', 'Python', 'Java', 'SQL'],
		},
		{
			key: 'jlpt',
			label: t('jlpt'),
			type: 'checkbox',
			options: ['N1', 'N2', 'N3', 'N4', 'N5'],
		},
		{
			key: 'jdu_japanese_certification',
			label: t('jdu_certification'),
			type: 'checkbox',
			options: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
		},
		{
			key: 'partner_university',
			label: t('partner_university'),
			type: 'checkbox',
			options: [
				t('tokyo_communication_university'),
				t('sanno_junior_college'),
				t('kyoto_university'),
				t('otemae_university'),
				t('niigata_university'),
			],
		},
		{
			key: 'other_information',
			label: t('special_skills'),
			type: 'radio',
			options: [t('yes'), t('no')],
		},
	]

	const handleFilterChange = useCallback(newFilterState => {
		setFilterState(newFilterState)
		console.log('Filter changed:', newFilterState)
	}, [])

	// ✅ Debug logging qo'shish
	const handleViewModeChange = useCallback(
		newMode => {
			console.log('Current viewMode:', viewMode)
			console.log('Switching to:', newMode)
			setViewMode(newMode)
		},
		[viewMode]
	)

	const navigate = useNavigate()

	const navigateToProfile = student => {
		navigate(`profile/${student.id}`)
	}

	const addToBookmark = async student => {
		try {
			const response = await axios.post('/api/bookmarks/toggle', {
				studentId: student.id,
				recruiterId,
			})
			setUpdatedBookmark({
				studentId: response.data.studentId,
				timestamp: new Date().getTime(),
			})
		} catch (error) {
			console.error('Error bookmarking student:', error)
		}
	}

	const headers = [
		{
			id: 'first_name',
			numeric: false,
			disablePadding: true,
			label: t('student'),
			type: 'avatar',
			minWidth: '220px',
			onClickAction: navigateToProfile,
		},
		{
			id: 'age',
			numeric: true,
			disablePadding: false,
			label: '年齢',
			minWidth: '80px',
			suffix: ' 歳',
		},
		{
			id: 'jlpt',
			numeric: true,
			disablePadding: false,
			label: t('jlpt'),
			minWidth: '160px',
			isJSON: true,
		},
		{
			id: 'partner_university',
			numeric: false,
			disablePadding: false,
			label: t('partner_university'),
			isJSON: false,
		},
		{
			id: 'expected_graduation_year',
			numeric: true,
			disablePadding: false,
			label: '卒業予定年（月）',
			minWidth: '160px',
		},
		{
			id: 'bookmark',
			numeric: false,
			disablePadding: true,
			label: '',
			type: 'bookmark',
			role: 'Recruiter',
			onClickAction: addToBookmark,
		},
	]

	const tableProps = {
		headers: headers,
		dataLink: '/api/students',
		filter: filterState,
		recruiterId: recruiterId,
		OnlyBookmarked: OnlyBookmarked,
	}

	// ✅ Debug logging
	console.log('Current viewMode in Parent:', viewMode)

	return (
		<div key={language}>
			<Box sx={{ width: '100%', height: '100px' }}>
				<Filter
					fields={filterFields}
					filterState={filterState}
					onFilterChange={handleFilterChange}
					viewMode={viewMode}
					onViewModeChange={handleViewModeChange}
					persistKey='students-filter-v1'
				/>
			</Box>
			{/* ✅ viewMode prop qo'shildi */}
			<Table
				tableProps={tableProps}
				updatedBookmark={updatedBookmark}
				viewMode={viewMode}
			/>
		</div>
	)
}

export default Student
