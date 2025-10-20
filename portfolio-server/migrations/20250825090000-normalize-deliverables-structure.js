/**
 * Normalize deliverables JSON structure across Students and Drafts.
 *
 * Target shape per deliverable item:
 * {
 *   id: number | string,
 *   title: string,
 *   description: string,
 *   link: string,
 *   codeLink: string,
 *   role: string[],
 *   image_urls: string[]
 * }
 *
 * Handles legacy shapes:
 * - imageLink: string => image_urls: [string]
 * - files: string[] => image_urls: string[]
 * - role: string (comma-separated) => string[]
 * - Fill missing fields with safe defaults and generate id when missing
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const sequelize = queryInterface.sequelize

		const normalizeArray = v => (Array.isArray(v) ? v : v ? [v] : [])
		const toRoleArray = v => {
			if (Array.isArray(v))
				return v
					.filter(Boolean)
					.map(x => String(x).trim())
					.filter(Boolean)
			if (typeof v === 'string') {
				const s = v.trim()
				if (!s) return []
				// Try JSON parse if it looks like an array
				if (s.startsWith('[') && s.endsWith(']')) {
					try {
						const arr = JSON.parse(s)
						return Array.isArray(arr) ? arr.map(x => String(x).trim()).filter(Boolean) : []
					} catch (_) {}
				}
				return s
					.split(',')
					.map(x => x.trim())
					.filter(Boolean)
			}
			return []
		}

		const ensureId = (d, baseTs, idx) => {
			if (d.id !== undefined && d.id !== null && d.id !== '') return d.id
			// Generate stable-ish id based on timestamp and index
			return Number(`${baseTs}${idx}`)
		}

		const normalizeDeliverable = (raw, baseTs, idx) => {
			const d = { ...(raw || {}) }

			// image_urls consolidation
			let imageUrls = []
			if (Array.isArray(d.image_urls)) imageUrls = d.image_urls.filter(Boolean)
			// Merge legacy single imageLink
			if (d.imageLink && typeof d.imageLink === 'string') imageUrls.push(d.imageLink)
			// Merge legacy files array
			if (Array.isArray(d.files)) imageUrls = imageUrls.concat(d.files.filter(Boolean))
			// Deduplicate
			imageUrls = Array.from(new Set(imageUrls))

			const normalized = {
				id: ensureId(d, baseTs, idx),
				title: typeof d.title === 'string' ? d.title : '',
				description: typeof d.description === 'string' ? d.description : '',
				link: typeof d.link === 'string' ? d.link : '',
				codeLink: typeof d.codeLink === 'string' ? d.codeLink : '',
				role: toRoleArray(d.role),
				image_urls: imageUrls,
			}

			// Preserve any other existing fields (non-conflicting)
			for (const key of Object.keys(d)) {
				if (!(key in normalized) && key !== 'imageLink' && key !== 'files') {
					normalized[key] = d[key]
				}
			}
			return normalized
		}

		// Helper to compare two arrays of deliverables for change detection
		const isEqualDeliverables = (a, b) => {
			try {
				return JSON.stringify(a) === JSON.stringify(b)
			} catch (_) {
				return false
			}
		}

		// 1) Normalize Students.deliverables
		{
			const [students] = await sequelize.query('SELECT id, "deliverables" FROM "Students" WHERE "deliverables" IS NOT NULL')
			for (const row of students) {
				let list = row.deliverables
				if (!Array.isArray(list)) continue
				const baseTs = Date.now()
				const normalized = list.map((d, idx) => normalizeDeliverable(d, baseTs, idx))
				if (!isEqualDeliverables(list, normalized)) {
					await sequelize.query('UPDATE "Students" SET "deliverables" = :deliverables WHERE id = :id', { replacements: { deliverables: JSON.stringify(normalized), id: row.id } })
				}
			}
		}

		// 2) Normalize Drafts.profile_data.deliverables
		{
			const [drafts] = await sequelize.query('SELECT id, profile_data FROM "Drafts" WHERE profile_data IS NOT NULL')
			for (const row of drafts) {
				const pd = row.profile_data
				if (!pd || typeof pd !== 'object') continue
				const list = pd.deliverables
				if (!Array.isArray(list)) continue
				const baseTs = Date.now()
				const normalized = list.map((d, idx) => normalizeDeliverable(d, baseTs, idx))
				if (!isEqualDeliverables(list, normalized)) {
					const newPd = { ...pd, deliverables: normalized }
					await sequelize.query('UPDATE "Drafts" SET profile_data = :pd WHERE id = :id', { replacements: { pd: JSON.stringify(newPd), id: row.id } })
				}
			}
		}
	},

	async down(queryInterface, Sequelize) {
		// Best-effort rollback: set imageLink to first image_urls if not present.
		const sequelize = queryInterface.sequelize

		const rollbackDeliverable = d => {
			const copy = { ...(d || {}) }
			if (!copy.imageLink && Array.isArray(copy.image_urls) && copy.image_urls.length > 0) {
				copy.imageLink = copy.image_urls[0]
			}
			// Try to coerce role back to string if it was an array (join by comma)
			if (Array.isArray(copy.role)) {
				copy.role = copy.role.join(', ')
			}
			return copy
		}

		// Students
		{
			const [students] = await sequelize.query('SELECT id, "deliverables" FROM "Students" WHERE "deliverables" IS NOT NULL')
			for (const row of students) {
				let list = row.deliverables
				if (!Array.isArray(list)) continue
				const rolled = list.map(rollbackDeliverable)
				await sequelize.query('UPDATE "Students" SET "deliverables" = :deliverables WHERE id = :id', { replacements: { deliverables: JSON.stringify(rolled), id: row.id } })
			}
		}

		// Drafts
		{
			const [drafts] = await sequelize.query('SELECT id, profile_data FROM "Drafts" WHERE profile_data IS NOT NULL')
			for (const row of drafts) {
				const pd = row.profile_data
				if (!pd || typeof pd !== 'object') continue
				const list = pd.deliverables
				if (!Array.isArray(list)) continue
				const rolled = list.map(rollbackDeliverable)
				const newPd = { ...pd, deliverables: rolled }
				await sequelize.query('UPDATE "Drafts" SET profile_data = :pd WHERE id = :id', { replacements: { pd: JSON.stringify(newPd), id: row.id } })
			}
		}
	},
}
