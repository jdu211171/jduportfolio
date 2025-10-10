import { useEffect, useCallback, useRef } from 'react'
import { debounce } from 'lodash'

const STORAGE_PREFIX = 'profileEditDraft'
const STORAGE_VERSION = '1.0'
const EXPIRY_HOURS = 24

export const useFormPersistence = (key, initialValue, options = {}) => {
	const {
		debounceMs = 2000,
		onSaveStart,
		onSaveComplete,
		onLoadComplete,
		enabled = true,
		originalData = null,
	} = options

	const isMountedRef = useRef(false)
	const lastSavedRef = useRef(null)
	const originalDataRef = useRef(originalData)

	// Update original data reference when it changes
	useEffect(() => {
		if (originalData && originalData !== originalDataRef.current) {
			originalDataRef.current = originalData
			console.log('Updated original data reference from prop:', originalData)
		}
	}, [originalData])

	const getStorageKey = () => {
		return `${STORAGE_PREFIX}_${key}`
	}

	const isDataExpired = timestamp => {
		if (!timestamp) return true
		const expiryTime = EXPIRY_HOURS * 60 * 60 * 1000
		return Date.now() - timestamp > expiryTime
	}

	const loadFromStorage = useCallback(() => {
		if (!enabled) return initialValue

		try {
			const storageKey = getStorageKey()
			const stored = localStorage.getItem(storageKey)

			if (!stored) return initialValue

			const parsed = JSON.parse(stored)

			if (
				parsed.version !== STORAGE_VERSION ||
				isDataExpired(parsed.timestamp)
			) {
				localStorage.removeItem(storageKey)
				return initialValue
			}

			if (onLoadComplete) {
				onLoadComplete(parsed.data)
			}

			lastSavedRef.current = parsed.data
			return parsed.data
		} catch (error) {
			console.error('Error loading from storage:', error)
			return initialValue
		}
	}, [key, initialValue, enabled, onLoadComplete])

	const saveToStorage = useCallback(
		data => {
			if (!enabled) {
				console.log('Save disabled, enabled:', enabled)
				return
			}

			try {
				const storageKey = getStorageKey()
				const dataToStore = {
					version: STORAGE_VERSION,
					timestamp: Date.now(),
					data: data,
				}

				const serialized = JSON.stringify(dataToStore)

				if (serialized.length > 5 * 1024 * 1024) {
					console.warn('Data too large to store (>5MB)')
					return
				}

				if (onSaveStart) {
					onSaveStart()
				}

				console.log('Saving to localStorage with key:', storageKey)
				localStorage.setItem(storageKey, serialized)
				lastSavedRef.current = data
				console.log('Save successful, data:', data)

				if (onSaveComplete) {
					onSaveComplete()
				}
			} catch (error) {
				console.error('Error saving to storage:', error)
				if (error.name === 'QuotaExceededError') {
					console.warn('localStorage quota exceeded')
				}
			}
		},
		[key, enabled, onSaveStart, onSaveComplete]
	)

	const debouncedSave = useRef(
		debounce(data => {
			saveToStorage(data)
		}, debounceMs)
	).current

	const clearStorage = useCallback(() => {
		try {
			const storageKey = getStorageKey()
			localStorage.removeItem(storageKey)
			lastSavedRef.current = null
		} catch (error) {
			console.error('Error clearing storage:', error)
		}
	}, [key])

	const hasUnsavedChanges = useCallback(currentData => {
		return JSON.stringify(currentData) !== JSON.stringify(lastSavedRef.current)
	}, [])

	const hasChangesFromOriginal = useCallback(currentData => {
		if (!originalDataRef.current) {
			console.log(
				'hasChangesFromOriginal: No original data reference, returning true'
			)
			return true
		}

		// Create filtered versions for comparison (exclude temporary fields)
		const filterData = data => {
			const filtered = { ...data }
			// Recruiter-specific temporary fields
			delete filtered.newBusinessOverview
			delete filtered.newRequiredSkill
			delete filtered.newWelcomeSkill
			delete filtered.newVideoUrl
			delete filtered.newTargetAudience

			// For Student data, compare only the draft portion if it exists
			if (data.draft && originalDataRef.current.draft) {
				return { draft: data.draft }
			}

			return filtered
		}

		const currentFiltered = filterData(currentData)
		const originalFiltered = filterData(originalDataRef.current)

		const currentStr = JSON.stringify(currentFiltered)
		const originalStr = JSON.stringify(originalFiltered)
		const hasChanges = currentStr !== originalStr

		console.log('hasChangesFromOriginal comparison:', {
			hasChanges,
			currentData: currentFiltered,
			originalData: originalFiltered,
			currentStr: currentStr.substring(0, 200) + '...',
			originalStr: originalStr.substring(0, 200) + '...',
		})

		return hasChanges
	}, [])

	const saveToStorageIfChanged = useCallback(
		data => {
			if (!enabled) {
				console.log('Save disabled, enabled:', enabled)
				return false
			}

			// Only save if there are actual changes from the original data
			if (!hasChangesFromOriginal(data)) {
				console.log('No changes detected from original data, skipping save')
				return false
			}

			saveToStorage(data)
			return true
		},
		[enabled, hasChangesFromOriginal, saveToStorage]
	)

	const debouncedSaveIfChanged = useRef(
		debounce(data => {
			saveToStorageIfChanged(data)
		}, debounceMs)
	).current

	const updateOriginalData = useCallback(data => {
		originalDataRef.current = data
		console.log('Updated original data reference:', data)
	}, [])

	useEffect(() => {
		const handleStorageChange = e => {
			if (e.key === getStorageKey() && e.newValue) {
				try {
					const parsed = JSON.parse(e.newValue)
					if (
						parsed.version === STORAGE_VERSION &&
						!isDataExpired(parsed.timestamp)
					) {
						if (onLoadComplete) {
							onLoadComplete(parsed.data)
						}
					}
				} catch (error) {
					console.error('Error handling storage change:', error)
				}
			}
		}

		window.addEventListener('storage', handleStorageChange)
		return () => {
			window.removeEventListener('storage', handleStorageChange)
			debouncedSave.cancel()
			debouncedSaveIfChanged.cancel()
		}
	}, [key, onLoadComplete])

	useEffect(() => {
		isMountedRef.current = true
		return () => {
			isMountedRef.current = false
		}
	}, [])

	const cleanupExpiredData = useCallback(() => {
		try {
			const keys = Object.keys(localStorage)
			keys.forEach(key => {
				if (key.startsWith(STORAGE_PREFIX)) {
					try {
						const stored = localStorage.getItem(key)
						if (stored) {
							const parsed = JSON.parse(stored)
							if (isDataExpired(parsed.timestamp)) {
								localStorage.removeItem(key)
							}
						}
					} catch (error) {
						localStorage.removeItem(key)
					}
				}
			})
		} catch (error) {
			console.error('Error cleaning up expired data:', error)
		}
	}, [])

	useEffect(() => {
		cleanupExpiredData()
	}, [cleanupExpiredData])

	return {
		loadFromStorage,
		saveToStorage: debouncedSave,
		saveToStorageIfChanged: debouncedSaveIfChanged,
		clearStorage,
		hasUnsavedChanges,
		hasChangesFromOriginal,
		immediateSave: saveToStorage,
		immediateSaveIfChanged: saveToStorageIfChanged,
		updateOriginalData,
	}
}
