import AddIcon from '@mui/icons-material/Add'
import { Box, Chip, IconButton, TextField } from '@mui/material'
import PropTypes from 'prop-types'
import { useState } from 'react'
import styles from './LanguageSkillSelector.module.css'

import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'

const LanguageSkillSelector = ({
	title,
	data,
	editData,
	editMode,
	updateEditData,
	keyName,
	parentKey = 'draft',
	icon,
	isChanged = false,
}) => {
	const [skillName, setSkillName] = useState('')
	const [skillLevel, setSkillLevel] = useState('')

	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	// Get the current skills data - handle both old string format and new array format
	const getCurrentSkillsData = () => {
		let rawData = null

		if (editMode && editData && editData[parentKey]) {
			rawData = editData[parentKey][keyName]
		} else {
			rawData = data?.[keyName]
		}

		// If no data, return empty array
		if (!rawData) {
			return []
		}

		// If it's already an array (new format), return it
		if (Array.isArray(rawData)) {
			return rawData
		}

		// If it's a string (old format), parse it
		if (typeof rawData === 'string' && rawData.trim()) {
			// Parse string like "Japanese (JLPT N2), English (IELTS 6.5)" into array format
			return rawData
				.split(',')
				.map(skill => skill.trim())
				.filter(skill => skill.length > 0)
				.map(skill => {
					const match = skill.match(/^(.+?)\s*\((.+?)\)$/)
					if (match) {
						return {
							name: match[1].trim(),
							level: match[2].trim(),
							color: '#5627DB',
						}
					} else {
						// If no parentheses found, treat the whole string as name
						return {
							name: skill,
							level: '',
							color: '#5627DB',
						}
					}
				})
		}

		return []
	}

	const handleAddSkill = () => {
		// Validation
		if (!skillName.trim() || !skillLevel.trim()) {
			return
		}

		const currentSkillsData = getCurrentSkillsData()

		// Check for duplicates
		const isDuplicate = currentSkillsData.some(
			skill => skill.name?.toLowerCase() === skillName.trim().toLowerCase()
		)

		if (isDuplicate) {
			alert(`Skill "${skillName.trim()}" already exists!`)
			return
		}

		// Create new skill object
		const newSkill = {
			name: skillName.trim(),
			level: skillLevel.trim(),
			color: '#5627DB',
		}

		// Create updated skills array
		const updatedSkills = [...currentSkillsData, newSkill]

		// Update the data with array format
		try {
			updateEditData(keyName, updatedSkills, parentKey)

			// Reset form
			setSkillName('')
			setSkillLevel('')
		} catch (error) {
			console.error('Error updating language skills:', error)
		}
	}

	const handleDeleteSkill = skillToDelete => {
		const currentSkillsData = getCurrentSkillsData()
		const updatedSkills = currentSkillsData.filter(
			skill => skill.name !== skillToDelete.name
		)

		try {
			updateEditData(keyName, updatedSkills, parentKey)
		} catch (error) {
			console.error('Error deleting language skill:', error)
		}
	}

	const skillsToDisplay = getCurrentSkillsData()

	return (
		<div
			className={styles.container}
			style={{
				backgroundColor: isChanged ? '#fff3cd' : '#ffffff',
				border: isChanged ? '2px solid #ffc107' : '1px solid #f0f0f0',
				borderRadius: isChanged ? '8px' : '12px',
				padding: isChanged ? '28px' : '20px',
				position: 'relative',
			}}
		>
			{isChanged && (
				<div
					style={{
						position: 'absolute',
						top: -10,
						right: 10,
						backgroundColor: '#ffc107',
						color: '#fff',
						padding: '2px 8px',
						borderRadius: '4px',
						fontSize: '12px',
						fontWeight: 'bold',
					}}
				>
					変更あり
				</div>
			)}

			<div
				className={styles.title}
				style={icon ? { display: 'flex', alignItems: 'center', gap: 8 } : {}}
			>
				{icon}
				{title}
			</div>

			{editMode && (
				<Box
					display='flex'
					alignItems='center'
					mb={2}
					mt={2}
					gap={2}
					className={styles.addSkillForm}
				>
					<TextField
						value={skillName}
						onChange={event => setSkillName(event.target.value)}
						onKeyPress={event => {
							if (event.key === 'Enter') {
								event.preventDefault()
								if (skillLevel.trim()) {
									handleAddSkill()
								}
							}
						}}
						label={t('languageName') || 'Language Name'}
						placeholder='e.g., IELTS, JLPT, TOEFL'
						variant='outlined'
						size='small'
						sx={{ width: 200 }}
					/>

					<TextField
						value={skillLevel}
						onChange={event => setSkillLevel(event.target.value)}
						onKeyPress={event => {
							if (event.key === 'Enter') {
								event.preventDefault()
								handleAddSkill()
							}
						}}
						label={t('level') || 'Level'}
						placeholder='e.g., N4, 7.0, 90'
						variant='outlined'
						size='small'
						sx={{ width: 150 }}
					/>

					<IconButton
						onClick={handleAddSkill}
						color='primary'
						disabled={!skillName.trim() || !skillLevel.trim()}
						sx={{
							backgroundColor: '#5627DB',
							color: 'white',
							'&:hover': { backgroundColor: '#4520A6' },
							'&:disabled': { backgroundColor: '#cccccc', color: '#666666' },
						}}
					>
						<AddIcon />
					</IconButton>
				</Box>
			)}

			<div className={styles.data}>
				{skillsToDisplay.length > 0 ? (
					<div className={styles.skillChipContainer}>
						{skillsToDisplay.map((skill, index) => (
							<Chip
								key={`${skill.name}-${index}`}
								label={`${skill.name}: ${skill.level}`}
								variant='filled'
								style={{
									color: '#ffffff',
									backgroundColor: skill.color || '#5627DB',
									fontWeight: 500,
									fontSize: 13,
									borderRadius: '16px',
									margin: '4px',
								}}
								onDelete={editMode ? () => handleDeleteSkill(skill) : undefined}
							/>
						))}
					</div>
				) : (
					<div
						style={{
							textAlign: 'center',
							padding: '20px',
							color: '#999',
						}}
					>
						{editMode
							? 'No language skills added yet. Use the form above to add skills.'
							: 'No language skills available.'}
					</div>
				)}
			</div>
		</div>
	)
}

LanguageSkillSelector.propTypes = {
	title: PropTypes.string.isRequired,
	data: PropTypes.object,
	editData: PropTypes.object,
	editMode: PropTypes.bool,
	updateEditData: PropTypes.func,
	keyName: PropTypes.string.isRequired,
	parentKey: PropTypes.string,
	icon: PropTypes.node,
	isChanged: PropTypes.bool,
}

export default LanguageSkillSelector
