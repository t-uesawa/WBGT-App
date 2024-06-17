import React, { useCallback, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'
import allLocales from '@fullcalendar/core/locales-all.js';
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { Box, CssBaseline, Grid, SwipeableDrawer, Typography, useMediaQuery, useTheme, } from "@mui/material";
import dayjs from 'dayjs';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import Home from "./components/Home";
import Detail from "./components/Detail";

const App: React.FC = () => {
	// (mobile)ドロワー状態管理
	const [drawerOpen, setDrawerOpen] = useState(false);
	// 日付
	const [dateStr, setDateStr] = useState<string | null>(null);
	// Firestore data
	const [dataList, setDataList] = useState<Array<Firebase>>([]);
	// fullCalendar
	const [eventList, setEventList] = useState<Array<CalendarEvent>>([]);
	// detail data
	const [detailList, setDetailList] = useState<Array<Firebase>>([]);

	const ref = React.useRef<HTMLDivElement>(null);

	// 画面サイズ判別
	const theme = useTheme();
	const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

	// ドロワー開閉
	const handleDrawerOpen = () => {
		setDrawerOpen(drawerOpen => !drawerOpen);
	}

	// カレンダークリック
	const handleCalendarClick = (date: string) => {
		handleDateClick;	// 選択した日付をセット
		// 選択された日付でデータをフィルタリング
		const detailItems = dataList.filter(data => data['recordDate'] === date);
		setDetailList(detailItems);
		!isMdUp && handleDrawerOpen();	// (mobile)ドロワーオープン
	}

	// SET 日付
	const handleDateClick = useCallback((arg: DateClickArg) => {
		setDateStr(arg.dateStr); // 選択された日付をステートに設定
	}, []);

	// SET Firebase元データ
	const handleDataList = (items: Array<Firebase>) => {
		setDataList(items);
	};

	// Firebase取得関数
	const fetchData = async () => {
		try {
			// コレクションからドキュメント取得
			const querySnapshot = await getDocs(collection(db, 'calendarEvents'));
			console.log(querySnapshot);
			// 汎用的なデータ
			const items: Array<Firebase> = [];	// 初期化
			querySnapshot.forEach(doc => {
				items.push({
					id: doc.id,
					recordDate: doc.data().recordDate,
					recordTime: doc.data().recordTime,
					kouji_name: doc.data().kouji_name,
					temperatureVal: doc.data().temperatureVal,
					humidityVal: doc.data().humidityVal,
					wbgtVal: doc.data().wbgtValm,
					creationTime: doc.data().creationTime,
				});
			});
			setDataList(items);	// データリスト更新
			// イベントカレンダー
			const eventItems: Array<CalendarEvent> = [];	// 初期化
			const uniqueItems: Set<string> = new Set();
			querySnapshot.forEach(doc => {
				const uniqueKey = `${doc.data().kouji_name}-${doc.data().recordDate}`;
				if (!uniqueItems.has(uniqueKey)) {
					uniqueItems.add(uniqueKey);
					eventItems.push({ title: doc.data().kouji_name, date: doc.data().recordDate });
				}
			});
			setEventList(eventItems);	// データリスト更新
		} catch (err) {
			console.error("Error fetching data: ", err);
		}
	};

	// コンポーネントマウント時にFirebaseからデータ取得
	useEffect(() => {
		fetchData();	// データ取得関数を実行
	}, []);	// 初回マウント時のみ実行

	return (
		<>
			<Box ref={ref}>
				<CssBaseline />
				<Grid container>
					<Grid item xs={12} md={8}>
						<Box sx={{ p: 1 }}>
							<Typography variant='h4' fontWeight='bold'>暑さ指数計測記録表</Typography>
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
								events={eventList}
								dayCellContent={(e) => e.dayNumberText = e.dayNumberText.replace('日', '')}
								dateClick={(e) => handleCalendarClick(e.dateStr)}
								eventClick={(e) => handleCalendarClick(dayjs(e.event.start).format('YYYY-MM-DD'))}
							/>
						</Box>
					</Grid>
					{isMdUp ? (
						<Grid item xs={4}>
							<Home
								dataList={dataList}
								filterDataList={detailList}
								drawerOpen={drawerOpen}
								dateStr={dateStr}
								onDataList={handleDataList}
								onDrawerOpen={handleDrawerOpen}
								fetchDate={fetchData}
							/>
						</Grid>
					) : (
						<SwipeableDrawer
							anchor='bottom'
							open={drawerOpen}
							onClose={handleDrawerOpen}
							onOpen={handleDrawerOpen}
						>
							<Detail
								filterDataList={detailList}
							></Detail>
							{/* <Home
								dataList={dataList}
								filterDataList={detailList}
								drawerOpen={drawerOpen}
								dateStr={dateStr}
								onDataList={handleDataList}
								onDrawerOpen={handleDrawerOpen}
								fetchDate={fetchData}
							/> */}
						</SwipeableDrawer>
					)}
				</Grid>
			</ Box>
		</>
	)
}

export default App;