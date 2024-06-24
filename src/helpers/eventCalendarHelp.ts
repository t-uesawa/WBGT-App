import { addDoc, collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import localforage from 'localforage';

// ホットリロード対応
export const setupRealtimeListener = (setDataList: React.Dispatch<React.SetStateAction<Firebase[]>>) => {
	const unsubscribe = onSnapshot(collection(db, 'calendarEvents'), (snapshot) => {
		const updatedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Firebase));
		setDataList(updatedData);
		localforage.setItem('calendarEvents', updatedData); // オフライン用に保存
	});
	return unsubscribe;
};

// オンラインであればFirebaseから、オフラインであればlocalForageからデータを取得しFirebase型を返す
export const fetchData = async (): Promise<Array<Firebase>> => {
	const isOnline = navigator.onLine;

	if (isOnline) {
		// 取得前にローカル上に未同期データがないかチェックする
		const localData: Array<Firebase> | null = await localforage.getItem('calendarEvents');
		if (localData !== null) {
			// 未同期データを抽出
			const notSyncData = localData.filter(item => !item['syncFlag']);
			if (notSyncData.length > 0) {
				console.log('同期中');
				// 未同期データあり
				notSyncData.map(async item => {
					await addDoc(collection(db, 'calendarEvents'), { ...item, syncFlag: true });
				});
				console.log('同期完了');
			}
		}

		console.log('GET Firebase');
		// firebaseからデータ取得(全て)
		const snapshot = await getDocs(collection(db, 'calendarEvents'));
		// 取得したデータをFirebase型に変換
		const data = snapshot.docs.map(doc => ({ ...doc.data() } as Firebase));
		// オフライン時用にデータを保存
		await localforage.setItem('calendarEvents', data);
		return data;
	} else {
		// オフライン時
		// localForageからデータ取得(全て)
		const data: Array<Firebase> | null = await localforage.getItem('calendarEvents');
		return data || [];
	}
};

// オンラインであればFirebaseに、オフラインであればlocalForageのみデータを保存
export const addDataRecord = async (newRecord: Firebase) => {
	const isOnline = navigator.onLine;
	try {
		let records: Array<Firebase> | null = await localforage.getItem('calendarEvents');
		console.log('Fetched records from localforage:', records);
		// ストレージにデータがなければ空の配列を作成
		if (!records || !Array.isArray(records)) {
			records = [];
		}
		// オンラインの場合はFirebaseにデータを保存
		if (isOnline) {
			const doc = await addDoc(collection(db, 'calendarEvents'), newRecord);
			// Firebaseに追加されたドキュメントのIDをログ出力
			console.log('Document written with ID: ', doc.id);
			// ローカルストレージにもデータを保存
			records.push({ ...newRecord, syncFlag: true });
		} else {
			// オフライン時は未同期フラグをつけてストレージに保存する
			records.push({ ...newRecord, syncFlag: false });
		}
		await localforage.setItem('calendarEvents', records);
		return records;
	} catch (err) {
		console.error('Error adding data:', err);
		return null;
	}
};

export const updateDataRecord = async (updatedRecord: Firebase) => {
	const isOnline = navigator.onLine;
	try {
		let records: Array<Firebase> | null = await localforage.getItem('calendarEvents');
		if (!records || !Array.isArray(records)) {
			records = [];
		}
		// オンラインの場合はFirebaseのデータを更新
		if (isOnline) {
			// ユニークIDからドキュメントIDを探します
			const q = query(collection(db, 'calendarEvents'), where('id', '==', updatedRecord.id));
			const querySnapshot = await getDocs(q);

			// ドキュメントが見つかった場合、更新
			querySnapshot.forEach(async (docSnapshot) => {
				const docRef = doc(db, 'calendarEvents', docSnapshot.id);
				await updateDoc(docRef, updatedRecord);
			});
		}
		// ローカルストレージのデータを更新
		const recordIndex = records.findIndex(record => record.id === updatedRecord.id);
		if (recordIndex !== -1) {
			records[recordIndex] = updatedRecord;
			await localforage.setItem('calendarEvents', records);
		}
		return records;
	} catch (err) {
		console.error('Error updating data:', err);
		return null;
	}
};