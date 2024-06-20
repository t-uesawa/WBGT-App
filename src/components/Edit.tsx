import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, CssBaseline, FormControl, Grid, Icon, IconButton, InputLabel, MenuItem, Select, Slider, TextField, Tooltip, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import 'dayjs/locale/ja';
import { wbgtPostFirebase, wbgtPutFirebase } from './firebase';

type Props = {
	koujiList: Array<{ label: string, id: string }>;
	filterDataList: Array<DetailData>;
	dateStr: string | null;
	drawerOpen: boolean;
	selectedRecordId: string | null;
	onDataList: (e: Array<Firebase>) => void;
	onDrawerOpen: () => void;
	onPageTransition: (page: string) => void;
};

export const Edit = (props: Props) => {
	// レコードIDを取得したとき編集画面を描写する
	const screenResult = typeof props.selectedRecordId === 'string';
	const editData = screenResult ?
		props.filterDataList.map(item => ({
			...item,
			records: item['records'].filter(record => record['id'] === props.selectedRecordId)
		})).filter(item => item['records'].length > 0)[0] : null;

	const [selectedKouji, setSelectedKouji] = useState<{ label: string; id: string } | null>(null);
	const [selectedDate, setSelectedDate] = useState<Dayjs>(editData ? dayjs(editData['recordDate']) : dayjs());
	const [selectedTime, setSelectedTime] = useState<string>(editData ? editData['records'][0]['recordTime'] : getClosestTime());
	const [temperatureVal, setTemperatureVal] = useState<string | number>(editData ? editData['records'][0]['temperatureVal'] : 15);
	const [temperatureError, setTemperatureError] = useState<string | null>(null);
	const [humidityVal, setHumidityVal] = useState<string | number>(editData ? editData['records'][0]['humidityVal'] : 0);
	const [humidityError, setHumidityError] = useState<string | null>(null);
	const [wbgtVal, setWbgtVal] = useState<string | number>(editData ? editData['records'][0]['wbgtVal'] : 15);
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
	const handleKoujiChange = (e: { label: string, id: string } | null) => {
		setSelectedKouji(e);
	}

	// 気温
	const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTemperatureVal(e.target.value);
	};
	// 気温入力チェック
	const handleTemperatureCheck = (): boolean => {
		const numVal = Number(temperatureVal);
		if (isNaN(numVal)) {
			setTemperatureError('気温は数値である必要があります');
			return false;
		} else if (numVal < 15 || numVal > 44) {
			setTemperatureError('気温は15℃から44℃の間である必要がありまする');
			return false;
		} else {
			setTemperatureError(null);
			return true;
		}
	};

	const handleHumidityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setHumidityVal(Number(e.target.value));
	};

	const handleHumidityBlur = () => {
		validateHumidity(humidityVal);
	};

	const handleWBGTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWbgtVal(Number(e.target.value));
	};

	const handleWBGTBlur = () => {
		validateWBGT(wbgtVal);
	};
	// 湿度入力チェック
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
	// WBGT入力チェック
	const validateWBGT = (val: string | number) => {
		const numVal = Number(val);
		if (isNaN(numVal)) {
			setWbgtError('WBGT値は数値である必要があります');
			return false;
		} else if (numVal < 15 || numVal > 44) {
			setWbgtError('WBGT値は15℃から44℃の間である必要があります');
			return false;
		} else {
			setWbgtError(null);
			return true;
		}
	};

	const handleSubmit = async () => {
		const isKoujiValid = selectedKouji !== null;
		const isTemperatureValid = handleTemperatureCheck();
		const isHumidityValid = validateHumidity(humidityVal);
		const isWBGTValid = validateWBGT(wbgtVal);
		if (isKoujiValid && isTemperatureValid && isHumidityValid && isWBGTValid) {
			console.log('Form submitted successfully');
			// Firebase送信
			try {
				// 新しいドキュメントを'data'コレクションに追加
				if (screenResult && props.selectedRecordId) {
					// レコードIDを持っている時のみドキュメント更新
					wbgtPutFirebase(
						props.selectedRecordId,
						selectedDate,
						selectedTime,
						selectedKouji!,
						Number(temperatureVal),
						Number(humidityVal),
						Number(wbgtVal),
					);
				} else {
					wbgtPostFirebase(
						selectedDate,
						selectedTime,
						selectedKouji!,
						Number(temperatureVal),
						Number(humidityVal),
						Number(wbgtVal),
					);
				}
				// ドロワー閉じる
				props.onPageTransition('detail');
				props.onDrawerOpen();
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
				<Typography variant='h6'>{screenResult ? '編集' : '新規登録'}</Typography>
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
							options={props.koujiList}
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
							disabled
							label="気温(℃)"
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
							disabled
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
							disabled
							label="WBGT値(℃)"
							value={wbgtVal}
							onChange={handleWBGTChange}
							onBlur={handleWBGTBlur}
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