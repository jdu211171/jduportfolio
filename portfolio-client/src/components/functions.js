export const shortText = (text, maxLength, dot) => {
	if (text.length > maxLength) {
		if (dot) {
			return text.substring(0, maxLength)
		} else {
			return text.substring(0, maxLength) + '...'
		}
	}
	return text
}

