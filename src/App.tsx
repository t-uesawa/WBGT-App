import { CssBaseline, } from "@mui/material";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'
import allLocales from '@fullcalendar/core/locales-all.js';
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { Drawer } from "./components/Drawer";
// import Draw from "./components/Drawer";

const App: React.FC = () => {

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [dateStr, setDateStr] = useState<string | null>(null);
	const ref = React.useRef<HTMLDivElement>(null);

	const handleDrawerOpen = () => {
		setDrawerOpen(drawerOpen => !drawerOpen);
	}

	const handleDateClick = useCallback((arg: DateClickArg) => {
		setDateStr(arg.dateStr); // 選択された日付をステートに設定
		handleDrawerOpen();
	}, []);

	const events = [
		{ title: 'A工事', date: '2024-06-12' },
		{ title: 'B工事', date: '2024-06-13' },
		{ title: 'A工事', date: '2024-06-1' },
	];

	return (
		<Box ref={ref}>
			<CssBaseline />
			<Box sx={{ p: 1 }}>
				<h1>Demo App</h1>
				<FullCalendar
					// カレンダー
					plugins={[dayGridPlugin, interactionPlugin]}
					initialView='dayGridMonth'
					headerToolbar={{
						start: 'prev', center: 'title', end: 'today next'
					}}
					height={'auto'}
					businessHours={true}
					// 日本語
					locales={allLocales}
					locale="ja"
					events={events}
					dayCellContent={(e) => e.dayNumberText = e.dayNumberText.replace('日', '')}
					dateClick={handleDateClick}
					eventClick={(e) => console.log(e)}
				/>
			</Box>
			<Drawer drawerOpen={drawerOpen} dateStr={dateStr} onDrawerOpen={handleDrawerOpen}></Drawer>
		</ Box>
	)
}

export default App;