import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, CssBaseline, FormControl, Grid, Icon, IconButton, InputLabel, MenuItem, Select, Slider, TextField, Tooltip, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import 'dayjs/locale/ja';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

type Props = {
	dataList: Array<Firebase>;
	filterDataList: Array<DetailData>;
	dateStr: string | null;
	drawerOpen: boolean;
	onDataList: (e: Array<Firebase>) => void;
	onDrawerOpen: () => void;
	onPageTransition: (page: string) => void;
	fetchDate: () => void;
};

export const Edit = (props: Props) => {
	const [selectedKouji, setSelectedKouji] = useState<{ label: string; id: number } | null>(null);
	const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
	const [selectedTime, setSelectedTime] = useState<string>(getClosestTime());
	const [temperatureVal, setTemperatureVal] = useState<string | number>(15);
	const [temperatureError, setTemperatureError] = useState<string | null>(null);
	const [humidityVal, setHumidityVal] = useState<string | number>(0);
	const [humidityError, setHumidityError] = useState<string | null>(null);
	const [WBGTVal, setWBGTVal] = useState<string | number>(15);
	const [WBGTError, setWBGTError] = useState<string | null>(null);

	const koujiOptions = [
		{ label: 'A工事', id: 1 },
		{ label: 'B工事', id: 2 }
	];

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

	const handleDateChange = (date: Dayjs | null) => {
		setSelectedDate(date);
	};

	const handleTimeChange = (time: string) => {
		setSelectedTime(time);
	}

	const validateTemperature = (val: string | number) => {
		const numVal = Number(val);
		if (isNaN(numVal)) {
			setTemperatureError('気温は数値である必要があります');
			return false;
		} else if (numVal < 15 || numVal > 44) {
			setTemperatureError('気温は15℃から44℃の間である必要があります');
			return false;
		} else {
			setTemperatureError(null);
			return true;
		}
	};

	const validateHumidity = (val: string | number) => {
		const numVal = Number(val);
		if (isNaN(numVal)) {
			setHumidityError('湿度は数値である必要があります');
			return false;
		} else if (numVal < 0 || numVal > 100) {
			setHumidityError('湿度は0%から100%の間である必要があります');
			return false;
		} else {
			setHumidityError(null);
			return true;
		}
	};

	const validateWBGT = (val: string | number) => {
		const numVal = Number(val);
		if (isNaN(numVal)) {
			setWBGTError('WBGT値は数値である必要があります');
			return false;
		} else if (numVal < 15 || numVal > 44) {
			setWBGTError('WBGT値は15℃から44℃の間である必要があります');
			return false;
		} else {
			setWBGTError(null);
			return true;
		}
	};

	const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTemperatureVal(Number(e.target.value));
	};

	const handleTemperatureBlur = () => {
		validateTemperature(temperatureVal);
	};

	const handleHumidityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setHumidityVal(Number(e.target.value));
	};

	const handleHumidityBlur = () => {
		validateHumidity(humidityVal);
	};

	const handleWBGTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWBGTVal(Number(e.target.value));
	};

	const handleWBGTBlur = () => {
		validateWBGT(WBGTVal);
	};

	const handleSubmit = async () => {
		const isKoujiValid = selectedKouji !== null;
		const isTemperatureValid = validateTemperature(temperatureVal);
		const isHumidityValid = validateHumidity(humidityVal);
		const isWBGTValid = validateWBGT(WBGTVal);
		if (isKoujiValid && isTemperatureValid && isHumidityValid && isWBGTValid) {
			console.log('Form submitted successfully');
			// Firebase送信
			try {
				// 新しいドキュメントを'data'コレクションに追加
				const formattedDate = selectedDate ? selectedDate.format('YYYY-MM-DD') : null;
				const docRef = await addDoc(collection(db, 'calendarEvents'), {
					recordDate: formattedDate,
					recordTime: selectedTime,
					kouji_name: selectedKouji['label'],
					temperatureVal: Number(temperatureVal),
					humidityVal: Number(humidityVal),
					wbgtVal: Number(WBGTVal),
					creationTime: dayjs().tz('Asia/Tokyo').format('YYYY年M月D日 H:mm:ss [UTC+9]'),
				});
				console.log('Document written with ID: ', docRef.id); // 成功メッセージをコンソールに表示
				// (''); // 入力フィールドをクリア
				// 新しいデータをデータリストに追加
				props.onDataList([...props.dataList, {
					id: docRef.id,
					recordDate: formattedDate,
					recordTime: selectedTime,
					kouji_name: selectedKouji['label'],
					temperatureVal: Number(temperatureVal),
					humidityVal: Number(humidityVal),
					wbgtVal: Number(WBGTVal),
					creationTime: dayjs().tz('Asia/Tokyo').format('YYYY年M月D日 H:mm:ss [UTC+9]'),
				}]);

				// ドロワー閉じる
				props.onPageTransition('detail');
				props.onDrawerOpen();
				// 再レタリング
				props.fetchDate();
			} catch (e) {
				console.error('Error adding document: ', e); // エラーメッセージをコンソールに表示
			}
		}
	};

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
		const hours: string = closestTime.getHours().toString().padStart(2, '0');
		const minutes: string = closestTime.getMinutes().toString().padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	useEffect(() => {
		if (props.dateStr) {
			setSelectedDate(dayjs(props.dateStr));
		}
	}, [props.dateStr]);

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
					<IconButton aria-label='back' onClick={() => props.onPageTransition('detail')}>
						<Icon>arrow_back</Icon>
					</IconButton>
				</Tooltip>
				<Typography variant='h6'>新規登録</Typography>
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
							options={koujiOptions}
							value={selectedKouji}
							onChange={(_, newValue) => setSelectedKouji(newValue)}
							isOptionEqualToValue={(option, value) => option.id === value.id}
							renderInput={(params) => <TextField {...params} label="工事名" />}
						/>
					</Grid>
					<Grid item xs={6}>
						<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
							<DatePicker
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
							value={temperatureVal}
							onChange={handleTemperatureChange}
							onBlur={handleTemperatureBlur}
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
							value={humidityVal}
							onChange={handleHumidityChange}
							onBlur={handleHumidityBlur}
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
							value={WBGTVal}
							onChange={handleWBGTChange}
							onBlur={handleWBGTBlur}
							error={WBGTError !== null}
							helperText={WBGTError}
						/>
						<Slider
							value={typeof WBGTVal === 'number' ? WBGTVal : Number(WBGTVal)}
							onChange={(_, val) => setWBGTVal(val as number)}
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