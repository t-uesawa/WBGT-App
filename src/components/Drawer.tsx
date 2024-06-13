// import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { CssBaseline, Icon, Typography, } from '@mui/material';
import Home from './Home';
import { Box, IconButton } from '@mui/material';

type Props = {
	dateStr: string | null;
	drawerOpen: boolean;
	onDrawerOpen: () => void;
};

export const Drawer = (props: Props) => {
	return (
		<>
			<SwipeableDrawer
				anchor='bottom'
				open={props.drawerOpen}
				onClose={props.onDrawerOpen}
				onOpen={props.onDrawerOpen}
			>
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
					<IconButton aria-label="close" onClick={props.onDrawerOpen}>
						<Icon>highlight_off</Icon>
					</IconButton>
					<Typography variant='h6'>新規登録</Typography>
					<IconButton aria-label="close">
						<Icon>save</Icon>
					</IconButton>
				</Box>
				<Box sx={{ p: 1 }}>
					<Home date={props.dateStr} />
				</Box>
			</SwipeableDrawer>
		</>
	);
}