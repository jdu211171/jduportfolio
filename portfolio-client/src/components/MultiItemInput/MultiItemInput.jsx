import React, { useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Box, Chip, TextField, Typography, IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import styles from './MultiItemInput.module.css'

// Normalize an array of strings: trim, drop empty, dedupe (case-insensitive)
const normalizeItems = items => {
	const seen = new Set()
	const out = []
	for (const raw of Array.isArray(items) ? items : []) {
		const s = String(raw || '').trim()
		if (!s) continue
		const key = s.toLowerCase()
		if (seen.has(key)) continue
		seen.add(key)
		out.push(s)
	}
	return out
}

const splitInput = value => {
	const str = String(value || '')
	if (!str) return []
	return str
		.split(/[\n,]+/) // split by newline or comma
		.map(s => s.trim())
		.filter(Boolean)
}

const MultiItemInput = ({ value = [], onChange, placeholder, helperText, maxTotalChars = 500, suggestions = [] }) => {
	const [draft, setDraft] = useState('')
	const inputRef = useRef(null)

	const items = useMemo(() => normalizeItems(value), [value])

	const totalChars = useMemo(() => {
		const joined = items.join(', ')
		return joined.length + (draft ? (joined.length ? 2 : 0) + draft.length : 0) // account for ", " if needed
	}, [items, draft])

	const remaining = Math.max(0, maxTotalChars - totalChars)

	const commitTokens = tokens => {
		if (!onChange) return
		const next = normalizeItems([...items, ...tokens])
		onChange(next)
	}

	const handleAdd = () => {
		const tokens = splitInput(draft)
		if (tokens.length === 0) return
		commitTokens(tokens)
		setDraft('')
		inputRef.current?.focus()
	}

	const handleKeyDown = e => {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault()
			handleAdd()
		} else if (e.key === 'Backspace' && draft === '' && items.length > 0) {
			// remove last chip when backspace on empty input
			onChange(items.slice(0, -1))
		}
	}

	const handlePaste = e => {
		const text = e.clipboardData.getData('text')
		if (!text) return
		e.preventDefault()
		const tokens = splitInput(text)
		if (tokens.length > 0) {
			commitTokens(tokens)
			setDraft('')
		}
	}

	const handleDelete = idx => {
		if (!onChange) return
		const next = items.filter((_, i) => i !== idx)
		onChange(next)
	}

	const handleSuggestion = s => {
		if (!onChange) return
		const next = normalizeItems([...items, s])
		onChange(next)
	}

	return (
		<Box className={styles.container}>
			{items.length > 0 && (
				<Box className={styles.chips}>
					{items.map((tag, i) => (
						<Chip
							key={`${tag}-${i}`}
							label={tag}
							onDelete={() => handleDelete(i)}
							variant='filled'
							sx={{
								backgroundColor: '#efeafc',
								color: '#5627db',
								fontWeight: 500,
							}}
						/>
					))}
				</Box>
			)}

			<Box className={styles.inputRow}>
				<TextField inputRef={inputRef} fullWidth size='small' placeholder={placeholder} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste} inputProps={{ maxLength: Math.max(0, maxTotalChars) }} helperText={helperText} />
				<Tooltip title='Add'>
					<IconButton color='primary' onClick={handleAdd}>
						<AddIcon />
					</IconButton>
				</Tooltip>
			</Box>

			<Box className={styles.helperRow}>
				{suggestions?.length > 0 ? (
					<Box className={styles.suggestions}>
						{suggestions.map(s => (
							<Chip key={`sg-${s}`} label={s} onClick={() => handleSuggestion(s)} variant='outlined' size='small' />
						))}
					</Box>
				) : (
					<span />
				)}
				<Typography className={styles.counter}>
					{totalChars}/{maxTotalChars}
				</Typography>
			</Box>
		</Box>
	)
}

MultiItemInput.propTypes = {
	value: PropTypes.arrayOf(PropTypes.string),
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	helperText: PropTypes.string,
	maxTotalChars: PropTypes.number,
	suggestions: PropTypes.arrayOf(PropTypes.string),
}

export default MultiItemInput
