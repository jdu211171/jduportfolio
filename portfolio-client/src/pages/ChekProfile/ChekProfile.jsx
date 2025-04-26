import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Table from '../../components/Table/Table'
import Filter from '../../components/Filter/Filter'

import axios from '../../utils/axiosUtils'
import { useAlert } from '../../contexts/AlertContext'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'

const Student = ({ OnlyBookmarked = false }) => {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key
	const [filterState, setFilterState] = useState({})

	const showAlert = useAlert()

	const [updatedBookmark, setUpdatedBookmark] = useState({
		studentId: null,
		timestamp: new Date().getTime(),
	})
	const userId = JSON.parse(sessionStorage.getItem('loginUser')).id

	const filterProps = [
		//{
		//  key: "semester",
		//  label: t("grade"), // Переводится
		//  type: "checkbox",
		//  options: [t("grade1"), t("grade2"), t("grade3"), t("grade4")],
		//  minWidth: "120px",
		//},
		{
			key: 'it_skills',
			label: t('programming_languages'),
			type: 'checkbox',
			options: ['JS', 'Python', 'Java', 'SQL'],
			minWidth: '160px',
		},
		{
			key: 'jlpt',
			label: t('jlpt'),
			type: 'checkbox',
			options: ['N1', 'N2', 'N3', 'N4', 'N5'],
			minWidth: '160px',
		},
		{
			key: 'jdu_japanese_certification',
			label: t('jdu_certification'),
			type: 'checkbox',
			options: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
			minWidth: '160px',
		},
		//{
		//  key: "partner_university_credits",
		//  label: t("credits"),
		//  type: "radio",
		//  options: ["20", "40", "60", "80", "100"],
		//  unit: t("credits_unit"),
		//  minWidth: "160px",
		//},
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
			minWidth: '160px',
		},
		{
			key: 'other_information',
			label: t('special_skills'),
			type: 'radio',
			options: [t('yes'), t('no')],
			minWidth: '160px',
		},
		{
			key: 'draft_status',
			label: t('confirmationStatus'),
			type: 'checkbox',
			options: [
				t('submitted'),
				t('checking'),
				//t("resubmission_required"),
				t('approved'),
			],
			minWidth: '160px',
		},
		{
			key: 'approval_status',
			label: t('approvalStatus'),
			type: 'checkbox',
			options: [t('not_approved_yet'), t('approved'), t('disapproved')],
			minWidth: '160px',
		},
		{
			key: 'visibility',
			label: t('visible_status'),
			type: 'checkbox',
			options: [t('visible'), t('invisible')],
			minWidth: '160px',
		},
	]

	const handleFilterChange = newFilterState => {
		setFilterState(newFilterState)
	}

	const navigate = useNavigate()

	const navigateToProfile = student => {
		navigate(`profile/${student.id}/top`, { state: { student } })
	}

	const updateDraftStatus = async (draftId, status) => {
		const res = await axios.put(`/api/draft/status/${draftId}`, {
			status: status,
			reviewed_by: userId,
		})
		if (res.status == 200) {
			showAlert(t['profileConfirmed'], 'success')
			return true
		} else {
			return false
		}
	}

	const setProfileVisibility = async (id, visibility) => {
		try {
			if (visibility) {
				const student = await axios.get(`/api/students/${id}`)
				const studentId = student.data.student_id

				const draftsResponse = await axios.get(
					`/api/draft/student/${studentId}`
				)

				if (
					draftsResponse.data &&
					draftsResponse.data.draft &&
					draftsResponse.data.draft.status === 'approved'
				) {
					const profileData = draftsResponse.data.draft.profile_data || {}
					const res = await axios.put(`/api/students/${id}`, {
						...profileData,
						visibility: true,
					})

					if (res.status === 200) {
						showAlert(t['profileVisibilityEnabled'], 'success')
						return true
					}
				} else {
					const res = await axios.put(`/api/students/${id}`, {
						visibility: true,
					})

					if (res.status === 200) {
						showAlert(t['profileVisibilityEnabled'], 'success')
						return true
					}
				}
			} else {
				const res = await axios.put(`/api/students/${id}`, {
					visibility: false,
				})

				if (res.status === 200) {
					showAlert(t['profileHidden'], 'success')
					return true
				}
			}

			return false
		} catch (error) {
			console.error('Error setting profile visibility:', error)
			showAlert(t['errorSettingVisibility'], 'error')
			return false
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
			id: 'draft',
			subkey: 'updated_at',
			numeric: true,
			type: 'date',
			disablePadding: false,
			label: t('submit_date'),
			minWidth: '110px',
		},
		{
			id: 'draft',
			subkey: 'submit_count',
			numeric: true,
			disablePadding: false,
			label: t('submit_count'),
			minWidth: '60px',
		},
		{
			id: 'draft',
			subkey: 'status',
			type: 'mapped',
			numeric: false,
			disablePadding: false,
			label: t('check_status'),
			minWidth: '70px',
			map: {
				submitted: '未確認',
				checking: '確認中',
				resubmission_required: '確認済',
				approved: '承認済',
			},
		},
		{
			id: 'draft',
			subkey: 'status',
			keyIdentifier: 'approval_status',
			type: 'mapped',
			numeric: false,
			disablePadding: false,
			label: '承認状況',
			minWidth: '30px',
			map: {
				draft: '未承認',
				submitted: '未承認',
				checking: '未承認',
				resubmission_required: '差し戻し',
				disapproved: '差し戻し',
				approved: '承認済',
			},
		},
		{
			id: 'visibility',
			numeric: false,
			type: 'status',
			disablePadding: false,
			label: t('visible_status'),
			minWidth: '60px',
		},
		{
			id: 'email',
			numeric: false,
			type: 'email',
			disablePadding: false,
			label: t('email'),
			minWidth: '60px',
		},
		{
			id: 'action',
			numeric: false,
			disablePadding: true,
			label: t(''),
			isJSON: false,
			type: 'action',
			minWidth: '20px',
			options: [
				{
					visibleTo: 'Staff',
					label: '確認開始',
					action: id => {
						updateDraftStatus(id, 'checking')
					},
				},
				{
					visibleTo: 'Admin',
					label: '公開',
					action: id => {
						setProfileVisibility(id, true)
					},
					shouldShow: row => row.draft && row.draft.status === 'approved',
				},
				{
					visibleTo: 'Admin',
					label: '非公開',
					action: id => {
						setProfileVisibility(id, false)
					},
				},
			],
		},
	]

	const tableProps = {
		headers: headers,
		dataLink: '/api/draft',
		filter: filterState,
		recruiterId: userId,
		OnlyBookmarked: OnlyBookmarked,
	}

	return (
		<div key={language}>
			<Box sx={{ width: '100%', height: '100px' }}>
				<Filter
					fields={filterProps}
					filterState={filterState}
					onFilterChange={handleFilterChange}
				/>
			</Box>
			<Table tableProps={tableProps} updatedBookmark={updatedBookmark} />
		</div>
	)
}

export default Student
