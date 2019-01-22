/* global moment */
(function(){
	'use strict';

	function TimePicker(){
		return {
			restrict: 'E',
			replace: true,
			scope: {
				initialDate: '<',
                format: '@',
                setTimeOnSingleSelect: '<',
				onTimeSelectCall: '&'
			},
			controller: ['$scope', '$mdUtil', 'picker', TimePickerCtrl],
            controllerAs: 'vm',
            bindToController: true,
            templateUrl: 'picker/calendar-hour-component.html'
		}
	}

	var TimePickerCtrl = function($scope, $mdUtil, picker){
        var self = this;
        self.MIDDLE_INDEX = 3;
        
        self.$scope = $scope;
        self.$mdUtil = $mdUtil;
        self.picker = picker;
	}

	TimePickerCtrl.prototype.$onInit = function(){
        var self = this;
        
		self.uid = Math.random().toString(36).substr(2, 5);
		self.colorIntention = self.picker.colorIntention;		
		self.hourItems =[];
		self.minuteCells =[];
		self.hourSet =false;
		self.minuteSet = false;
        self.show = true;
        
        //self.initialDate = this.initialTime; 	//if calender to be  initiated with specific date
        self.format = angular.isUndefined(this.format) ? 'HH:mm': self.format;
		self.initialDate =	angular.isUndefined(self.initialDate)? moment() : moment(self.initialDate, self.format);
		self.currentDate = self.initialDate.clone();

		self.buidHourCells();
		self.buidMinuteCells();
		self.headerDispalyFormat = 'HH:mm';
		self.showHour();
	};

	TimePickerCtrl.prototype.showHour = function() {
		var self = this;

        self.hourTopIndex = ((self.initialDate.hour()-self.MIDDLE_INDEX) >= 0) ? (self.initialDate.hour()-self.MIDDLE_INDEX) : 0;
        self.minuteTopIndex = ((self.initialDate.minute()-self.MIDDLE_INDEX) >= 0) ? (self.initialDate.minute()-self.MIDDLE_INDEX) : 0;

        // bug: "minutes" is empty if minuteTopIndex > 52
        // workaround: limit minuteTopIndex to 52
        if(self.minuteTopIndex > 52) self.minuteTopIndex = 53;

		//self.hourTopIndex = 22;
		//self.minuteTopIndex	= (self.initialDate.minute() -0) + Math.floor(7 / 2);
		//self.yearTopIndex = (self.initialDate.year() - self.yearItems.START) + Math.floor(self.yearItems.PAGE_SIZE / 2);
		//	self.hourItems.currentIndex_ = (self.initialDate.hour() - self.hourItems.START) + 1;
	};

	TimePickerCtrl.prototype.buidHourCells = function(){
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

	TimePickerCtrl.prototype.buidMinuteCells = function(){
        var self = this;
        self.minuteTopIndex = ((self.initialDate.minute()-self.MIDDLE_INDEX) >= 0) ? (self.initialDate.minute()-self.MIDDLE_INDEX) : 0;

        // bug: "minutes" is empty if minuteTopIndex > 52
        // workaround: limit minuteTopIndex to 52
        if(self.minuteTopIndex > 52) self.minuteTopIndex = 53;

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
		self.currentDate = d;
		self.$scope.$emit('calender:date-selected');
	}

	TimePickerCtrl.prototype.setHour = function(h){
		var self = this;
		self.currentDate.hour(h);

        self.hourSet =true;
		if((self.hourSet && self.minuteSet) || self.setTimeOnSingleSelect) {
			self.onTimeSelectCall({time: self.currentDate});
			self.hourSet=false;
			self.minuteSet=false;
		}
	}

	TimePickerCtrl.prototype.setMinute = function(m){
		var self = this;
		self.currentDate.minute(m);

        self.minuteSet =true;
		if((self.hourSet && self.minuteSet) || self.setTimeOnSingleSelect) {
			self.onTimeSelectCall({time: self.currentDate});
			self.hourSet=false;
			self.minuteSet=false;
		}
	}

	TimePickerCtrl.prototype.selectedDateTime = function(){
		var self = this;

        if(self.mode === 'time')
		    self.view='HOUR'
		else
		    self.view='DATE';
		self.$scope.$emit('calender:close');
	}

	var app = angular.module('smDateTimeRangePicker');
	app.directive('smTimeComponent', ['$timeout', TimePicker]);
})();
