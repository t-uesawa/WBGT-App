import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import localforage from "localforage";

// オンラインであればFirebaseから、オフラインであればlocalForageからデータを取得しFirebase型を返す
export const fetchKoujiData = async (): Promise<Array<{ label: string, id: string }>> => {
	const isOnline = navigator.onLine;

	if (isOnline) {
		console.log('GET Firebase');
		// firebaseからデータ取得(全て)
		const snapshot = await getDocs(collection(db, 'kouji'));
		// 取得したデータをFirebase型に変換
		const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { label: string, id: string }));
		// オフライン時用にデータを保存
		await localforage.setItem('kouji', data);
	}
	// オフライン時
	// localForageからデータ取得(全て)
	const data: Array<{ label: string, id: string }> | null = await localforage.getItem('kouji');
	return data || [];
};

