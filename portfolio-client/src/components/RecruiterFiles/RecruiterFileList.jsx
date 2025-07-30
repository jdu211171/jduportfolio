import React, { useState } from 'react'
import {
	Box,
	Typography,
	IconButton,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	CircularProgress,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteIcon from '@mui/icons-material/Delete'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAlert } from '../../contexts/AlertContext'
import translations from '../../locales/translations'
import axios from '../../utils/axiosUtils'

const RecruiterFileList = ({ files = [], onFileDeleted, loading = false }) => {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key
	const showAlert = useAlert()
	
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [fileToDelete, setFileToDelete] = useState(null)
	const [deleting, setDeleting] = useState(false)
	
	const handleDownload = (file) => {
		// Direct window.open (most reliable for S3)
		window.open(file.file_url, '_blank')
	}
	
	const handleDeleteClick = (file) => {
		setFileToDelete(file)
		setDeleteDialogOpen(true)
	}
	
	const handleDeleteConfirm = async () => {
		if (!fileToDelete) return
		
		setDeleting(true)
		try {
			await axios.delete(`/api/recruiter-files/${fileToDelete.id}`)
			showAlert(t.file_deleted || 'File deleted successfully', 'success')
			
			if (onFileDeleted) {
				onFileDeleted(fileToDelete.id)
			}
			
			setDeleteDialogOpen(false)
			setFileToDelete(null)
		} catch (error) {
			console.error('Delete error:', error)
			showAlert(t.delete_failed || 'Delete failed', 'error')
		} finally {
			setDeleting(false)
		}
	}
	
	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false)
		setFileToDelete(null)
	}
	
	const formatFileSize = (bytes) => {
		if (!bytes || bytes === 0) return '0 B'
		if (bytes < 1024) return bytes + ' B'
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
	}
	
	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
				<CircularProgress />
			</Box>
		)
	}
	
	if (files.length === 0) {
		return (
			<Box sx={{ textAlign: 'center', py: 3 }}>
				<Typography color="text.secondary">
					{t.no_files_uploaded || 'No files uploaded yet'}
				</Typography>
			</Box>
		)
	}
	
	return (
		<>
			<List>
				{files.map((file) => (
					<ListItem
						key={file.id}
						sx={{
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: 1,
							mb: 1,
							'&:hover': {
								backgroundColor: 'action.hover',
							},
						}}
					>
						<InsertDriveFileIcon sx={{ mr: 2, color: 'primary.main' }} />
						<ListItemText
							primary={file.original_filename}
							secondary={`${new Date(file.createdAt).toLocaleDateString()} • ${formatFileSize(file.file_size || 0)}`}
							sx={{ wordBreak: 'break-word' }}
						/>
						<ListItemSecondaryAction>
							<IconButton
								edge="end"
								aria-label="download"
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									handleDownload(file)
								}}
								sx={{ mr: 1 }}
							>
								<DownloadIcon />
							</IconButton>
							<IconButton
								edge="end"
								aria-label="delete"
								onClick={() => handleDeleteClick(file)}
							>
								<DeleteIcon />
							</IconButton>
						</ListItemSecondaryAction>
					</ListItem>
				))}
			</List>
			
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				maxWidth="xs"
				fullWidth
			>
				<DialogTitle>
					{t.delete_file || 'Delete File'}
				</DialogTitle>
				<DialogContent>
					<Typography>
						{t.delete_file_confirm || 'Are you sure you want to delete this file?'}
					</Typography>
					{fileToDelete && (
						<Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
							{fileToDelete.original_filename}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDeleteCancel} disabled={deleting}>
						{t.cancel || 'Cancel'}
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						color="error"
						variant="contained"
						disabled={deleting}
						startIcon={deleting ? <CircularProgress size={20} /> : null}
					>
						{deleting ? t.deleting || 'Deleting...' : t.delete || 'Delete'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}

export default RecruiterFileList