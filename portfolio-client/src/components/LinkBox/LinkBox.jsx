import { TextField as MuiTextField } from '@mui/material'
import PropTypes from 'prop-types'
import styles from './LinkBox.module.css'
const TextField = ({
	title,
	data,
	editData,
	editMode,
	updateEditData,
	keyName,
}) => {
	const handleChange = e => {
		updateEditData(keyName, e.target.value)
	}

	return (
		<div className={styles.container}>
			<div className={styles.title}>{title}</div>
			<div className={styles.data}>
				{editMode ? (
					<MuiTextField
						value={editData[keyName] || ''}
						onChange={handleChange}
						variant='filled'
						fullWidth
						multiline
					/>
				) : (
					<div>{data}</div>
				)}
			</div>
		</div>
	)
}

TextField.propTypes = {
	title: PropTypes.string.isRequired,
	data: PropTypes.any,
	editData: PropTypes.object,
	editMode: PropTypes.bool,
	updateEditData: PropTypes.func,
	keyName: PropTypes.string,
}

export default TextField
