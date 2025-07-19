import { useState, useEffect } from 'react'
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
import axios from 'axios'
import PropTypes from 'prop-types'

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
	parentKey = 'draft',
	showAutocomplete,
	showHeaders,
	icon,
	isChanged = false,
}) => {
	const [selectedSkill, setSelectedSkill] = useState(null)
	const [selectedLevel, setSelectedLevel] = useState('初級')
	const [databaseSkills, setDatabaseSkills] = useState([])
	const [loadingSkills, setLoadingSkills] = useState(false)

	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	// Fetch skills from database when showAutocomplete is true
	useEffect(() => {
		if (showAutocomplete) {
			fetchSkillsFromDatabase()
		}
	}, [showAutocomplete])

	const fetchSkillsFromDatabase = async (search = '') => {
		try {
			setLoadingSkills(true)
			const url = search 
				? `/api/itskills?search=${encodeURIComponent(search)}` 
				: '/api/itskills'
			const response = await axios.get(url)
			console.log('Fetched database skills:', response.data)
			setDatabaseSkills(response.data || [])
		} catch (error) {
			console.error('Error fetching skills from database:', error)
			// Fallback to local skills if database fails
			setDatabaseSkills([])
		} finally {
			setLoadingSkills(false)
		}
	}

	// Get skills to use in autocomplete (database skills if available, otherwise local skills)
	const getSkillsForAutocomplete = () => {
		if (showAutocomplete && databaseSkills.length > 0) {
			return databaseSkills
		}
		return skills
	}

	// Get the current skills data
	const getCurrentSkillsData = () => {
		if (editMode && editData && editData[parentKey]) {
			console.log(
				'🎯 Getting skills from editData:',
				editData[parentKey][keyName]
			)
			return editData[parentKey][keyName] || {}
		}
		console.log('🎯 Getting skills from data:', data?.[keyName])
		return data?.[keyName] || {}
	}

	const handleAddSkill = () => {
		console.log('� Adding skill - Start:', {
			selectedSkill,
			selectedLevel,
			keyName,
			parentKey,
			editMode,
			currentData: getCurrentSkillsData(),
		})

		// Validation
		if (!selectedSkill?.name?.trim() || !selectedLevel) {
			console.log('❌ Validation failed:', { selectedSkill, selectedLevel })
			return
		}

		const skillName = selectedSkill.name.trim()
		const currentSkillsData = getCurrentSkillsData()

		// Check for duplicates
		const isDuplicate = Object.values(currentSkillsData).some(
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

		// Create updated skills object
		const updatedSkills = {
			...currentSkillsData,
			[selectedLevel]: [
				...(currentSkillsData[selectedLevel] || []),
				{
					name: skillName,
					color: selectedSkill.color || '#5627DB',
				},
			],
		}

		console.log('✅ Updating skills:', updatedSkills)
		console.log('📤 Calling updateEditData with:', {
			keyName,
			updatedSkills,
			parentKey,
		})

		// Update the data
		try {
			updateEditData(keyName, updatedSkills, parentKey)

			// Reset form
			setSelectedSkill(null)
			setSelectedLevel('初級')

			console.log('✅ Skill added successfully!')
		} catch (error) {
			console.error('❌ Error adding skill:', error)
		}
	}

	const handleDeleteSkill = (skillToDelete, level) => {
		console.log('🗑️ Deleting skill:', {
			skillToDelete,
			level,
			keyName,
			parentKey,
		})

		const currentSkillsData = getCurrentSkillsData()
		const updatedSkills = {
			...currentSkillsData,
			[level]: (currentSkillsData[level] || []).filter(
				skill => skill.name !== skillToDelete.name
			),
		}

		console.log('✅ Updated skills after delete:', updatedSkills)

		try {
			updateEditData(keyName, updatedSkills, parentKey)
			console.log('✅ Skill deleted successfully!')
		} catch (error) {
			console.error('❌ Error deleting skill:', error)
		}
	}

	const skillsToDisplay = getCurrentSkillsData()
	console.log('📊 Skills to display:', skillsToDisplay)

	return (
		<div className={styles.container} style={{
			backgroundColor: isChanged ? '#fff3cd' : '#ffffff',
			border: isChanged ? '2px solid #ffc107' : '1px solid #f0f0f0',
			borderRadius: isChanged ? '8px' : '12px',
			padding: isChanged ? '28px' : '20px',
			position: 'relative',
		}}>
			{isChanged && (
				<div style={{
					position: 'absolute',
					top: -10,
					right: 10,
					backgroundColor: '#ffc107',
					color: '#fff',
					padding: '2px 8px',
					borderRadius: '4px',
					fontSize: '12px',
					fontWeight: 'bold',
				}}>
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
							options={getSkillsForAutocomplete()}
							getOptionLabel={option => option.name || ''}
							value={selectedSkill}
							onChange={(event, newValue) => {
								console.log('🎯 Autocomplete changed:', newValue)
								setSelectedSkill(newValue)
							}}
							onInputChange={(event, newInputValue) => {
								// Search skills when user types
								if (newInputValue && newInputValue.length > 0) {
									fetchSkillsFromDatabase(newInputValue)
								}
							}}
							loading={loadingSkills}
							sx={{ width: 200 }}
							renderInput={params => (
								<TextField
									{...params}
									label={t('selectSkill')}
									variant='outlined'
									size='small'
								/>
							)}
						/>
					) : (
						<TextField
							value={selectedSkill?.name || ''}
							onChange={event => {
								console.log('🎯 TextField changed:', event.target.value)
								setSelectedSkill({ name: event.target.value })
							}}
							onKeyPress={event => {
								if (event.key === 'Enter') {
									event.preventDefault()
									handleAddSkill()
								}
							}}
							label={t('skill')}
							variant='outlined'
							size='small'
							sx={{ width: 200 }}
						/>
					)}

					<FormControl variant='outlined' size='small' sx={{ width: 150 }}>
						<InputLabel>{t('level')}</InputLabel>
						<Select
							value={selectedLevel}
							onChange={event => {
								console.log('🎯 Level changed:', event.target.value)
								setSelectedLevel(event.target.value)
							}}
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
						disabled={!selectedSkill?.name?.trim() || !selectedLevel}
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

SkillSelector.propTypes = {
	title: PropTypes.string.isRequired,
	data: PropTypes.object,
	editData: PropTypes.object,
	editMode: PropTypes.bool,
	headers: PropTypes.object,
	updateEditData: PropTypes.func,
	keyName: PropTypes.string.isRequired,
	parentKey: PropTypes.string,
	showAutocomplete: PropTypes.bool,
	showHeaders: PropTypes.bool,
	icon: PropTypes.node,
}

export default SkillSelector
