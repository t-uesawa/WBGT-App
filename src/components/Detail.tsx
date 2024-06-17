import { Box, Typography } from "@mui/material";

type Props = {
	filterDataList: Array<Firebase>;
}

export const Detail = ({ filterDataList }: Props) => {
	console.log(filterDataList);
	return (
		<>
			<Box>
				{filterDataList.map(data => (
					<Typography variant="body2">{data['kouji_name']}</Typography>
				))}
			</Box>
		</>
	)
}

export default Detail;