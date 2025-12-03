import { Box, Chip, Stack } from '@mui/material'

export const FilteredItems = ({ tempFilterState, setTempFilterState, onFilterChange }) => {
	const handleDelete = (key, value) => {
		setTempFilterState(prevState => {
			let newState
			if (Array.isArray(prevState[key])) {
				const updatedField = prevState[key].filter(item => item !== value)
				newState = {
					...prevState,
					[key]: updatedField,
				}
			} else {
				newState = {
					...prevState,
					[key]: '',
				}
			}
			if (onFilterChange) {
				onFilterChange(newState)
			}
			return newState
		})
	}
	return (
		<Box sx={{ my: 2 }}>
			<Stack direction='row' sx={{ flexWrap: 'wrap', rowGap: '5px' }} spacing={'5px'}>
				{tempFilterState.jlpt &&
					tempFilterState.jlpt.map(level => (
						<Chip
							label={level}
							variant='outlined'
							key={level}
							onDelete={() => {
								handleDelete('jlpt', level)
							}}
						/>
					))}
				{tempFilterState.jdu_japanese_certification &&
					tempFilterState.jdu_japanese_certification.map(level => (
						<Chip
							label={level}
							variant='outlined'
							key={level}
							onDelete={() => {
								handleDelete('jdu_japanese_certification', level)
							}}
						/>
					))}
				{tempFilterState.it_skills &&
					tempFilterState.it_skills.map(level => (
						<Chip
							label={level}
							variant='outlined'
							key={level}
							onDelete={() => {
								handleDelete('it_skills', level)
							}}
						/>
					))}
				{tempFilterState.it_skills_match === 'all' && <Chip label='all' variant='outlined' onDelete={() => handleDelete('it_skills_match', 'all')} />}
				{tempFilterState.other_information === 'all' && <Chip label='all' variant='outlined' onDelete={() => handleDelete('other_information', 'all')} />}
				{tempFilterState.partner_university &&
					tempFilterState.partner_university.map(level => (
						<Chip
							variant='outlined'
							key={level}
							label={level}
							onDelete={() => {
								handleDelete('partner_university', level)
							}}
						/>
					))}
			</Stack>
		</Box>
	)
}
