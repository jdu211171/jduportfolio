import { Avatar } from '@mui/material'
import React from 'react'
import style from './UserAvatar.module.css'

const UserAvatar = ({ photo, name, studentId, age, isGridMode }) => {
	return (
		<div className={style.avatarContainer}>
			<Avatar sx={{ width: 40, height: 40 }} alt={name} src={photo} />{' '}
			<div className={style.nameIdContainer}>
				<div>{name}</div>
				{studentId ? (
					<span style={{ fontSize: '12px', color: '#666' }}>{studentId}</span>
				) : null}
				{isGridMode && age ? (
					<span style={{ fontSize: '12px', color: '#666' }}>年齢: {age}</span>
				) : null}
			</div>
		</div>
	)
}

export default UserAvatar
