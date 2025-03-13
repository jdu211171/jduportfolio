import React, { useState, useEffect } from "react";
import { Box, Button, Modal, Typography, Chip, Stack } from "@mui/material";
import axios from "../../utils/axiosUtils";

import styles from "./DraftsModal.module.css";

const DraftsModal = ({ id, handleSettingtoHonban, handleSettingDraft }) => {
  const [open, setOpen] = useState(false); // Modal visibility state
  const [drafts, setDrafts] = useState([]); // Store drafts

  // Function to fetch drafts by student_id
  const fetchDrafts = async () => {
    try {
      const response = await axios.get(`/api/draft/student/${id}`);
      setDrafts(response.data);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };

  const draftClick = (draft) => {
    handleSettingDraft(draft);
    setOpen(false);
  };
  // Open modal and fetch drafts
  const handleOpen = () => {
    setOpen(true);
    fetchDrafts();
  };

  // Close modal
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSettingtoHonban}
      >
        本番
      </Button>
      <Button variant="contained" color="secondary" onClick={handleOpen}>
        下書き
      </Button>

      {/* Modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="drafts-modal">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" id="drafts-modal">
            Drafts
          </Typography>
          <Box
            sx={{
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            {drafts.length > 0 ? (
              drafts.map((draft, index) => (
                <Box
                  key={index}
                  className={styles.draftBox}
                  onClick={() => draftClick(draft)}
                >
                  {/* Header */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {index + 1}.
                    </Typography>
                    <Chip
                      label={draft.status}
                      size="small"
                      color={
                        draft.status === "approved"
                          ? "success"
                          : draft.status === "disapproved"
                          ? "error"
                          : "warning"
                      }
                      variant="outlined"
                    />
                  </Stack>

                  {/* Body */}
                  <Typography variant="body2" sx={{ display: "flex", mb: 0.5 }}>
                    <strong>Submit Count:</strong>&nbsp;{draft.submit_count}
                  </Typography>
                  <Typography variant="body2" sx={{ display: "flex", mb: 0.5 }}>
                    <strong>Comments:</strong>&nbsp;
                    {draft.comments || (
                      <i style={{ color: "gray" }}>No comments</i>
                    )}
                  </Typography>
                  <Typography variant="body2" sx={{ display: "flex", mb: 0.5 }}>
                    <strong>Reviewed By:</strong>&nbsp;
                    {draft.reviewed_by || (
                      <i style={{ color: "gray" }}>Not reviewed</i>
                    )}
                  </Typography>

                  {/* Updated Date */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", textAlign: "right" }}
                  >
                    Updated: {new Date(draft.updated_at).toLocaleString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{ mt: 2, color: "gray", textAlign: "center" }}
              >
                No drafts available.
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleClose}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default DraftsModal;
