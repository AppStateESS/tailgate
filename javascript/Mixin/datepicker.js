/* global $ */

class Datepicker {
  constructor(update, error, dom, command) {
    this.update = update
    this.error = error
    this.dom = dom
    this.command = command
    this.popupCalendar = this.popupCalendar.bind(this)
  }

  dateInit(useTime) {
    let dateFormat = useTime
      ? 'Y/m/d H:i'
      : 'Y/m/d'
    $(this.dom).datetimepicker({
      timepicker: useTime,
      format: dateFormat,
      onChangeDateTime: function (ct, input) {
        this.updateDate(input[0].value)
      }.bind(this)
    })
  }

  popupCalendar() {
    $(this.dom).datetimepicker('show')
  }

  updateDate(date) {
    $.post('tailgate/Admin/Game', {
      command: this.command,
      date: date,
    }, null, 'json').done(function (data) {
      if (data.success) {
        this.update()
      } else {
        this.error(data.error)
      }
    }.bind(this))
  }
}

export default Datepicker
