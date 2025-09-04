;(function () {
	'use strict'

	// An array of events that will trigger the validation before a record is saved.
	const events = [
		'app.record.create.submit',
		'app.record.edit.submit',
		'app.record.index.edit.submit',
	]

	// Register the event handler for the specified events.
	kintone.events.on(events, function (event) {
		const record = event.record

		// Check if the 'Table' and 'count' fields exist to avoid errors.
		if (!record.Table || !record.count) {
			console.error(
				'The "Table" subtable or "count" field is missing from the form.'
			)
			return event
		}

		// Get the actual number of rows in the "Table" subtable.
		const tableRowCount = record.Table.value.length

		// Get the expected number from the "count" field.
		// We convert it to a Number and default to 0 if the field is empty.
		const countFieldValue = Number(record.count.value) || 0

		// Compare the two values.
		if (tableRowCount !== countFieldValue) {
			// If they don't match, set an error message on the 'count' field.
			// Kintone will automatically display this error and prevent the save action.
			record.count.error =
				'The number of rows in the table must match the value in the "count" field.'
		} else {
			// It's good practice to clear the error if validation passes.
			record.count.error = null
		}

		// Return the event object to proceed with or stop the save action.
		return event
	})
})()
