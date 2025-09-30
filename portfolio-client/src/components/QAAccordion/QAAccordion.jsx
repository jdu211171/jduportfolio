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

const QAAccordion = ({
    question,
    answer,
    notExpand = false,
    expanded, // optional controlled expanded state
    onToggle, // optional toggle handler (for controlled mode)
    showExpandIcon = true, // controls visibility of expand icon and click behavior
    allowToggleWhenNotExpand = false, // allow header toggle even if details are disabled
}) => {
	// Local state for uncontrolled usage
	const [localExpanded, setLocalExpanded] = useState(false)

	const isControlled = typeof expanded === 'boolean'
	const isExpanded = isControlled ? expanded : localExpanded

	return (
		<div>
			<Accordion
				TransitionProps={{ timeout: 500 }}
				className={styles.accordion}
				expanded={notExpand ? false : isExpanded}
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
                expandIcon={(showExpandIcon || (notExpand && allowToggleWhenNotExpand)) && (
                    <KeyboardArrowDownIcon />
                )}
					aria-controls='panel2-content'
					id='panel2-header'
					onClick={e => {
                    // If expansion is disabled and not explicitly allowed, or icon hidden, block
                    if ((notExpand && !allowToggleWhenNotExpand) || !showExpandIcon) {
                        e.stopPropagation()
                        return
                    }
						if (typeof onToggle === 'function') {
							onToggle()
						} else if (!isControlled) {
							setLocalExpanded(prev => !prev)
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
    expanded: PropTypes.bool,
    onToggle: PropTypes.func,
    showExpandIcon: PropTypes.bool,
    allowToggleWhenNotExpand: PropTypes.bool,
}

export default QAAccordion
