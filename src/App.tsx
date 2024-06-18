import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'
import allLocales from '@fullcalendar/core/locales-all.js';
import interactionPlugin from "@fullcalendar/interaction";
import { Box, CssBaseline, Grid, SwipeableDrawer, Typography, useMediaQuery, useTheme, } from "@mui/material";
import dayjs from 'dayjs';
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import Detail from "./components/Detail";
import Edit from './components/Edit';

const App: React.FC = () => {
	// (mobile)ドロワー状態管理
	const [drawerOpen, setDrawerOpen] = useState(false);
	// ページ状態管理
	const [currentComponent, setCurrentComponent] = useState<string>('detail');
	// 日付
	const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
	// Firestore data
	const [dataList, setDataList] = useState<Array<Firebase>>([]);
	// fullCalendar
	const [eventList, setEventList] = useState<Array<CalendarEvent>>([]);
	// detail data
	const [detailList, setDetailList] = useState<Array<DetailData>>([]);

	const ref = React.useRef<HTMLDivElement>(null);

	// 画面サイズ判別
	const theme = useTheme();
	const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

	// ドロワー切り替え
	const toggleDrawer = () => {
		setDrawerOpen(open => !open);
	}

	// ページ切り替え
	const handlePageTransition = (page: string) => {
		setCurrentComponent(page);
	};

	// カレンダークリック
	const handleCalendarClick = (date: string) => {
		setSelectedDate(date);	// 選択した日付をセット
		// 選択された日付でデータをフィルタリング
		const transformData = (data: Firebase[]): DetailData[] => {
			const map = new Map<string, DetailData>();

			data.forEach(item => {
				const key = `${item.kouji_name}-${item.recordDate}`;

				if (date === item.recordDate) {
					if (!map.has(key)) {
						map.set(key, {
							key,
							kouji_name: item.kouji_name,
							recordDate: item.recordDate,
							records: []
						});
					}
					map.get(key)!.records.push({
						id: item.id,
						recordTime: item.recordTime,
						temperatureVal: item.temperatureVal,
						humidityVal: item.humidityVal,
						wbgtVal: item.wbgtVal,
						creationTime: item.creationTime
					});
				}
			});
			return Array.from(map.values());
		}
		setDetailList(transformData(dataList));
		!isMdUp && toggleDrawer();	// (mobile)ドロワーオープン
	}

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
					wbgtVal: doc.data().wbgtVal,
					creationTime: doc.data().creationTime,
				});
			});
			handleDataList(items);	// データリスト更新
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
							{currentComponent === 'detail' &&
								<Detail
									filterDataList={detailList}
									selectedDate={selectedDate}
									onDrawerOpen={toggleDrawer}
									onPageTransition={handlePageTransition}
								/>
							}
							{currentComponent === 'edit' &&
								<Edit
									dataList={dataList}
									filterDataList={detailList}
									drawerOpen={drawerOpen}
									dateStr={selectedDate}
									onDataList={handleDataList}
									onDrawerOpen={toggleDrawer}
									onPageTransition={handlePageTransition}
									fetchDate={fetchData}
								/>
							}
						</Grid>
					) : (
						<SwipeableDrawer
							anchor='bottom'
							open={drawerOpen}
							onClose={toggleDrawer}
							onOpen={toggleDrawer}
						>
							{currentComponent === 'detail' &&
								<Detail
									filterDataList={detailList}
									selectedDate={selectedDate}
									onDrawerOpen={toggleDrawer}
									onPageTransition={handlePageTransition}
								/>
							}
							{currentComponent === 'edit' &&
								<Edit
									dataList={dataList}
									filterDataList={detailList}
									drawerOpen={drawerOpen}
									dateStr={selectedDate}
									onDataList={handleDataList}
									onDrawerOpen={toggleDrawer}
									onPageTransition={handlePageTransition}
									fetchDate={fetchData}
								/>
							}
						</SwipeableDrawer>
					)}
				</Grid>
			</ Box>
		</>
	)
}

export default App;