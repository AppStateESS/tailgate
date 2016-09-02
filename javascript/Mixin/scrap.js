var tgMixin = {
    showForm() {
        this.setState({
            showForm : true
        });
    },

    hideForm() {
        this.setState({
            showForm : false
        });
    },

    loadVisitors() {
        $.getJSON('tailgate/Admin/Visitor', {
            command : 'list'
        }).done(function(data){
            if (data.length < 1) {
                data = [];
            }
            if (this.isMounted()) {
                    this.setState({
                    visitors : data
                });
            }
        }.bind(this));
    },

    getUnixTime(date){
        var obj = new Date(date).getTime() / 1000;
        return obj;
    }

};
