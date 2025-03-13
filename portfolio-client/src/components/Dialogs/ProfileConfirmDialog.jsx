import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

function ConfirmationDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm" // You can change to "xs", "md", etc.
      closeAfterTransition={false}
    >
      {/* Large Title */}
      <DialogTitle sx={{ fontWeight: "100" }}>承認依頼・同意</DialogTitle>

      <DialogContent dividers>
        {/* Large Title */}
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          あなたの情報が承認されるためJDU職員に送信されます
        </Typography>

        {/* Body text; using whiteSpace: pre-line lets you preserve \n as line breaks */}
        <Typography variant="body2" sx={{ whiteSpace: "pre-line", mt: 1 }}>
          {`プロフィールの承認依頼はJDU就業部へ送信され、職員による内容確認が行われます。
不明点や追加の質問がある場合は、メールにてご連絡します。
問題がなければ承認され、あなたの入力情報や成績情報などがJDU大学のサポート企業に公開され、就職活動がよりスムーズになります。
プロフィール公開に同意しますか？`}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ pr: 3, pb: 2 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={onClose}
          sx={{ mr: 2 }}
        >
          いいえ
        </Button>

        <Button variant="contained" color="primary" onClick={onConfirm}>
          はい
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;

