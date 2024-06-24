declare type DetailData = {
	key: string;
	kouji: { label: string, id: string };
	recordDate: string;
	records: Array<DetailRecord>
}

declare type DetailRecord = {
	id: string;
	recordTime: string;
	temperatureVal: number;
	humidityVal: number;
	wbgtVal: number;
	creationTime: string;
	syncFlag: boolean;
}