import React, { useState } from 'react'
import {
	Autocomplete,
	TextField,
	Chip,
	Box,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import styles from './SkillSelector.module.css'
import skills from '../../utils/skills'

import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'

const SkillSelectorSimple = ({
	title,
	data,
	editData,
	editMode,
	headers,
	updateEditData,
	keyName,
	parentKey = 'draft',
	showAutocomplete,
	showHeaders,
	icon,
}) => {
	const [selectedSkill, setSelectedSkill] = useState(null)
	const [selectedLevel, setSelectedLevel] = useState('初級')

	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	// Simple data access
	const getCurrentData = () => {
		if (editMode && editData && editData[parentKey]) {
			return editData[parentKey][keyName] || {}
		}
		return data?.[keyName] || {}
	}

	const handleAddSkill = () => {
		console.log('🚀 Simple Add Skill Start:', {
			selectedSkill,
			selectedLevel,
			keyName,
			parentKey,
			editMode,
		})

		if (!selectedSkill?.name?.trim() || !selectedLevel) {
			console.log('❌ Validation failed')
			return
		}

		const skillName = selectedSkill.name.trim()
		const currentData = getCurrentData()

		console.log('📊 Current data:', currentData)

		// Check for duplicates
		const isDuplicate = Object.values(currentData).some(
			levelSkills =>
				Array.isArray(levelSkills) &&
				levelSkills.some(
					skill => skill.name?.toLowerCase() === skillName.toLowerCase()
				)
		)

		if (isDuplicate) {
			alert(`Skill "${skillName}" already exists!`)
			return
		}

		// Create updated skills
		const updatedSkills = {
			...currentData,
			[selectedLevel]: [
				...(currentData[selectedLevel] || []),
				{
					name: skillName,
					color: selectedSkill.color || '#5627DB',
				},
			],
		}

		console.log('✅ Updated skills:', updatedSkills)

		// Update the data
		updateEditData(keyName, updatedSkills, parentKey)

		// Reset form
		setSelectedSkill(null)
		setSelectedLevel('初級')
	}

	const handleDeleteSkill = (skillToDelete, level) => {
		console.log('🗑️ Simple Delete Skill:', { skillToDelete, level })

		const currentData = getCurrentData()
		const updatedSkills = {
			...currentData,
			[level]: (currentData[level] || []).filter(
				skill => skill.name !== skillToDelete.name
			),
		}

		console.log('✅ After delete:', updatedSkills)
		updateEditData(keyName, updatedSkills, parentKey)
	}

	const skillsToDisplay = getCurrentData()

	return (
		<div className={styles.container}>
			<div
				className={styles.title}
				style={icon ? { display: 'flex', alignItems: 'center', gap: 8 } : {}}
			>
				{icon}
				{title}
			</div>

			{showHeaders && (
				<div className={styles.description}>
					{Object.entries(headers).map(([level, description]) => (
						<div key={level}>
							<span style={{ fontWeight: 800 }}>{t('levels')[level]}</span>:{' '}
							{description}
						</div>
					))}
				</div>
			)}

			{editMode && (
				<Box display='flex' alignItems='center' mb={2} mt={2} gap={2}>
					{showAutocomplete ? (
						<Autocomplete
							options={skills}
							getOptionLabel={option => option.name || ''}
							value={selectedSkill}
							onChange={(event, newValue) => setSelectedSkill(newValue)}
							sx={{ width: 200 }}
							renderInput={params => (
								<TextField
									{...params}
									label='Select Skill'
									variant='outlined'
									size='small'
								/>
							)}
						/>
					) : (
						<TextField
							value={selectedSkill?.name || ''}
							onChange={event => setSelectedSkill({ name: event.target.value })}
							label='Skill'
							variant='outlined'
							size='small'
							sx={{ width: 200 }}
						/>
					)}

					<FormControl variant='outlined' size='small' sx={{ width: 150 }}>
						<InputLabel>Level</InputLabel>
						<Select
							value={selectedLevel}
							onChange={event => setSelectedLevel(event.target.value)}
							label='Level'
						>
							{Object.keys(headers || {}).map(key => (
								<MenuItem key={key} value={key}>
									{t('levels')[key]}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					<IconButton
						onClick={handleAddSkill}
						color='primary'
						sx={{
							backgroundColor: '#5627DB',
							color: 'white',
							'&:hover': { backgroundColor: '#4520A6' },
						}}
					>
						<AddIcon />
					</IconButton>
				</Box>
			)}

			<div className={styles.data}>
				<table>
					<tbody>
						{Object.entries(skillsToDisplay)
							.filter(
								([, skills]) =>
									skills && Array.isArray(skills) && skills.length > 0
							)
							.map(([level, skills]) => (
								<tr key={level}>
									<td
										style={{
											fontSize: 14,
											width: '120px',
											verticalAlign: 'top',
											paddingRight: '12px',
										}}
									>
										{t('levels')[level] || level}
									</td>
									<td style={{ width: 'auto' }}>
										<div className={styles.skillChipContainer}>
											{skills.map((skill, index) => (
												<Chip
													key={`${level}-${index}-${skill.name}`}
													label={skill.name}
													variant='filled'
													style={{
														color:
															level === '上級'
																? '#ffffff'
																: level === '中級'
																	? '#FFFFFF'
																	: '#5627db',
														backgroundColor:
															level === '上級'
																? '#5627DB'
																: level === '中級'
																	? '#7852e2'
																	: '#efeafc',
														fontWeight: 500,
														fontSize: 13,
														borderRadius: '16px',
													}}
													onDelete={
														editMode
															? () => handleDeleteSkill(skill, level)
															: undefined
													}
												/>
											))}
										</div>
									</td>
								</tr>
							))}
						{Object.keys(skillsToDisplay).length === 0 && (
							<tr>
								<td
									colSpan='2'
									style={{
										textAlign: 'center',
										padding: '20px',
										color: '#999',
									}}
								>
									{editMode
										? 'No skills added yet. Use the form above to add skills.'
										: 'No skills available.'}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default SkillSelectorSimple
