!function(e){function t(n){if(a[n])return a[n].exports;var s=a[n]={exports:{},id:n,loaded:!1};return e[n].call(s.exports,s,s.exports,t),s.loaded=!0,s.exports}var a={};return t.m=e,t.c=a,t.p="",t(0)}([function(e,t){"use strict";var a=React.createClass({displayName:"Status",getInitialState:function(){return{student:{},currentGame:{id:0},lottery:null,spot:{}}},loadData:function(){var e,t,a,n;$.getJSON("tailgate/User/Student",{command:"get"}).done(function(s){e=s,$.getJSON("tailgate/User/Game",{command:"getCurrent"}).done(function(s){t=s,t?$.getJSON("tailgate/User/Lottery",{command:"get",game_id:s.id}).done(function(s){a=s,a?$.getJSON("tailgate/User/Lottery",{command:"getSpotInfo",lotteryId:a.id}).done(function(s){n=s,this.setState({student:e,currentGame:t,lottery:a,spot:n})}.bind(this)):this.setState({student:e,currentGame:t,lottery:a})}.bind(this)):this.setState({currentGame:null,student:e})}.bind(this))}.bind(this))},componentDidMount:function(){this.loadData()},render:function(){var e;return 1==this.state.student.banned?React.createElement(n,{student:this.state.student}):(e=null===this.state.currentGame?React.createElement("h4",null,"No games scheduled. Try back later."):React.createElement(s,{game:this.state.currentGame,lottery:this.state.lottery,spot:this.state.spot,loadData:this.loadData}),React.createElement("div",null,React.createElement("h2",null,"Welcome ",this.state.student.first_name," ",this.state.student.last_name),e))}}),n=React.createClass({displayName:"Banned",getDefaultProps:function(){return{student:{}}},render:function(){return React.createElement("div",null,React.createElement("h2",null,"Sorry"),React.createElement("p",null,"You were banned from using this site on ",this.props.student.banned_date,"."),React.createElement("h3",null,"Reason for ban"),React.createElement("p",{className:"well"},this.props.student.banned_reason),React.createElement("p",null,"Contact the administrators of this site if you have questions."))}}),s=React.createClass({displayName:"Game",getDefaultProps:function(){return{game:{},lottery:{},spot:{}}},render:function(){return React.createElement("div",null,this.props.game.length>0?React.createElement("h3",null,this.props.game.university," ",this.props.game.mascot," - ",this.props.game.kickoff_format):null,React.createElement(r,{game:this.props.game,lottery:this.props.lottery,spot:this.props.spot,loadData:this.props.loadData}))}}),r=React.createClass({displayName:"GameStatus",submitLottery:function(){$("#lotSelect").val(),$.post("tailgate/User/Lottery",{command:"apply",game_id:this.props.game.id}).done(function(e){this.props.loadData()}.bind(this))},render:function(){var e=null,t=Math.floor(Date.now()/1e3);return e=void 0===this.props.game.id?React.createElement("div",{className:"alert alert-info"},"The next lottery has not been created yet. Check back later."):0===this.props.game.id?null:"1"===this.props.game.lottery_run?this.props.lottery?"1"===this.props.lottery.winner?"1"===this.props.lottery.confirmed?"0"!==this.props.lottery.spot_id?"1"===this.props.lottery.picked_up?React.createElement("div",{className:"alert alert-info"},"Your tailgate tag has been picked up. Enjoy the game!"):this.props.game.pickup_deadline<t?React.createElement("div",{className:"alert alert-info"},"Sorry, you failed to pick up your tailgating pass in time. It has been forfeited."):React.createElement("div",{className:"alert alert-info"},"You have chosen lot ",React.createElement("strong",null,this.props.spot.title),", spot number ",React.createElement("strong",null,this.props.spot.number),". Make sure to go pick up your tag before the ",this.props.game.pickup_deadline_format," deadline.",React.createElement("br",null),"See the ",React.createElement("a",{href:"./"},"home page")," for more details."):this.props.game.pickup_deadline<t?React.createElement("div",{className:"alert alert-info"},"Sorry, you failed to confirm your tailgating win. Your spot has been forfeited."):React.createElement("div",null,React.createElement(l,{lottery:this.props.lottery,loadData:this.props.loadData})):React.createElement("div",{className:"alert alert-success"},React.createElement("strong",null,"Congratulations,")," you won a lottery spot! Check your email to confirm your win."):React.createElement("div",{className:"alert alert-info"},"Sorry, you did not win a spot this time. Try again next game."):React.createElement("div",{className:"alert alert-danger"},"The lottery is complete and the winners have been contacted. Please, try again next game."):t>=this.props.game.signup_end?this.props.lottery?React.createElement("div",{className:"alert alert-info"},"Your application has been submitted. Watch your email and check back later for lottery results."):React.createElement("div",{className:"alert alert-info"},"Sorry, you missed the lottery sign up deadline. Try again next game."):this.props.game.signup_start<=t?this.props.lottery?React.createElement("div",{className:"alert alert-info"},"Your application has been submitted. Check your email after ",this.props.game.signup_end_format," for lottery results."):React.createElement(o,{game:this.props.game,handleClick:this.submitLottery}):React.createElement("div",{className:"alert alert-success"},"Tailgate lottery for this game begins at ",React.createElement("strong",null,this.props.game.signup_start_format),". See you then!")}}),l=React.createClass({displayName:"ConfirmSpot",getInitialState:function(){return{availableSpots:[],message:null,waiting:0}},getDefaultProps:function(){return{lottery:{}}},componentDidMount:function(){this.loadAvailableSpots()},loadAvailableSpots:function(){$.getJSON("tailgate/User/Lottery",{command:"spotChoice"}).done(function(e){this.setState({availableSpots:e})}.bind(this))},confirmSpot:function(){var e=this.refs.spotChoice.value,t=this.props.lottery.id;this.setState({waiting:1}),$.post("tailgate/User/Lottery",{command:"pickSpot",spotId:e,lotteryId:t},null,"json").done(function(e){e.success?this.props.loadData():(this.setState({waiting:0}),this.setState({message:React.createElement("div",{className:"alert alert-danger"},"Your requested spot was chosen by someone else. Pick again.")}),this.loadAvailableSpots())}.bind(this))},render:function(){var e;if(1===this.state.waiting)return React.createElement(i,null);if(this.state.availableSpots.length>0){var t=this.state.availableSpots.map(function(t,a){return e="1"===t.sober?"(Non-alcoholic)":"",React.createElement("option",{key:a,value:t.id},t.lot_title+", #"+t.number+" "+e)});return React.createElement("div",{className:"row"},React.createElement("div",{className:"col-sm-12"},React.createElement("p",null,"You have confirmed your winning ticket. Pick the spot you wish to tailgate in below. Choose quickly, other winners may be picking spots while you decide."),this.state.message),React.createElement("div",{className:"col-sm-4"},React.createElement("select",{ref:"spotChoice",className:"form-control"},t)),React.createElement("div",{className:"col-sm-4"},React.createElement("button",{className:"btn btn-primary",onClick:this.confirmSpot},"Choose tailgating spot")))}return React.createElement("div",null,React.createElement("p",null,"We have run out of spots. Contact the site administrator."))}}),o=React.createClass({displayName:"LotterySubmit",render:function(){var e=this.props.game;return React.createElement("div",null,React.createElement("p",null,"Lottery submission deadline: ",e.signup_end_format),React.createElement("p",{style:{marginTop:"1em"}},React.createElement("button",{className:"btn btn-primary btn-lg",onClick:this.props.handleClick},React.createElement("i",{className:"fa fa-check-square"})," Submit my name to the tailgate lottery")),React.createElement("p",null,React.createElement("small",null,React.createElement("em",null,"Lottery winners will choose their spot on a first come, first serve basis."))))}}),i=React.createClass({displayName:"Waiting",render:function(){return React.createElement("div",{className:"alert alert-success"},React.createElement("i",{className:"fa fa-cog fa-spin fa-lg"})," Please wait...")}});ReactDOM.render(React.createElement(a,null),document.getElementById("studentStatus"))}]);