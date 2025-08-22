import { useState } from 'react'
import {
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { styled } from '@mui/material/styles'
import PropTypes from 'prop-types'
import styles from './QAAccordion.module.css'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
const StyledAccordionSummary = styled(AccordionSummary)(() => ({
	'.MuiAccordionSummary-expandIcon': {
		order: -1,
	},
}))

const QAAccordion = ({ question, answer, notExpand = false }) => {
	const [expandable, setExpandable] = useState(notExpand)
	return (
		<div>
			<Accordion
				TransitionProps={{ timeout: 500 }}
				className={styles.accordion}
				expanded={expandable}
				style={notExpand ? {} : { marginBottom: '10px' }}
				sx={{
					transition: 'all 0.3s ease',
					boxShadow: 'none',
					'&:hover': {
						boxShadow: '0px 3px 3px 0px rgb(187, 187, 187)',
					},
				}}
			>
				<StyledAccordionSummary
					style={{
						borderRadius: 20,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'left',
					}}
					expandIcon={!notExpand && <KeyboardArrowDownIcon />}
					aria-controls='panel2-content'
					id='panel2-header'
					onClick={e => {
						if (notExpand) e.stopPropagation()
						else {
							setExpandable(!expandable)
						}
					}}
				>
					<div className={styles.qPart}>
						<HelpOutlineIcon sx={{ color: '#2563eb' }} />
					</div>
					<Typography sx={{ pl: '10px', fontSize: 18 }}>{question}</Typography>
				</StyledAccordionSummary>
				{!notExpand && (
					<AccordionDetails className={styles.answer}>
						<ChatBubbleOutlineIcon />
						<div
							style={{
								whiteSpace: 'pre-wrap',
								wordWrap: 'break-word',
								overflowWrap: 'break-word',
								flex: 1,
								maxWidth: '100%',
							}}
						>
							{answer}
						</div>
					</AccordionDetails>
				)}
			</Accordion>
		</div>
	)
}

QAAccordion.propTypes = {
	question: PropTypes.string.isRequired,
	answer: PropTypes.string.isRequired,
	notExpand: PropTypes.bool,
}

export default QAAccordion
