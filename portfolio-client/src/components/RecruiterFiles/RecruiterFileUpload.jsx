import React, { useState, useRef } from 'react'
import {
	Box,
	Button,
	Typography,
	LinearProgress,
	Alert,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAlert } from '../../contexts/AlertContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'

const RecruiterFileUpload = ({ onUploadSuccess, existingFilesCount = 0, existingFilesSize = 0, editMode = false }) => {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key
	const showAlert = useAlert()
	const fileInputRef = useRef(null)
	
	const [uploading, setUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [selectedFiles, setSelectedFiles] = useState([])
	
	const MAX_FILES = 3
	const MAX_SIZE = 20 * 1024 * 1024 // 20MB
	const ALLOWED_TYPES = {
		'application/pdf': '.pdf',
		'application/msword': '.doc',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
		'application/vnd.ms-excel': '.xls',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
		'application/vnd.ms-powerpoint': '.ppt',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
		'application/vnd.ms-powerpoint.presentation.macroEnabled.12': '.pptx',
		'application/powerpoint': '.ppt',
		'application/x-mspowerpoint': '.ppt'
	}
	
	const handleFileSelect = (event) => {
		const files = Array.from(event.target.files)
		const remainingSlots = MAX_FILES - existingFilesCount
		
		if (files.length === 0) return
		
		// Double-check if max files reached
		if (existingFilesCount >= MAX_FILES) {
			showAlert(t('max_files_reached'), 'error')
			event.target.value = '' // Clear input
			return
		}
		
		// Check remaining slots
		if (remainingSlots <= 0) {
			showAlert(t('max_files_reached'), 'error')
			event.target.value = '' // Clear input
			return
		}
		
		if (files.length > remainingSlots) {
			showAlert(`${t('can_upload_only')} ${remainingSlots} ${t('more_files')}`, 'error')
			return
		}
		
		// Calculate remaining space
		const remainingSpace = MAX_SIZE - existingFilesSize
		
		// Validate files
		const validFiles = []
		let totalSize = 0
		
		for (const file of files) {
			// Debug log
			console.log('File info:', {
				name: file.name,
				type: file.type,
				size: file.size
			})
			
			// Check file type
			if (!ALLOWED_TYPES[file.type]) {
				showAlert(`${file.name}: ${t('invalid_file_type')} (${file.type})`, 'error')
				continue
			}
			
			// No individual file size limit - only total size matters
			totalSize += file.size
			validFiles.push(file)
		}
		
		// Check if new files fit in remaining space
		if (totalSize > remainingSpace) {
			const remainingMB = (remainingSpace / 1024 / 1024).toFixed(1)
			showAlert(`${t('insufficient_space')}: ${remainingMB}MB`, 'error')
			return
		}
		
		if (validFiles.length > 0) {
			setSelectedFiles(validFiles)
		}
	}
	
	const handleUpload = async () => {
		if (selectedFiles.length === 0) return
		
		setUploading(true)
		setUploadProgress(0)
		
		try {
			const formData = new FormData()
			selectedFiles.forEach(file => {
				console.log('Appending file to FormData:', file.name, file.size)
				formData.append('files', file)
			})
			
			const response = await axios.post('/api/recruiter-files', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				onUploadProgress: (progressEvent) => {
					const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
					setUploadProgress(percentCompleted)
				}
			})
			
			showAlert(t('files_uploaded_successfully'), 'success')
			
			// Clear selection
			setSelectedFiles([])
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
			
			// Notify parent component
			if (onUploadSuccess) {
				onUploadSuccess(response.data)
			}
		} catch (error) {
			console.error('Upload error:', error)
			showAlert(t('upload_failed'), 'error')
		} finally {
			setUploading(false)
			setUploadProgress(0)
		}
	}
	
	const formatFileSize = (bytes) => {
		if (!bytes || bytes === 0) return '0 B'
		if (bytes < 1024) return bytes + ' B'
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
	}
	
	// Don't show upload UI if not in edit mode
	if (!editMode) {
		return null
	}

	return (
		<Box sx={{ mb: 3 }}>
			<Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
				{t('upload_info')}
			</Typography>
			
			{existingFilesSize > 0 && (
				<Typography variant="body2" sx={{ mb: 2, color: 'info.main' }}>
					{t('space_used')}: {(existingFilesSize / 1024 / 1024).toFixed(1)}MB / 20MB | 
					{' '}{t('available')}: {((MAX_SIZE - existingFilesSize) / 1024 / 1024).toFixed(1)}MB
				</Typography>
			)}
			
			<input
				ref={fileInputRef}
				type="file"
				multiple
				accept={Object.values(ALLOWED_TYPES).join(',')}
				onChange={handleFileSelect}
				style={{ display: 'none' }}
				id="recruiter-file-input"
				disabled={existingFilesCount >= MAX_FILES}
			/>
			
			<label htmlFor="recruiter-file-input">
				<Button
					variant="outlined"
					component="span"
					startIcon={<CloudUploadIcon />}
					disabled={uploading || existingFilesCount >= MAX_FILES}
					sx={{ mb: 2 }}
				>
					{t('select_files')}
				</Button>
			</label>
			
			{selectedFiles.length > 0 && (
				<Box sx={{ mb: 2 }}>
					<Typography variant="subtitle2" sx={{ mb: 1 }}>
						{t('selected_files')}:
					</Typography>
					{selectedFiles.map((file, index) => (
						<Typography key={index} variant="body2" sx={{ ml: 2 }}>
							• {file.name} ({formatFileSize(file.size)})
						</Typography>
					))}
					
					<Button
						variant="contained"
						onClick={handleUpload}
						disabled={uploading}
						sx={{ mt: 2 }}
					>
						{uploading ? t('uploading') : t('upload')}
					</Button>
				</Box>
			)}
			
			{uploading && (
				<LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />
			)}
			
			{existingFilesCount >= MAX_FILES && (
				<Alert severity="info" sx={{ mt: 2 }}>
					{t('max_files_info')}
				</Alert>
			)}
		</Box>
	)
}

export default RecruiterFileUpload