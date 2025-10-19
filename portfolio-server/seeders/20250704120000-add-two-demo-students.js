'use strict'

const bcrypt = require('bcrypt')

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash('password123', salt)

		// IT Skills data
		const itSkillsStudent1 = {
			上級: [
				{ name: 'React', color: '#039be5' },
				{ name: 'JavaScript', color: '#f57c00' },
				{ name: 'Node.js', color: '#388e3c' },
			],
			中級: [
				{ name: 'MySQL', color: '#00838f' },
				{ name: 'MongoDB', color: '#2e7d32' },
			],
			初級: [
				{ name: 'Python', color: '#1976d2' },
				{ name: 'AWS', color: '#ff5722' },
			],
		}

		const itSkillsStudent2 = {
			上級: [
				{ name: 'Vue.js', color: '#4caf50' },
				{ name: 'TypeScript', color: '#1976d2' },
			],
			中級: [
				{ name: 'PostgreSQL', color: '#336791' },
				{ name: 'Docker', color: '#0db7ed' },
				{ name: 'Express.js', color: '#000000' },
			],
			初級: [
				{ name: 'GraphQL', color: '#e535ab' },
				{ name: 'Redis', color: '#d32f2f' },
			],
		}

		// Other Skills data
		const skillsStudent1 = {
			上級: [
				{ name: '日本語', color: '#e91e63' },
				{ name: 'チームワーク', color: '#9c27b0' },
			],
			中級: [
				{ name: 'プレゼンテーション', color: '#673ab7' },
				{ name: 'プロジェクト管理', color: '#3f51b5' },
			],
			初級: [{ name: 'デザイン', color: '#ff9800' }],
		}

		const skillsStudent2 = {
			上級: [
				{ name: '英語', color: '#2196f3' },
				{ name: 'リーダーシップ', color: '#ff5722' },
			],
			中級: [
				{ name: '問題解決', color: '#4caf50' },
				{ name: 'コミュニケーション', color: '#ff9800' },
			],
			初級: [{ name: 'マーケティング', color: '#795548' }],
		}

		// Deliverables data
		const deliverablesStudent1 = [
			{
				title: 'JDU学生ポートフォリオシステム',
				link: 'https://portfolio.jdu.ac.jp',
				codeLink: 'https://github.com/student1/portfolio-system',
				imageLink: 'https://picsum.photos/600/400?random=1',
				description: 'React.js、Node.js、PostgreSQLを使用した学生ポートフォリオ管理システム。学生の情報、スキル、成果物を一元管理できるWebアプリケーション。',
				role: ['フロントエンド開発', 'バックエンド開発', 'データベース設計'],
			},
			{
				title: 'ECサイトモバイルアプリ',
				link: 'https://demo-ecommerce-app.com',
				codeLink: 'https://github.com/student1/ecommerce-mobile',
				imageLink: 'https://picsum.photos/600/400?random=2',
				description: 'React Nativeで開発したECサイトのモバイルアプリ。商品検索、カート機能、決済システムを実装。',
				role: ['モバイル開発', 'UI/UX設計'],
			},
		]

		const deliverablesStudent2 = [
			{
				title: '在庫管理システム',
				link: 'https://inventory-management-demo.com',
				codeLink: 'https://github.com/student2/inventory-system',
				imageLink: 'https://picsum.photos/600/400?random=3',
				description: 'Vue.js、Express.js、MongoDBを使用した在庫管理システム。リアルタイムでの在庫状況確認、自動発注機能を搭載。',
				role: ['フルスタック開発', 'システム設計'],
			},
			{
				title: 'AIチャットボット',
				link: 'https://ai-chatbot-demo.com',
				codeLink: 'https://github.com/student2/ai-chatbot',
				imageLink: 'https://picsum.photos/600/400?random=4',
				description: '自然言語処理技術を活用したカスタマーサポート用AIチャットボット。Python、TensorFlowを使用。',
				role: ['AI開発', 'バックエンド開発', 'データ分析'],
			},
		]

		// JLPT data
		const jlptStudent1 = {
			highest: 'N2',
			jlptlist: [
				{ level: 'N5', date: '2022-07' },
				{ level: 'N4', date: '2022-12' },
				{ level: 'N3', date: '2023-07' },
				{ level: 'N2', date: '2023-12' },
			],
		}

		const jlptStudent2 = {
			highest: 'N1',
			jlptlist: [
				{ level: 'N5', date: '2021-12' },
				{ level: 'N4', date: '2022-07' },
				{ level: 'N3', date: '2022-12' },
				{ level: 'N2', date: '2023-07' },
				{ level: 'N1', date: '2023-12' },
			],
		}

		// IELTS data
		const ieltsStudent1 = {
			highest: '6.5',
			ieltslist: [
				{ level: '5.5', date: '2022-08' },
				{ level: '6.0', date: '2023-02' },
				{ level: '6.5', date: '2023-08' },
			],
		}

		const ieltsStudent2 = {
			highest: '7.0',
			ieltslist: [
				{ level: '6.0', date: '2022-06' },
				{ level: '6.5', date: '2022-12' },
				{ level: '7.0', date: '2023-06' },
			],
		}

		// Gallery images
		const galleryStudent1 = ['https://picsum.photos/300/200?random=10', 'https://picsum.photos/300/200?random=11', 'https://picsum.photos/300/200?random=12', 'https://picsum.photos/300/200?random=13', 'https://picsum.photos/300/200?random=14']

		const galleryStudent2 = ['https://picsum.photos/300/200?random=20', 'https://picsum.photos/300/200?random=21', 'https://picsum.photos/300/200?random=22', 'https://picsum.photos/300/200?random=23', 'https://picsum.photos/300/200?random=24']

		// Credit Details data (matching the image format)
		const creditDetailsStudent1 = [
			{
				番号: 1,
				科目名: 'User experience and User interface Design',
				評価: 'A',
				単位数: 2,
				取得日: '2023-12-15',
			},
			{
				番号: 2,
				科目名: 'C# / Python',
				評価: 'C',
				単位数: 2,
				取得日: '2023-11-20',
			},
			{
				番号: 3,
				科目名: 'Artificial Intelligence',
				評価: 'E',
				単位数: 0,
				取得日: '2024-01-10',
			},
			{
				番号: 4,
				科目名: 'Web Development Fundamentals',
				評価: 'B',
				単位数: 3,
				取得日: '2023-10-05',
			},
			{
				番号: 5,
				科目名: 'Database Management Systems',
				評価: 'A',
				単位数: 3,
				取得日: '2023-09-15',
			},
		]

		const creditDetailsStudent2 = [
			{
				番号: 1,
				科目名: 'Advanced Machine Learning',
				評価: 'A',
				単位数: 4,
				取得日: '2023-12-20',
			},
			{
				番号: 2,
				科目名: 'Data Science and Analytics',
				評価: 'A',
				単位数: 3,
				取得日: '2023-11-25',
			},
			{
				番号: 3,
				科目名: 'Computer Vision',
				評価: 'B',
				単位数: 3,
				取得日: '2023-10-30',
			},
			{
				番号: 4,
				科目名: 'Natural Language Processing',
				評価: 'A',
				単位数: 4,
				取得日: '2023-09-20',
			},
			{
				番号: 5,
				科目名: 'Software Engineering Principles',
				評価: 'B',
				単位数: 2,
				取得日: '2023-08-15',
			},
			{
				番号: 6,
				科目名: 'Cloud Computing',
				評価: 'A',
				単位数: 3,
				取得日: '2023-07-10',
			},
		]

		const studentsData = [
			{
				email: 'yamada.taro@jdu.student.jp',
				password: hashedPassword,
				student_id: '23120001',
				first_name: '太郎',
				last_name: '山田',
				date_of_birth: new Date('2002-04-15'),
				photo: 'https://randomuser.me/api/portraits/med/men/32.jpg',
				gender: 'Male',
				address: '東京都新宿区高田馬場1-1-1',
				phone: '090-1234-5678',
				parents_phone_number: '03-1234-5678',
				partner_university_enrollment_date: new Date('2023-09-01'),

				// Credits
				total_credits: 98,
				partner_university_credits: 24,
				world_language_university_credits: 16,
				business_skills_credits: 12,
				japanese_employment_credits: 10,
				liberal_arts_education_credits: 18,
				specialized_education_credits: 18,

				// Profile information
				self_introduction: 'こんにちは！私は山田太郎です。現在JDUの3年生で、Webアプリケーション開発に興味を持っています。特にReact.jsとNode.jsを使ったフルスタック開発を学んでいます。将来はIT企業でソフトウェアエンジニアとして働きたいと考えています。チームワークを大切にし、常に新しい技術を学ぶことに情熱を注いでいます。',
				hobbies: 'プログラミング、読書、映画鑑賞、サッカー',
				gallery: JSON.stringify(galleryStudent1),
				skills: JSON.stringify(skillsStudent1),
				it_skills: JSON.stringify(itSkillsStudent1),
				other_information: '大学では情報システム学科に所属し、ソフトウェア開発プロジェクトに積極的に参加しています。また、プログラミングサークルのリーダーとして、後輩の指導も行っています。',
				semester: '6',
				student_status: 'Active',
				partner_university: 'テック大学',
				deliverables: JSON.stringify(deliverablesStudent1),
				jlpt: JSON.stringify(jlptStudent1),
				ielts: JSON.stringify(ieltsStudent1),
				jdu_japanese_certification: JSON.stringify(jlptStudent1),
				japanese_speech_contest: '日本語スピーチコンテスト優秀賞',
				it_contest: 'プログラミングコンテスト入賞',
				active: true,
				visibility: true,
				has_pending: false,
				kintone_id: 1001,
				graduation_year: '2025年',
				graduation_season: '春',
				language_skills: 'Japanese (JLPT N2), English (IELTS 6.5)',
				credit_details: JSON.stringify(creditDetailsStudent1),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				email: 'suzuki.hanako@jdu.student.jp',
				password: hashedPassword,
				student_id: '23120002',
				first_name: '花子',
				last_name: '鈴木',
				date_of_birth: new Date('2001-11-22'),
				photo: 'https://randomuser.me/api/portraits/med/women/44.jpg',
				gender: 'Female',
				address: '東京都渋谷区代々木2-2-2',
				phone: '080-9876-5432',
				parents_phone_number: '03-9876-5432',
				partner_university_enrollment_date: new Date('2023-09-01'),

				// Credits
				total_credits: 110,
				partner_university_credits: 28,
				world_language_university_credits: 20,
				business_skills_credits: 14,
				japanese_employment_credits: 12,
				liberal_arts_education_credits: 20,
				specialized_education_credits: 16,

				// Profile information
				self_introduction: '鈴木花子と申します。JDU4年生で、AIとデータサイエンスに特に関心があります。Vue.jsとPythonを使った開発が得意で、機械学習を活用したWebアプリケーションの開発に取り組んでいます。英語が得意で、国際的な環境で働くことを目標としています。問題解決能力とコミュニケーション能力を活かして、社会に貢献したいと考えています。',
				hobbies: 'データ分析、旅行、写真撮影、ヨガ',
				gallery: JSON.stringify(galleryStudent2),
				skills: JSON.stringify(skillsStudent2),
				it_skills: JSON.stringify(itSkillsStudent2),
				other_information: '学生会の副会長を務めており、大学のイベント企画や運営に携わっています。また、AIクラブに所属し、機械学習を使った研究プロジェクトに参加しています。',
				semester: '8',
				student_status: 'Active',
				partner_university: 'グローバル工科大学',
				deliverables: JSON.stringify(deliverablesStudent2),
				jlpt: JSON.stringify(jlptStudent2),
				ielts: JSON.stringify(ieltsStudent2),
				jdu_japanese_certification: JSON.stringify(jlptStudent2),
				japanese_speech_contest: '日本語スピーチコンテスト最優秀賞',
				it_contest: 'AIコンテスト特別賞',
				active: true,
				visibility: true,
				has_pending: false,
				kintone_id: 1002,
				graduation_year: '2025年',
				graduation_season: '春',
				language_skills: 'Japanese (JLPT N1), English (IELTS 7.0), Korean (TOPIK 3)',
				credit_details: JSON.stringify(creditDetailsStudent2),
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]

		await queryInterface.bulkInsert('Students', studentsData, {})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete(
			'Students',
			{
				student_id: ['23120001', '23120002'],
			},
			{}
		)
	},
}
