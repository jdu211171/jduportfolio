import React from 'react'
import { TextField as MuiTextField } from '@mui/material'
import { useState } from 'react'
import styles from './TextField.module.css'

const TextField = ({
	title,
	data,
	editData,
	editMode,
	updateEditData,
	keyName,
	parentKey,
	icon: Icon,
	iconColor = '#7049e1',
	imageUrl,
	details = null,
}) => {
	const [showAddInput, setShowAddInput] = useState(false)
	const [newDetailValue, setNewDetailValue] = useState('')

	// Fields that should NOT have tag functionality
	const fieldsWithoutTags = [
		'address',
		'major',
		'job_type',
		'self_introduction',
	]
	const shouldShowTags = !fieldsWithoutTags.includes(keyName)

	const handleChange = e => {
		updateEditData(keyName, e.target.value)
	}

	const handleAddDetail = () => {
		setShowAddInput(true)
	}

	const handleSaveDetail = () => {
		if (newDetailValue && newDetailValue.trim()) {
			const currentDetails = details || []
			const updatedDetails = [...currentDetails, newDetailValue.trim()]
			// Update details in the parent component with parentKey support
			const detailsKey = `${keyName}_details`
			if (parentKey) {
				updateEditData(detailsKey, updatedDetails, parentKey)
			} else {
				updateEditData(detailsKey, updatedDetails)
			}
			setNewDetailValue('')
			setShowAddInput(false)
		}
	}

	const handleCancelAdd = () => {
		setNewDetailValue('')
		setShowAddInput(false)
	}

	const handleRemoveDetail = indexToRemove => {
		const updatedDetails = details.filter((_, index) => index !== indexToRemove)
		const detailsKey = `${keyName}_details`
		if (parentKey) {
			updateEditData(detailsKey, updatedDetails, parentKey)
		} else {
			updateEditData(detailsKey, updatedDetails)
		}
	}

	return (
		<div className={styles.container}>
			<div className={styles.title}>
				{Icon && <Icon sx={{ color: iconColor }} />}
				{title}
			</div>
			<div style={{ display: 'flex', gap: 15 }}>
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={imageUrl}
						height={200}
						width={200}
						style={{ borderRadius: 12 }}
					/>
				) : (
					''
				)}
				<div className={styles.data}>
					{editMode ? (
						<>
							<MuiTextField
								value={
									(parentKey
										? editData[parentKey]?.[keyName]
										: editData[keyName]) || ''
								}
								onChange={handleChange}
								placeholder='入力'
								variant='outlined'
								sx={{
									width: '100%',
									'& .MuiOutlinedInput-root': {
										backgroundColor: '#f8f9fa',
										borderRadius: '8px',
										'& fieldset': {
											borderColor: '#e0e0e0',
										},
										'&:hover fieldset': {
											borderColor: '#7049e1',
										},
										'&.Mui-focused fieldset': {
											borderColor: '#7049e1',
										},
									},
								}}
								multiline
								rows={3}
							/>

							{/* Show current details at the top - only for fields that support tags */}
							{shouldShowTags && details && details.length > 0 && (
								<div
									style={{
										display: 'flex',
										gap: 8,
										marginTop: 12,
										flexWrap: 'wrap',
									}}
								>
									{details.map((item, ind) => (
										<div
											key={ind}
											className={styles.editableDetail}
											onClick={() => handleRemoveDetail(ind)}
										>
											{item}
											<span className={styles.removeIcon}>×</span>
										</div>
									))}
								</div>
							)}

							{/* Add input field when showAddInput is true - only for fields that support tags */}
							{shouldShowTags && showAddInput && (
								<div className={styles.addInputContainer}>
									<MuiTextField
										value={newDetailValue}
										onChange={e => setNewDetailValue(e.target.value)}
										placeholder={`${title}を入力してください`}
										variant='outlined'
										size='small'
										sx={{
											flex: 1,
											'& .MuiOutlinedInput-root': {
												backgroundColor: '#fff',
												borderRadius: '8px',
											},
										}}
										onKeyPress={e => {
											if (e.key === 'Enter') {
												handleSaveDetail()
											}
										}}
									/>
									<button
										className={styles.saveButton}
										onClick={handleSaveDetail}
									>
										追加
									</button>
									<button
										className={styles.cancelButton}
										onClick={handleCancelAdd}
									>
										×
									</button>
								</div>
							)}

							{/* Add tag button - only for fields that support tags */}
							{shouldShowTags && !showAddInput && (
								<div className={styles.addButton} onClick={handleAddDetail}>
									<span className={styles.addIcon}>+</span>
									{title}を追加
								</div>
							)}
						</>
					) : (
						<>
							<div className={styles.displayValue}>
								{data ? data : '未設定'}
							</div>
							{/* Show tags only for fields that support them */}
							{shouldShowTags && details && details.length > 0 && (
								<div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
									{details.map((item, ind) => (
										<div key={ind} className={styles.detail}>
											{item}
										</div>
									))}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default TextField
