import React, { useState, useEffect, useRef } from 'react'
import LaunchIcon from '@mui/icons-material/Launch'
import { TextField as MuiTextField, Box, IconButton } from '@mui/material'
import { Add, DeleteOutline, Upload } from '@mui/icons-material'
import styles from './Deliverables.module.css'
import TextField from '../TextField/TextField'
import RoleField from '../RoleField/RoleField'
import {
	TransformWrapper,
	TransformComponent,
	useControls,
} from 'react-zoom-pan-pinch'

const Deliverables = ({
	data,
	editData,
	editMode,
	updateEditData,
	keyName,
	updateEditMode,
	onImageUpload,
}) => {
	const textFieldRef = useRef(null)
	const fileInputRef = useRef(null)
	const [newData, setNewData] = useState(editData)
	const [activeDeliverable, setActiveDeliverable] = useState(0)
	const [imagePreview, setImagePreview] = useState({})

	useEffect(() => {
		setNewData(editData)
	}, [editData])

	const addNewDeliverable = () => {
		const deliverable = {
			title: '',
			link: '',
			role: [],
			codeLink: '',
			imageLink: '',
			description: '',
		}
		const updatedData = [...newData, deliverable]
		setNewData(updatedData)
		updateEditData(keyName, updatedData)
		updateEditMode()
		setActiveDeliverable(updatedData.length - 1)
		setTimeout(() => {
			textFieldRef.current?.focus()
		}, 0)
	}

	useEffect(() => {
		if (editData.length === 0) {
			addNewDeliverable()
		}
	}, [])
	console.log(data)

	return (
		<div className={styles.container}>
			{data.length > 0
				? data.map((item, ind) => (
						<div key={ind} className={styles.item}>
							<img src={item.imageLink} alt={item.title} />
							<div className={styles.title}>{item.title}</div>
							<div className={styles.description}>{item.description}</div>
							<div className={styles.roles}>
								{item.role.length > 0
									? item.role.map((Role, index) => (
											<div key={index} className={styles.role}>
												{Role}
											</div>
										))
									: ''}
							</div>
							<a
								href={item.link}
								target='_blank'
								rel='noopener noreferrer'
								style={{
									display: 'flex',
									alignItems: 'center',
									color: '#5627DB',
									textDecoration: 'none',
									gap: '4px',
								}}
							>
								View the project
								<LaunchIcon sx={{ color: '#5627DB' }} />
							</a>
						</div>
					))
				: '成果物がないです。'}
		</div>
	)
}

export default Deliverables
