import React, { useState, useEffect } from 'react'
import { Box, Typography, Paper } from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'
import RecruiterFileUpload from './RecruiterFileUpload'
import RecruiterFileList from './RecruiterFileList'

const RecruiterFiles = () => {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key
	
	const [files, setFiles] = useState([])
	const [totalSize, setTotalSize] = useState(0)
	const [loading, setLoading] = useState(true)
	
	useEffect(() => {
		fetchFiles()
	}, [])
	
	const fetchFiles = async () => {
		try {
			setLoading(true)
			const response = await axios.get('/api/recruiter-files')
			setFiles(response.data.files || response.data) // Handle both old and new response format
			setTotalSize(response.data.totalSize || 0)
		} catch (error) {
			console.error('Error fetching files:', error)
		} finally {
			setLoading(false)
		}
	}
	
	const handleUploadSuccess = (uploadedFiles) => {
		// Refresh the files list to get updated total size
		fetchFiles()
	}
	
	const handleFileDeleted = (fileId) => {
		// Refresh the files list to get updated total size
		fetchFiles()
	}
	
	return (
		<Paper elevation={1} sx={{ p: 3, mb: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
				<AttachFileIcon sx={{ mr: 1, color: 'primary.main' }} />
				<Typography variant="h6" component="h2">
					{t.company_documents || 'Company Documents'}
				</Typography>
			</Box>
			
			<RecruiterFileUpload
				onUploadSuccess={handleUploadSuccess}
				existingFilesCount={files.length}
				existingFilesSize={totalSize}
			/>
			
			<RecruiterFileList
				files={files}
				onFileDeleted={handleFileDeleted}
				loading={loading}
			/>
		</Paper>
	)
}

export default RecruiterFiles