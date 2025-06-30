import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import SearchIcon from '../../assets/icons/search-line.svg'
import FilterIcon from '../../assets/icons/filter-2-line.svg'
import AppIcons from '../../assets/icons/apps-2-line.svg'
import AppIconList from '../../assets/icons/list-unordered.svg'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'
import style from './Filter.module.css'
import { debounce } from 'lodash'
import PropTypes from 'prop-types'

const Filter = ({
	fields,
	filterState,
	onFilterChange,
	onGridViewClick,
	viewMode = 'grid',
	onViewModeChange,
	persistKey = 'filter-state',
}) => {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	// Load initial state ONCE with validation
	const getInitialState = useCallback(() => {
		try {
			const saved = localStorage.getItem(persistKey)
			if (saved) {
				const parsedState = JSON.parse(saved)
				// Validate saved state against current fields
				const validatedState = { ...filterState }

				Object.keys(parsedState).forEach(key => {
					const field = fields.find(f => f.key === key) || { key: 'search' }
					if (field && parsedState[key] !== undefined) {
						validatedState[key] = parsedState[key]
					}
				})

				return validatedState
			}
		} catch (error) {
			console.warn('Error loading filter state from localStorage:', error)
			localStorage.removeItem(persistKey) // Clear corrupted data
		}
		return filterState
	}, [persistKey, filterState, fields])

	const [localFilterState, setLocalFilterState] = useState(getInitialState)
	const [inputValue, setInputValue] = useState(
		() => getInitialState().search || ''
	)
	const [noMatches, setNoMatches] = useState(false)
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

	// Filter modal state
	const [showFilterModal, setShowFilterModal] = useState(false)
	const [tempFilterState, setTempFilterState] = useState(getInitialState)

	// Track if this is the initial mount
	const isInitialMount = useRef(true)

	// IMPORTANT: Call parent immediately on mount with saved filter state
	useEffect(() => {
		if (isInitialMount.current) {
			// Check if there's any saved filter state that needs to be applied
			const hasActiveFilters = Object.entries(localFilterState).some(
				([key, value]) => {
					if (key === 'search' && value) return true
					if (Array.isArray(value) && value.length > 0) return true
					if (!Array.isArray(value) && value && value !== '') return true
					return false
				}
			)

			// Always call parent with current state (whether empty or with filters)
			onFilterChange(localFilterState)
			isInitialMount.current = false
		}
	}, [localFilterState, onFilterChange])

	// Debounced save to localStorage
	const debouncedSaveToStorage = useMemo(
		() =>
			debounce(state => {
				try {
					// Only save non-empty values
					const stateToSave = Object.entries(state).reduce(
						(acc, [key, value]) => {
							if (
								value &&
								value !== '' &&
								!(Array.isArray(value) && value.length === 0)
							) {
								acc[key] = value
							}
							return acc
						},
						{}
					)

					if (Object.keys(stateToSave).length > 0) {
						localStorage.setItem(persistKey, JSON.stringify(stateToSave))
					} else {
						localStorage.removeItem(persistKey)
					}
				} catch (error) {
					console.warn('Error saving filter state to localStorage:', error)
				}
			}, 500),
		[persistKey]
	)

	// Save to localStorage when state changes (but not on initial load)
	useEffect(() => {
		if (!isInitialMount.current) {
			debouncedSaveToStorage(localFilterState)
		}

		return () => {
			debouncedSaveToStorage.cancel()
		}
	}, [localFilterState, debouncedSaveToStorage])

	// Handle user-initiated changes (not initial load)
	const userChangedFilter = useRef(false)

	useEffect(() => {
		if (!isInitialMount.current && userChangedFilter.current) {
			onFilterChange(localFilterState)
			userChangedFilter.current = false
		}
	}, [localFilterState, onFilterChange])

	// Memoize all potential filter options for suggestions
	const allFilterOptions = useMemo(() => {
		if (!fields || fields.length === 0) return []

		const options = []
		fields.forEach(field => {
			if (field.options) {
				field.options.forEach(option => {
					options.push({
						label: option,
						field: field.key,
						type: field.type,
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
			setShowSuggestions(false)
			return
		}

		const filtered = allFilterOptions.filter(option =>
			option.label.toLowerCase().includes(inputValue.toLowerCase())
		)
		setSuggestions(filtered)
		setNoMatches(inputValue.trim().length > 0 && filtered.length === 0)
		setShowSuggestions(true)
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

	const handleChange = useCallback((key, value) => {
		if (!isInitialMount.current) {
			userChangedFilter.current = true // Mark as user change
		}
		setLocalFilterState(prevState => ({
			...prevState,
			[key]: value,
		}))
	}, [])

	const handleInputChange = useCallback(
		e => {
			const value = e.target.value
			handleChange('search', value)
			setInputValue(value)
			debouncedSetInputValue(value)
			setSelectedSuggestionIndex(-1)
		},
		[handleChange, debouncedSetInputValue]
	)

	const handleSuggestionClick = useCallback(
		suggestion => {
			handleChange(
				suggestion.field,
				suggestion.type === 'checkbox' ? [suggestion.label] : suggestion.label
			)
			setInputValue(suggestion.label)
			setShowSuggestions(false)
		},
		[handleChange]
	)

	const handleInputKeyDown = useCallback(
		e => {
			if (!showSuggestions || suggestions.length === 0) return

			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault()
					setSelectedSuggestionIndex(prev =>
						prev < suggestions.length - 1 ? prev + 1 : 0
					)
					break
				case 'ArrowUp':
					e.preventDefault()
					setSelectedSuggestionIndex(prev =>
						prev > 0 ? prev - 1 : suggestions.length - 1
					)
					break
				case 'Enter':
					e.preventDefault()
					if (selectedSuggestionIndex >= 0) {
						handleSuggestionClick(suggestions[selectedSuggestionIndex])
					} else {
						handleSubmit(e)
					}
					break
				case 'Escape':
					setShowSuggestions(false)
					setSelectedSuggestionIndex(-1)
					break
			}
		},
		[
			showSuggestions,
			suggestions,
			selectedSuggestionIndex,
			handleSuggestionClick,
		]
	)

	const handleSubmit = useCallback(
		e => {
			e.preventDefault()
			userChangedFilter.current = true
			onFilterChange(localFilterState)
			setShowSuggestions(false)
		},
		[localFilterState, onFilterChange]
	)

	const handleViewModeToggle = useCallback(() => {
		const newMode =
			viewMode === 'table' || viewMode === 'list' ? 'grid' : 'table'
		onViewModeChange && onViewModeChange(newMode)
	}, [viewMode, onViewModeChange])

	const handleInputFocus = useCallback(() => {
		if (suggestions.length > 0) {
			setShowSuggestions(true)
		}
	}, [suggestions.length])

	const handleInputBlur = useCallback(() => {
		setTimeout(() => {
			setShowSuggestions(false)
			setSelectedSuggestionIndex(-1)
		}, 150)
	}, [])

	// Filter modal functions
	const handleFilterClick = useCallback(() => {
		setTempFilterState(localFilterState)
		setShowFilterModal(true)
	}, [localFilterState])

	const handleFilterModalClose = useCallback(() => {
		setShowFilterModal(false)
	}, [])

	const handleTempFilterChange = useCallback((key, value) => {
		setTempFilterState(prevState => ({
			...prevState,
			[key]: value,
		}))
	}, [])

	const handleFilterApply = useCallback(() => {
		userChangedFilter.current = true
		setLocalFilterState(tempFilterState)
		setShowFilterModal(false)
	}, [tempFilterState])

	const handleFilterClear = useCallback(() => {
		const clearedState = fields.reduce(
			(acc, field) => {
				if (field.type === 'checkbox') {
					acc[field.key] = []
				} else {
					acc[field.key] = ''
				}
				return acc
			},
			{ search: '' }
		)

		userChangedFilter.current = true
		setTempFilterState(clearedState)
		setLocalFilterState(clearedState)
		setInputValue('')

		// Clear from localStorage
		try {
			localStorage.removeItem(persistKey)
		} catch (error) {
			console.warn('Error clearing filter state from localStorage:', error)
		}
	}, [fields, persistKey])

	const renderFilterField = useCallback(
		field => {
			const value =
				tempFilterState[field.key] || (field.type === 'checkbox' ? [] : '')

			switch (field.type) {
				case 'checkbox':
					return (
						<div key={field.key} className={style.filterGroup}>
							<h4 className={style.filterGroupTitle}>{field.label}</h4>
							<div className={style.checkboxGroup}>
								{field.options.map(option => (
									<label key={option} className={style.checkboxLabel}>
										<input
											type='checkbox'
											checked={value.includes(option)}
											onChange={e => {
												const newValue = e.target.checked
													? [...value, option]
													: value.filter(v => v !== option)
												handleTempFilterChange(field.key, newValue)
											}}
											className={style.checkbox}
										/>
										<span>{option}</span>
									</label>
								))}
							</div>
						</div>
					)

				case 'radio':
					return (
						<div key={field.key} className={style.filterGroup}>
							<h4 className={style.filterGroupTitle}>{field.label}</h4>
							<div className={style.radioGroup}>
								{field.options.map(option => (
									<label key={option} className={style.radioLabel}>
										<input
											type='radio'
											name={field.key}
											value={option}
											checked={value === option}
											onChange={e =>
												handleTempFilterChange(field.key, e.target.value)
											}
											className={style.radio}
										/>
										<span>{option}</span>
									</label>
								))}
							</div>
						</div>
					)

				case 'select':
					return (
						<div key={field.key} className={style.filterGroup}>
							<h4 className={style.filterGroupTitle}>{field.label}</h4>
							<select
								value={value}
								onChange={e =>
									handleTempFilterChange(field.key, e.target.value)
								}
								className={style.select}
							>
								<option value=''>{t('all') || '全て'}</option>
								{field.options.map(option => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>
					)

				default:
					return null
			}
		},
		[tempFilterState, handleTempFilterChange, t]
	)

	return (
		<>
			<form onSubmit={handleSubmit} className={style.modernFilterContainer}>
				<div className={style.autocompleteField}>
					<div className={style.inputWrapper}>
						<div className={style.searchInputContainer}>
							<img
								src={SearchIcon}
								alt='Search'
								className={style.inputSearchIcon}
							/>
							<input
								type='text'
								value={localFilterState.search || ''}
								onChange={handleInputChange}
								onKeyDown={handleInputKeyDown}
								onFocus={handleInputFocus}
								onBlur={handleInputBlur}
								placeholder={
									t('search_placeholder') ||
									'名前、ID、大学で学生を検索します...'
								}
								className={style.modernSearchInput}
								aria-label={t('search_filters')}
								autoComplete='off'
							/>
						</div>

						{showSuggestions && (
							<div className={style.suggestionsDropdown}>
								{suggestions.length > 0 ? (
									<ul className={style.suggestionsList}>
										{suggestions.map((suggestion, index) => (
											<li
												key={`${suggestion.field}-${suggestion.label}`}
												className={`${style.suggestionItem} ${
													index === selectedSuggestionIndex
														? style.suggestionItemSelected
														: ''
												}`}
												onClick={() => handleSuggestionClick(suggestion)}
												onMouseEnter={() => setSelectedSuggestionIndex(index)}
											>
												<span className={style.suggestionLabel}>
													{suggestion.label}
												</span>
												<span className={style.suggestionField}>
													in {suggestion.field}
												</span>
											</li>
										))}
									</ul>
								) : noMatches ? (
									<div className={style.noOptions}>
										{t('no_matches_found') || 'No matches found'}
									</div>
								) : (
									<div className={style.noOptions}>
										{t('start_typing') || 'Start typing to see suggestions'}
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				<button type='submit' className={style.modernSearchButton}>
					{t('search')}
				</button>

				<div className={style.iconButtonsGroup}>
					<button
						type='button'
						onClick={handleViewModeToggle}
						className={`${style.viewModeButton} ${viewMode === 'grid' ? style.active : ''}`}
						aria-label={
							viewMode === 'grid'
								? 'Switch to List View'
								: 'Switch to Grid View'
						}
					>
						<img
							src={viewMode === 'grid' ? AppIconList : AppIcons}
							alt={viewMode === 'grid' ? 'Grid View' : 'List View'}
						/>
					</button>
					<button
						type='button'
						onClick={handleFilterClick}
						className={style.filterButton}
						aria-label='Filter'
					>
						<img src={FilterIcon} alt='Filter' />
					</button>
				</div>
			</form>

			{/* Filter Modal */}
			{showFilterModal && (
				<div
					className={style.filterModalOverlay}
					onClick={handleFilterModalClose}
				>
					<div className={style.filterModal} onClick={e => e.stopPropagation()}>
						<div className={style.filterModalHeader}>
							<h3 className={style.filterModalTitle}>フィルター</h3>
							<button
								onClick={handleFilterModalClose}
								className={style.filterModalCloseButton}
							>
								×
							</button>
						</div>

						<div className={style.filterModalContent}>
							{fields
								.filter(field => field.key !== 'search')
								.map(renderFilterField)}
						</div>

						<div className={style.filterModalFooter}>
							<button
								onClick={handleFilterClear}
								className={style.filterClearButton}
							>
								クリア
							</button>
							<button
								onClick={handleFilterApply}
								className={style.filterApplyButton}
							>
								決定
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

Filter.propTypes = {
	fields: PropTypes.array.isRequired,
	filterState: PropTypes.object.isRequired,
	onFilterChange: PropTypes.func.isRequired,
	onGridViewClick: PropTypes.func,
	viewMode: PropTypes.string,
	onViewModeChange: PropTypes.func,
	persistKey: PropTypes.string,
}

export default Filter
