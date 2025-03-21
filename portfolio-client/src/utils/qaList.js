const qaList = {
	QAPage: {
		学生成績: {
			q1: '[必須] 最終学歴とその専攻分野を教えてください。',
			q2: '[必須] 在学中に最も力を入れて学んだ科目は何ですか？その理由も併せて教えてください。',
			q3: '[任意] 学校生活において、成果を出したものは何ですか。あれば教えて下さい。',
			q4: '[必須] 卒業論文または最終プロジェクトのテーマは何でしたか？',
			q5: '[任意] 在学中に参加した課外活動や学生団体はありますか？',
			q6: '[必須] 学業を通じて身につけた、仕事に活かせるスキルは何だと考えますか？',
			q7: '[必須] あなたの日本語のレベルについて教えて下さい。',
			q8: '[任意] 成績が特に優秀だった科目はありますか？',
			q9: '[任意] 学業と両立して行っていたアルバイトやインターンシップはありますか？',
			q10: '[必須] 今後さらに学びたいと考えている分野はありますか？',
		},
		専門知識: {
			q1: '[必須] あなたの専門分野における最新のトレンドや技術について、どのように情報を得ていますか？',
			q2: '[必須] これまでに取得した資格や認定は何ですか？',
			q3: '[任意] コワーク以外で専門分野に関連するアルバイトや仕事をしたことがありますか。あれば教えて下さい。',
			q4: '[必須] あなたの専門知識を活かして何をしたいですか？',
			q5: '[任意] 専門分野で最も影響を受けた書籍や論文は何ですか？',
			q6: '[任意] あなたの専門知識をチームメンバーにどのように共有しますか？',
			q7: '[任意] 専門分野でのプレゼンテーションや講演の経験はありますか？',
			q8: '[必須] 専門知識を深めるために、どのような自己学習を行っていますか？',
			q9: '[任意] あなたの専門分野で最も大変だと感じたことは何ですか？',
			q10: '[必須] あなたの専門知識について教えて下さい。',
		},
		個性: {
			q1: '[必須] あなたの長所と短所を教えて下さい。',
			q2: '[任意] 休みの日はどのように過ごしますか？',
			q3: '[任意] チーム内でどのような役割をしたいですか？',
			q4: '[必須] 失敗から学んだ最も重要な教訓は何ですか？',
			q5: '[必須] 新しい環境や状況にどのように適応しますか？',
			q6: '[任意] あなたの性格について教えて下さい。',
			q7: '[必須] 困難な課題に直面した際、どのように解決しますか？',
			q8: '[必須] あなたは他者からどのように思われていますか？',
			q9: '[任意] あなたの好きな言葉、座右の銘について教えて下さい。',
		},
		実務経験: {
			q1: '[必須] これまでの職歴を簡潔に説明して下さい。',
			q2: '[必須] コワークプロジェクト内での主な成果を教えて下さい。またどのようなことをしましたか。前職での主な責任と成果を教えてください。',
			q3: '[任意] リーダーシップを発揮した経験について教えて下さい。',
			q4: '[任意] コワーク作業内で困難だったことについて教えて下さい。またどのように解決しましたか？',
			q5: '[任意] クライアントや顧客との実務経験はありますか？',
			q6: '[任意] 海外や異文化環境での就業経験はありますか？',
			q7: '[必須] これまでの経験を今後どのように活かしたいと考えていますか？',
		},
		キャリア目標: {
			q1: '[必須] 5 年後のキャリアビジョンを教えてください。',
			q2: '[必須] あなたのキャリアにおける最終目標は何ですか？',
			q3: '[任意] キャリアを進める上で、どのようなスキルや資格を今後身につけたいですか？',
			q4: '[必須] 日本で働きたい理由について教えてください。',
			q6: '[必須] 企業を選ぶ基準は何ですか？「安定性、成長機会、給与、休日など」',
			q7: '[任意] 将来、起業や独立の意向はありますか？',
			q8: '[必須] どのような会社や業界で働きたいと考えていますか？',
			q9: '[任意] 仕事とプライベートのバランスについてどのように考えていますか？',
			q10: '[必須] リモートワーク、フレックスタイム、転勤など、どのような働き方を希望し、その理由は何ですか？',
		},
	},

	FAQ: {
		学生向け: [
			{
				question: 'ポートフォリオシステムで何を登録できますか？',
				answer:
					'ポートフォリオシステムでは、自己 PR、特技、IT スキル、成果物、その他を他人と共有できます。これにより、あなたの学業成果やスキルを効果的にアピールできます。',
			},
			{
				question: '他の学生のポートフォリオを見ることができますか？',
				answer:
					'リクルーターのプロフィールを見ることができますが、他の学生のポートフォリオを見られません。',
			},
			{
				question: 'モバイルデバイスでもポートフォリオを閲覧できますか？',
				answer:
					'はい、ポートフォリオシステムはレスポンシブデザインを対応しており、スマートフォンやタブレットなど、どのデバイスでも快適に閲覧できます。',
			},
		],
		リクルーター向け: [
			{
				question:
					'ポートフォリオシステムはどのように学生の情報を提供しますか？',
				answer:
					'各学生にアカウント発行して、そのアカウントを通じて自己 PR、特技、IT スキル、成果物、単位数、実績などの詳細な情報を確認できます。これにより、学生の学業成果やスキルを効果的に評価できます。',
			},
			{
				question: '学生のプロジェクトデータはどのように追加されていますか？',
				answer:
					'学生はフォームを使用してプロジェクトデータを追加します。これには、プロジェクトの概要、画像、リンクなどが含まれ、詳細な情報を提供します。',
			},
			{
				question: 'ポートフォリオの内容はどのくらい頻繁に更新されますか？',
				answer:
					'学生が新しい成績やプロジェクト情報を追加するたびに、リアルタイムでポートフォリオが更新されます。これにより、最新の情報を常に確認することができます。',
			},
		],
	},
}

export default qaList
