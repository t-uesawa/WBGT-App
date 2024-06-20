import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Box, CssBaseline, Grid, Icon, Paper, SwipeableDrawer, Tooltip, Typography, useMediaQuery, useTheme, } from '@mui/material';
import Calendar from './components/Calendar';
import Detail from './components/Detail';
import Edit from './components/Edit';
import { koujiGetFirebase, wbgtGetFirebase } from './components/firebase';

const App: React.FC = () => {
	// ネットワーク状態
	const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
	// (mobile)ドロワー状態管理
	const [drawerOpen, setDrawerOpen] = useState(false);
	// ページ状態管理(detail, edit)
	const [currentComponent, setCurrentComponent] = useState<string>('detail');
	// 工事情報
	const [koujiList, setKoujiList] = useState<Array<{ label: string, id: string }>>([]);
	// fullCalendar 選択した日付
	const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
	// fullCalendar イベントリスト
	const [eventList, setEventList] = useState<Array<CalendarEvent>>([]);
	// Firestore データリスト
	const [dataList, setDataList] = useState<Array<Firebase>>([]);
	// detail data 詳細画面アイテムリスト
	const [detailList, setDetailList] = useState<Array<DetailData>>([]);
	// データの読み込み状態
	const [isLoading, setIsLoading] = useState<boolean>(true);
	// (Table)クリックされたレコードのIDを管理
	const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

	// SET 工事情報
	const handleKoujiList = (items: Array<{ label: string, id: string }>) => {
		setKoujiList(items);
	}
	// SET カレンダーイベントリスト
	const handleEventList = (events: Array<CalendarEvent>) => {
		setEventList(events);
	}
	// SET Firebase元データリスト
	const handleDataList = (items: Array<Firebase>) => {
		setDataList(items);
	};
	// SET 詳細画面データリスト
	const handleDetailDataList = (data: Firebase[], date: string) => {
		// 初回データ取得後、選択された日付でdetailListを更新する関数
		const map = new Map<string, DetailData>();
		data.forEach(item => {
			const key = `${item.kouji['id']}-${item.recordDate}`;

			if (date === item.recordDate) {
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
	}
	// ドロワー切り替え
	const toggleDrawer = () => {
		setDrawerOpen(open => !open);
	};
	// ページ切り替え
	const handlePageTransition = (page: string) => {
		setCurrentComponent(page);
	};
	// データ読み込み状態
	const handleIsLoading = (result: boolean) => {
		setIsLoading(result);
	}
	// レコードID更新
	const handleSelectedRecordId = (id: string | null) => {
		setSelectedRecordId(id);
	}

	// カレンダークリック
	const handleCalendarClick = (date: string) => {
		setCurrentComponent('detail');	// 詳細画面強制
		setSelectedDate(date);	// 選択した日付をセット
		handleDetailDataList(dataList, date);	 // 選択された日付でデータをフィルタリング
		!isMdUp && toggleDrawer();	// (mobile)ドロワーオープン
	}

	// Tableコンポーネントで行クリック時の処理
	const handleRowClick = (id: string) => {
		setSelectedRecordId(id); // クリックされた行のIDをセット
		handlePageTransition('edit'); // Editページに遷移
	};

	const ref = React.useRef<HTMLDivElement>(null);
	// 画面サイズ判別
	const theme = useTheme();
	const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

	// コンポーネントマウント時にFirebaseからデータ取得
	useEffect(() => {
		// 工事情報取得
		koujiGetFirebase(
			handleKoujiList,
			handleIsLoading,
		);
		// カレンダーイベント取得
		wbgtGetFirebase(
			handleDataList,
			handleEventList,
			handleIsLoading,
		);

		const updateOnlineStatus = () => {
			setIsOnline(navigator.onLine);
		};

		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);

		// クリーンアップ関数を返してイベントリスナーを削除
		return () => {
			window.removeEventListener('online', updateOnlineStatus);
			window.removeEventListener('offline', updateOnlineStatus);
		};
	}, []);

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
								{!isLoading && currentComponent === 'detail' &&
									<Detail
										isMdUp={isMdUp}
										filterDataList={detailList}
										selectedDate={selectedDate}
										onDrawerOpen={toggleDrawer}
										onPageTransition={handlePageTransition}
										onRowClick={handleRowClick}
									/>
								}
								{!isLoading && currentComponent === 'edit' &&
									<Edit
										koujiList={koujiList}
										dataList={dataList}
										filterDataList={detailList}
										drawerOpen={drawerOpen}
										dateStr={selectedDate}
										selectedRecordId={selectedRecordId}
										onDataList={handleDataList}
										onEventList={handleEventList}
										onDrawerOpen={toggleDrawer}
										onPageTransition={handlePageTransition}
										onIsLoading={handleIsLoading}
										onSelectedRecordId={handleSelectedRecordId}
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
							{!isLoading && currentComponent === 'detail' &&
								<Detail
									isMdUp={isMdUp}
									filterDataList={detailList}
									selectedDate={selectedDate}
									onDrawerOpen={toggleDrawer}
									onPageTransition={handlePageTransition}
									onRowClick={handleRowClick}
								/>
							}
							{!isLoading && currentComponent === 'edit' &&
								<Edit
									koujiList={koujiList}
									dataList={dataList}
									filterDataList={detailList}
									drawerOpen={drawerOpen}
									dateStr={selectedDate}
									selectedRecordId={selectedRecordId}
									onDataList={handleDataList}
									onEventList={handleEventList}
									onDrawerOpen={toggleDrawer}
									onPageTransition={handlePageTransition}
									onIsLoading={handleIsLoading}
									onSelectedRecordId={handleSelectedRecordId}
								/>
							}
						</SwipeableDrawer>
					)}
				</Grid>
			</ Box >
		</>
	)
}

export default App;