import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Checkbox,
  Divider,
  Box,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import translations from '../../locales/translations.js'
import { useLanguage } from '../../contexts/LanguageContext.jsx'

function ConfirmationDialog({ open, onClose, onConfirm }) {
  const [checked, setChecked] = React.useState(false)
  const { language } = useLanguage()
  const t = (key) => translations[language][key] || key

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" closeAfterTransition={false}>
      {/* Large Title */}
      <DialogTitle sx={{ fontWeight: '100' }}>{t('profile_publish_request')}</DialogTitle>

      <DialogContent dividers>
        <Divider sx={{ my: 1 }} />

        {/* Main content */}
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
          {t('profile_publish_explanation')}
        </Typography>

        <Divider sx={{ my: 1 }} />

        {/* Prohibited actions section */}
        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
          {t('prohibited_actions')}
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {t('prohibited_actions_content')}
        </Typography>

        <Divider sx={{ my: 1 }} />

        {/* Agreement checkbox */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <Typography>{t('confirm_no_prohibited_actions')}</Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ pr: 3, pb: 2 }}>
        <Button variant="outlined" color="error" onClick={onClose} sx={{ mr: 2 }}>
          {t('no_button')}
        </Button>

        <Button variant="contained" color="primary" onClick={onConfirm} disabled={!checked}>
          {t('apply_button')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
