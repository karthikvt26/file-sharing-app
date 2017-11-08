import { h, Component } from 'preact';
import style from './style.less';

import Upload from './upload';

export default class Home extends Component {
	render() {
		return (
			<div class={style.home}>
        <div class={ style.img_rel_wrapper }>
          <div class={ style.img_wrapper }>
          </div>
        </div>
        <Upload />
			</div>
		);
	}
}
