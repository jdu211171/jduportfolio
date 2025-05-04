import { useState } from 'react'
import './language.css'

export const LanguageSelect = props => {
	const savedLanguage = localStorage.getItem('language') || 'ja'
	const [language, setLanguage] = useState(savedLanguage)

	const changeLanguage = lng => {
		setLanguage(lng)
		localStorage.setItem('language', lng)
		window.location.reload()
	}

	return (
		<select
			className='languageSelect'
			onChange={e => changeLanguage(e.target.value)}
			defaultValue={language}
			style={props.style}
		>
			<option value='ja'>日本語</option>
			<option value='en'>English</option>
			<option value='uz'>O‘zbek</option>
		</select>
	)
}
