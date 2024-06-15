import React, { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, CssBaseline, Grid, Icon, IconButton, Slider, SwipeableDrawer, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ja';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

type Props = {
	dataList: Array<{ id: string; kouji_name: string; wbgt: number; }>;
	dateStr: string | null;
	drawerOpen: boolean;
	onDataList: (e: Array<{ id: string; kouji_name: string; wbgt: number; }>) => void;
	onDrawerOpen: () => void;
	fetchDate: () => void;
};

export const Home = (props: Props) => {
	const [selectedKouji, setSelectedKouji] = useState<{ label: string; id: number } | null>(null);
	const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
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

	const handleDateChange = (date: Dayjs | null) => {
		setSelectedDate(date);
	};

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
				const docRef = await addDoc(collection(db, 'data'), {
					date: formattedDate,
					kouji_name: selectedKouji['label'],
					wbgt: WBGTVal,
					timestamp: Date.now(), // 現在のタイムスタンプを追加
				});
				console.log('Document written with ID: ', docRef.id); // 成功メッセージをコンソールに表示
				// (''); // 入力フィールドをクリア
				// 新しいデータをデータリストに追加
				props.onDataList([...props.dataList, { id: docRef.id, kouji_name: selectedKouji['label'], wbgt: Number(WBGTVal) }]);
				// 再レタリング
				props.fetchDate();
			} catch (e) {
				console.error('Error adding document: ', e); // エラーメッセージをコンソールに表示
			}
		}
	};

	useEffect(() => {
		if (props.dateStr) {
			setSelectedDate(dayjs(props.dateStr));
		}
	}, [props.dateStr]);

	return (
		<SwipeableDrawer
			anchor='bottom'
			open={props.drawerOpen}
			onClose={props.onDrawerOpen}
			onOpen={props.onDrawerOpen}
		>
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
				<IconButton aria-label="close" onClick={props.onDrawerOpen}>
					<Icon>highlight_off</Icon>
				</IconButton>
				<Typography variant='h6'>新規登録</Typography>
				<IconButton aria-label="save" onClick={() => handleSubmit()}>
					<Icon>save</Icon>
				</IconButton>
			</Box>
			<Box sx={{ p: 1 }}>
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
						<Grid item xs={12} md={6}>
							<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
								<DatePicker
									label='計測日'
									value={selectedDate}
									onChange={() => handleDateChange}
								/>
							</LocalizationProvider>
						</Grid>
						<Grid item xs={12} md={6}>

						</Grid>
						<Grid item xs={12} md={6} lg={4}>
							<TextField
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
						<Grid item xs={12} textAlign='center'>
							<Button variant="contained" startIcon={<Icon>done</Icon>} onClick={handleSubmit}>
								送信
							</Button>
						</Grid>
					</Grid>
				</Box>
			</Box>
		</SwipeableDrawer>
	);
};

export default Home;