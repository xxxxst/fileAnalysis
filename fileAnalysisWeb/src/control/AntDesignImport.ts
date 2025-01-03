
import { getVueProptotype } from '@/sdk/tsHelp/vue/v2c/IVue';
import VueApp from '@/VueApp';
import 'ant-design-vue/dist/antd.css';
import { message, Button, Modal, Dropdown, Menu, Popconfirm } from 'ant-design-vue';

var arr = [Button, Modal, Dropdown, Menu, Popconfirm];

getVueProptotype(VueApp.app).$message = message;
getVueProptotype(VueApp.app).$confirm = Modal.confirm;
arr.forEach(it=>VueApp.app.use(it));
