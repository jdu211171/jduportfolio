import React from 'react'
import { TextField as MuiTextField } from '@mui/material'
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
	isChanged = false,
}) => {
	const handleChange = e => {
		updateEditData(keyName, e.target.value)
	}

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
						<MuiTextField
							value={
								(parentKey
									? editData[parentKey]?.[keyName]
									: editData[keyName]) || ''
							}
							onChange={handleChange}
							variant='outlined'
							sx={{ width: '100%' }}
							multiline
						/>
					) : (
						<div>{data ? data : '未入力'}</div>
					)}
				</div>
			</div>
			{details ? (
				<div style={{ display: 'flex', gap: 8 }}>
					{details.map((item, ind) => (
						<div key={ind} className={styles.detail}>
							{item}
						</div>
					))}
				</div>
			) : (
				''
			)}
		</div>
	)
}

export default TextField
