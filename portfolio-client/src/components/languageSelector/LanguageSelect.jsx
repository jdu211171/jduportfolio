import { useState } from 'react'
import PropTypes from 'prop-types'
import { useLanguage } from '../../contexts/LanguageContext'
import './language.css'

export const LanguageSelect = ({ 
	style, 
	size = 'medium', 
	variant = 'select',
	showLabel = false,
	labelText = 'Language',
	showFlags = false,
	onChange,
	disabled = false,
	className = '',
}) => {
	const { language, changeLanguage } = useLanguage()

	const handleChange = (e) => {
		const newLanguage = e.target.value
		
		// Call custom onChange if provided
		if (onChange) {
			onChange(newLanguage)
		}
		
		// Use context's changeLanguage instead of reloading
		changeLanguage(newLanguage)
	}

	const languages = [
		{ code: 'ja', name: '日本語', flag: '🇯🇵', shortName: 'JP' },
		{ code: 'en', name: 'English', flag: '🇺🇸', shortName: 'EN' },
		{ code: 'uz', name: "O'zbek", flag: '🇺🇿', shortName: 'UZ' },
	]

	const sizeClasses = {
		small: 'languageSelect-small',
		medium: 'languageSelect-medium',
		large: 'languageSelect-large',
	}

	if (variant === 'buttons') {
		return (
			<div className={`languageButtons ${className}`} style={style}>
				{showLabel && <span className='languageLabel'>{labelText}</span>}
				<div className='languageButtonGroup'>
					{languages.map((lang) => (
						<button
							key={lang.code}
							onClick={() => handleChange({ target: { value: lang.code } })}
							className={`languageButton ${language === lang.code ? 'active' : ''}`}
							disabled={disabled}
						>
							{showFlags && <span className='languageFlag'>{lang.flag}</span>}
							<span>{lang.shortName}</span>
						</button>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className={`languageSelectWrapper ${className}`} style={style}>
			{showLabel && <label className='languageLabel'>{labelText}</label>}
			<select
				className={`languageSelect ${sizeClasses[size]}`}
				onChange={handleChange}
				value={language}
				disabled={disabled}
			>
				{languages.map((lang) => (
					<option key={lang.code} value={lang.code}>
						{showFlags ? `${lang.flag} ${lang.name}` : lang.name}
					</option>
				))}
			</select>
		</div>
	)
}

LanguageSelect.propTypes = {
	style: PropTypes.object,
	size: PropTypes.oneOf(['small', 'medium', 'large']),
	variant: PropTypes.oneOf(['select', 'buttons']),
	showLabel: PropTypes.bool,
	labelText: PropTypes.string,
	showFlags: PropTypes.bool,
	onChange: PropTypes.func,
	disabled: PropTypes.bool,
	className: PropTypes.string,
}
