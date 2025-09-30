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

	const changeLanguage = useCallback((newLanguage) => {
		console.log('Language change requested:', newLanguage)
		setLanguage(newLanguage)
		localStorage.setItem('language', newLanguage)
		
		// Small delay before reload to ensure state is saved
		setTimeout(() => {
			console.log('Reloading page for language change')
			window.location.reload()
		}, 100)
	}, [])

	return (
		<LanguageContext.Provider value={{ 
			language, 
			changeLanguage
		}}>
			{children}
		</LanguageContext.Provider>
	)
}
