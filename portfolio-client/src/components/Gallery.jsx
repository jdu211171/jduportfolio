import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Input,
  Typography,
  Button,
  Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import styles from './Gallery.module.css'

const Gallery = ({
  galleryUrls,
  newImages,
  deletedUrls,
  editMode,
  updateEditData,
  keyName,
  parentKey = null,
}) => {
  const [open, setOpen] = useState(false)
  const [newImageUrls, setNewImageUrls] = useState([])
  const fileInputRef = useRef(null)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const MAX_SIZE = 5 * 1024 * 1024

    for (let file of files) {
      if (file.size > MAX_SIZE) {
        alert(`ファイル "${file.name}" は最大5MBのサイズを超えています。`)
        return
      }
    }

    updateEditData(files, true, false, (parentKey = parentKey))
  }

  const handleFileDelete = (index, isNewFiles = false) => {
    updateEditData(index, isNewFiles, true, (parentKey = parentKey))
  }

  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file))
    setNewImageUrls(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [newImages])

  const handleAddImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <Box>
      <Box className={styles.galleryContainer}>
        {(parentKey
          ? galleryUrls[parentKey]?.[keyName].slice(0, 2)
          : galleryUrls[keyName].slice(0, 2)
        ).map((url, index) => (
          <div className={styles.galleryImageContainer} key={`gallery-${index}`}>
            <img
              src={url}
              alt={`ギャラリー ${index}`}
              className={styles.galleryImage}
              onClick={handleClickOpen}
            />
          </div>
        ))}
        {editMode && (
          <Tooltip
            title="クリックして画像をアップロードしてください。対応形式: JPG, PNG 最大ファイルサイズ: 5MB。画像の理想的なサイズは、最適のサイズは500x500pxです。"
            placement="top"
          >
            <label
              htmlFor="file-upload"
              className={styles.editPlaceholder}
              onClick={handleAddImageClick}
            >
              <Typography variant="h6">画像を追加</Typography>
            </label>
          </Tooltip>
        )}
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          ギャラリー
          <IconButton
            aria-label="閉じる"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box className={styles.fullGalleryContainer}>
            {(parentKey ? galleryUrls[parentKey]?.[keyName] : galleryUrls[keyName]).map(
              (url, index) => (
                <div className={styles.fullGalleryImageContainer} key={`gallery-full-${index}`}>
                  <img src={url} alt={`ギャラリー ${index}`} className={styles.fullGalleryImage} />
                  {editMode && (
                    <IconButton
                      aria-label="削除"
                      onClick={() => handleFileDelete(index)}
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        color: 'red',
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </div>
              )
            )}
            {newImageUrls.map((url, index) => (
              <div className={styles.fullGalleryImageContainer} key={`new-${index}`}>
                <img
                  src={url}
                  alt={`新しいギャラリー ${index}`}
                  className={styles.fullGalleryImage}
                />
                {editMode && (
                  <IconButton
                    aria-label="削除"
                    onClick={() => handleFileDelete(index, true)}
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      color: 'red',
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </div>
            ))}
            {editMode && (
              <Tooltip
                title="クリックして画像をアップロードしてください。対応形式: JPG, PNG 最大ファイルサイズ: 5MB。画像の理想的なサイズは、最適のサイズは500x500pxです。"
                placement="top"
              >
                <label
                  htmlFor="file-upload"
                  className={styles.editPlaceholder}
                  onClick={handleAddImageClick}
                >
                  <Typography variant="h6">画像を追加</Typography>
                </label>
              </Tooltip>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Input
        id="file-upload"
        type="file"
        inputProps={{ multiple: true, accept: 'image/jpeg, image/png' }}
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </Box>
  )
}

export default Gallery
