import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
	return useContext(LanguageContext)
}

export const LanguageProvider = ({ children }) => {
	const [language, setLanguage] = useState(
		localStorage.getItem('language') || 'ja'
	)

	useEffect(() => {
		localStorage.setItem('language', language)
	}, [language])

	const [pendingLanguageChange, setPendingLanguageChange] = useState(null)

	const changeLanguage = useCallback((newLanguage) => {
		console.log('Language change requested:', newLanguage)
		// Check if there are unsaved changes by dispatching an event
		const event = new CustomEvent('checkUnsavedChanges', { 
			detail: { 
				newLanguage,
				cancelable: true 
			},
			cancelable: true
		})
		
		const cancelled = !window.dispatchEvent(event)
		console.log('Event dispatch result:', { cancelled })
		
		if (cancelled) {
			// Store the pending language change
			console.log('Language change cancelled, storing pending change')
			setPendingLanguageChange(newLanguage)
		} else {
			// No unsaved changes, proceed with language change
			console.log('No unsaved changes, proceeding with language change')
			performLanguageChange(newLanguage)
		}
	}, [])

	const performLanguageChange = useCallback((newLanguage) => {
		console.log('Performing language change to:', newLanguage)
		setLanguage(newLanguage)
		localStorage.setItem('language', newLanguage)
		// Dispatch a custom event before reload to allow components to save state
		window.dispatchEvent(new CustomEvent('beforeLanguageChange', { detail: { newLanguage } }))
		// Small delay to allow state persistence
		setTimeout(() => {
			console.log('Reloading page for language change')
			window.location.reload()
		}, 100)
	}, [])

	const confirmLanguageChange = useCallback(() => {
		if (pendingLanguageChange) {
			performLanguageChange(pendingLanguageChange)
			setPendingLanguageChange(null)
		}
	}, [pendingLanguageChange, performLanguageChange])

	const cancelLanguageChange = useCallback(() => {
		setPendingLanguageChange(null)
	}, [])

	return (
		<LanguageContext.Provider value={{ 
			language, 
			changeLanguage,
			pendingLanguageChange,
			confirmLanguageChange,
			cancelLanguageChange
		}}>
			{children}
		</LanguageContext.Provider>
	)
}
