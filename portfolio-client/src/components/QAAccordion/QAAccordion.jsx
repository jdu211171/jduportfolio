import React, {useState} from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { ArrowDropDown, Margin } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import styles from "./QAAccordion.module.css";

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  ".MuiAccordionSummary-expandIcon": {
    order: -1,
  },
}));

const QAAccordion = ({ question, answer, notExpand = false }) => {
  const [expandable, setExpandable] = useState(notExpand);
  return (
    <div>
      <Accordion className={styles.accordion} expanded={expandable} style={notExpand ? {marginBottom:"10px"} : {}} >
        <StyledAccordionSummary
          expandIcon={!notExpand && <ArrowDropDown />}
          aria-controls="panel2-content"
          id="panel2-header"
          onClick={(e) => {
            if (notExpand) e.stopPropagation(); else {
              setExpandable(!expandable)
            } // Prevent expanding when `expand` is false
          }}
        >
          <div className={styles.qPart}>Q</div>
          <Typography className={styles.question}>{question}</Typography>
        </StyledAccordionSummary>
        {!notExpand && (
          <AccordionDetails className={styles.answer}>
            <Typography>{answer} </Typography>
          </AccordionDetails>
        )}
      </Accordion>
    </div>
  );
};

export default QAAccordion;
