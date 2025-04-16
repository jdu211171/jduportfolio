import React from 'react'
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Button,
	Checkbox,
	Divider,
	Box
} from '@mui/material'

function ConfirmationDialog({ open, onClose, onConfirm }) {
	const [checked, setChecked] = React.useState(false)
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth='sm'
			closeAfterTransition={false}
		>
			{/* Large Title */}
			<DialogTitle sx={{ fontWeight: '100' }}>公開申請</DialogTitle>

			<DialogContent dividers>
				<Divider sx={{ my: 1 }} />
				
				{/* Main content */}
				<Typography variant='body2' sx={{ whiteSpace: 'pre-line', mt: 1 }}>
					{`就職活動を円滑にする目的のために、あなたのプロフィールを申請に基づき、JDUポー
トフォリオサービス上に公開します。
公開申請後はJDU日本就業部に送信され、職員による内容確認が行われます。
記載内容について不明点や質問がある場合は、メールにてご連絡します。
記載内容について不明点や質問がない場合は、申請内容が承認され、あなたのプロフ
ィールが公開されます。
あなたのプロフィールの内容等が以下の禁止行為に該当しないこと確認し、申請ボタ
ンから公開申請をしてください。`}
				</Typography>
				
				<Divider sx={{ my: 1 }} />
				
				{/* Prohibited actions section */}
				<Typography variant='body2' sx={{ fontWeight: 'bold', mt: 1 }}>
					（禁止行為）
				</Typography>
				<Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
					{`JDU学生は、本サービスの利用に際し、次の各号の行為を行ってはならないものとしま
す。
(1)虚偽または不正確な情報を提供する行為
(2)個人や団体を誹謗、中傷、脅迫、またはそのおそれのある行為
(3)著作権、商標権、その他の知的財産権を含む他人の権利を侵害し、またはそのおそ
れのある行為　例：芸能人や他人の写真、作品、キャラクターなどを無断で利用す
る行為
(5)本サービスの円滑な運営を妨げる行為、または当社および求人者の信用または名誉
を毀損する行為、もしくはそれらのおそれのある行為　例：求人者への直接連絡、
面談等の行為
(6)犯罪行為、または法令に反する行為等公序良俗に反する行為、もしくはそれらのお
それのある行為
(7)反社会的勢力等に関連する組織に属する行為、反社会的勢力に利益を与え、または
利用する等不適切な関係を持つ行為、もしくはそれらのおそれのある行為`}
				</Typography>
				
				<Divider sx={{ my: 1 }} />
				
				{/* Agreement checkbox */}
				<Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
					<Checkbox
						checked={checked}
						onChange={e => setChecked(e.target.checked)}
					/>
					<Typography>上記の禁止行為に該当しないとことを確認しました</Typography>
				</Box>
			</DialogContent>

			<DialogActions sx={{ pr: 3, pb: 2 }}>
				<Button
					variant='outlined'
					color='error'
					onClick={onClose}
					sx={{ mr: 2 }}
				>
					いいえ
				</Button>

				<Button
					variant='contained'
					color='primary'
					onClick={onConfirm}
					disabled={!checked}
				>
					申請
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default ConfirmationDialog
