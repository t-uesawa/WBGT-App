import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

type Props = {
	records: Array<DetailRecord>
	onRowClick: (selectedRecordId: string) => void;
	onSnackOpen: (msg: string) => void;
};

const editFontColor = (num: number): string => {
	if (num >= 15 && num <= 20) {
		return '#003285';
	} else if (num >= 21 && num <= 24) {
		return '#2A629A';
	} else if (num >= 25 && num <= 27) {
		return '#FFDA78';
	} else if (num >= 28 && num <= 30) {
		return '#FF7F3E';
	} else if (num >= 31 && num <= 44) {
		return '#FF0000';
	} else {
		return '#1A2130';
	}
}

export default function BasicTable({ records, onRowClick, onSnackOpen }: Props) {
	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 400 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell align='center'>計測時刻</TableCell>
						<TableCell align="right">WBGT&nbsp;(℃)</TableCell>
						<TableCell align="right">気温&nbsp;(℃)</TableCell>
						<TableCell align="right">湿度&nbsp;(%)</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{records.map(record => (
						<TableRow
							key={record.id}
							// オフラインかつ同期済みデータは編集不可
							onClick={() => {
								!navigator.onLine && record.syncFlag ?
									onSnackOpen('オフラインモードでは同期済みデータを編集できません') : onRowClick(record.id)
							}}
							sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }}
						>
							<TableCell align='center' component="th" scope="row">
								{record.recordTime}
							</TableCell>
							<TableCell align="right" sx={{ color: editFontColor(record.wbgtVal) }}>{record.wbgtVal}</TableCell>
							<TableCell align="right">{record.temperatureVal}</TableCell>
							<TableCell align="right">{record.humidityVal}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}