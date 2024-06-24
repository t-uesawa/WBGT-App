declare type Firebase = {
	id: string;
	recordDate: string;
	recordTime: string;
	kouji: { label: string, id: string };
	temperatureVal: number;
	humidityVal: number;
	wbgtVal: number;
	creationTime: string;
	syncFlag: boolean;
}