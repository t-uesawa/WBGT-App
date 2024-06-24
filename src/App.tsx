import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Box, CssBaseline, Grid, Icon, Paper, Snackbar, SwipeableDrawer, Tooltip, Typography, useMediaQuery, useTheme, } from '@mui/material';
import packageJson from '../package.json';
import Calendar from './components/Calendar';
import Detail from './components/Detail';
import Edit from './components/Edit';
import { fetchData } from './helpers/eventCalendarHelp';
import { fetchKoujiData } from './helpers/koujiHelp';

// オンライン状態を更新する処理
const useOnlineStatus = (): boolean => {
	const [isOnline, setIsOnline] = useState(navigator.onLine);

	useEffect(() => {
		const updateOnlineStatus = () => {
			setIsOnline(navigator.onLine);
		};

		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);

		return () => {
			window.removeEventListener('online', updateOnlineStatus);
			window.removeEventListener('offline', updateOnlineStatus);
		};
	}, []);

	return isOnline;
};

const App: React.FC = () => {
	// ネットワーク状態
	const isOnline = useOnlineStatus();
	// (mobile)ドロワー状態管理
	const [drawerOpen, setDrawerOpen] = useState(false);
	// ページ状態管理(detail, edit)
	const [currentComponent, setCurrentComponent] = useState<string>('detail');
	// fullCalendar 選択した日付
	const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
	// 工事リスト
	const [koujiList, setKoujiList] = useState<Array<{ label: string, id: string }>>([]);
	// fullCalendar イベントリスト
	const [eventList, setEventList] = useState<Array<CalendarEvent>>([]);
	// Firestore データリスト
	const [dataList, setDataList] = useState<Array<Firebase>>([]);
	// detail data 詳細画面アイテムリスト
	const [detailList, setDetailList] = useState<Array<DetailData>>([]);
	// (Table)クリックされたレコードのIDを管理
	const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
	// エラーメッセージ開閉状態
	const [snackOpne, setSnackOpen] = useState<boolean>(false);
	// エラーメッセージ
	const [snackMessage, setSnackMessage] = useState<string>('');

	// SET Firebase元データリスト
	const handleDataList = (items: Array<Firebase>) => {
		setDataList(items);
	};

	// ドロワー切り替え
	const toggleDrawer = () => {
		setDrawerOpen(open => !open);
	};
	// ページ切り替え
	const handlePageTransition = (page: string) => {
		setCurrentComponent(page);
	};
	// レコードID更新
	const handleSelectedRecordId = (id: string | null) => {
		setSelectedRecordId(id);
	}

	// カレンダークリック
	const handleCalendarClick = (date: string) => {
		setCurrentComponent('detail');	// 詳細画面強制
		setSelectedDate(date);	// 選択した日付をセット
		!isMdUp && toggleDrawer();	// (mobile)ドロワーオープン
	}

	// Tableコンポーネントで行クリック時の処理
	const handleRowClick = (id: string) => {
		setSelectedRecordId(id); // クリックされた行のIDをセット
		handlePageTransition('edit'); // Editページに遷移
	};

	// Snack
	const handleSnackOpen = (msg: string) => {
		setSnackMessage(msg);
		setSnackOpen(true);
	}
	const handleSnackClose = (reason?: string) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackMessage('');
		setSnackOpen(false);
	}

	const ref = React.useRef<HTMLDivElement>(null);
	// 画面サイズ判別
	const theme = useTheme();
	const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

	// オンライン状態が変化したとき、データを再取得する
	useEffect(() => {
		const loadData = async () => {
			const fetchedData = await fetchData();
			setDataList(fetchedData);
			const fetchedKoujiData = await fetchKoujiData();
			setKoujiList(fetchedKoujiData);
		};
		loadData();
	}, [isOnline]);

	// 取得データが変化したとき、FullCalendarイベントを再形成する
	useEffect(() => {
		const transformedEvents: CalendarEvent[] = [];
		const uniqueItems: Set<string> = new Set();	// 工事名と日付でフィルタリング
		dataList.forEach(data => {
			// 重複確認のユニークキーを発行
			const uniqueKey = `${data.kouji.id}-${data.recordDate}`;
			// 重複確認
			if (!uniqueItems.has(uniqueKey)) {
				// 重複なしの場合
				uniqueItems.add(uniqueKey);
				// イベント背景色: 異常値(30以上)であれば赤くする
				transformedEvents.push({
					title: data.kouji.label,
					date: data.recordDate,
					backgroundColor: data.wbgtVal >= 30 ? 'red' : 'blue',
					borderColor: data.wbgtVal >= 30 ? 'red' : 'blue',
				});
			} else {
				// 重複している場合は既に登録されている背景色を確認する
				const existingEvent = transformedEvents.find(
					event => event.title === data.kouji.label && event.date === data.recordDate
				);
				// 重複して排除されそうになっているデータのWBGT値が30を超えていて背景色がblueならredに変える
				if (data.wbgtVal >= 30 && existingEvent && existingEvent.backgroundColor === 'blue') {
					existingEvent.backgroundColor = 'red';
				}
			}
		});
		setEventList(transformedEvents);
	}, [dataList]);

	// 取得データが変化したときと、日付が選択されたときDetailを再形成する
	useEffect(() => {
		// 初回データ取得後、選択された日付でdetailListを更新する関数
		const map = new Map<string, DetailData>();
		dataList.forEach(item => {
			const key = `${item.kouji['id']}-${item.recordDate}`;

			if (selectedDate === item.recordDate) {
				if (!map.has(key)) {
					map.set(key, {
						key,
						kouji: { label: item.kouji.label, id: item.kouji.id },
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
		setDetailList(Array.from(map.values()));
	}, [dataList, selectedDate]);

	return (
		<>
			<Box ref={ref}>
				<CssBaseline />
				<Box p={3} sx={{ display: 'flex', justifyContent: 'space-between' }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
						<Icon fontSize='large' sx={{ color: '#FF0000' }}>thermostat</Icon>
						<Typography variant='h4' fontWeight='bold'>WBGT</Typography>
					</Box>
					<Tooltip title={isOnline ? 'オンラインで接続中' : 'オフライン'}>
						<Icon fontSize='large' sx={{ color: isOnline ? 'blue' : 'red' }}>{isOnline ? 'wifi' : 'wifi_off'}</Icon>
					</Tooltip>
				</Box>
				<Grid container spacing={2}>
					<Grid item xs={12} md={8}>
						<Paper elevation={6}>
							<Calendar eventList={eventList} onCalendarClick={handleCalendarClick} />
						</Paper>
					</Grid>
					{isMdUp ? (
						<Grid item xs={4}>
							<Paper elevation={6}>
								{currentComponent === 'detail' &&
									<Detail
										isMdUp={isMdUp}
										filterDataList={detailList}
										selectedDate={selectedDate}
										onDrawerOpen={toggleDrawer}
										onPageTransition={handlePageTransition}
										onRowClick={handleRowClick}
									/>
								}
								{currentComponent === 'edit' &&
									<Edit
										koujiList={koujiList}
										dataList={dataList}
										filterDataList={detailList}
										drawerOpen={drawerOpen}
										dateStr={selectedDate}
										selectedRecordId={selectedRecordId}
										onDataList={handleDataList}
										onDrawerOpen={toggleDrawer}
										onPageTransition={handlePageTransition}
										onSelectedRecordId={handleSelectedRecordId}
										onSnackOpen={handleSnackOpen}
									/>
								}
							</Paper>
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
									isMdUp={isMdUp}
									filterDataList={detailList}
									selectedDate={selectedDate}
									onDrawerOpen={toggleDrawer}
									onPageTransition={handlePageTransition}
									onRowClick={handleRowClick}
								/>
							}
							{currentComponent === 'edit' &&
								<Edit
									koujiList={koujiList}
									dataList={dataList}
									filterDataList={detailList}
									drawerOpen={drawerOpen}
									dateStr={selectedDate}
									selectedRecordId={selectedRecordId}
									onDataList={handleDataList}
									onDrawerOpen={toggleDrawer}
									onPageTransition={handlePageTransition}
									onSelectedRecordId={handleSelectedRecordId}
									onSnackOpen={handleSnackOpen}
								/>
							}
						</SwipeableDrawer>
					)}
				</Grid>
				<Typography variant='body2'>Version: {packageJson.version}</Typography>
			</ Box >
			<Snackbar
				open={snackOpne}
				autoHideDuration={6000}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				onClose={(_, val) => handleSnackClose(val)}
				message={
					<Typography>
						{snackMessage}
					</Typography>
				}
			/>
		</>
	)
}

export default App;