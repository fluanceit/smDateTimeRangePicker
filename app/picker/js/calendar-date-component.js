/* global moment */
(function(){
    'use strict';

    function Calender(picker){
        return {
            restrict: 'E',
            replace: false,
            scope: {
                minDate: '<',
                maxDate: '<',
                initialDate : '<',
                format: '@',
                mode: '@',
                startView:'@',
                weekStartDay:'@',
                disableYearSelection:'@',
                onDateSelectCall: '&'
            },
            controller: ['$scope', '$timeout', 'smDatePickerLocale', '$mdMedia', CalenderCtrl],
            controllerAs: 'vm',
            templateUrl: 'picker/calendar-date-component.html'
        };
    }

    var CalenderCtrl = function($scope, $timeout, picker, $mdMedia){
        var self = this;

        self.$scope = $scope;
        self.$timeout = $timeout;
        self.picker = picker;
        self.$mdMedia = $mdMedia;
        self.backToCalendar = self.picker.backToCalendar;
        self.todayTranslation = self.picker.todayTranslation;

        self.todayDisabled =

        self.setToday = function () {
            if (!self.isTodayDisabled) {
                var today = moment();
                self.$scope.initialDate = today;
                self.selectDate(today, false);
                self.$onInit();
            }
        }
    };

    CalenderCtrl.prototype.$onInit = function(){
        var self = this;

        var MIN_YEAR = 1900;
        var MAX_YEAR = 2100;

        self.dayHeader = self.picker.dayHeader;
        self.colorIntention = self.picker.colorIntention;
        self.initialDate = self.$scope.initialDate;
        self.viewModeSmall = self.$mdMedia('xs');
        self.startDay = angular.isUndefined(self.$scope.weekStartDay) || self.$scope.weekStartDay==='' ? 'Sunday' : self.$scope.weekStartDay ;
        self.minDate = self.$scope.minDate || undefined;			//Minimum date
        self.maxDate = self.$scope.maxDate || undefined;			//Maximum date
        self.mode = angular.isUndefined(self.$scope.mode) ? 'DATE' : self.$scope.mode;
        self.format = angular.isUndefined(self.$scope.format)? self.picker.format : self.$scope.format;
        self.restrictToMinDate = angular.isUndefined(self.minDate) ? false : true;
        self.restrictToMaxDate = angular.isUndefined(self.maxDate) ? false : true;
        self.stopScrollPrevious = false;
        self.stopScrollNext = false;
        self.disableYearSelection = self.$scope.disableYearSelection;
        self.monthCells=[];
        self.dateCellHeader= [];
        self.dateCells = [];
        self.monthList = self.picker.monthShortNames ? self.picker.monthShortNames : moment.monthsShort();
        self.moveCalenderAnimation = '';

        self.format = angular.isUndefined(self.format) ? 'MM-DD-YYYY': self.format;

        self.initialDate =	angular.isUndefined(self.initialDate) ? moment() : moment(self.initialDate, self.format);
        self.currentDate = self.initialDate.clone();

        self.minYear = MIN_YEAR;
        self.maxYear = MAX_YEAR;

        if(self.restrictToMinDate) {
             if(!moment.isMoment(self.minDate)){
                self.minDate = moment(self.minDate, self.format);
            }
            /* the below code is giving some errors. It was added by Pablo Reyes, but I still need to check what
            he intended to fix.
            if(moment.isMoment(self.minDate)){
                self.minDate = self.minDate.subtract(1, 'd').startOf('day');
            }else{
                self.minDate = moment(self.minDate, self.format).subtract(1, 'd').startOf('day');
            }
            self.minYear = self.minDate.year();
            */
        }

        if(self.restrictToMaxDate) {
            if(!moment.isMoment(self.maxDate)){
                self.maxDate = moment(self.maxDate, self.format).startOf('day');
                self.maxYear = self.maxDate.year();
            }
        }

        self.yearItems = {
            START: self.minYear,
            END: self.maxYear,
            getItemAtIndex: function(index) {
               return this.START + index;
           },
            getLength: function() {
                return this.END - this.START;
            }
        };

        var today = moment();
        self.isTodayDisabled = false;

        if(self.restrictToMinDate && !angular.isUndefined(self.minDate) && !self.isTodayDisabled)
        {
            self.isTodayDisabled = self.minDate.isAfter(today);
        }

        if(self.restrictToMaxDate && !angular.isUndefined(self.maxDate) && !self.isTodayDisabled)
        {
            self.isTodayDisabled = self.maxDate.isBefore(today);
        }

        self.buildDateCells();
        self.buildDateCellHeader();
        self.buildMonthCells();
        self.setView();
        self.showYear();
    };

    CalenderCtrl.prototype.setView = function(){
        var self = this;
        self.headerDispalyFormat = 'ddd, MMM DD';
        switch(self.mode) {
            case 'date-time':
            self.view = 'DATE';
            self.headerDispalyFormat = 'ddd, MMM DD HH:mm';
            break;
            case 'time':
            self.view = 'HOUR';
            self.headerDispalyFormat = 'HH:mm';
            break;
            default:
            self.view = 'DATE';
        }
    };


    CalenderCtrl.prototype.showYear = function() {
        var self = this;
        self.yearTopIndex = self.initialDate.year() - self.yearItems.START;
    };


    CalenderCtrl.prototype.buildMonthCells = function(){
        var self = this;
        self.monthCells = moment.months();
    };

    CalenderCtrl.prototype.buildDateCells = function(){
        var self = this;
        var currentMonth = self.initialDate.month();
        var calStartDate = self.initialDate.clone().date(0).day(self.startDay).startOf('day');
        var lastDayOfMonth = self.initialDate.clone().endOf('month');
        var weekend = false;
        var isDisabledDate =false;
        /*
        Check if min date is greater than first date of month
        if true than set stopScrollPrevious=true
        */
        if(!angular.isUndefined(self.minDate)){
            self.stopScrollPrevious	 = self.minDate.unix() >= calStartDate.unix();
        }
        self.dateCells =[];
        for (var i = 0; i < 6; i++) {
            var week = [];
            for (var j = 0; j < 7; j++) {

                var isCurrentMonth = (calStartDate.month()=== currentMonth);

                isDisabledDate = isCurrentMonth? false:true;
                //if(isCurrentMonth){isDisabledDate=false}else{isDisabledDate=true};

                if(self.restrictToMinDate && !angular.isUndefined(self.minDate) && !isDisabledDate)
                isDisabledDate = self.minDate.isAfter(calStartDate);

                if(self.restrictToMaxDate && !angular.isUndefined(self.maxDate) && !isDisabledDate)
                isDisabledDate = self.maxDate.isBefore(calStartDate);

                var day = {
                    date : calStartDate.clone(),
                    dayNum: isCurrentMonth ? calStartDate.date() :'',
                    month : calStartDate.month(),
                    today: calStartDate.isSame(moment(), 'day') && calStartDate.isSame(moment(), 'month'),
                    year : calStartDate.year(),
                    dayName : calStartDate.format('dddd'),
                    isWeekEnd : weekend,
                    isDisabledDate : isDisabledDate,
                    isCurrentMonth : isCurrentMonth
                };
                week.push(day);
                calStartDate.add(1, 'd');
            }
            self.dateCells.push(week);
        }
        /*
        Check if max date is greater than first date of month
        if true than set stopScrollPrevious=true
        */

        if(self.restrictToMaxDate && !angular.isUndefined(self.maxDate)){
            self.stopScrollNext	=  self.maxDate.isBefore(lastDayOfMonth);
        }

        if(self.dateCells[0][6].isDisabledDate && !self.dateCells[0][6].isCurrentMonth){
            self.dateCells[0].splice(0);
        }
    };

    CalenderCtrl.prototype.changePeriod = function(c){
        var self = this;
        if(c === 'p'){
            if(self.stopScrollPrevious) return;
            self.moveCalenderAnimation='slideLeft';
            self.initialDate.subtract(1, 'M');
        }else{
            console.log(self.stopScrollNext);
            if(self.stopScrollNext) return;
            self.moveCalenderAnimation='slideRight';
            self.initialDate.add(1, 'M');
        }

        self.buildDateCells();
        self.$timeout(function(){
            self.moveCalenderAnimation='';
        }, 500);
    };


    CalenderCtrl.prototype.selectDate = function(d, isDisabled){
        var self = this;
        if (isDisabled) {
            return;
        }
        self.currentDate = d;
        self.$scope.onDateSelectCall({date:d});
        self.$scope.$emit('calender:date-selected');
    };

    CalenderCtrl.prototype.buildDateCellHeader = function(startFrom) {
        var self = this;
        var daysByName = self.picker.daysNames;
        var keys = [];
        var key;
        for (key in daysByName) {
            keys.push(key);
        }

        var startIndex = moment().day(self.startDay).day(), count = 0;

        for (key in daysByName) {
            self.dateCellHeader.push(daysByName[ keys[ (count + startIndex) % (keys.length)] ]);
            count++; // Don't forget to increase count.
        }
    };

    /*
    Month Picker
    */

    CalenderCtrl.prototype.changeView = function(view){
        var self = this;
        if(self.disableYearSelection){
            return;
        }else{
            if(view==='YEAR_MONTH'){
                self.showYear();
            }
            self.view =view;
        }
    };

    /*
    Year Picker
    */

    CalenderCtrl.prototype.changeYear = function(yr, mn){
        var self = this;
        self.initialDate.year(yr).month(mn);
        self.buildDateCells();
        self.view='DATE';
    };

    /*
    Hour and Time
    */

    CalenderCtrl.prototype.setHour = function(h){
        var self = this;
        self.currentDate.hour(h);
    };

    CalenderCtrl.prototype.setMinute = function(m){
        var self = this;
        self.currentDate.minute(m);
    };

    CalenderCtrl.prototype.selectedDateTime = function(){
        var self = this;
        if(self.mode === 'time')
            self.view='HOUR';
        else
            self.view='DATE';
        self.$scope.$emit('calender:close');
    };

    CalenderCtrl.prototype.closeDateTime = function(){
        var self = this;
        if(self.mode === 'time')
            self.view='HOUR';
        else
            self.view='DATE';

        self.$scope.$emit('calender:close');
    };

    Calender.$inject = ['smDatePickerLocale'];

    CalenderCtrl.prototype.isPreviousDate = function(yearToCheck, monthToCheck)
    {
        var self = this;
        if(angular.isUndefined(self.minDate) || angular.isUndefined(yearToCheck) || angular.isUndefined(monthToCheck))
        {
            return false;
        }
        var _current_year = self.minDate.year();
        if(yearToCheck < _current_year)
        {
            return true;
        }else if(yearToCheck === _current_year)
        {
            if(monthToCheck < self.minDate.month())
            {
                return true;
            }
        }
        return false;
    };

    var app = angular.module('smDateTimeRangePicker', []);
    app.directive('smCalendarComponent', Calender);
})();
