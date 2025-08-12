export function descendingComparator(a, b, orderBy) {
	let aValue, bValue

	// Special handling for first_name sorting - use full name
	if (orderBy === 'first_name') {
		aValue = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase()
		bValue = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase()
	} else {
		aValue = a[orderBy]
		bValue = b[orderBy]
	}

	if (bValue < aValue) {
		return -1
	}
	if (bValue > aValue) {
		return 1
	}
	return 0
}

export function stableSort(array, comparator) {
	const stabilizedThis = array.map((el, index) => [el, index])
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0])
		if (order !== 0) return order
		return a[1] - b[1]
	})
	return stabilizedThis.map(el => el[0])
}

export function getComparator(order, orderBy) {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy)
}
