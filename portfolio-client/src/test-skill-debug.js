// Test file to debug skill selector
console.log('Testing SkillSelector functionality...')

// This will help us debug the issue
const testSkillData = {
	初級: [
		{ name: 'JavaScript', color: '#5627DB' },
		{ name: 'React', color: '#5627DB' },
	],
	中級: [{ name: 'Node.js', color: '#5627DB' }],
	上級: [],
}

console.log('Test data structure:', testSkillData)

// Test updating skills
const newSkill = { name: 'Python', color: '#5627DB' }
const level = '初級'

const updatedSkills = {
	...testSkillData,
	[level]: [...(testSkillData[level] || []), newSkill],
}

console.log('Updated skills:', updatedSkills)
