import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LaunchIcon from '@mui/icons-material/Launch'
import { Button, IconButton } from '@mui/material'
import { useEffect, useRef, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import styles from './Deliverables.module.css'

const Deliverables = ({
	data,
	editData,
	editMode,
	updateEditData,
	keyName,
	updateEditMode,
	onImageUpload,
	resetPreviews, // Add this prop to reset previews when needed
}) => {
	const textFieldRef = useRef(null)
	const fileInputRef = useRef(null)
	const [newData, setNewData] = useState(editData || [])
	const [activeDeliverable, setActiveDeliverable] = useState(0)
	const [imagePreview, setImagePreview] = useState({})
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		link: '',
		role: [],
		codeLink: '',
		imageLink: '',
	})

	// Cleanup function for blob URLs
	const cleanupBlobUrls = useCallback((previewsToClean = imagePreview) => {
		Object.values(previewsToClean).forEach(url => {
			if (url && typeof url === 'string' && url.startsWith('blob:')) {
				try {
					URL.revokeObjectURL(url)
				} catch (error) {
					console.warn('Failed to revoke blob URL:', url, error)
				}
			}
		})
	}, [imagePreview])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			cleanupBlobUrls()
		}
	}, [])

	useEffect(() => {
		setNewData(editData || [])
		// Clean up existing blob URLs before setting new previews
		cleanupBlobUrls()

		// Set new image previews when editData changes (after save)
		if (editData && editData.length > 0) {
			const newPreviews = {}
			editData.forEach((item, index) => {
				if (item.imageLink && !item.imageLink.startsWith('blob:')) {
					// If it's a real URL (not blob), use it
					newPreviews[index] = item.imageLink
				}
			})
			setImagePreview(newPreviews)
		} else {
			setImagePreview({})
		}
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
		if (updateEditMode) updateEditMode()
		setActiveDeliverable(updatedData.length - 1)
		setFormData(deliverable)
		setTimeout(() => {
			textFieldRef.current?.focus()
		}, 0)
	}

	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value,
		}))
	}

	const handleImageUpload = event => {
		const file = event.target.files[0]
		if (file) {
			// Clean up previous blob URL if it exists
			const previousUrl = imagePreview[activeDeliverable]
			if (previousUrl && previousUrl.startsWith('blob:')) {
				URL.revokeObjectURL(previousUrl)
			}

			// Create preview URL
			const previewUrl = URL.createObjectURL(file)
			setImagePreview(prev => ({
				...prev,
				[activeDeliverable]: previewUrl,
			}))

			// Call parent's onImageUpload with the file
			if (onImageUpload) {
				onImageUpload(activeDeliverable, file)
			}
		}
	}

	const saveDeliverable = () => {
		const updatedData = [...newData]

		// Make sure we have the correct data structure
		const newDeliverable = {
			...formData,
			// For immediate preview, use the preview URL, but real URL will be set when draft is saved
			imageLink: imagePreview[activeDeliverable] || formData.imageLink,
		}

		updatedData[activeDeliverable] = newDeliverable

		setNewData(updatedData)
		updateEditData(keyName, updatedData)

		// Reset form but keep preview for this deliverable
		setFormData({
			title: '',
			description: '',
			link: '',
			role: [],
			codeLink: '',
			imageLink: '',
		})
		setActiveDeliverable(-1)
	}

	const deleteDeliverable = index => {
		// Clean up blob URL for the deleted deliverable
		const urlToClean = imagePreview[index]
		if (urlToClean && urlToClean.startsWith('blob:')) {
			URL.revokeObjectURL(urlToClean)
		}

		const updatedData = newData.filter((_, i) => i !== index)
		setNewData(updatedData)
		updateEditData(keyName, updatedData)

		// Remove the preview entry and reindex remaining previews
		const newPreviews = {}
		Object.entries(imagePreview).forEach(([key, value]) => {
			const keyIndex = parseInt(key)
			if (keyIndex < index) {
				newPreviews[keyIndex] = value
			} else if (keyIndex > index) {
				newPreviews[keyIndex - 1] = value
			}
			// Skip the deleted index
		})
		setImagePreview(newPreviews)
		setActiveDeliverable(-1)
	}

	const editDeliverable = index => {
		setActiveDeliverable(index)
		const deliverableData = newData[index] || {
			title: '',
			description: '',
			link: '',
			role: [],
			codeLink: '',
			imageLink: '',
		}
		setFormData(deliverableData)

		// If there's an existing image, show it as preview
		if (deliverableData.imageLink && !imagePreview[index]) {
			setImagePreview(prev => ({
				...prev,
				[index]: deliverableData.imageLink,
			}))
		}
	}

	const cancelEdit = () => {
		setActiveDeliverable(-1)
		setFormData({
			title: '',
			description: '',
			link: '',
			role: [],
			codeLink: '',
			imageLink: '',
		})
	}

	useEffect(() => {
		if (editData && editData.length === 0 && editMode) {
			addNewDeliverable()
		}
	}, [editMode, editData])

	// Reset previews when resetPreviews prop changes
	useEffect(() => {
		if (resetPreviews) {
			// Clean up existing blob URLs first
			cleanupBlobUrls()

			const newPreviews = {}
			if (editData && editData.length > 0) {
				editData.forEach((item, index) => {
					if (item.imageLink && !item.imageLink.startsWith('blob:')) {
						newPreviews[index] = item.imageLink
					}
				})
			}
			setImagePreview(newPreviews)
		}
	}, [resetPreviews, editData])

	// Cleanup blob URLs on unmount to prevent memory leaks
	useEffect(() => {
		return () => {
			Object.values(imagePreview).forEach(url => {
				if (url && url.startsWith('blob:')) {
					URL.revokeObjectURL(url)
				}
			})
		}
	}, [imagePreview])
	return (
		<div className={styles.container}>
			{editMode && (
				<div style={{ marginBottom: 20 }}>
					{/* Add New Deliverable Button */}
					{activeDeliverable === -1 && (
						<Button
							variant='outlined'
							onClick={addNewDeliverable}
							style={{ marginBottom: 20 }}
						>
							新しい成果物を追加
						</Button>
					)}

					{/* Edit Form */}
					{activeDeliverable >= 0 && (
						<form
							style={{
								width: '546px',
								display: 'flex',
								flexDirection: 'column',
								gap: 15,
								backgroundColor: '#f9fafb',
								padding: 20,
								borderRadius: 10,
								border: '1px solid #e5e7eb',
							}}
						>
							{/* Image Upload */}
							<div
								style={{
									width: '100%',
									height: '192px',
									borderRadius: '10px',
									border: '1px dashed #d1d5db',
									backgroundColor: '#ffffff',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									position: 'relative',
									cursor: 'pointer',
									backgroundImage: imagePreview[activeDeliverable]
										? `url(${imagePreview[activeDeliverable]})`
										: formData.imageLink
											? `url(${formData.imageLink})`
											: 'none',
									backgroundSize: 'cover',
									backgroundPosition: 'center',
								}}
								onClick={() => fileInputRef.current?.click()}
							>
								{!imagePreview[activeDeliverable] && !formData.imageLink && (
									<>
										<AddPhotoAlternateOutlinedIcon
											style={{ fontSize: '40px', color: '#9ca3af' }}
										/>
										<div style={{ color: '#4b5563', marginTop: '8px' }}>
											画像を追加
										</div>
									</>
								)}
								<input
									ref={fileInputRef}
									type='file'
									accept='image/*'
									onChange={handleImageUpload}
									style={{
										position: 'absolute',
										width: '100%',
										height: '100%',
										top: 0,
										left: 0,
										opacity: 0,
										cursor: 'pointer',
									}}
								/>
							</div>

							{/* Form Fields */}
							<div
								style={{ display: 'flex', flexDirection: 'column', gap: 15 }}
							>
								<div>
									<input
										ref={textFieldRef}
										type='text'
										placeholder='プロジェクト名'
										value={formData.title}
										onChange={e => handleInputChange('title', e.target.value)}
										style={{
											width: '100%',
											height: 40,
											padding: '8px 15px',
											fontSize: 14,
											border: '1px solid #e0e0e0',
											borderRadius: 6,
										}}
									/>
								</div>
								<div>
									<textarea
										placeholder='プロジェクトの簡単な説明'
										value={formData.description}
										onChange={e =>
											handleInputChange('description', e.target.value)
										}
										style={{
											width: '100%',
											height: 80,
											padding: '8px 15px',
											fontSize: 14,
											border: '1px solid #e0e0e0',
											borderRadius: 6,
											resize: 'vertical',
										}}
									/>
								</div>
								<div>
									<input
										type='text'
										placeholder='プロジェクトリンクを投稿する'
										value={formData.link}
										onChange={e => handleInputChange('link', e.target.value)}
										style={{
											width: '100%',
											height: 40,
											padding: '8px 15px',
											fontSize: 14,
											border: '1px solid #e0e0e0',
											borderRadius: 6,
										}}
									/>
								</div>
								<div>
									<input
										type='text'
										placeholder='コードリンク (GitHub等)'
										value={formData.codeLink}
										onChange={e =>
											handleInputChange('codeLink', e.target.value)
										}
										style={{
											width: '100%',
											height: 40,
											padding: '8px 15px',
											fontSize: 14,
											border: '1px solid #e0e0e0',
											borderRadius: 6,
										}}
									/>
								</div>
								<div>
									<input
										type='text'
										placeholder='担当役割 (例: フロントエンド開発, デザイン)'
										value={
											Array.isArray(formData.role)
												? formData.role.join(', ')
												: formData.role
										}
										onChange={e =>
											handleInputChange(
												'role',
												e.target.value
													.split(',')
													.map(r => r.trim())
													.filter(r => r)
											)
										}
										style={{
											width: '100%',
											height: 40,
											padding: '8px 15px',
											fontSize: 14,
											border: '1px solid #e0e0e0',
											borderRadius: 6,
										}}
									/>
								</div>

								{/* Action Buttons */}
								<div style={{ display: 'flex', gap: 10 }}>
									<Button
										variant='contained'
										onClick={saveDeliverable}
										disabled={!formData.title.trim()}
									>
										保存
									</Button>
									<Button variant='outlined' onClick={cancelEdit}>
										キャンセル
									</Button>
								</div>
							</div>
						</form>
					)}

					{/* Existing Deliverables List in Edit Mode */}
					{newData.length > 0 && activeDeliverable === -1 && (
						<div style={{ marginTop: 20 }}>
							<h3>既存の成果物</h3>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: '1fr 1fr',
									gap: 15,
								}}
							>
								{newData.map((item, index) => (
									<div
										key={index}
										style={{
											display: 'flex',
											alignItems: 'center',
											padding: 15,
											border: '1px solid #e5e7eb',
											borderRadius: 10,
											backgroundColor: '#ffffff',
										}}
									>
										{item.imageLink && !item.imageLink.startsWith('blob:') && (
											<img
												src={item.imageLink}
												alt={item.title}
												style={{
													width: 60,
													height: 60,
													objectFit: 'cover',
													borderRadius: 6,
													marginRight: 15,
												}}
												onError={e => {
													console.log(
														'Edit mode image failed to load:',
														item.imageLink
													)
													e.target.style.display = 'none'
												}}
											/>
										)}
										<div style={{ flex: 1 }}>
											<div style={{ fontWeight: 600, marginBottom: 5 }}>
												{item.title || '無題'}
											</div>
											<div style={{ fontSize: 14, color: '#6b7280' }}>
												{item.description || '説明なし'}
											</div>
										</div>
										<div style={{ display: 'flex', gap: 10 }}>
											<Button
												size='small'
												variant='outlined'
												onClick={() => editDeliverable(index)}
											>
												編集
											</Button>
											<IconButton
												size='small'
												color='error'
												onClick={() => deleteDeliverable(index)}
											>
												<DeleteOutlineIcon />
											</IconButton>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Display Mode */}
			{!editMode && (
				<div>
					{data && data.length > 0 ? (
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: 20,
							}}
						>
							{data.map((item, ind) => (
								<div key={ind} className={styles.item}>
									{item.imageLink && !item.imageLink.startsWith('blob:') && (
										<img
											src={item.imageLink}
											alt={item.title}
											onError={e => {
												console.warn(
													'View mode image failed to load:',
													item.imageLink
												)
												e.target.style.display = 'none'
											}}
										/>
									)}
									<div style={{ padding: 15 }}>
										<div className={styles.title}>{item.title}</div>
										<div className={styles.description}>{item.description}</div>
										<div className={styles.roles}>
											{Array.isArray(item.role) &&
												item.role.length > 0 &&
												item.role.map((Role, index) => (
													<div key={index} className={styles.role}>
														{Role}
													</div>
												))}
										</div>
										<div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
											{item.link && (
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
													<LaunchIcon sx={{ color: '#5627DB', fontSize: 16 }} />
												</a>
											)}
											{item.codeLink && (
												<a
													href={item.codeLink}
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
													View Code
													<LaunchIcon sx={{ color: '#5627DB', fontSize: 16 }} />
												</a>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div
							style={{
								textAlign: 'center',
								padding: 40,
								color: '#6b7280',
								fontSize: 16,
							}}
						>
							成果物がありません。
						</div>
					)}
				</div>
			)}
		</div>
	)
}

Deliverables.propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string,
			description: PropTypes.string,
			link: PropTypes.string,
			role: PropTypes.arrayOf(PropTypes.string),
			codeLink: PropTypes.string,
			imageLink: PropTypes.string,
		})
	),
	editData: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string,
			description: PropTypes.string,
			link: PropTypes.string,
			role: PropTypes.arrayOf(PropTypes.string),
			codeLink: PropTypes.string,
			imageLink: PropTypes.string,
		})
	),
	editMode: PropTypes.bool,
	updateEditData: PropTypes.func,
	keyName: PropTypes.string,
	updateEditMode: PropTypes.func,
	onImageUpload: PropTypes.func,
	resetPreviews: PropTypes.bool,
}

export default Deliverables
