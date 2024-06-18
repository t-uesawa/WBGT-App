import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

type Props = {
	records: Array<DetailRecord>
};

export default function BasicTable({ records }: Props) {
	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 450 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>計測時刻</TableCell>
						<TableCell align="right">気温&nbsp;(℃)</TableCell>
						<TableCell align="right">湿度&nbsp;(%)</TableCell>
						<TableCell align="right">WBGT&nbsp;(℃)</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{records.map(record => (
						<TableRow
							key={record.id}
							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
						>
							<TableCell component="th" scope="row">
								{record.recordTime}
							</TableCell>
							<TableCell align="right">{record.temperatureVal}</TableCell>
							<TableCell align="right">{record.humidityVal}</TableCell>
							<TableCell align="right">{record.wbgtVal}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}