import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, CssBaseline, FormControl, Grid, Icon, IconButton, InputLabel, MenuItem, Select, Slider, TextField, Tooltip, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import 'dayjs/locale/ja';
// import { addDoc, collection } from 'firebase/firestore';
// import { db } from '../firebaseConfig';
import { addDataRecord, updateDataRecord } from '../helpers/eventCalendarHelp';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

type Props = {
	koujiList: Array<{ label: string, id: string }>
	dataList: Array<Firebase>;
	filterDataList: Array<DetailData>;
	dateStr: string | null;
	drawerOpen: boolean;
	selectedRecordId: string | null;
	onDataList: (e: Array<Firebase>) => void;
	onDrawerOpen: () => void;
	onPageTransition: (page: string) => void;
	onSelectedRecordId: (id: string | null) => void;
	onSnackOpen: (msg: string) => void;
};

export const Edit = ({
	koujiList,
	dataList,
	filterDataList,
	dateStr,
	selectedRecordId,
	onDataList,
	onDrawerOpen,
	onPageTransition,
	onSelectedRecordId,
	onSnackOpen
}: Props) => {
	const [selectedKouji, setSelectedKouji] = useState<{ label: string; id: string } | null>(null);
	const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
	const [selectedTime, setSelectedTime] = useState<string>(getClosestTime());
	const [temperatureVal, setTemperatureVal] = useState<number | string>('');
	const [temperatureError, setTemperatureError] = useState<string | null>(null);
	const [humidityVal, setHumidityVal] = useState<number | string>('');
	const [humidityError, setHumidityError] = useState<string | null>(null);
	const [wbgtVal, setWbgtVal] = useState<number | string>('');
	const [wbgtError, setWbgtError] = useState<string | null>(null);


	const temperatureMarks = [
		{ value: 15, label: '15°C' },
		{ value: 25, label: '25°C' },
		{ value: 35, label: '35°C' },
		{ value: 44, label: '44°C' }
	];

	const humidityMarks = [
		{ value: 0, label: '0%' },
		{ value: 20, label: '20%' },
		{ value: 40, label: '40%' },
		{ value: 60, label: '60%' },
		{ value: 80, label: '80%' },
		{ value: 100, label: '100%' }
	];

	dayjs.extend(utc);
	dayjs.extend(timezone);

	// 計測日
	const handleDateChange = (date: Dayjs) => {
		setSelectedDate(date);
	};
	// 計測時刻
	const handleTimeChange = (time: string) => {
		setSelectedTime(time);
	}
	// 工事
	const handleKoujiChange = async (e: { label: string, id: string } | null) => {
		await localforage.setItem('selectedKouji', e);
		setSelectedKouji(e);
	}
	// 気温
	const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value !== '' ? Number(e.target.value) : '';
		setTemperatureVal(val);
	};
	// 湿度
	const handleHumidityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value !== '' ? Number(e.target.value) : '';
		setHumidityVal(val);
	};
	// WBGT
	const handleWbgtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value !== '' ? Number(e.target.value) : '';
		setWbgtVal(val);
	};
	// 気温入力チェック
	const handleTemperatureCheck = (): boolean => {
		const val = Number(temperatureVal);
		if (val == 0) {
			setTemperatureError('気温の入力は必須です');
			return false;
		} else if (val < 15 || val > 44) {
			setTemperatureError('気温は15℃から44℃の間である必要があります');
			return false;
		} else {
			setTemperatureError(null);
			return true;
		}
	};
	// 湿度入力チェック
	const handleHumidityCheck = (): boolean => {
		const val = Number(humidityVal);
		if (val == 0) {
			setHumidityError('湿度の入力は必須です');
			return false;
		} else if (val < 0 || val > 100) {
			setHumidityError('湿度は0%から100%の間である必要があります');
			return false;
		} else {
			setHumidityError(null);
			return true;
		}
	};
	// WBGT入力チェック
	const handleWbgtCheck = (): boolean => {
		const val = Number(wbgtVal);
		if (val == 0) {
			setWbgtError('WBGTの入力は必須です');
			return false;
		} else if (val < 15 || val > 44) {
			setWbgtError('WBGT値は15℃から44℃の間である必要があります');
			return false;
		} else {
			setWbgtError(null);
			return true;
		}
	};

	// 保存ボタン押下時処理
	const handleSubmit = async () => {
		// 入力値チェック
		const checkResult = checkInputValue();
		if (checkResult !== null) return onSnackOpen(checkResult);
		// DB更新処理
		try {
			// 編集モードか？
			if (selectedRecordId) {
				// レコードIDを持っている時のみドキュメント更新
				await handleUpdateData();
			} else {
				await handleAddData();
			}
		} catch (e) {
			// エラーメッセージをコンソールに表示
			console.error('Error adding document: ', e);
			onSnackOpen('データ登録時にエラーが発生しました');
		}
		// ページ遷移
		onPageTransition('detail');
		// ドロワー閉じる
		onDrawerOpen();
		// レコードIDクリア
		onSelectedRecordId(null);
	}

	// 入力値チェック処理: エラーがあればエラー文を返します
	const checkInputValue = (): string | null => {
		const isKoujiValid = selectedKouji !== null;
		const isTemperatureValid = handleTemperatureCheck();
		const isHumidityValid = handleHumidityCheck();
		const isWBGTValid = handleWbgtCheck();
		if (isKoujiValid && isTemperatureValid && isHumidityValid && isWBGTValid) {
			console.log('Form submitted successfully');
			// 重複のチェック
			const checkedItems = dataList.filter(data =>
				data['id'] !== selectedRecordId &&
				data['kouji']['id'] === selectedKouji['id'] &&
				data['recordDate'] === dayjs(selectedDate).format('YYYY-MM-DD') &&
				data['recordTime'] === selectedTime
			);
			// 重複データがないか確認(編集時は自分のIDを除く)
			if (checkedItems.length === 0) {
				console.log('Form submitted successfully');
			} else {
				// 重複エラー
				return '同じデータが登録されています';
			}
		} else {
			// 入力エラー
			return '入力されていない項目があります';
		}
		// 問題なし
		return null;
	}

	// データアップデート処理
	const handleUpdateData = async () => {
		const updatedRecord: Firebase = {
			id: selectedRecordId!,  // 更新するレコードのID
			recordDate: selectedDate.format('YYYY-MM-DD'),
			recordTime: selectedTime,
			kouji: selectedKouji!,
			temperatureVal: Number(temperatureVal),
			humidityVal: Number(humidityVal),
			wbgtVal: Number(wbgtVal),
			creationTime: dayjs().tz('Asia/Tokyo').format('YYYY年M月D日 H:mm:ss [UTC+9]'),
			syncFlag: true,
		};

		const updatedData = await updateDataRecord(updatedRecord);
		if (updatedData) {
			onDataList(updatedData);
		}
	};

	// 登録処理
	const handleAddData = async () => {
		const newRecord: Firebase = {
			id: uuidv4(),  // 一意のIDを生成
			recordDate: selectedDate.format('YYYY-MM-DD'),
			recordTime: selectedTime,
			kouji: selectedKouji!,
			temperatureVal: Number(temperatureVal),
			humidityVal: Number(humidityVal),
			wbgtVal: Number(wbgtVal),
			creationTime: dayjs().tz('Asia/Tokyo').format('YYYY年M月D日 H:mm:ss [UTC+9]'),
			syncFlag: true,
		};
		const updatedData = await addDataRecord(newRecord);
		if (updatedData) {
			onDataList(updatedData);
		}
	}

	function getClosestTime(): string {
		// 現在時刻を取得
		const now: Date = new Date();

		// 指定時刻をDateオブジェクトとして作成
		const times: Date[] = [
			new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0),
			new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
			new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0),
		];

		// 時刻の差を計算し、最も小さい値を持つ時刻を見つける
		let closestTime: Date = times[0];
		let minDiff: number = Math.abs(now.getTime() - times[0].getTime());

		for (let i = 1; i < times.length; i++) {
			const diff: number = Math.abs(now.getTime() - times[i].getTime());
			if (diff < minDiff) {
				minDiff = diff;
				closestTime = times[i];
			}
		}
		// 結果をフォーマットして返す
		const hours: string = closestTime.getHours().toString();
		const minutes: string = closestTime.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	// 工事初期値設定
	useEffect(() => {
		// レコードIDを取得したとき編集画面を描写する
		const editData = typeof selectedRecordId === 'string' ?
			filterDataList.map(item => ({
				...item,
				records: item['records'].filter(record => record['id'] === selectedRecordId)
			})).filter(item => item['records'].length > 0)[0] : null;


		if (editData !== null) {
			// Detailで選択された工事を初期表示する
			setSelectedKouji(editData!['kouji']);
			setSelectedDate(dayjs(editData['recordDate']));
			setSelectedTime(editData['records'][0]['recordTime']);
			setTemperatureVal(editData['records'][0]['temperatureVal']);
			setHumidityVal(editData['records'][0]['humidityVal']);
			setWbgtVal(editData['records'][0]['wbgtVal']);
		} else {
			// 直近で選択した工事を初期表示
			const fetchData = async () => {
				try {
					const val: { label: string, id: string } | null = await localforage.getItem('selectedKouji');
					if (val) setSelectedKouji(val);
				} catch (err) {
					console.log('ありえんエラー');
				}
			}
			fetchData();
		}
	}, []);

	useEffect(() => {
		if (dateStr) {
			setSelectedDate(dayjs(dateStr));
		}
	}, [dateStr]);

	return (
		<>
			<Box sx={{
				display: 'flex',
				justifyContent: 'space-between',
				position: 'sticky',
				top: 0,
				zIndex: 1000,
				p: 1,
				bgcolor: 'background.paper',
			}}>
				<CssBaseline />
				<Tooltip title='戻る'>
					<IconButton aria-label='back' onClick={() => {
						onPageTransition('detail');
						onSelectedRecordId(null);
					}}>
						<Icon>arrow_back</Icon>
					</IconButton>
				</Tooltip>
				<Typography variant='h6'>{selectedRecordId ? '編集' : '新規登録'}</Typography>
				<Tooltip title='保存'>
					<IconButton aria-label='save' onClick={() => handleSubmit()}>
						<Icon>save</Icon>
					</IconButton>
				</Tooltip>
			</Box>
			<Box sx={{ p: 4 }}>
				<Grid container spacing={4} columnSpacing={6} alignItems="center">
					<Grid item xs={12}>
						<Autocomplete
							options={koujiList}
							value={selectedKouji}
							onChange={(_, newValue) => handleKoujiChange(newValue)}
							isOptionEqualToValue={(option, value) => option.id === value.id}
							renderInput={(params) => <TextField {...params} label="工事名" />}
						/>
					</Grid>
					<Grid item xs={6}>
						<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
							<DatePicker
								disabled
								label='計測日'
								value={selectedDate}
								onChange={() => handleDateChange}
							/>
						</LocalizationProvider>
					</Grid>
					<Grid item xs={6}>
						<FormControl fullWidth>
							<InputLabel id="time-select-label">計測時刻</InputLabel>
							<Select
								labelId="time-select-label"
								id="time-select"
								value={selectedTime}
								label="計測時刻"
								onChange={(e) => handleTimeChange(e['target']['value'])}
							>
								<MenuItem value='8:00'>8:00</MenuItem>
								<MenuItem value='10:00'>10:00</MenuItem>
								<MenuItem value='13:00'>13:00</MenuItem>
							</Select>
						</FormControl>
					</Grid>
					<Grid item xs={12} md={6} lg={4}>
						<TextField
							required
							label="気温(℃)"
							type='number'
							inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
							value={temperatureVal}
							onChange={handleTemperatureChange}
							onBlur={handleTemperatureCheck}
							error={temperatureError !== null}
							helperText={temperatureError}
						/>
						<Slider
							value={typeof temperatureVal === 'number' ? temperatureVal : Number(temperatureVal)}
							onChange={(_, val) => setTemperatureVal(val as number)}
							aria-labelledby="input-slider"
							valueLabelDisplay="auto"
							marks={temperatureMarks}
							min={15}
							max={44}
						/>
					</Grid>
					<Grid item xs={12} md={6} lg={4}>
						<TextField
							required
							label="湿度(%)"
							type='number'
							inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
							value={humidityVal}
							onChange={handleHumidityChange}
							onBlur={handleHumidityCheck}
							error={humidityError !== null}
							helperText={humidityError}
						/>
						<Slider
							value={typeof humidityVal === 'number' ? humidityVal : Number(humidityVal)}
							onChange={(_, val) => setHumidityVal(val as number)}
							aria-labelledby="input-slider"
							valueLabelDisplay="auto"
							marks={humidityMarks}
							min={0}
							max={100}
						/>
					</Grid>
					<Grid item xs={12} md={6} lg={4}>
						<TextField
							required
							label="WBGT値(℃)"
							type='number'
							inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
							value={wbgtVal}
							onChange={handleWbgtChange}
							onBlur={handleWbgtCheck}
							error={wbgtError !== null}
							helperText={wbgtError}
						/>
						<Slider
							value={typeof wbgtVal === 'number' ? wbgtVal : Number(wbgtVal)}
							onChange={(_, val) => setWbgtVal(val as number)}
							aria-labelledby="input-slider"
							valueLabelDisplay="auto"
							marks={temperatureMarks}
							min={15}
							max={44}
						/>
					</Grid>
				</Grid>
			</Box>
		</>
	);
};

export default Edit;