
import HomeTs from '../components/page/home/HomeTs';
import IHome from '../components/page/home/HomeTs';
import { FileStructInfo } from '@/model/FileStruct';

export default class MainModel{
	static ins = new MainModel();
	
	language = "default";

	baseUrl = "";
	domName = "";
	port = "";
	staticUrl = "";
	// serverUrl:string = "/server/";
	serverUrl = "/server/";
	static = "1";
	defaultData = "";

	isDebug = false;

	home:IHome = null;
}

export class Size {
	width = 0;
	height = 0;
}

export enum EventType {
	jumpHex = "jumpHex",
}

export class ConfigMd {
	isHexMode = true;
	structData: FileStructInfo[] = [];
}