
import HomeTs from '../components/page/home/HomeTs';
import IHome from '../components/page/home/HomeTs';

export default class MainModel{
	static ins = new MainModel();
	
	language = "default";

	baseUrl = "";
	domName = "";
	port = "";
	staticUrl = "";
	// serverUrl:string = "/server/";
	serverUrl = "/server/";

	isDebug = false;

	home:IHome = null;
}

export class Size {
	width = 0;
	height = 0;
}
