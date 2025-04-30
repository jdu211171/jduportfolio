import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
	Autocomplete,
	Box,
	Button,
	ButtonGroup,
	Checkbox,
	Collapse,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormLabel,
	Grid,
	IconButton,
	Radio,
	RadioGroup,
	TextField,
} from '@mui/material'
import { debounce } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'; // Import the language context
import translations from '../../locales/translations'; // Import translations
import style from './Filter.module.css'

const Filter = ({ fields, filterState, onFilterChange }) => {
	const { language } = useLanguage() // Get the current language
	const t = key => translations[language][key] || key // Translation function

	const [open, setOpen] = useState(false)
	const [collapse, setCollapse] = useState(false)
	const [localFilterState, setLocalFilterState] = useState(filterState)
	const [inputValue, setInputValue] = useState('')
	const [noMatches, setNoMatches] = useState(false)

	// Memoize all potential filter options for suggestions
	const allFilterOptions = useMemo(() => {
		const options = []
		fields.forEach(field => {
			if (field.options) {
				field.options.forEach(option => {
					options.push({
						label: option,
						field: field.key,
						type: field.type
					})
				})
			}
		})
		return options
	}, [fields])

	// Create suggestions based on input
	const [suggestions, setSuggestions] = useState([])

	useEffect(() => {
		if (!inputValue.trim()) {
			setSuggestions([])
			return
		}

		const filtered = allFilterOptions.filter(option =>
			option.label.toLowerCase().includes(inputValue.toLowerCase())
		)
		setSuggestions(filtered)
		setNoMatches(inputValue.trim().length > 0 && filtered.length === 0)
	}, [inputValue, allFilterOptions])

	// Debounce input changes for performance
	const debouncedSetInputValue = useMemo(
		() => debounce(value => setInputValue(value), 300),
		[]
	)

	// Clean up debounce on unmount
	useEffect(() => {
		return () => {
			debouncedSetInputValue.cancel()
		}
	}, [debouncedSetInputValue])

	const handleChange = (key, value) => {
		setLocalFilterState(prevState => ({
			...prevState,
			[key]: value,
		}))

		// Auto-expand the form when a filter is selected
		if (key !== 'search' && !open) {
			setOpen(true)
			setCollapse(true)
		}
	}

	const renderField = (field, index) => {
		const width = field.minWidth || '160px'

		switch (field.type) {
			case 'radio':
				return (
					<FormControl
						key={field.key + index}
						component='fieldset'
						sx={{ m: 1 }}
						style={{ width }}
					>
						<FormLabel component='legend'>{field.label}</FormLabel>
						<RadioGroup
							value={localFilterState[field.key] || ''}
							onChange={e => handleChange(field.key, e.target.value)}
						>
							{field.options.map(option => (
								<FormControlLabel
									key={option}
									value={option}
									control={<Radio />}
									label={option + (field.unit ? field.unit : '')}
								/>
							))}
						</RadioGroup>
					</FormControl>
				)
			case 'checkbox':
				return (
					<FormControl
						key={field.key + index}
						component='fieldset'
						sx={{ m: 1 }}
						style={{ width }}
					>
						<FormLabel component='legend'>{field.label}</FormLabel>
						<FormGroup>
							{field.options.map(option => (
								<FormControlLabel
									key={option}
									control={
										<Checkbox
											checked={(localFilterState[field.key] || []).includes(
												option
											)}
											onChange={e => {
												const newValue = (
													localFilterState[field.key] || []
												).includes(option)
													? (localFilterState[field.key] || []).filter(
														item => item !== option
													)
													: [...(localFilterState[field.key] || []), option]
												handleChange(field.key, newValue)
											}}
										/>
									}
									label={option + (field.unit ? field.unit : '')}
								/>
							))}
						</FormGroup>
					</FormControl>
				)
			default:
				return null
		}
	}

	const handleSubmit = e => {
		e.preventDefault()
		onFilterChange(localFilterState) // Update filterState with localFilterState
		handleClick()
	}

	const handleClear = () => {
		// Reset local filter state to initial state (or empty state)
		const clearedFilterState = fields.reduce((acc, field) => {
			if (field.type === 'checkbox') {
				acc[field.key] = [] // Reset checkbox arrays to empty
			} else {
				acc[field.key] = '' // Reset other fields to empty strings
			}
			return acc
		}, {})

		setLocalFilterState(clearedFilterState) // Update local state
		onFilterChange(clearedFilterState) // Notify parent component with cleared filters
	}

	const handleClick = (onSearch = false) => {
		if (!open && onSearch) {
			setOpen(true)
			setCollapse(true)
		} else {
			setCollapse(false)
			setTimeout(() => {
				setOpen(false)
			}, 300)
		}
	}

	return (
		<Box
			component='form'
			onSubmit={handleSubmit}
			className={open ? style.open : style.closed}
			id='filter'
		>
			<Grid
				container
				spacing={1}
				className={style.filterBar}
				justifyContent='space-between'
			>
				<Grid item xs={2}>
					<ButtonGroup fullWidth>
						<Button
							variant='contained'
							color='primary'
							type='submit'
							sx={{
								fontSize: {
									xs: '0.75rem', // Small screen
									sm: '1rem', // Medium and larger screens
								},
								padding: {
									xs: '0px 0px', // Small screen
									sm: '0px 0px', // Medium and larger screens
								},
							}}
						>
							{t('search')} {/* Translation for 検索 */}
						</Button>
					</ButtonGroup>
				</Grid>
				<Grid item xs={10} sx={{ p: 1 }}>
					<FormControl fullWidth>
						<Autocomplete
							freeSolo
							options={suggestions}
							getOptionLabel={(option) => typeof option === 'string' ? option : option.label}
							inputValue={inputValue}
							onInputChange={(event, newInputValue) => {
								debouncedSetInputValue(newInputValue)
							}}
							onChange={(event, newValue) => {
								if (newValue && typeof newValue !== 'string') {
									// User selected a suggestion
									setCollapse(true)
									setOpen(true)

									handleChange(newValue.field, newValue.type === 'checkbox' ? [newValue.label] : newValue.label)
								}
							}}
							noOptionsText={noMatches ? t('no_matches_found') : t('start_typing')}
							renderInput={(params) => (
								<TextField
									{...params}
									className={style.textfield}
									label={t('name_search')}
									value={localFilterState.search || ''}
									onChange={(e) => {
										handleChange('search', e.target.value)
										setInputValue(e.target.value)
									}}
									onClick={() => handleClick(true)}
									aria-label={t('search_filters')}
								/>
							)}
						/>
					</FormControl>
				</Grid>
			</Grid>
			<Grid item xs={12} style={{ position: 'relative' }}>
				<div className={style.clear} onClick={handleClear}>
					{t('reset')} {/* Translation for 戻る */}
				</div>
				<div className={style.filterButtonContainer}>
					{fields.length > 1 && (
						<IconButton onClick={handleClick} className={style.filterButton}>
							{open ? (
								<ExpandLessIcon fontSize='large' />
							) : (
								<ExpandMoreIcon fontSize='large' />
							)}
						</IconButton>
					)}
				</div>
			</Grid>
			<Collapse in={collapse} timeout={300}>
				<Grid my={1} container spacing={1} className={style.filterFields}>
					{fields.map((field, index) => renderField(field, index))}
				</Grid>
			</Collapse>
		</Box>
	)
}

export default Filter
