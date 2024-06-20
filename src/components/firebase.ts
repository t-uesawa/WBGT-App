import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ja';

// 工事取得関数
export const koujiGetFirebase = async (
	onKoujiList: (items: Array<{ label: string, id: string }>) => void,
	onIsLoading: (result: boolean) => void,
) => {
	try {
		// コレクションからドキュメント取得
		const querySnapshot = await getDocs(collection(db, 'kouji'));
		const koujiList: Array<{ label: string, id: string }> = [];
		// 汎用的なデータ
		querySnapshot.forEach(doc => {
			koujiList.push({
				id: doc.id,
				label: doc.data().label,
			});
		});
		onKoujiList(koujiList);
		onIsLoading(false); // データ取得完了
	} catch (err) {
		console.error('Error fetching data: ', err);
		onIsLoading(false); // データ取得エラー
	}
}

// カレンダーイベント取得関数
export const wbgtGetFirebase = async (
	onDataList: (items: Array<Firebase>) => void,
	onEventList: (events: Array<CalendarEvent>) => void,
	onIsLoading: (result: boolean) => void,
) => {
	try {
		// コレクションからドキュメント取得
		const querySnapshot = await getDocs(collection(db, 'calendarEvents'));
		// 汎用的なデータ
		const items: Array<Firebase> = [];	// 初期化
		querySnapshot.forEach(doc => {
			items.push({
				id: doc.id,
				recordDate: doc.data().recordDate,
				recordTime: doc.data().recordTime,
				kouji: doc.data().kouji,
				temperatureVal: doc.data().temperatureVal,
				humidityVal: doc.data().humidityVal,
				wbgtVal: doc.data().wbgtVal,
				creationTime: doc.data().creationTime,
			});
		});
		onDataList(items);	// データリスト更新
		const eventItems: Array<CalendarEvent> = [];	// イベントカレンダー
		const uniqueItems: Set<string> = new Set();	// 工事名と日付でフィルタリング
		// フィルタリング処理
		querySnapshot.forEach(doc => {
			const uniqueKey = `${doc.data().kouji.id}-${doc.data().recordDate}`;
			if (!uniqueItems.has(uniqueKey)) {
				uniqueItems.add(uniqueKey);
				eventItems.push({ title: doc.data().koujiId, date: doc.data().recordDate });
			}
		});
		onEventList(eventItems);	// データリスト更新
		onIsLoading(false); // データ取得完了
	} catch (err) {
		console.error('Error fetching data: ', err);
		onIsLoading(false); // データ取得エラー
	}
};

// カレンダーイベント登録関数
export const wbgtPostFirebase = async (
	selectedDate: Dayjs,
	selectedTime: string,
	selectedKouji: { label: string, id: string },
	temperatureVal: number,
	humidityVal: number,
	wbgtVal: number,
) => {
	try {
		const docRef = await addDoc(collection(db, 'calendarEvents'), {
			recordDate: selectedDate.format('YYYY-MM-DD'),
			recordTime: selectedTime,
			kouji: selectedKouji,
			temperatureVal: temperatureVal,
			humidityVal: humidityVal,
			wbgtVal: wbgtVal,
			creationTime: dayjs().tz('Asia/Tokyo').format('YYYY年M月D日 H:mm:ss [UTC+9]'),
		});
		console.log('Document written with ID: ', docRef.id); // 成功メッセージをコンソールに表示
	} catch (err) {
		console.error('Error fetching data: ', err);
	}
}

// カレンダーイベント更新関数
export const wbgtPutFirebase = async (
	recordId: string,
	selectedDate: Dayjs,
	selectedTime: string,
	selectedKouji: { label: string, id: string },
	temperatureVal: number,
	humidityVal: number,
	wbgtVal: number,
) => {
	try {
		const docRef = doc(db, 'calendarEvents', recordId);
		await updateDoc(docRef, {
			recordDate: selectedDate.format('YYYY-MM-DD'),
			recordTime: selectedTime,
			kouji: selectedKouji,
			temperatureVal: temperatureVal,
			humidityVal: humidityVal,
			wbgtVal: wbgtVal,
			creationTime: dayjs().tz('Asia/Tokyo').format('YYYY年M月D日 H:mm:ss [UTC+9]'),
		});
		console.log('Document updated with ID: ', docRef.id); // 成功メッセージをコンソールに表示
	} catch (err) {
		console.error('Error fetching data: ', err);
	}
}