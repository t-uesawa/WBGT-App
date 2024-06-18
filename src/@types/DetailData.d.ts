declare type DetailData = {
	key: string;
	kouji_name: string;
	recordDate: string | null;
	records: Array<DetailRecord>
}

declare type DetailRecord = {
	id: string;
	recordTime: string;
	temperatureVal: number;
	humidityVal: number;
	wbgtVal: number;
	creationTime: string;
}