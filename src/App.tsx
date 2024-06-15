import { CssBaseline, } from "@mui/material";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid'
import allLocales from '@fullcalendar/core/locales-all.js';
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import React, { useCallback, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { collection, getDocs } from "firebase/firestore";
import Home from "./components/Home";
import { db } from "./firebaseConfig";
// import Draw from "./components/Drawer";

const App: React.FC = () => {

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [dateStr, setDateStr] = useState<string | null>(null);
	// Firestoreから取得したデータリストを保持するためのstate
	const [dataList, setDataList] = useState<Array<{ id: string; kouji_name: string; wbgt: number; }>>([]);
	// イベントカレンダー
	const [eventList, setEventList] = useState<Array<{ title: string; date: string; }>>([]);

	const ref = React.useRef<HTMLDivElement>(null);

	const handleDrawerOpen = () => {
		setDrawerOpen(drawerOpen => !drawerOpen);
	}

	const handleDateClick = useCallback((arg: DateClickArg) => {
		setDateStr(arg.dateStr); // 選択された日付をステートに設定
		handleDrawerOpen();
	}, []);

	const handleDataList = (items: Array<{ id: string; kouji_name: string; wbgt: number; }>) => {
		setDataList(items);
	};

	// Firebase取得関数
	const fetchData = async () => {
		try {
			// コレクションからドキュメント取得
			const querySnapshot = await getDocs(collection(db, 'data'));
			// 汎用的なデータ
			const items: Array<{ id: string; kouji_name: string; wbgt: number; }> = [];	// 初期化
			querySnapshot.forEach(doc => {
				items.push({ id: doc.id, kouji_name: doc.data().kouji_name, wbgt: doc.data().wbgt });
			});
			setDataList(items);	// データリスト更新
			// イベントカレンダー
			const eventItems: Array<{ title: string; date: string; }> = [];	// 初期化
			querySnapshot.forEach(doc => {
				eventItems.push({ title: doc.data().kouji_name, date: doc.data().date });
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
		<Box ref={ref}>
			<CssBaseline />
			<Box sx={{ p: 1 }}>
				<h1>Demo Demo App</h1>
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
					dateClick={handleDateClick}
					eventClick={(e) => console.log(e)}
				/>
			</Box>
			<Home dataList={dataList} drawerOpen={drawerOpen} dateStr={dateStr} onDataList={handleDataList} onDrawerOpen={handleDrawerOpen} fetchDate={fetchData} />
		</ Box>
	)
}

export default App;