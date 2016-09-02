import React from 'react'

class Modal extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div id="admin-modal" className="modal fade">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button aria-label="Close" className="close" data-dismiss="modal" type="button">
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title"></h4>
            </div>
            <div className="modal-body"></div>
            <div className="modal-footer">
              <button className="btn btn-default" data-dismiss="modal" type="button">Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default Modal;
