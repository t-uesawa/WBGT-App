import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, CssBaseline, Icon, IconButton, Tooltip, Typography } from "@mui/material";
import BasicTable from "./Table";

type Props = {
	filterDataList: Array<DetailData>;
	selectedDate: string;
	onDrawerOpen: () => void;
	onPageTransition: (page: string) => void;
}

export const Detail = ({ filterDataList, selectedDate, onDrawerOpen, onPageTransition }: Props) => {
	console.log(filterDataList);
	return (
		<>
			<Box sx={{
				display: 'flex',
				justifyContent: 'space-between',
				position: 'sticky',
				top: 0,
				zIndex: 1000,
				p: 1,
				bgcolor: 'background.paper',
			}}>
				<CssBaseline />
				<Tooltip title='閉じる'>
					<IconButton aria-label='close' onClick={() => onDrawerOpen()}>
						<Icon>highlight_off</Icon>
					</IconButton>
				</Tooltip>
				<Typography variant='h6'>{selectedDate}</Typography>
				<Tooltip title='新規作成'>
					<IconButton aria-label='add' onClick={() => onPageTransition('edit')}>
						<Icon>add_circle_outline</Icon>
					</IconButton>
				</Tooltip>
			</Box>
			<Box sx={{ p: 4 }}>
				{filterDataList.length === 0 && <Typography variant="body2">データがありません</Typography>}
				{filterDataList.length !== 0 &&
					filterDataList.map(data => (
						<div>
							<Accordion>
								<AccordionSummary
									expandIcon={<Icon>expand_more</Icon>}
									aria-controls="panel1-content"
									id="panel1-header"
								>
									<Badge badgeContent={data['records'].length} color="success">
										<Icon>storage</Icon>
									</Badge>
									<Typography sx={{ width: '33%', flexShrink: 0 }}>{data['kouji_name']}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<BasicTable records={data['records']}></BasicTable>
								</AccordionDetails>
							</Accordion>
						</div>
					))}
			</Box>
		</>
	)
}

export default Detail;