// import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { Icon } from '@mui/material';
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
				<Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
					<IconButton aria-label="close" size="small" onClick={props.onDrawerOpen}>
						<Icon>highlight_off</Icon>
					</IconButton>
					<IconButton aria-label="close" size="small">
						<Icon>save</Icon>
					</IconButton>
				</Box>
				<Home date={props.dateStr}></Home>
			</SwipeableDrawer>
		</>
	);
}