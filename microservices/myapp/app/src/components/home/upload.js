import { h, Component } from 'preact';

import upload_style from './upload.less';

export default class Upload extends Component {
  exploreFile = e => {
    document.getElementById("fileInput").click();
  };
  render() {
    return (
      <div class={ upload_style.upload_wrapper }>
        <form>
          <div class={ upload_style.display_bl + ' ' + upload_style.form_input }>
            <span>
              <div class={ upload_style.upload_plus + ' ' + upload_style.display_inl } onClick={ this.exploreFile }>
                +
              </div>
              <div class={ upload_style.display_inl + ' ' + upload_style.add_your_file_text }>
                Add your files
              </div>
              <input id="fileInput" type="file" style="display:none;" />
            </span>
          </div>
          <div class={ upload_style.display_bl + ' ' + upload_style.form_input }>
            <input type="text" placeholder="Email to" />
          </div>
          <div class={ upload_style.display_bl + ' ' + upload_style.form_input }>
            <input type="text" placeholder="Your email" />
          </div>
          <div class={ upload_style.display_bl + ' ' + upload_style.form_input }>
            <input type="text" placeholder="Message" />
          </div>
          <div class={ upload_style.transfer_btn_wrapper }>
            <div class={ upload_style.transfer_btn_element }>
              <button>
                Transfer
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
