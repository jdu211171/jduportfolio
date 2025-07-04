import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from '../../utils/axiosUtils'
import style from './Table.module.css'
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
	TableSortLabel,
	Chip,
	LinearProgress,
	Menu,
	MenuItem,
	IconButton,
} from '@mui/material'

import MoreVertIcon from '@mui/icons-material/MoreVert'

import { stableSort, getComparator } from './TableUtils'
import { useLanguage } from '../../contexts/LanguageContext'
import translations from '../../locales/translations'

// Create an atom to store rows per page preference
const rowsPerPageAtom = atom(25)

const EnhancedTable = ({ tableProps, updatedBookmark }) => {
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

	const open = Boolean(anchorEls)
	const handleClick = (event, rowId) => {
		setAnchorEls(prev => ({
			...prev,
			[rowId]: event.currentTarget,	
		}))
	}
	const handleClose = async (id, action) => {
		let res = false
		res = await action(id)
		if (res == undefined) {
			setRefresher(refresher + 1)
		}
		setAnchorEls(prev => ({
			...prev,
			[id]: null,
		}))
	}

	const getUniqueKey = header => {
		return header.keyIdentifier || `${header.id}${header.subkey || ''}`
	}

	const fetchUserData = async () => {
		setLoading(true)
		try {
			const response = await axios.get(tableProps.dataLink, {
				params: {
					filter: tableProps.filter,
					recruiterId: tableProps.recruiterId,
					onlyBookmarked: tableProps.OnlyBookmarked,
				},
			})
			setRows(response.data)
		} catch (error) {
			console.error('Error fetching students:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchUserData()
	}, [tableProps.dataLink, tableProps.filter, refresher])

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
	const handleRequestSort = property => {
		const isAsc = orderBy === property && order === 'asc'
		setOrder(isAsc ? 'desc' : 'asc')
		setOrderBy(property)
	}

	const handleSelectAllClick = event => {
		if (event.target.checked) {
			const newSelected = rows.map(n => n.id)
			setSelected(newSelected)
		} else {
			setSelected([])
		}
	}

	const handleChangePage = (event, newPage) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = event => {
		setRowsPerPage(parseInt(event.target.value, 10))
		setPage(0)
	}

	const isSelected = id => selected.indexOf(id) !== -1

	const visibleRows = stableSort(rows, getComparator(order, orderBy)).slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	)

	// Reusable pagination component
	const PaginationControls = () => (
		<TablePagination
			rowsPerPageOptions={[25, 50, 100]}
			component='div'
			count={rows.length}
			rowsPerPage={rowsPerPage}
			page={page}
			onPageChange={handleChangePage}
			onRowsPerPageChange={handleChangeRowsPerPage}
			labelRowsPerPage={t('rows_per_page')}
		/>
	)

	return (
		<Box sx={{ width: '100%', border: '1px solid #eee', borderRadius: '10px' }}>
			{/* Top pagination controls */}
			<Box sx={{ borderBottom: '1px solid #eee' }}>
				<PaginationControls />
			</Box>

			<TableContainer
				sx={{
					minHeight: visibleRows.length > 0 ? 'auto' : '200px',
					maxHeight: 'calc(100vh - 280px)',
					overflowY: 'auto'
				}}
			>
				<Table sx={{ minWidth: 750 }} size='medium' stickyHeader>
					<TableHead>
						<TableRow>
							{tableProps.headers.map(
								header =>
									(header.role == undefined || header.role == role) &&
									(header.visibleTo
										? header.visibleTo.includes(role)
										: true) && (
										<TableCell
											sx={{ borderBottom: '1px solid #aaa' }}
											key={`data${getUniqueKey(header)}_${rows.id}`}
											align={header.numeric ? 'right' : 'left'}
											padding={'normal'}
											sortDirection={orderBy === header.id ? order : false}
										>
											{/* <TableSortLabel
                        active={orderBy === header.id}
                        direction={orderBy === header.id ? order : "asc"}
                        onClick={() => handleRequestSort(header.id)}
                      > */}
											{header.label}
											{/* </TableSortLabel> */}
										</TableCell>
									)
							)}
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={tableProps.headers.length} align='center'>
									<LinearProgress />
								</TableCell>
							</TableRow>
						) : visibleRows.length > 0 ? (
							visibleRows.map(row => (
								<TableRow
									hover
									role='checkbox'
									aria-checked={isSelected(row.id)}
									tabIndex={-1}
									key={row.id}
									selected={isSelected(row.id)}
									sx={{ cursor: 'pointer' }}
								>
									{tableProps.headers.map(
										header =>
											(header.role == undefined || header.role == role) &&
											(header.visibleTo
												? header.visibleTo.includes(role)
												: true) && (
												<TableCell
													key={'data' + header.id + (header.subkey ?? '')}
													align={header.numeric ? 'right' : 'left'}
													padding={header.disablePadding ? 'none' : 'normal'}
													onClick={() =>
														header.onClickAction
															? header.onClickAction(row)
															: null
													}
													className={
														header.onClickAction
															? style.hoverEffect
															: style.default
													}
													style={{
														minWidth: header.minWidth,
														padding:
															header.type === 'avatar' ? '4px' : undefined,
														...(header.type === 'action'
															? {
																position: 'sticky',
																right: 0,
																background: '#fff',
																zIndex: 10,
																width: '20px',
															}
															: {}),
													}}
													
												>
													{header.renderCell ? (
														header.renderCell(row)
													) : header.type === 'bookmark' ? (
														<>
															{row.isBookmarked ? (
																<svg
																	width='19'
																	height='18'
																	viewBox='0 0 19 18'
																	fill='none'
																	xmlns='http://www.w3.org/2000/svg'
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
																>
																	<path
																		d='M9.00035 13.7913L3.85702 16.4955L4.83952 10.768L0.672852 6.71214L6.42285 5.8788L8.99452 0.667969L11.5662 5.8788L17.3162 6.71214L13.1495 10.768L14.132 16.4955L9.00035 13.7913Z'
																		stroke='#F7C02F'
																		strokeLinecap='round'
																		strokeLinejoin='round'
																	/>
																</svg>
															)}
														</>
													) : header.type === 'avatar' ? (
														<UserAvatar
															photo={row.photo}
															name={row.first_name + ' ' + row.last_name}
															studentId={row.student_id}
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
																borderLeft:
																	'1px solid rgba(224, 224, 224, 1)',
																display: 'flex',
																justifyContent: 'flex-end',
															}}
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
																is
																clicked
																onClose={() => {
																	setAnchorEls(prev => ({
																		...prev,
																		[row.id]: null,
																	}))
																}}
															>
																{header.options.map((option, key) => {
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
																						: row.draft.id,
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
											)
									)}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={tableProps.headers.length} align="center">
									{t('no_data_found') || 'No data found'}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Bottom pagination controls */}
			<Box sx={{ borderTop: '1px solid #eee' }}>
				<PaginationControls />
			</Box>
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
	}).isRequired,
}

export default EnhancedTable