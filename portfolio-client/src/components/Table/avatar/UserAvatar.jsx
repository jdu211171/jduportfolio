import { Avatar, Chip } from '@mui/material'
import React from 'react'
import style from './UserAvatar.module.css'

const UserAvatar = ({ photo, name, studentId }) => {
	return (
		<div className={style.avatarContainer}>
			<Avatar sx={{ width: 40, height: 40 }} alt={name} src={photo} />{' '}
			<div className={style.nameIdContainer}>
				<div>{name}</div>
				{studentId ? (
					<Chip
						label={studentId}
						color='success'
						variant='outlined'
						size='small'
						sx={{ width: '100px' }}
					/>
				) : (
					''
				)}
			</div>
		</div>
	)
}

export default UserAvatar
