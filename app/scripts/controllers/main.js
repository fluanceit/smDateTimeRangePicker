/* global moment */
'use strict';

function MainCtrl($scope, $timeout, $mdSidenav, $mdUtil, $log, $state, $mdDialog, smDateTimePicker, smTimePicker) {
    var vm = this;
    vm.minDate = moment().add(10, 'd').format('MM-DD-YYYY');
    vm.maxDate =  '03-01-2017';//moment().add(1, 'M').format('MM-DD-YYYY');
    vm.dateOfBirth = moment();
    vm.dateOfPay2 = {
        startDate: new Date(),
        endDate: new Date()
    };
    vm.dateOfBirth2;

    vm.hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    vm.overrideList = [{
        position:1,
        label:'Custom',
        startDate: moment(),
        endDate: moment()
    }]

    vm.dateChanged = function(date){
        vm.dateOnNgChange =date;
    }

    vm.clearInput = function() {
        vm.dateOfBirth = '';
    }

    vm.dateSelected = function(date){
        vm.callBackValue = date;
    }

    vm.changeModelValue = function(){
        vm.dateOfBirth = '10-10-2016 10:10';
    }

    vm.openDatePicker = function(model, dateField, ev) {
        var options = {
            mode: 'date',
            weekStartDay:'Sunday'
        }

        options.targetEvent = ev;
        smDateTimePicker(model[dateField], options)
        .then(function(selectedDate) {
            model[dateField] = selectedDate;
        });
    }

    vm.openTimePicker = function(model, dateField, ev) {
        var options = {
            mode : 'time',
            format : 'MM.DD.YYYY HH:mm'
        }

        //vm.smCurrentDate = new Date();
        
        options.targetEvent = ev;
        smTimePicker(model[dateField], options)
        .then(function(selectedDate) {
            model[dateField] = selectedDate;
        })
        .catch(function() {
            // explicit exception handling (1.6+)
        });
    }

    vm.showTimePicker = function(ev) {
        var options = {
            mode : 'time',
            format : 'MM.DD.YYYY HH:mm'
        }

        //vm.smCurrentDate = new Date();
        
        options.targetEvent = ev;
        smTimePicker(vm.currentDate, options)
        .then(function(selectedDate) {
            vm.currentDate = selectedDate;
        })
        .catch(function() {
            // explicit exception handling (1.6+)
        });
    }

    vm.employee = {
        //birthDate: moment("13.11.1955 14:30", "DD.MM.YYYY HH:mm")
        birthDate: moment("13.11.2018 10:26", "DD.MM.YYYY HH:mm").toDate(),
        visitDate: moment("13.11.2019 14:30", "DD.MM.YYYY HH:mm").toDate()
        //visitDate: undefined
        //visitDate: null // breaks calendar (empty)
    };
    vm.employee.default = {
        startDate: moment(),
        endDate: moment().add(1, 'days')
    };

    //vm.currentDate = '10-15-2015';
    vm.currentDate = moment();
    var options = {
        mode : 'date',
        view : 'DATE',
        format : 'DD.MM.YYYY',
        minDate : '03-10-2016',
        maxDate : null,
        weekStartDay :'Sunday',
        closeOnSelect : false
    }

    vm.currentDate1 = moment();
    var options1 = {
        mode: 'date-time',
        format: 'MM-DD-YYYY HH:mm',
        minDate: '03-10-2016',
        maxDate: null,
        weekStartDay:'Sunday'
    }

    vm.showCalendar = function(ev){
        options.targetEvent = ev;
        smDateTimePicker(vm.currentDate, options)
        .then(function(selectedDate) {
            vm.currentDate = selectedDate;
        });
    }

    vm.showCalander1 = function(ev){
        options1.targetEvent = ev;
        smDateTimePicker(vm.currentDate1, options1).then(function(selectedDate) {
            vm.currentDate1 = selectedDate;
            var ele = document.getElementsByClassName('md-scroll-mask');
            if (ele.length !== 0) {
                angular.element(ele).remove();
            }
        });
    }

    vm.showDailog = function(ev){
        $mdDialog.show({
            templateUrl: 'views/dailog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: false
        });
    }

    vm.dayofPaySelected = function(range) {
        vm.rangeObj = range;
    }

    vm.dayofPay2Selected = function(range) {
        vm.rangeObj2 = range;
    }

    function buildToggler(navID) {
        var debounceFn = $mdUtil.debounce(function(){
            $mdSidenav(navID)
            .toggle().then(function () {
                $log.debug('toggle ' + navID + ' is done');
            });
        }, 300);
        return debounceFn;
    }
    vm.toggleLeft = buildToggler('left');

    vm.save = function(form){
        validateForm(form);
    }

    function validateForm(form){
        angular.forEach(form, function(obj, name){
            if (name.indexOf('$') !== 0) {
                obj.$validate();
                obj.$touched= true;
            }
        });
        form.$setSubmitted();
        return form.$valid;
    }
}

function LeftCtrl($timeout, $mdSidenav, $mdUtil, $log) {
    var vm = this;
    vm.close = function () {
        $mdSidenav('left').close()
        .then(function () {
        });
    };
}

angular.module('demoApp')
    .config(['smDatePickerLocaleProvider',
        function(pickerProvider) {
            pickerProvider.setCustomHeader(
                {date: 'DD.MM', time: 'HH:mm', dateTime: 'DD.MM HH:mm'}
            );
        } 
    ])
    .controller('MainCtrl', ['$scope', '$timeout', '$mdSidenav', '$mdUtil', '$log', '$state', '$mdDialog', 'smDateTimePicker', 'smTimePicker', MainCtrl])
    .controller('LeftCtrl', ['$timeout', '$mdSidenav', '$mdUtil', '$log', LeftCtrl]);
