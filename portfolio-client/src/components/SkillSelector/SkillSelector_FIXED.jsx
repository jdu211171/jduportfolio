import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
	CircularProgress,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import styles from './SkillSelector.module.css'
import skills from '../../utils/skills'

import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'

const SkillSelector = ({
	title,
	data,
	editData,
	editMode,
	headers,
	updateEditData,
	keyName,
	showAutocomplete,
	showHeaders,
	icon,
}) => {
	const [selectedSkill, setSelectedSkill] = useState(null)
	const [selectedLevel, setSelectedLevel] = useState('初級')
	const [isAdding, setIsAdding] = useState(false)

	const { language } = useLanguage()

	const t = key => translations[language][key] || key

	// Get current skills data safely
	const currentSkillsData = useMemo(() => {
		if (editMode) {
			return editData?.[keyName] || {}
		}
		return data?.[keyName] || {}
	}, [editMode, editData, data, keyName])

	// Reset form when not in edit mode
	useEffect(() => {
		if (!editMode) {
			setSelectedSkill(null)
			setSelectedLevel('初級')
		}
	}, [editMode])

	const handleAddSkill = useCallback(() => {
		if (!selectedSkill || !selectedSkill.name || !selectedLevel) {
			return
		}

		// Trim and validate skill name
		const skillName = selectedSkill.name.trim()
		if (!skillName) {
			return
		}

		setIsAdding(true)

		const currentEditData = currentSkillsData || {}
		let skillExists = false

		// Check if skill already exists in any level
		Object.keys(currentEditData).forEach(level => {
			if (
				currentEditData[level] &&
				Array.isArray(currentEditData[level]) &&
				currentEditData[level].some(
					skill => skill.name.toLowerCase() === skillName.toLowerCase()
				)
			) {
				skillExists = true
			}
		})

		if (skillExists) {
			setIsAdding(false)
			return
		}

		// Add the new skill
		const updatedSkills = {
			...currentEditData,
			[selectedLevel]: [
				...(currentEditData[selectedLevel] || []),
				{
					name: skillName,
					color: selectedSkill.color || '#5627DB',
				},
			],
		}

		try {
			updateEditData(keyName, updatedSkills)

			// Reset selection after a brief delay to prevent flicker
			setTimeout(() => {
				setSelectedSkill(null)
				setSelectedLevel('初級')
				setIsAdding(false)
			}, 100)
		} catch (error) {
			console.error('Error adding skill:', error)
			setIsAdding(false)
		}
	}, [selectedSkill, selectedLevel, currentSkillsData, updateEditData, keyName])

	const handleDeleteSkill = useCallback(
		(skillToDelete, level) => {
			try {
				const currentEditData = currentSkillsData || {}
				const updatedSkills = {
					...currentEditData,
					[level]: (currentEditData[level] || []).filter(
						skill => skill.name !== skillToDelete.name
					),
				}
				updateEditData(keyName, updatedSkills)
			} catch (error) {
				console.error('Error deleting skill:', error)
			}
		},
		[currentSkillsData, updateEditData, keyName]
	)

	// Check if add button should be enabled
	const canAddSkill = useMemo(() => {
		return (
			selectedSkill &&
			selectedSkill.name &&
			selectedSkill.name.trim() &&
			selectedLevel &&
			!isAdding
		)
	}, [selectedSkill, selectedLevel, isAdding])

	return (
		<div className={styles.container}>
			<div
				className={styles.title}
				style={icon ? { display: 'flex', alignItems: 'center', gap: 8 } : {}}
			>
				{icon ? icon : ''}
				{title}
			</div>
			<div className={styles.description}>
				{showHeaders &&
					Object.entries(headers).map(([level, description]) => (
						<div key={level}>
							<span style={{ fontWeight: 800 }}>{t('levels')[level]}</span>:{' '}
							{description}
						</div>
					))}
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
					{showAutocomplete ? (
						<Autocomplete
							options={skills}
							getOptionLabel={option => option.name || ''}
							value={selectedSkill}
							onChange={(event, newValue) => {
								setSelectedSkill(newValue)
							}}
							sx={{ width: 200 }}
							disabled={isAdding}
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
							onKeyPress={event => {
								if (event.key === 'Enter') {
									event.preventDefault()
									if (canAddSkill) {
										handleAddSkill()
									}
								}
							}}
							label='Skill'
							variant='outlined'
							size='small'
							sx={{ width: 200 }}
							disabled={isAdding}
						/>
					)}
					<FormControl variant='outlined' size='small' sx={{ width: 150 }}>
						<InputLabel>Level</InputLabel>
						<Select
							value={selectedLevel}
							onChange={event => setSelectedLevel(event.target.value)}
							label='Level'
							disabled={isAdding}
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
						disabled={!canAddSkill}
						sx={{
							backgroundColor: '#5627DB',
							color: 'white',
							'&:hover': { backgroundColor: '#4520A6' },
							'&:disabled': { backgroundColor: '#cccccc', color: '#666666' },
						}}
					>
						{isAdding ? (
							<CircularProgress size={20} color='inherit' />
						) : (
							<AddIcon />
						)}
					</IconButton>
				</Box>
			)}
			<div className={styles.data}>
				<table>
					<tbody>
						{Object.entries(currentSkillsData || {})
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
											{(skills || []).map((skill, index) => (
												<Chip
													key={`${level}-${index}-${skill.name}`}
													label={
														skill.name + (skill.date ? `\n${skill.date}` : '')
													}
													variant='filled'
													style={{
														color: skill.date
															? skill.color
															: level === '上級'
																? '#ffffff'
																: level === '中級'
																	? '#FFFFFF'
																	: '#5627db',
														backgroundColor: skill.date
															? skill.color + '16'
															: level === '上級'
																? '#5627DB'
																: level === '中級'
																	? '#7852e2'
																	: '#efeafc',
														fontWeight: 500,
														fontSize: 13,
														borderRadius: '16px',
													}}
													sx={{
														height: 'auto',
														'& .MuiChip-label': {
															display: 'block',
															whiteSpace: 'pre-wrap',
															padding: '6px 12px',
														},
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
						{/* Show message if no skills */}
						{Object.keys(currentSkillsData || {}).length === 0 && (
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

export default SkillSelector
