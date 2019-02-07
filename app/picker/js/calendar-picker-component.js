/* global moment */
(function(){
	'use strict';

	function DatePickerDir($timeout, picker, $mdMedia, $window) {
		return {
			restrict: 'E',
			replace: false,
			scope: {
				initialDate: '<',
				minDate: '<',
				maxDate: '<',
				format: '@',
				mode: '@',
				startDay: '@',
                closeOnSelect: '<',
                changeViewOnSelect: '<',
				weekStartDay: '@',
				disableYearSelection: '@',
				onSelectCall: '&'
			},
			controller: ['$scope', 'smDatePickerLocale', '$mdMedia', '$mdUtil', PickerCtrl],
			controllerAs: 'vm',
			bindToController: true,
            templateUrl: 'picker/date-picker-component.html',
		};
	}

	var PickerCtrl = function($scope, picker, $mdMedia, $mdUtil) {
        var self = this;
        
        self.scope = $scope;
        self.picker = picker;
        self.$mdMedia = $mdMedia;
        self.$mdUtil = $mdUtil;

		self.okLabel = picker.okLabel;
		self.cancelLabel = picker.cancelLabel;
		self.colorIntention = picker.colorIntention;
	};

	PickerCtrl.prototype.$onInit = function() {
		var self = this;

		if(angular.isUndefined(self.mode) || self.mode ===''){
			self.mode = 'date';
        }

		self.format = angular.isUndefined(self.format)? self.picker.format : self.format;

        if((this.mode === 'time' && !this.closeOnSelect) || (this.mode === 'date-time' && !this.changeViewOnSelect)) {
            this.setTimeOnSingleSelect = true;
        }
        else {
            this.setTimeOnSingleSelect = false;
        }

        // initialize with 'initialDate' (copy)
        self.currentDate = (angular.isUndefined(self.initialDate) || self.initialDate === null) ? moment(): self.initialDate.clone();
        self.selectedDate = self.currentDate;
        self.selectedTime = (angular.isUndefined(self.initialDate) || self.initialDate === null) ? moment() : self.initialDate.clone();

		self.setViewMode(self.mode);
	};

	PickerCtrl.prototype.setViewMode = function(mode){
		var self = this;
		switch(mode) {
			case 'date':
                self.view = 'DATE';
                self.headerDispalyFormat = self.picker.customHeader.date;
                break;
			case 'date-time':
                self.view = 'DATE';
                self.headerDispalyFormat = self.picker.customHeader.dateTime;
                break;
			case 'time':
                self.view = 'TIME';
                self.headerDispalyFormat = 'HH:mm';
                break;
			default:
                self.headerDispalyFormat = 'ddd, MMM DD ';
                self.view = 'DATE';
		}
	};

	PickerCtrl.prototype.setNextView = function(){
		var self = this;
		switch (self.mode){
			case 'date':
                self.view = 'DATE';
                break;
            case 'time':
                self.view = 'TIME';
                break;
			case 'date-time':
                self.view = self.view==='DATE' ? 'TIME':'DATE';
                break;
			default:
                self.view = 'DATE';
		}
	};

    /**
     * Update date/time
     */
	PickerCtrl.prototype.selectedDateTime = function(){
        var self = this;
        var date = moment(self.selectedDate, self.format);
		if(!date.isValid()){
			date = moment();
			self.selectedDate = date;
		}
		if(!angular.isUndefined(self.selectedTime) || self.selectedTime !== null){
			date.hour(self.selectedTime.hour()).minute(self.selectedTime.minute());
        }

        self.onSelectCall({date: date});
		self.closeDateTime();
	};

    /**
     * Callback when date is selected
     */
	PickerCtrl.prototype.dateSelected = function(date){
		var self = this;

        // update date of current date/time
        self.currentDate.date(date.date()).month(date.month()).year(date.year());
        self.selectedDate = self.currentDate;
        
        // close picker on select
		if(self.mode === 'date' && self.closeOnSelect){
			self.selectedDateTime();
        }
        else {
            // change view (next view) on select
            if(self.changeViewOnSelect) {
                self.setNextView();
            }
		}
	};

    /**
     * Callback when time is selected
     */
	PickerCtrl.prototype.timeSelected = function(time){
        var self = this;
        
        // update time of current date/time
        self.currentDate.hours(time.hour()).minutes(time.minute());
		self.selectedTime = self.currentDate;

        // close picker on select
        if((self.mode === 'date-time' && (self.changeViewOnSelect && self.closeOnSelect)) ||
            (self.mode === 'time' && self.closeOnSelect)) {
            self.selectedDateTime();
        }
		else {
            // change view (next view) on select
            if(self.changeViewOnSelect) {
                self.setNextView();
            }
        }
	};

	PickerCtrl.prototype.closeDateTime = function(){
		var self = this;
		self.view = 'DATE';
		self.scope.$emit('calender:close');
	};

	function TimePickerDir($timeout, picker, $mdMedia, $window) {
		return {
			restrict : 'E',
			require: '^ngModel',
			replace:true,
			scope :{
				initialDate : '@',
				format:'@',
				mode:'@',
				closeOnSelect:'@'
			},
			templateUrl:'picker/time-picker.html',
			link : function(scope, element, att, ngModelCtrl){
				setViewMode(scope.mode);

				scope.okLabel = picker.okLabel;
				scope.cancelLabel = picker.cancelLabel;

				scope.currentDate = isNaN(ngModelCtrl.$viewValue) ? moment(): ngModelCtrl.$viewValue ;

				scope.$mdMedia =$mdMedia;
				function setViewMode(mode){
					switch(mode) {
						case 'date-time':
						scope.view = 'DATE';
						scope.headerDispalyFormat = 'ddd, MMM DD HH:mm';
						break;
						case 'time':
						scope.view = 'HOUR';
						scope.headerDispalyFormat = 'HH:mm';
						break;
						default:
						scope.view = 'DATE';
					}
				}

				scope.$on('calender:date-selected', function(){
					if(scope.closeOnSelect && (scope.mode!=='date-time' || scope.mode!=='time')){
						var date = moment(scope.selectedDate, scope.format);
						if(!date.isValid()){
							date = moment();
							scope.selectedDate =date;
						}
						if(!angular.isUndefined(scope.selectedTime) || scope.selectedTime !== null){
							date.hour(scope.selectedTime.hour()).minute(scope.selectedTime.minute());
						}
						scope.currentDate =scope.selectedDate;
						ngModelCtrl.$setViewValue(date.format(scope.format));
						ngModelCtrl.$render();
						setViewMode(scope.mode);
						scope.$emit('calender:close');

					}
				});

				scope.selectedDateTime = function(){
					var date = moment(scope.selectedDate, scope.format);
					if(!date.isValid()){
						date = moment();
						scope.selectedDate =date;
					}
					if(!angular.isUndefined(scope.selectedTime) || scope.selectedTime !== null){
						date.hour(scope.selectedTime.hour()).minute(scope.selectedTime.minute());
					}
					scope.currentDate =scope.selectedDate;
					ngModelCtrl.$setViewValue(date.format(scope.format));
					ngModelCtrl.$render();
					setViewMode(scope.mode);
					scope.$emit('calender:close');
				};


				scope.closeDateTime = function(){
					scope.$emit('calender:close');
				};

			}
		};
	}

	var app = angular.module('smDateTimeRangePicker');
	app.directive('smDatePickerComponent', ['$timeout', 'smDatePickerLocale', '$mdMedia', '$window', DatePickerDir]);
	//app.directive('smTimePickerCp', ['$timeout', 'smDatePickerLocale', '$mdMedia', '$window', TimePickerDir]);
})();