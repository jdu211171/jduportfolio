#!/usr/bin/env node
/*
Bulk updater for studentQA `required` flags in Settings.

Usage examples:
  node scripts/migrate_studentQA_required.js --all-required
  node scripts/migrate_studentQA_required.js --all-optional
  node scripts/migrate_studentQA_required.js --category 学生成績 --required true

If no flags are provided, the script will normalize: ensure each question has a boolean `required` (default false) and save.
*/

const SettingsService = require('../src/services/settingService')

const parseArgs = () => {
  const args = process.argv.slice(2)
  const opts = { category: null, allRequired: false, allOptional: false, required: null }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--all-required') opts.allRequired = true
    else if (a === '--all-optional') opts.allOptional = true
    else if (a === '--category') opts.category = args[++i]
    else if (a === '--required') {
      const v = args[++i]
      opts.required = v === 'true'
    }
  }
  return opts
}

;(async () => {
  try {
    const opts = parseArgs()
    const raw = await SettingsService.getSetting('studentQA')
    if (!raw) {
      console.error('studentQA setting not found')
      process.exit(1)
    }
    let json
    try {
      json = JSON.parse(raw)
    } catch (e) {
      console.error('Failed to parse studentQA JSON:', e.message)
      process.exit(1)
    }

    const updateCategory = (catName, fn) => {
      const cat = json[catName]
      if (!cat || typeof cat !== 'object') return
      for (const key of Object.keys(cat)) {
        const item = cat[key] || {}
        fn(item)
        cat[key] = item
      }
    }

    const allCategories = Object.keys(json).filter(k => k !== 'idList')

    if (opts.allRequired) {
      allCategories.forEach(cat => updateCategory(cat, item => (item.required = true)))
    } else if (opts.allOptional) {
      allCategories.forEach(cat => updateCategory(cat, item => (item.required = false)))
    } else if (opts.category && typeof opts.required === 'boolean') {
      updateCategory(opts.category, item => (item.required = opts.required))
    } else {
      // Normalize: ensure boolean required field exists (default false)
      allCategories.forEach(cat =>
        updateCategory(cat, item => {
          if (typeof item.required !== 'boolean') item.required = false
        })
      )
    }

    const updatedValue = JSON.stringify(json)
    await SettingsService.updateSetting('studentQA', updatedValue)
    console.log('studentQA setting updated successfully')
    process.exit(0)
  } catch (e) {
    console.error('Migration failed:', e)
    process.exit(1)
  }
})()

