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
	showAutocomplete,
	showHeaders,
	icon,
}) => {
	const [jsonData, setJsonData] = useState(data[keyName] || {})
	const [editJsonData, setEditJsonData] = useState(editData[keyName] || {})
	const [selectedSkill, setSelectedSkill] = useState(null)
	const [selectedLevel, setSelectedLevel] = useState('初級')

	const { language } = useLanguage()

	const t = key => translations[language][key] || key
	useEffect(() => {
		setJsonData(data[keyName] || {})
		setEditJsonData(editData[keyName] || {})
	}, [data, editData, keyName])
	const handleAddSkill = () => {
		if (selectedSkill && selectedLevel) {
			let skillExists = false
			const currentEditData = editJsonData || {}
			Object.keys(currentEditData).forEach(level => {
				if (
					currentEditData[level] &&
					currentEditData[level].some(
						skill => skill.name === selectedSkill.name
					)
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
				...currentEditData,
				[selectedLevel]: [
					...(currentEditData[selectedLevel] || []),
					{
						name: selectedSkill.name,
						color: selectedSkill.color,
					},
				],
			}
			setEditJsonData(updatedSkills)
			updateEditData(keyName, updatedSkills)
		}
	}

	const handleDeleteSkill = (skillToDelete, level) => {
		const currentEditData = editJsonData || {}
		const updatedSkills = {
			...currentEditData,
			[level]: (currentEditData[level] || []).filter(
				skill => skill.name !== skillToDelete.name
			),
		}
		setEditJsonData(updatedSkills)
		updateEditData(keyName, updatedSkills)
	}

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
				<Box display='flex' alignItems='center' mb={2} mt={2}>
					{showAutocomplete ? (
						<Autocomplete
							options={skills}
							getOptionLabel={option => option.name}
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
							onChange={event => setSelectedSkill({ name: event.target.value })}
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
						{Object.entries((editMode ? editJsonData : jsonData) || {}).map(
							([level, skills]) => (
								<tr key={level}>
									<td style={{ fontSize: 14 }}>{t('levels')[level]}</td>
									<td>
										{(skills || []).map((skill, index) => (
											<Chip
												key={level + index}
												label={
													skill.name + '\n' + (skill.date ? skill.date : '')
												}
												variant='filled'
												style={
													skill.date
														? {
																color: skill.color,
																margin: '0 4px 4px 0',
																backgroundColor: skill.color + '16',
																padding: '8px 4px',
																height: 'auto',
															}
														: {
																color:
																	level === '上級'
																		? '#ffffff'
																		: level === '中級'
																			? '#FFFFFF'
																			: '#5627db',
																margin: '0 4px 4px 0',
																padding: '2px 10px',
																fontWeight: 500,
																fontSize: 14,
																backgroundColor:
																	level === '上級'
																		? '#5627DB'
																		: level === '中級'
																			? '#7852e2'
																			: '#efeafc',
															}
												}
												sx={{
													borderRadius: '4px',
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
							)
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default SkillSelector
