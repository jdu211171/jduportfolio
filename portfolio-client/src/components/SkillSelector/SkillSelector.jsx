import React, { useState, useEffect } from 'react'
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

const SkillSelector = ({
												 title,
												 data,
												 editData,
												 editMode,
												 headers,
												 updateEditData,
												 keyName,
												 parentKey = 'draft', // ✅ parentKey qo'shildi
												 showAutocomplete,
												 showHeaders,
											 }) => {
	// ✅ TO'G'IRLANGAN: parentKey orqali to'g'ri ma'lumotlarga murojaat
	const getDataSource = () => {
		if (parentKey) {
			return data[parentKey] ? data[parentKey][keyName] || {} : {}
		}
		return data[keyName] || {}
	}

	const getEditDataSource = () => {
		if (parentKey) {
			return editData[parentKey] ? editData[parentKey][keyName] || {} : {}
		}
		return editData[keyName] || {}
	}

	const [jsonData, setJsonData] = useState(getDataSource())
	const [editJsonData, setEditJsonData] = useState(getEditDataSource())
	const [selectedSkill, setSelectedSkill] = useState(null)
	const [selectedLevel, setSelectedLevel] = useState('初級')

	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	// ✅ TO'G'IRLANGAN useEffect: parentKey hisobga olish
	useEffect(() => {
		console.log('🔄 SkillSelector data updated:', {
			keyName,
			parentKey,
			dataSource: getDataSource(),
			editDataSource: getEditDataSource(),
			editMode
		})

		setJsonData(getDataSource())
		setEditJsonData(getEditDataSource())
	}, [data, editData, keyName, parentKey])

	// ✅ TO'G'IRLANGAN updateEditData: parentKey bilan ishlash
	const updateParentEditData = (updatedSkills) => {
		if (parentKey) {
			// Parent component'ga parentKey orqali yuborish
			updateEditData(keyName, updatedSkills, parentKey)
		} else {
			// To'g'ridan-to'g'ri yuborish
			updateEditData(keyName, updatedSkills)
		}
	}

	const handleAddSkill = () => {
		if (selectedSkill && selectedLevel) {
			let skillExists = false
			Object.keys(editJsonData).forEach(level => {
				if (
					editJsonData[level] &&
					editJsonData[level].some(skill => skill.name === selectedSkill.name)
				) {
					skillExists = true
					alert(
						`Skill "${selectedSkill.name}" is already added for level "${level}"`
					)
				}
			})

			if (skillExists) {
				return
			}

			const updatedSkills = {
				...editJsonData,
				[selectedLevel]: [
					...(editJsonData[selectedLevel] || []),
					{
						name: selectedSkill.name,
						color: selectedSkill.color,
					},
				],
			}

			console.log('➕ Adding skill:', {
				skill: selectedSkill.name,
				level: selectedLevel,
				updatedSkills
			})

			setEditJsonData(updatedSkills)
			updateParentEditData(updatedSkills) // ✅ TO'G'IRLANGAN

			// Reset selection
			setSelectedSkill(null)
			setSelectedLevel('初級')
		}
	}

	const handleDeleteSkill = (skillToDelete, level) => {
		const updatedSkills = {
			...editJsonData,
			[level]: editJsonData[level].filter(
				skill => skill.name !== skillToDelete.name
			),
		}

		console.log('🗑️ Deleting skill:', {
			skill: skillToDelete.name,
			level,
			updatedSkills
		})

		setEditJsonData(updatedSkills)
		updateParentEditData(updatedSkills) // ✅ TO'G'IRLANGAN
	}

	// ✅ TO'G'IRLANGAN: editMode'da editJsonData, aks holda jsonData
	const displayData = editMode ? editJsonData : jsonData

	console.log('🎯 SkillSelector render:', {
		keyName,
		editMode,
		displayData,
		jsonData,
		editJsonData
	})

	return (
		<div className={styles.container}>
			<div className={styles.title}>{title}</div>
			<div className={styles.description}>
				{showHeaders &&
					Object.entries(headers).map(([level, description]) => (
						<div key={level}>
							<span style={{ fontWeight: 800 }}>{t('levels')[level]}</span>:{' '}
							{description}
						</div>
					))}
			</div>
			<hr />
			{editMode && (
				<Box display='flex' alignItems='center' mb={2} mt={2}>
					{showAutocomplete ? (
						<Autocomplete
							options={skills}
							getOptionLabel={option => option.name}
							value={selectedSkill}
							onChange={(event, newValue) => setSelectedSkill(newValue)}
							sx={{ width: 160 }}
							renderInput={params => (
								<TextField
									{...params}
									label='Select Skill'
									variant='outlined'
								/>
							)}
						/>
					) : (
						<TextField
							value={selectedSkill?.name || ''}
							onChange={event => setSelectedSkill({
								name: event.target.value,
								color: '#2196f3' // Default color
							})}
							label='Skill'
							variant='outlined'
							sx={{ width: 120 }}
						/>
					)}
					<FormControl variant='outlined' size='small' sx={{ ml: 2 }}>
						<InputLabel>Level</InputLabel>
						<Select
							value={selectedLevel}
							onChange={event => setSelectedLevel(event.target.value)}
							label='Level'
							sx={{ width: 120 }}
						>
							{Object.keys(headers).map(key => (
								<MenuItem key={key} value={key}>
									{t('levels')[key]}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<IconButton onClick={handleAddSkill} color='primary' sx={{ ml: 2 }}>
						<AddIcon />
					</IconButton>
				</Box>
			)}
			<div className={styles.data}>
				<table>
					<tbody>
					{Object.entries(displayData || {}).map(([level, skillsArray]) => (
						<tr key={level}>
							<td style={{ textAlign: 'right' }}>{t('levels')[level]}:</td>
							<td>
								{(skillsArray || []).map((skill, index) => (
									<Chip
										key={`${level}-${index}-${skill.name}`}
										label={
											skill.name + '\n' + (skill.date ? skill.date : '')
										}
										variant='outlined'
										style={
											skill.date
												? {
													borderColor: skill.color,
													color: skill.color,
													margin: '0 4px 4px 0',
													backgroundColor: skill.color + '16',
													padding: '8px 4px',
													height: 'auto',
												}
												: {
													borderColor: skill.color,
													color: skill.color,
													margin: '0 4px 4px 0',
													backgroundColor: skill.color + '16',
												}
										}
										sx={{
											'& .MuiChip-label': {
												display: 'block',
												whiteSpace: 'pre-wrap',
											},
										}}
										onDelete={
											editMode
												? () => handleDeleteSkill(skill, level)
												: undefined
										}
									/>
								))}
							</td>
						</tr>
					))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default SkillSelector