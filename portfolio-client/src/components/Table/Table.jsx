import { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import axios from '../../utils/axiosUtils'

import { atom, useAtom } from 'jotai'
import UserAvatar from './Avatar/UserAvatar'
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	LinearProgress,
	Menu,
	MenuItem,
	IconButton,
	Grid,
	Typography,
	Switch,
	Modal,
	Button,
} from '@mui/material'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PendingIcon from '@mui/icons-material/Pending'

// Icons import
import AwardIcon from '../../assets/icons/award-line.svg'
import GraduationCapIcon from '../../assets/icons/graduation-cap-line.svg'
import SchoolIcon from '../../assets/icons/school-line.svg'
import DeleteIcon from '../../assets/icons/delete-bin-3-line.svg'

import { stableSort, getComparator } from './TableUtils'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'

// localStorage dan qiymat o'qish yoki default qiymat
const getInitialRowsPerPage = () => {
	try {
		const saved = localStorage.getItem('tableRowsPerPage')
		return saved ? parseInt(saved, 10) : 10
	} catch (error) {
		console.error('Error reading from localStorage:', error)
		return 10
	}
}

// Create an atom to store rows per page preference
const rowsPerPageAtom = atom(getInitialRowsPerPage())

const EnhancedTable = ({ tableProps, updatedBookmark, viewMode = 'table' }) => {
	const { language } = useLanguage()
	const t = key => translations[language][key] || key

	const role = sessionStorage.getItem('role')

	const [order, setOrder] = useState('asc')
	const [orderBy, setOrderBy] = useState('')
	const [selected, setSelected] = useState([])
	const [page, setPage] = useState(0)
	const [rowsPerPage, setRowsPerPage] = useAtom(rowsPerPageAtom)
	const [rows, setRows] = useState([])
	const [loading, setLoading] = useState(false)
	const [refresher, setRefresher] = useState(0)
	const [anchorEls, setAnchorEls] = useState({})
	const [deleteModal, setDeleteModal] = useState({
		open: false,
		itemId: null,
		deleteAction: null,
	})

	// localStorage ga saqlash
	useEffect(() => {
		try {
			localStorage.setItem('tableRowsPerPage', rowsPerPage.toString())
		} catch (error) {
			console.error('Error saving to localStorage:', error)
		}
	}, [rowsPerPage])

	const open = Boolean(anchorEls)
	const handleClick = (event, rowId) => {
		setAnchorEls(prev => ({
			...prev,
			[rowId]: event.currentTarget,
		}))
	}
	const handleClose = async (id, action) => {
		console.log('handleClose called with:', { id, action })
		let res = false
		res = await action(id)
		console.log('Action result:', res)

		if (res == undefined) {
			console.log('Action returned undefined, triggering refresh')
			setRefresher(prev => prev + 1)
		} else {
			console.log('Action returned result, not triggering refresh')
		}

		setAnchorEls(prev => ({
			...prev,
			[id]: null,
		}))
	}

	const getUniqueKey = header => {
		return header.keyIdentifier || `${header.id}${header.subkey || ''}`
	}

	const fetchUserData = useCallback(async () => {
		console.log('fetchUserData called')
		setLoading(true)
		try {
			const response = await axios.get(tableProps.dataLink, {
				params: {
					filter: tableProps.filter,
					recruiterId: tableProps.recruiterId,
					onlyBookmarked: tableProps.OnlyBookmarked,
				},
			})
			console.log('Fetched data:', response.data)
			setRows(response.data)
		} catch (error) {
			console.error('Error fetching students:', error)
		} finally {
			setLoading(false)
		}
	}, [
		tableProps.dataLink,
		tableProps.filter,
		tableProps.recruiterId,
		tableProps.OnlyBookmarked,
	])

	useEffect(() => {
		console.log('useEffect triggered, calling fetchUserData')
		fetchUserData()
	}, [
		fetchUserData,
		tableProps.refreshTrigger,
		// Remove refresher from dependencies to prevent automatic refetch
		// refresher should only be used for manual refresh operations
	])

	useEffect(() => {
		if (updatedBookmark?.studentId) {
			setRows(prevData =>
				prevData.map(data =>
					data.id === updatedBookmark.studentId
						? { ...data, isBookmarked: !data.isBookmarked }
						: data
				)
			)
		}
	}, [updatedBookmark])

	const handleChangePage = (event, newPage) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = event => {
		const newRowsPerPage = parseInt(event.target.value, 10)
		setRowsPerPage(newRowsPerPage)
		setPage(0) // Reset to first page
	}

	const isSelected = id => selected.indexOf(id) !== -1

	const visibleRows = stableSort(rows, getComparator(order, orderBy)).slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	)

	// Grid view da bookmark click handler
	const handleBookmarkClickInGrid = row => {
		const bookmarkHeader = tableProps.headers.find(h => h.type === 'bookmark')
		if (bookmarkHeader && bookmarkHeader.onClickAction) {
			bookmarkHeader.onClickAction(row)
		}
	}

	// Grid view da profile click handler
	const handleProfileClickInGrid = row => {
		const avatarHeader = tableProps.headers.find(h => h.type === 'avatar')
		if (avatarHeader && avatarHeader.onClickAction) {
			avatarHeader.onClickAction(row)
		}
	}

	// Grid view uchun card component
	const renderGridView = () => (
		<Grid container spacing={2.5}>
			{visibleRows.map(row => (
				<Grid item xs={12} sm={6} md={4} key={row.id}>
					<Box
						sx={{
							width: '100%',
							maxWidth: '380px',
							minHeight: '160px',
							borderRadius: '12px',
							border: '1px solid #f0f0f0',
							backgroundColor: '#fff',
							position: 'relative',
							cursor: 'pointer',
							transition: 'all 0.2s ease',
							p: 2,
							'&:hover': {
								boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
								transform: 'translateY(-2px)',
							},
						}}
					>
						{/* Top row: Avatar, Bookmark */}
						<Box
							sx={{
								display: 'flex',
								alignItems: 'flex-start',
								mb: 2,
								padding: viewMode === 'grid' ? '0px' : '10px 16px',
							}}
						>
							{/* Avatar va Age */}
							<Box
								sx={{ mr: 1.5, cursor: 'pointer', flex: 1 }}
								onClick={() => handleProfileClickInGrid(row)}
							>
								<UserAvatar
									photo={row.photo}
									name={row.first_name + ' ' + row.last_name}
									studentId={row.kana_name || 'N/A'}
									isGridMode={viewMode === 'grid'}
									style={{
										width: '56px',
										height: '56px',
									}}
								/>
								{/* Age - Avatar tagida */}
								<Typography
									variant='body2'
									sx={{
										fontSize: '14px',
										color: '#666',
										lineHeight: 1.2,
										mt: 0.5,
									}}
								>
									年齢: {row.age || 'N/A'}
								</Typography>
							</Box>

							{/* Bookmark */}
							{role === 'Recruiter' && (
								<Box
									sx={{ cursor: 'pointer', p: 0.5 }}
									onClick={() => handleBookmarkClickInGrid(row)}
								>
									{row.isBookmarked ? (
										<svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
											<path
												d='M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z'
												fill='#FFD700'
												stroke='#FFD700'
											/>
										</svg>
									) : (
										<svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
											<path
												d='M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z'
												stroke='#ccc'
												strokeWidth='1.5'
											/>
										</svg>
									)}
								</Box>
							)}
						</Box>

						{/* Bottom section: 3 rows of icon + value */}
						<Box
							sx={{
								mt: 1,
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'space-between',
								borderTop: '1px solid #f0f0f0',
								paddingTop: '8px',
							}}
						>
							{/* JLPT row */}
							<Box
								sx={{
									display: 'flex',
									mb: 1,
								}}
							>
								<img
									src={AwardIcon}
									alt='JLPT'
									style={{
										width: '20px',
										height: '20px',
										marginRight: '12px',
									}}
								/>
								<Typography
									variant='body2'
									sx={{
										fontSize: '15px',
										fontWeight: 500,
										color: '#333',
									}}
								>
									{(() => {
										if (row.jlpt) {
											try {
												const jlptData = JSON.parse(row.jlpt)
												return jlptData?.highest || '未提出'
											} catch {
												return row.jlpt
											}
										}
										return '未提出'
									})()}
								</Typography>
							</Box>

							{/* University row */}
							<Box sx={{ display: 'flex', mb: 1 }}>
								<img
									src={SchoolIcon}
									alt='University'
									style={{
										width: '20px',
										height: '20px',
										marginRight: '12px',
									}}
								/>
								<Typography
									variant='body2'
									sx={{
										fontSize: '15px',
										fontWeight: 500,
										color: '#333',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
										flex: 1,
									}}
								>
									{row.partner_university || 'N/A'}
								</Typography>
							</Box>

							{/* Graduation row */}
							<Box sx={{ display: 'flex' }}>
								<img
									src={GraduationCapIcon}
									alt='Graduation'
									style={{
										width: '20px',
										height: '20px',
										marginRight: '12px',
									}}
								/>
								<Typography
									variant='body2'
									sx={{
										fontSize: '15px',
										fontWeight: 500,
										color: '#333',
									}}
								>
									{row.expected_graduation_year || 'N/A'}
								</Typography>
							</Box>
						</Box>
					</Box>
				</Grid>
			))}
		</Grid>
	)

	// Reusable pagination component
	const PaginationControls = () => (
		<TablePagination
			rowsPerPageOptions={[5, 10, 25, 50, 100]}
			component='div'
			count={rows.length}
			rowsPerPage={rowsPerPage}
			page={page}
			onPageChange={handleChangePage}
			onRowsPerPageChange={handleChangeRowsPerPage}
			labelRowsPerPage={t('rows_per_page')}
			sx={{
				backgroundColor: viewMode === 'grid' ? 'transparent' : '#fff',
				'& .MuiToolbar-root': {
					display: 'flex',
					alignItems: 'center',
					padding: '8px 16px',
					gap: '16px',
				},
				// Chap taraf container
				'& .MuiTablePagination-selectLabel, & .MuiTablePagination-select': {
					flex: '0 1 auto', // Fixed size, chap tarafda
				},
				// O'rtada bo'sh joy
				'& .MuiTablePagination-spacer': {
					flex: '0 0 auto', // Barcha bo'sh joyni egallash
				},
				// O'ng taraf container
				'& .MuiTablePagination-displayedRows': {
					flex: '10 0 auto', // Fixed size, o'ng tarafda
					order: 999,
					textAlign: 'right',
				},
				'& .MuiTablePagination-actions': {
					flex: '0 0 auto', // Fixed size, o'ng tarafda
					order: 1000,
					marginLeft: '16px',
				},
			}}
		/>
	)

	// Filtered headers for easier processing
	const visibleHeaders = tableProps.headers.filter(
		header =>
			(header.role == undefined || header.role == role) &&
			(header.visibleTo ? header.visibleTo.includes(role) : true)
	)

	return (
		<Box sx={{ width: '100%' }}>
			{loading ? (
				<Box sx={{ padding: 2 }}>
					<LinearProgress />
				</Box>
			) : viewMode === 'grid' ? (
				renderGridView()
			) : (
				<Box
					sx={{
						border: '1px solid #e0e0e0',
						borderRadius: '12px',
						overflow: 'hidden',
						backgroundColor: '#ffffff',
						boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
					}}
				>
					<TableContainer
						sx={{
							minHeight: visibleRows.length > 0 ? 'auto' : '300px',
							maxHeight: {
								xs: 'calc(100vh - 320px)', // Mobile
								sm: 'calc(100vh - 300px)', // Tablet
								md: 'calc(100vh - 280px)', // Desktop
							},
							overflowY: 'auto',
							overflowX: 'auto',
							// Custom scrollbar styling
							'&::-webkit-scrollbar': {
								width: '8px',
								height: '8px',
							},
							'&::-webkit-scrollbar-track': {
								background: '#f1f1f1',
								borderRadius: '4px',
							},
							'&::-webkit-scrollbar-thumb': {
								background: '#c1c1c1',
								borderRadius: '4px',
								'&:hover': {
									background: '#a8a8a8',
								},
							},
						}}
					>
						<Table
							sx={{
								minWidth: 750,
								backgroundColor: '#ffffff',
							}}
							size='medium'
							stickyHeader
						>
							<TableHead>
								<TableRow>
									{visibleHeaders.map((header, index) => (
										<TableCell
											sx={{
												backgroundColor: '#f7fafc',
												borderBottom: '1px solid #e0e0e0',
												borderRight: 'none',
												position: 'sticky',
												top: 0,
												zIndex: 10,
												...(index === 0 && {
													borderTopLeftRadius: '10px',
												}),
												...(index === visibleHeaders.length - 1 && {
													borderTopRightRadius: '10px',
												}),
											}}
											key={`data${getUniqueKey(header)}_${header.id}`}
											align='center'
											padding={'normal'}
											sortDirection={orderBy === header.id ? order : false}
										>
											{header.label}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{visibleRows.length > 0 ? (
									visibleRows.map((row, rowIndex) => (
										<TableRow
											hover
											role='checkbox'
											aria-checked={isSelected(row.id)}
											tabIndex={-1}
											key={row.id}
											selected={isSelected(row.id)}
											sx={{
												cursor: 'pointer',
												backgroundColor: '#ffffff',
												'&:hover': {
													backgroundColor: '#f9fafb !important',
												},
											}}
										>
											{visibleHeaders.map((header, cellIndex) => (
												<TableCell
													key={`data${getUniqueKey(header)}_${header.id}`}
													align='center'
													padding={header.disablePadding ? 'none' : 'normal'}
													onClick={() => {
														// Don't trigger profile navigation for delete icon
														if (header.type === 'delete_icon') {
															return
														}

														// Find the avatar header to get the profile navigation function
														const avatarHeader = tableProps.headers.find(
															h => h.type === 'avatar'
														)
														if (avatarHeader && avatarHeader.onClickAction) {
															avatarHeader.onClickAction(row)
														}
													}}
													sx={{
														minWidth: (() => {
															// Set specific minWidth based on column label
															switch (header.label) {
																case '年齢':
																	return '65px'
																case '申請回数':
																	return '90px'
																case '承認状況':
																	return '135px'
																case '確認状況':
																	return '135px'
																case '公開状況':
																	return '120px'
																default:
																	return header.minWidth
															}
														})(),
														padding:
															header.type === 'avatar' ? '4px' : '12px 16px',
														borderRight: 'none',
														backgroundColor: 'inherit', // Use inherit to take from parent row
														cursor:
															header.type === 'delete_icon'
																? 'default'
																: 'pointer',
														...(rowIndex === visibleRows.length - 1 &&
															cellIndex === 0 && {
																borderBottom: 'none',
															}),
														...(rowIndex === visibleRows.length - 1 &&
															cellIndex === visibleHeaders.length - 1 && {
																borderBottom: 'none',
															}),
														...(header.type === 'action'
															? {
																	position: 'sticky',
																	right: 0,
																	background: 'inherit', // Use inherit instead of white
																	zIndex: 5,
																	width: '20px',
																	borderLeft: 'none',
																}
															: {}),
													}}
												>
													{/* Table cell content - same as before */}
													{header.type === 'bookmark' ? (
														<div onClick={e => e.stopPropagation()}>
															{row.isBookmarked ? (
																<svg
																	width='19'
																	height='18'
																	viewBox='0 0 19 18'
																	fill='none'
																	xmlns='http://www.w3.org/2000/svg'
																	onClick={() =>
																		header.onClickAction &&
																		header.onClickAction(row)
																	}
																	style={{ cursor: 'pointer' }}
																>
																	<path
																		d='M9.3275 14.1233L4.18417 16.8275L5.16667 11.1L1 7.04417L6.75 6.21083L9.32167 1L11.8933 6.21083L17.6433 7.04417L13.4767 11.1L14.4592 16.8275L9.3275 14.1233Z'
																		fill='#F7C02F'
																		stroke='#F7C02F'
																		strokeLinecap='round'
																		strokeLinejoin='round'
																	/>
																</svg>
															) : (
																<svg
																	width='18'
																	height='17'
																	viewBox='0 0 18 17'
																	fill='none'
																	xmlns='http://www.w3.org/2000/svg'
																	onClick={() =>
																		header.onClickAction &&
																		header.onClickAction(row)
																	}
																	style={{ cursor: 'pointer' }}
																>
																	<path
																		d='M9.00035 13.7913L3.85702 16.4955L4.83952 10.768L0.672852 6.71214L6.42285 5.8788L8.99452 0.667969L11.5662 5.8788L17.3162 6.71214L13.1495 10.768L14.132 16.4955L9.00035 13.7913Z'
																		stroke='#ccc'
																		strokeWidth='1.5'
																		strokeLinecap='round'
																		strokeLinejoin='round'
																	/>
																</svg>
															)}
														</div>
													) : header.type === 'avatar' ? (
														<UserAvatar
															photo={row.photo}
															name={row.first_name + ' ' + row.last_name}
															studentId={row.kana_name || 'N/A'}
														/>
													) : header.type === 'status' ? (
														<div
															style={{
																textAlign: 'center',
																fontSize: '16px',
															}}
														>
															{row[header.id] ? '公開' : '非公開'}
														</div>
													) : header.type === 'email' ? (
														<a href={`mailto:${row[header.id]}`}>
															{row[header.id]}
														</a>
													) : header.type === 'date' ? (
														header.subkey ? (
															row[header.id] ? (
																row[header.id][header.subkey].split('T')[0]
															) : (
																'N/A'
															)
														) : row[header.id] ? (
															row[header.id].split('T')[0]
														) : (
															'N/A'
														)
													) : header.type === 'status_icon' ? (
														<div
															style={{
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																gap: '6px',
																padding: '4px 8px',
																borderRadius: '8px',
															}}
														>
															{(() => {
																const status = header.subkey
																	? row[header.id]
																		? row[header.id][header.subkey]
																		: ''
																	: row[header.id]
																const statusConfig = header.statusMap[status]

																if (!statusConfig) return 'N/A'

																return (
																	<div
																		style={{
																			display: 'flex',
																			alignItems: 'center',
																			gap: '4px',
																			backgroundColor: `${statusConfig.color}15`,
																			padding: '4px 8px',
																			borderRadius: '12px',
																		}}
																	>
																		{statusConfig.icon === 'approved' && (
																			<CheckCircleIcon
																				sx={{
																					color: statusConfig.color,
																					fontSize: '16px',
																				}}
																			/>
																		)}
																		{statusConfig.icon === 'rejected' && (
																			<CancelIcon
																				sx={{
																					color: statusConfig.color,
																					fontSize: '16px',
																				}}
																			/>
																		)}
																		{statusConfig.icon === 'pending' && (
																			<PendingIcon
																				sx={{
																					color: statusConfig.color,
																					fontSize: '16px',
																				}}
																			/>
																		)}
																		<span
																			style={{
																				color: statusConfig.color,
																				fontSize: '12px',
																				fontWeight: '500',
																			}}
																		>
																			{statusConfig.text}
																		</span>
																	</div>
																)
															})()}
														</div>
													) : header.type === 'confirmation_status' ? (
														<div
															style={{
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																gap: '6px',
																padding: '4px 8px',
																borderRadius: '8px',
															}}
														>
															{(() => {
																// Checking logic based on draft status and visibility
																const draftStatus = row.draft?.status
																let color, icon, text

																if (row.visibility === true) {
																	// Agar visibility true bo'lsa - public/tasdiqlangan
																	color = '#4caf50'
																	icon = 'approved'
																	text = '承認済'
																} else if (
																	draftStatus === 'submitted' ||
																	draftStatus === 'checking'
																) {
																	// Draft yuborilgan yoki tekshirilmoqda - checking holati
																	color = '#ff9800'
																	icon = 'pending'
																	text = '未確認'
																} else if (
																	draftStatus === 'disapproved' ||
																	draftStatus === 'resubmission_required'
																) {
																	// Draft rad etilgan
																	color = '#f44336'
																	icon = 'rejected'
																	text = '差し戻し'
																} else {
																	// Default holat (draft yo'q yoki boshqa holatlar)
																	// visibility false bo'lsa va draft holati aniq emas bo'lsa
																	color = '#ff9800'
																	icon = 'pending'
																	text = '未確認'
																}

																return (
																	<div
																		style={{
																			display: 'flex',
																			alignItems: 'center',
																			gap: '4px',
																			backgroundColor: `${color}15`,
																			padding: '4px 8px',
																			borderRadius: '12px',
																			position: 'relative',
																		}}
																		title={
																			row.draft?.comments
																				? `コメント: ${row.draft.comments}`
																				: ''
																		}
																	>
																		{icon === 'approved' && (
																			<CheckCircleIcon
																				sx={{
																					color: color,
																					fontSize: '16px',
																				}}
																			/>
																		)}
																		{icon === 'rejected' && (
																			<CancelIcon
																				sx={{
																					color: color,
																					fontSize: '16px',
																				}}
																			/>
																		)}
																		{icon === 'pending' && (
																			<PendingIcon
																				sx={{
																					color: color,
																					fontSize: '16px',
																				}}
																			/>
																		)}
																		<span
																			style={{
																				color: color,
																				fontSize: '12px',
																				fontWeight: '500',
																			}}
																		>
																			{text}
																		</span>
																		{/* Show comment indicator when there are staff comments */}
																		{row.draft?.comments &&
																			(draftStatus === 'disapproved' ||
																				draftStatus ===
																					'resubmission_required') && (
																				<span
																					style={{
																						color: color,
																						fontSize: '10px',
																						marginLeft: '2px',
																					}}
																					title={`スタッフコメント: ${row.draft.comments}`}
																				>
																					💬
																				</span>
																			)}
																	</div>
																)
															})()}
														</div>
													) : header.type === 'visibility_toggle' ? (
														<div
															style={{
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																gap: '8px',
															}}
															onClick={e => e.stopPropagation()}
														>
															<Switch
																checked={row[header.id] || false}
																onChange={async e => {
																	const newValue = e.target.checked
																	const previousValue = row[header.id]

																	console.log('Visibility toggle clicked:', {
																		rowId: row.id,
																		previousValue: previousValue,
																		newValue: newValue,
																		headerId: header.id,
																	})

																	// Optimistically update UI immediately
																	setRows(prevRows => {
																		const newRows = prevRows.map(prevRow =>
																			prevRow.id === row.id
																				? { ...prevRow, [header.id]: newValue }
																				: prevRow
																		)
																		console.log(
																			'Optimistically updated rows:',
																			newRows.find(r => r.id === row.id)
																		)
																		return newRows
																	})

																	// Then call backend
																	if (header.onToggle) {
																		try {
																			const success = await header.onToggle(
																				row.id,
																				newValue
																			)
																			console.log('Toggle result:', success)

																			if (!success) {
																				console.log(
																					'Toggle failed, reverting to previous state'
																				)
																				// Revert to previous state if backend call failed
																				setRows(prevRows => {
																					const revertedRows = prevRows.map(
																						prevRow =>
																							prevRow.id === row.id
																								? {
																										...prevRow,
																										[header.id]: previousValue,
																									}
																								: prevRow
																					)
																					console.log(
																						'Reverted rows:',
																						revertedRows.find(
																							r => r.id === row.id
																						)
																					)
																					return revertedRows
																				})
																			} else {
																				console.log(
																					'Toggle successful, keeping optimistic update'
																				)
																			}
																		} catch (error) {
																			console.error(
																				'Toggle error, reverting to previous state:',
																				error
																			)
																			// Revert to previous state on error
																			setRows(prevRows => {
																				const revertedRows = prevRows.map(
																					prevRow =>
																						prevRow.id === row.id
																							? {
																									...prevRow,
																									[header.id]: previousValue,
																								}
																							: prevRow
																				)
																				console.log(
																					'Error reverted rows:',
																					revertedRows.find(
																						r => r.id === row.id
																					)
																				)
																				return revertedRows
																			})
																		}
																	}
																}}
																size='small'
																sx={{
																	'& .MuiSwitch-switchBase': {
																		color: '#fff',
																		'&.Mui-checked': {
																			color: '#fff',
																			'& + .MuiSwitch-track': {
																				backgroundColor: '#4caf50',
																				opacity: 1,
																			},
																		},
																	},
																	'& .MuiSwitch-track': {
																		backgroundColor: '#ccc',
																		opacity: 1,
																		borderRadius: '20px',
																	},
																	'& .MuiSwitch-thumb': {
																		backgroundColor: '#fff',
																		width: '16px',
																		height: '16px',
																		boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
																	},
																}}
															/>
															<span
																style={{
																	fontSize: '12px',
																	fontWeight: '500',
																	color: row[header.id] ? '#4caf50' : '#666',
																}}
															>
																{row[header.id] ? '公開' : '非公開'}
															</span>
														</div>
													) : header.type === 'toggle_switch' ? (
														<div
															style={{
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
															}}
															onClick={e => e.stopPropagation()}
														>
															<Switch
																checked={row[header.id] || false}
																onChange={async e => {
																	const newValue = e.target.checked
																	const previousValue = row[header.id]

																	console.log('Toggle switch clicked:', {
																		rowId: row.id,
																		previousValue: previousValue,
																		newValue: newValue,
																		headerId: header.id,
																	})

																	// Optimistically update UI immediately
																	setRows(prevRows => {
																		const newRows = prevRows.map(prevRow =>
																			prevRow.id === row.id
																				? { ...prevRow, [header.id]: newValue }
																				: prevRow
																		)
																		console.log(
																			'Optimistically updated toggle switch rows:',
																			newRows.find(r => r.id === row.id)
																		)
																		return newRows
																	})

																	// Then call backend
																	if (header.onToggle) {
																		try {
																			const success = await header.onToggle(
																				row.id,
																				newValue
																			)
																			console.log(
																				'Toggle switch result:',
																				success
																			)

																			if (!success) {
																				console.log(
																					'Toggle switch failed, reverting to previous state'
																				)
																				// Revert to previous state if backend call failed
																				setRows(prevRows => {
																					const revertedRows = prevRows.map(
																						prevRow =>
																							prevRow.id === row.id
																								? {
																										...prevRow,
																										[header.id]: previousValue,
																									}
																								: prevRow
																					)
																					console.log(
																						'Reverted toggle switch rows:',
																						revertedRows.find(
																							r => r.id === row.id
																						)
																					)
																					return revertedRows
																				})
																			} else {
																				console.log(
																					'Toggle switch successful, keeping optimistic update'
																				)
																			}
																		} catch (error) {
																			console.error(
																				'Toggle switch error, reverting to previous state:',
																				error
																			)
																			// Revert to previous state on error
																			setRows(prevRows => {
																				const revertedRows = prevRows.map(
																					prevRow =>
																						prevRow.id === row.id
																							? {
																									...prevRow,
																									[header.id]: previousValue,
																								}
																							: prevRow
																				)
																				console.log(
																					'Error reverted toggle switch rows:',
																					revertedRows.find(
																						r => r.id === row.id
																					)
																				)
																				return revertedRows
																			})
																		}
																	}
																}}
																size='small'
																sx={{
																	'& .MuiSwitch-switchBase': {
																		color: '#fff',
																		'&.Mui-checked': {
																			color: '#fff',
																			'& + .MuiSwitch-track': {
																				backgroundColor: '#4caf50',
																				opacity: 1,
																			},
																		},
																	},
																	'& .MuiSwitch-track': {
																		backgroundColor: '#ccc',
																		opacity: 1,
																		borderRadius: '20px',
																	},
																	'& .MuiSwitch-thumb': {
																		backgroundColor: '#fff',
																		width: '16px',
																		height: '16px',
																		boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
																	},
																}}
															/>
														</div>
													) : header.type === 'delete_icon' ? (
														<div
															style={{
																display: 'flex',
																alignItems: 'center',
																justifyContent: 'center',
																cursor: 'pointer',
																padding: '8px',
															}}
															onClick={e => {
																e.stopPropagation() // Prevent row click
																if (header.onClickAction) {
																	setDeleteModal({
																		open: true,
																		itemId: row.id,
																		deleteAction: header.onClickAction,
																	})
																}
															}}
														>
															<img
																src={DeleteIcon}
																alt='Delete'
																style={{
																	width: '16px',
																	height: '16px',
																	filter:
																		'invert(16%) sepia(10%) saturate(100%) hue-rotate(0deg) brightness(30%) contrast(100%)', // Dark gray color
																	transition: 'filter 0.2s ease',
																}}
																onMouseEnter={e => {
																	e.target.style.filter =
																		'invert(16%) sepia(88%) saturate(6400%) hue-rotate(357deg) brightness(95%) contrast(98%)' // Red color on hover
																}}
																onMouseLeave={e => {
																	e.target.style.filter =
																		'invert(16%) sepia(10%) saturate(100%) hue-rotate(0deg) brightness(30%) contrast(100%)' // Back to dark gray
																}}
															/>
														</div>
													) : header.type === 'mapped' ? (
														header.subkey ? (
															header.map[
																row[header.id]
																	? row[header.id][header.subkey]
																	: ''
															]
														) : (
															header.map[row[header.id] ? row[header.id] : '']
														)
													) : header.type === 'action' ? (
														<div
															style={{
																display: 'flex',
																justifyContent: 'flex-end',
															}}
															onClick={e => e.stopPropagation()}
														>
															<IconButton
																aria-label='more'
																id={'icon-button-' + row.id}
																aria-controls={open ? 'long-menu' : undefined}
																aria-expanded={open ? 'true' : undefined}
																aria-haspopup='true'
																onClick={e => handleClick(e, row.id)}
															>
																<MoreVertIcon />
															</IconButton>
															<Menu
																id={'long-menu' + row.id}
																MenuListProps={{
																	'aria-labelledby': 'long-button',
																}}
																anchorOrigin={{
																	vertical: 'bottom',
																	horizontal: 'right',
																}}
																transformOrigin={{
																	vertical: 'top',
																	horizontal: 'right',
																}}
																anchorEl={anchorEls[row.id] || null}
																open={Boolean(anchorEls[row.id])}
																onClose={() => {
																	setAnchorEls(prev => ({
																		...prev,
																		[row.id]: null,
																	}))
																}}
															>
																{header.options?.map((option, key) => {
																	const shouldBeVisible =
																		option.visibleTo === role &&
																		(!option.shouldShow ||
																			option.shouldShow(row))

																	return (
																		<MenuItem
																			key={`${option.label}-${row.id}-${key}`}
																			onClick={() =>
																				handleClose(
																					option.visibleTo === 'Admin'
																						? row.id
																						: row.draft?.id || row.id,
																					option.action
																				)
																			}
																			sx={
																				shouldBeVisible
																					? {}
																					: { display: 'none' }
																			}
																		>
																			{option.label}
																		</MenuItem>
																	)
																})}
															</Menu>
														</div>
													) : header.isJSON ? (
														JSON.parse(row[header.id])?.highest ? (
															JSON.parse(row[header.id])?.highest
														) : (
															'未提出'
														)
													) : row[header.id] ? (
														<>
															{header.subkey
																? row[header.id]
																	? row[header.id][header.subkey]
																	: 'N/A'
																: row[header.id]
																	? row[header.id]
																	: 'N/A'}
															{header.suffix ? header.suffix : ''}
														</>
													) : (
														'N/A'
													)}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={visibleHeaders.length}
											align='center'
											sx={{
												borderBottom: 'none',
												borderBottomLeftRadius: '9px',
												borderBottomRightRadius: '9px',
												backgroundColor: '#ffffff',
											}}
										>
											{t('no_data_found') || 'No data found'}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
			)}

			{/* Pagination */}
			<PaginationControls />

			{/* Delete Confirmation Modal */}
			<Modal
				open={deleteModal.open}
				onClose={() =>
					setDeleteModal({ open: false, itemId: null, deleteAction: null })
				}
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backdropFilter: 'blur(4px)',
				}}
			>
				<Box
					sx={{
						width: '455px',
						height: '263px',
						backgroundColor: '#ffffff',
						borderRadius: '12px',
						padding: '32px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow:
							'0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
						outline: 'none',
					}}
				>
					<Typography
						variant='h6'
						sx={{
							fontSize: '18px',
							fontWeight: 600,
							color: '#1f2937',
							textAlign: 'center',
							marginBottom: '32px',
							lineHeight: 1.5,
						}}
					>
						この採用担当者を削除しますか？
					</Typography>

					<Box
						sx={{
							display: 'flex',
							gap: '16px',
							width: '100%',
							justifyContent: 'center',
						}}
					>
						<Button
							onClick={async () => {
								if (deleteModal.deleteAction && deleteModal.itemId) {
									await deleteModal.deleteAction(deleteModal.itemId)
								}
								setDeleteModal({
									open: false,
									itemId: null,
									deleteAction: null,
								})
							}}
							sx={{
								color: 'rgba(239, 68, 68, 1)',
								backgroundColor: 'transparent',
								border: 'none',
								padding: '12px 24px',
								borderRadius: '8px',
								fontSize: '14px',
								fontWeight: 600,
								textTransform: 'none',
								minWidth: '140px',
								'&:hover': {
									backgroundColor: 'transparent',
									color: 'rgba(220, 38, 38, 1)',
								},
							}}
						>
							はい、削除する
						</Button>

						<Button
							onClick={() =>
								setDeleteModal({
									open: false,
									itemId: null,
									deleteAction: null,
								})
							}
							sx={{
								color: 'rgba(86, 39, 219, 1)',
								backgroundColor: 'transparent',
								border: 'none',
								padding: '12px 24px',
								borderRadius: '8px',
								fontSize: '14px',
								fontWeight: 600,
								textTransform: 'none',
								minWidth: '140px',
								'&:hover': {
									backgroundColor: 'transparent',
									color: 'rgba(76, 29, 209, 1)',
								},
							}}
						>
							キャンセル
						</Button>
					</Box>
				</Box>
			</Modal>
		</Box>
	)
}

EnhancedTable.propTypes = {
	tableProps: PropTypes.shape({
		dataLink: PropTypes.string.isRequired,
		headers: PropTypes.arrayOf(
			PropTypes.shape({
				id: PropTypes.string.isRequired,
				subquery: PropTypes.string,
				label: PropTypes.string.isRequired,
				numeric: PropTypes.bool,
				disablePadding: PropTypes.bool,
				type: PropTypes.string,
				role: PropTypes.string,
				visibleTo: PropTypes.array,
				keyIdentifier: PropTypes.string,
			})
		).isRequired,
		filter: PropTypes.object.isRequired,
		recruiterId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		OnlyBookmarked: PropTypes.bool,
		refreshTrigger: PropTypes.number,
	}).isRequired,
	updatedBookmark: PropTypes.object,
	viewMode: PropTypes.oneOf(['table', 'grid']),
}

export default EnhancedTable
