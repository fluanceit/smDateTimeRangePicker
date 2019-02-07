/* global moment */
(function(){
	'use strict';

	function TimePicker(){
		return {
			restrict : 'E',
			replace:true,
			require: ['^ngModel', 'smTime'],
			scope :{
				initialDate : '=',
				format:'@',
				timeSelectCall : '&'
			},
			controller:['$scope', 'smDatePickerLocale', TimePickerCtrl],
			controllerAs : 'vm',
			templateUrl:'picker/calender-hour.html',
			link : function(scope, element, att, ctrls){
				var ngModelCtrl = ctrls[0];
				var calCtrl = ctrls[1];
				calCtrl.configureNgModel(ngModelCtrl);

			}
		}
	}

	var TimePickerCtrl = function($scope, picker){
		var self = this;
		self.MIDDLE_INDEX = 4;
		self.uid = Math.random().toString(36).substr(2, 5);
		self.$scope = $scope;
		self.picker = picker;
		self.colorIntention = picker.colorIntention;		
		self.format = $scope.format;
		self.hourItems =[];
		self.minuteCells =[];
		self.hourSet =false;
		self.minuteSet = false;

		self.show=true;

		// use component lifecycle hooks
		self.$onInit = onInit;

		function onInit() {
			self.initialDate = $scope.initialDate; 	//if calender to be  initiated with specific date
			self.format = angular.isUndefined(self.format) ? 'HH:mm': self.format;
			self.initialDate =	angular.isUndefined(self.initialDate)? moment() : moment(self.initialDate, self.format);
			self.currentDate = self.initialDate.clone();
	
			self.init();
		}
	}

	TimePickerCtrl.prototype.init = function(){
		var self = this;
		self.buildHourCells();
		self.buildMinuteCells();
		self.headerDispalyFormat = 'HH:mm';
		self.showHour();
	};

	TimePickerCtrl.prototype.showHour = function() {
		var self = this;

		self.hourTopIndex = ((self.initialDate.hour()-self.MIDDLE_INDEX) >= 0) ? (self.initialDate.hour()-self.MIDDLE_INDEX) : 0;
		self.minuteTopIndex = ((self.initialDate.minute()-self.MIDDLE_INDEX) >= 0) ? (self.initialDate.minute()-self.MIDDLE_INDEX) : 0;
		//self.minuteTopIndex	= (self.initialDate.minute() - 0) + Math.floor(7 / 2);

		//self.yearTopIndex = (self.initialDate.year() - self.yearItems.START) + Math.floor(self.yearItems.PAGE_SIZE / 2);
		//	self.hourItems.currentIndex_ = (self.initialDate.hour() - self.hourItems.START) + 1;
	};

	TimePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
		this.ngModelCtrl = ngModelCtrl;
		var self = this;
		ngModelCtrl.$render = function() {
			self.ngModelCtrl.$viewValue= self.currentDate;
		};
	};


	TimePickerCtrl.prototype.setNgModelValue = function(date) {
		var self = this;
		self.ngModelCtrl.$setViewValue(date);
		self.ngModelCtrl.$render();
	};




	TimePickerCtrl.prototype.buildHourCells = function(){
		var self = this;
		self.hourTopIndex = ((self.initialDate.hour()-self.MIDDLE_INDEX) >= 0) ? (self.initialDate.hour()-self.MIDDLE_INDEX) : 0;
		for (var i = 0 ; i <= 23; i++) {
			var hour={
				hour : i,
				isCurrent :(self.initialDate.hour())=== i
			}
			self.hourItems.push(hour);
		};
	};

	TimePickerCtrl.prototype.buildMinuteCells = function(){
		var self = this;
		self.minuteTopIndex = ((self.initialDate.minute()-self.MIDDLE_INDEX) >= 0) ? (self.initialDate.minute()-self.MIDDLE_INDEX) : 0;
		for (var i = 0 ; i <= 59; i++) {
			var minute = {
				minute : i,
				isCurrent : (self.initialDate.minute())=== i,
			}
			self.minuteCells.push(minute);
		};
	};


	TimePickerCtrl.prototype.selectDate = function(d, isDisabled){
		var self = this;
		if (isDisabled) return;
		self.currentDate = self.currentDate.hour(d.hour()).minutes(d.minutes());

		self.$scope.$emit('calender:date-selected');

	}


	TimePickerCtrl.prototype.setHour = function(h){
		var self = this;
		self.currentDate.hour(h);
		self.setNgModelValue(self.currentDate);
		self.$scope.timeSelectCall({time: self.currentDate});

		/*
		self.hourSet =true;
		if(self.hourSet && self.minuteSet){
			self.$scope.timeSelectCall({time: self.currentDate});
			self.hourSet=false;
			self.minuteSet=false;
		}
		*/
	}

	TimePickerCtrl.prototype.setMinute = function(m){
		var self = this;
		self.currentDate.minute(m);
		self.setNgModelValue(self.currentDate);
		self.$scope.timeSelectCall({time: self.currentDate});

		/*
		self.minuteSet =true;
		if(self.hourSet && self.minuteSet){
			self.$scope.timeSelectCall({time: self.currentDate});
			self.hourSet=false;
			self.minuteSet=false;
		}
		*/

	}

	TimePickerCtrl.prototype.selectedDateTime = function(){
		var self = this;
		self.setNgModelValue(self.currentDate);
		if(self.mode === 'time')
		self.view='HOUR'
		else
		self.view='DATE';
		self.$scope.$emit('calender:close');
	}

	var app = angular.module('smDateTimeRangePicker');
	app.directive('smTime', ['$timeout', TimePicker]);
})();
