import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PropTypes from 'prop-types'

const ChangedFieldsModal = ({ open, onClose, data }) => {
	// Field isimlarini tarjima qilish
	const fieldTranslations = {
		self_introduction: '自己紹介',
		hobbies: '趣味',
		skills: 'スキル',
		it_skills: 'ITスキル',
		gallery: 'ギャラリー',
		deliverables: '成果物',
		other_information: 'その他',
		address: '住所',
		jlpt: 'JLPT',
		jdu_japanese_certification: 'JDU認定',
		japanese_speech_contest: '日本語スピーチコンテスト',
		it_contest: 'ITコンテスト',
		hobbies_description: '趣味説明',
		special_skills_description: '特技説明',
		special_skills: '特技',
		qa: 'Q&A',
		// QA subcategories
		'qa.academic_performance': '学生成績',
		'qa.expertise': '専門知識',
		'qa.personality': '個性',
		'qa.work_experience': '実務経験',
		'qa.career_goals': 'キャリア目標',
	}

	const getFieldName = field => {
		return fieldTranslations[field] || field
	}

	// Field kategoriyalarini guruhlash
	const categorizeFields = fields => {
		const categories = {
			basic: {
				name: '基本情報',
				fields: ['self_introduction', 'address'],
			},
			skills: {
				name: 'スキル・能力',
				fields: ['skills', 'it_skills', 'special_skills', 'special_skills_description'],
			},
			interests: {
				name: '趣味・興味',
				fields: ['hobbies', 'hobbies_description'],
			},
			certifications: {
				name: '資格・認定',
				fields: ['jlpt', 'jdu_japanese_certification', 'japanese_speech_contest', 'it_contest'],
			},
			portfolio: {
				name: 'ポートフォリオ',
				fields: ['gallery', 'deliverables'],
			},
			qa: {
				name: 'Q&A',
				fields: fields.filter(f => f.startsWith('qa.')),
			},
			other: {
				name: 'その他',
				fields: ['other_information'],
			},
		}

		const groupedFields = {}

		fields.forEach(field => {
			let placed = false
			for (const [key, category] of Object.entries(categories)) {
				if (category.fields.includes(field) || (key === 'qa' && field.startsWith('qa.'))) {
					if (!groupedFields[key]) {
						groupedFields[key] = {
							name: category.name,
							fields: [],
						}
					}
					groupedFields[key].fields.push(field)
					placed = true
					break
				}
			}
			if (!placed) {
				if (!groupedFields.other) {
					groupedFields.other = {
						name: categories.other.name,
						fields: [],
					}
				}
				groupedFields.other.fields.push(field)
			}
		})

		return groupedFields
	}

	if (!data || !data.fields) return null

	const categorizedFields = categorizeFields(data.fields)

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth='sm'
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 2,
				},
			}}
		>
			<DialogTitle
				sx={{
					m: 0,
					p: 2,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<Box>
					<Typography variant='h6' component='div'>
						変更項目一覧
					</Typography>
					<Typography variant='caption' color='text.secondary'>
						{data.studentName} ({data.studentId})
					</Typography>
				</Box>
				<IconButton
					aria-label='close'
					onClick={onClose}
					sx={{
						color: theme => theme.palette.grey[500],
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent dividers sx={{ p: 3 }}>
				<Box sx={{ mb: 2 }}>
					<Typography variant='body2' color='text.secondary' gutterBottom>
						合計 {data.fields.length} 件の変更があります
					</Typography>
				</Box>

				{Object.entries(categorizedFields).map(([categoryKey, category]) => (
					<Box key={categoryKey} sx={{ mb: 3 }}>
						<Typography variant='subtitle2' color='primary' sx={{ mb: 1, fontWeight: 600 }}>
							{category.name}
						</Typography>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
							{category.fields.map((field, index) => (
								<Chip
									key={index}
									label={getFieldName(field)}
									size='small'
									sx={{
										backgroundColor: '#e3f2fd',
										color: '#1976d2',
										'& .MuiChip-label': {
											fontSize: '13px',
											fontWeight: 500,
										},
									}}
								/>
							))}
						</Box>
					</Box>
				))}
			</DialogContent>

			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} variant='outlined' size='small'>
					閉じる
				</Button>
			</DialogActions>
		</Dialog>
	)
}

ChangedFieldsModal.propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	data: PropTypes.shape({
		fields: PropTypes.arrayOf(PropTypes.string),
		studentName: PropTypes.string,
		studentId: PropTypes.string,
	}),
}

export default ChangedFieldsModal
