import { useEffect, useRef } from 'react'
import styles from './CreditsProgressBar.module.css'

const CreditsProgressBar = ({ breakpoints, unit, credits, semester }) => {
	let color = 'red'
	if (credits > 124) {
		color = 'blue'
	} else if ((124 / 9) * Number(semester) < credits) {
		color = 'green'
	}
	let totalPoints =
		breakpoints[breakpoints.length - 1].point > credits
			? breakpoints[breakpoints.length - 1].point
			: credits
	if (totalPoints < credits) {
		totalPoints = credits
	}
	const creditPercentage = (credits / totalPoints) * 100

	const graphContainerRef = useRef(null)

	useEffect(() => {
		const graphContainer = graphContainerRef.current
		const checkScrollable = () => {
			if (graphContainer.scrollWidth > graphContainer.clientWidth) {
				graphContainer.classList.add(styles.scrollable)
			} else {
				graphContainer.classList.remove(styles.scrollable)
			}
		}

		checkScrollable()
		window.addEventListener('resize', checkScrollable)

		return () => {
			window.removeEventListener('resize', checkScrollable)
		}
	}, [])

	return (
		<div className={styles.graphContainer} ref={graphContainerRef}>
			<div className={styles.progressContainer}>
				{/* Top labels */}
				<div className={styles.topLabels}>
					<span className={styles.startLabel}>入学</span>
					<span className={styles.endLabel}>卒業</span>
				</div>

				{/* Progress bar */}
				<div className={styles.progressBar}>
					{/* Background line */}
					<div className={styles.progressLine}></div>

					{/* Active progress line */}
					<div
						className={styles.activeProgressLine}
						style={{ width: `${creditPercentage}%` }}
					></div>

					{/* Breakpoints */}
					{breakpoints.map((breakpoint, index) => {
						const leftPosition = (breakpoint.point / totalPoints) * 100
						const isCompleted = credits >= breakpoint.point

						return (
							<div
								key={index}
								className={`${styles.breakpoint} ${isCompleted ? styles.completed : ''}`}
								style={{ left: `${leftPosition}%` }}
							>
								<div className={styles.circle}>
									{isCompleted && (
										<svg width='16' height='16' viewBox='0 0 16 16' fill='none'>
											<path
												d='M13.5 4.5L6 12L2.5 8.5'
												stroke='white'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											/>
										</svg>
									)}
								</div>
								<div className={styles.creditLabel}>
									{breakpoint.point}
									{unit}
								</div>
							</div>
						)
					})}

					{/* Current credit indicator */}
					<div
						className={styles.currentIndicator}
						style={{ left: `${creditPercentage}%` }}
					>
						<div className={styles.currentCircle}></div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CreditsProgressBar
