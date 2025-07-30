import AddIcon from '@mui/icons-material/Add'
import { Autocomplete, Box, Chip, IconButton, TextField } from '@mui/material'
import axios from 'axios'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
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
	const [selectedSkill, setSelectedSkill] = useState(null)
	const [skillLevel, setSkillLevel] = useState('')
	const [availableSkills, setAvailableSkills] = useState([])
	const [loadingSkills, setLoadingSkills] = useState(false)

	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	// Fetch available skills from API
	useEffect(() => {
		fetchSkillsFromAPI()
	}, [])

	const fetchSkillsFromAPI = async (search = '') => {
		try {
			setLoadingSkills(true)
			const url = search
				? `/api/skills?search=${encodeURIComponent(search)}`
				: '/api/skills'
			const response = await axios.get(url)
			setAvailableSkills(response.data || [])
		} catch (error) {
			console.error('Error fetching skills:', error)
			setAvailableSkills([])
		} finally {
			setLoadingSkills(false)
		}
	}

	// Get the current skills data
	const getCurrentSkillsData = () => {
		let skillsData = []

		if (editMode && editData && editData[parentKey]) {
			skillsData = editData[parentKey][keyName] || []
		} else {
			skillsData = data?.[keyName] || []
		}

		// If the data is a string (from database), parse it as JSON
		if (typeof skillsData === 'string') {
			try {
				skillsData = JSON.parse(skillsData)
			} catch (error) {
				console.error('Error parsing language skills data:', error)
				skillsData = []
			}
		}

		// Ensure it's an array
		return Array.isArray(skillsData) ? skillsData : []
	}

	const handleAddSkill = () => {
		// Validation
		if (!selectedSkill?.name?.trim() || !skillLevel.trim()) {
			return
		}

		const skillName = selectedSkill.name.trim()
		const currentSkillsData = getCurrentSkillsData()

		// Check for duplicates
		const isDuplicate = currentSkillsData.some(
			skill => skill.name?.toLowerCase() === skillName.toLowerCase()
		)

		if (isDuplicate) {
			alert(`Skill "${skillName}" already exists!`)
			return
		}

		// Create new skill object
		const newSkill = {
			name: skillName,
			level: skillLevel.trim(),
			color: '#5627DB',
		}

		// Create updated skills array
		const updatedSkills = [...currentSkillsData, newSkill]

		// Update the data - convert to JSON string for database storage
		try {
			updateEditData(keyName, JSON.stringify(updatedSkills), parentKey)

			// Reset form
			setSelectedSkill(null)
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
			updateEditData(keyName, JSON.stringify(updatedSkills), parentKey)
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
					<Autocomplete
						options={availableSkills}
						getOptionLabel={option => option.name || ''}
						value={selectedSkill}
						onChange={(event, newValue) => {
							setSelectedSkill(newValue)
						}}
						onInputChange={(event, newInputValue) => {
							// Search skills when user types
							if (newInputValue && newInputValue.length > 0) {
								fetchSkillsFromAPI(newInputValue)
							}
						}}
						loading={loadingSkills}
						sx={{ width: 200 }}
						renderInput={params => (
							<TextField
								{...params}
								label={t('languageName') || 'Language Name'}
								variant='outlined'
								size='small'
								placeholder='e.g., IELTS, JLPT, TOEFL'
							/>
						)}
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
						disabled={!selectedSkill?.name?.trim() || !skillLevel.trim()}
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
