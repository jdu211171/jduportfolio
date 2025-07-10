import { useState, useEffect } from 'react'
import { TextField as MuiTextField, IconButton, Box } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PropTypes from 'prop-types'
import styles from './QATextField.module.css'

const QATextField = ({
	category,
	question,
	keyName,
	editData,
	updateEditData,
	DeleteQA,
	aEdit = false,
	qEdit = false,
}) => {
	const [localEditData, setLocalEditData] = useState('')
	const [localEditQuestion, setLocalQuestion] = useState('')

	useEffect(() => {
		if (category == false) {
			setLocalEditData(editData[keyName]?.answer || '')
			setLocalQuestion(editData[keyName]?.question || '')
		} else {
			setLocalEditData(editData[category]?.[keyName]?.answer || '')
			setLocalQuestion(editData[category]?.[keyName]?.question || '')
		}
	}, [editData, category, keyName])

	const handleChange = (e, fieldType) => {
		const updatedValue = e.target.value

		if (category == false) {
			if (fieldType === 'question') {
				setLocalQuestion(updatedValue)
			} else if (fieldType === 'answer') {
				setLocalEditData(updatedValue)
			}
			updateEditData(keyName, updatedValue, fieldType)
		} else {
			if (fieldType === 'question') {
				setLocalQuestion(updatedValue)
			} else if (fieldType === 'answer') {
				setLocalEditData(updatedValue)
			}
			updateEditData(category, keyName, updatedValue, fieldType)
		}
	}

	return (
		<div className={styles.container}>
			<div className={styles.title}>
				{aEdit ? (
					<Box display={'flex'}>
						<MuiTextField
							value={localEditQuestion}
							onChange={e => handleChange(e, 'question')}
							variant='outlined'
							fullWidth
							multiline
						/>
						{aEdit && (
							<IconButton
								aria-label='削除'
								onClick={() => DeleteQA(keyName)}
								sx={{
									color: 'red',
								}}
							>
								<DeleteIcon />
							</IconButton>
						)}
					</Box>
				) : (
					<div>{localEditQuestion}</div>
				)}
			</div>
			<div className={styles.data}>
				{qEdit ? (
					<MuiTextField
						value={localEditData}
						onChange={e => handleChange(e, 'answer')}
						variant='outlined'
						fullWidth
						multiline
					/>
				) : (
					<>{!aEdit && <div>{localEditData}</div>}</>
				)}
			</div>
		</div>
	)
}

QATextField.propTypes = {
	category: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
	question: PropTypes.string,
	keyName: PropTypes.string.isRequired,
	editData: PropTypes.object.isRequired,
	updateEditData: PropTypes.func.isRequired,
	DeleteQA: PropTypes.func.isRequired,
	aEdit: PropTypes.bool,
	qEdit: PropTypes.bool,
}

export default QATextField
