import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Table from '../../components/Table/Table'
import Filter from '../../components/Filter/Filter'

import axios from '../../utils/axiosUtils'
import { useAlert } from '../../contexts/AlertContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { UserContext } from '../../contexts/UserContext'
import translations from '../../locales/translations'

const Student = ({ OnlyBookmarked = false }) => {
	const { language } = useLanguage()
	const { role } = useContext(UserContext)
	const t = key => translations[language][key] || key
	const [filterState, setFilterState] = useState({
		search: '',
	})

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
				t('sanno_university'),
				t('forty_credit_model'),
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
		navigate(`profile/${student.student_id}/top`, { state: { student } })
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

	// New function to update draft status with comments
	const updateDraftStatusWithComments = async (
		draftId,
		status,
		comments = ''
	) => {
		try {
			const res = await axios.put(`/api/draft/status/${draftId}`, {
				status: status,
				reviewed_by: userId,
				comments: comments,
			})
			if (res.status === 200) {
				showAlert(t('statusUpdatedSuccessfully'), 'success')
				return true
			} else {
				return false
			}
		} catch (error) {
			showAlert(t('errorUpdatingStatus'), 'error')
			return false
		}
	}

	const setProfileVisibility = async (studentId, visibility) => {
		try {

			if (visibility) {

				const draftsResponse = await axios.get(
					`/api/draft/student/${studentId}`
				)


				if (
					draftsResponse.data &&
					draftsResponse.data.draft &&
					draftsResponse.data.draft.status === 'approved'
				) {
					const profileData = draftsResponse.data.draft.profile_data || {}

					// Use studentId (student_id) for API calls
					const res = await axios.put(`/api/students/${studentId}`, {
						...profileData,
						visibility: true,
					})


					if (res.status === 200) {
						showAlert(t['profileVisibilityEnabled'], 'success')
						return true
					} else {
						return false
					}
				} else {

					// Use studentId (student_id) for API calls
					const res = await axios.put(`/api/students/${studentId}`, {
						visibility: true,
					})


					if (res.status === 200) {
						showAlert(t['profileVisibilityEnabled'], 'success')
						return true
					} else {
						return false
					}
				}
			} else {

				// For visibility=false, we don't need to get additional data
				// since we already have studentId parameter

				// Use studentId (student_id) for API calls
				const res = await axios.put(`/api/students/${studentId}`, {
					visibility: false,
				})


				if (res.status === 200) {
					showAlert(t['profileHidden'], 'success')
					return true
				} else {
					return false
				}
			}
		} catch (error) {
			showAlert(
				t['errorSettingVisibility'] || 'Error setting visibility',
				'error'
			)
			return false
		}
	}

	const headers = [
		{
			id: 'first_name',
			numeric: false,
			disablePadding: true,
			label: '学生',
			type: 'avatar',
			minWidth: '220px',
			onClickAction: navigateToProfile,
		},
		{
			id: 'student_id',
			numeric: false,
			disablePadding: false,
			label: '学生ID',
			minWidth: '120px',
		},
		{
			id: 'age',
			numeric: true,
			disablePadding: false,
			label: '年齢',
			minWidth: '80px !important',
			suffix: ' 歳',
		},
		{
			id: 'draft',
			subkey: 'updated_at',
			numeric: true,
			type: 'date',
			disablePadding: false,
			label: '申請日',
			minWidth: '120px',
		},
		{
			id: 'draft',
			subkey: 'submit_count',
			numeric: true,
			disablePadding: false,
			label: '申請回数',
			minWidth: '100px',
		},
		{
			id: 'draft',
			subkey: 'changed_fields',
			type: 'changed_fields',
			numeric: false,
			disablePadding: false,
			label: '変更項目',
			minWidth: '120px',
		},
		{
			id: 'draft',
			subkey: 'status',
			type: 'status_icon',
			numeric: false,
			disablePadding: false,
			label: '確認状況',
			minWidth: '100px',
			statusMap: {
				submitted: { icon: 'pending', color: '#ff9800', text: '未確認' },
				checking: { icon: 'pending', color: '#ff9800', text: '確認中' },
				resubmission_required: {
					icon: 'approved',
					color: '#4caf50',
					text: '確認済',
				},
				approved: { icon: 'approved', color: '#4caf50', text: '承認済' },
			},
		},
		{
			id: 'confirmation_status',
			keyIdentifier: 'approval_status',
			type: 'confirmation_status',
			numeric: false,
			disablePadding: false,
			label: '承認状況',
			minWidth: '100px',
		},
		{
			id: 'visibility',
			keyIdentifier: 'visibility_toggle',
			numeric: false,
			type: 'visibility_toggle',
			disablePadding: false,
			label: '公開状況',
			minWidth: '100px',
			onToggle: (row, visibility) =>
				setProfileVisibility(row.student_id, visibility),
			disabled: role === 'Staff', // Disable for staff users
		},
		{
			id: 'email',
			numeric: false,
			type: 'email',
			disablePadding: false,
			label: 'メール',
			minWidth: '200px',
		},
	]

	const tableProps = {
		headers: headers,
		dataLink: '/api/draft',
		filter: filterState,
		recruiterId: userId,
		OnlyBookmarked: OnlyBookmarked,
		updateDraftStatusWithComments: updateDraftStatusWithComments,
		userRole: role,
	}

	return (
		<div key={language}>
			<Box sx={{ width: '100%', height: '100px' }}>
				<Filter
					fields={filterProps}
					filterState={filterState}
					onFilterChange={handleFilterChange}
					disableStudentIdSearch={true}
				/>
			</Box>
			<Table tableProps={tableProps} updatedBookmark={updatedBookmark} />
		</div>
	)
}

export default Student
