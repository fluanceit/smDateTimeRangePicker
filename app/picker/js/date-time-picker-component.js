(function() {

/* global moment */
function DateTimePicker($mdUtil, $mdMedia, $document) {
    return {
        restrict: 'E',
        require: ['^ngModel', 'smDateTimePickerComponent'],
        scope: {
            weekStartDay: '@',
            startView: '@',
            mode: '@',
            format: '@',
            minDate: '@',
            maxDate: '@',
            fname: '@',
            label: '@',
            isRequired: '<',
            disable: '<',
            noFloatingLabel: '<',
            alignTextRight: '<',
            disableYearSelection: '@',
            closeOnSelect: '<',
            changeViewOnSelect: '<',
            showInput: '@',
            onDateSelectedCall: '&'
        },
        controller: ['$scope', '$element', '$mdUtil', '$mdMedia', '$document','$parse', 'smDatePickerLocale', SMDateTimePickerCtrl],
        controllerAs: 'vm',
        bindToController :true,
        template: function (element, attributes){
            var inputType = '';
            var inputContainerStart = '<md-input-container class="sm-input-container md-icon-float md-block" md-no-float="vm.noFloatingLabel">';
            var inputContainerEnd = '</md-input-container>';
            if(attributes.hasOwnProperty('onFocus')) {
                inputType = '<input name="{{vm.fname}}" ng-model="vm.value" ng-class="{\'sm-input-align-text-right\': vm.alignTextRight }" '
                            + ' sm-date-time-validator="{{vm.format}}" '
                            + ' type="text" placeholder="{{vm.label}}" '
                            + ' aria-label="{{vm.fname}}" ng-focus="vm.show()" data-ng-required="vm.isRequired"  ng-disabled="vm.disable" '
                            + ' server-error class="sm-input-container" />' ;
            } else {
                if(attributes.hasOwnProperty('noInput')) {
                    inputType = '<md-button tabindex="-1" class="md-icon-button" aria-label="showCalender" ng-disabled="vm.disable" aria-hidden="true" type="button" ng-click="vm.show()">'
                            + '      <md-icon md-font-icon="material-icons md-primary">{{vm.iconType}}</md-icon>'
                            + '  </md-button>' ;
                    inputContainerStart = '<div class="sm-input-container md-icon-float md-block" style="position:relative;">';
                    inputContainerEnd = '</div>';
                }
                else {
                    inputType = 
                        '<input class="sm-input-align-for-button" name="{{vm.fname}}" ng-model="vm.value" ng-class="{\'sm-input-align-text-right\': vm.alignTextRight }" '
                        + '             sm-date-time-validator="{{vm.format}}" '
                        + '             type="text" placeholder="{{vm.label}}" '
                        + '             aria-label="{{vm.fname}}" aria-hidden="true" data-ng-required="vm.isRequired" ng-disabled="vm.disable"/>'
                        + '     <md-button tabindex="-1" class="sm-picker-button md-icon-button" aria-label="showCalender" ng-disabled="vm.disable" aria-hidden="true" type="button" ng-click="vm.show()">'
                        + '         <md-icon md-font-icon="material-icons md-primary">{{vm.iconType}}</md-icon>'
                        + '     </md-button>' ;
                        /*
                        '<input class="" name="{{vm.fname}}" ng-model="vm.value" '
                        + '             type="text" placeholder="{{vm.label}}" '
                        + '             aria-label="{{vm.fname}}" aria-hidden="true" data-ng-required="vm.isRequired" ng-disabled="vm.disable"/>'
                        + '     <md-button tabindex="-1" class="sm-picker-icon md-icon-button" aria-label="showCalender" ng-disabled="vm.disable" aria-hidden="true" type="button" ng-click="vm.show()">'
                        + '         <svg  fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
                        + '     </md-button>' ; */
                }
            }

            return  inputContainerStart +
                    inputType +
                    '     <div id="picker" class="sm-calender-pane md-whiteframe-z2">' +
                    '          <sm-date-picker-component ' +
                    '              ng-if="vm.isCalendarOpen"' +
                    '              id="{{vm.fname}}Picker" ' +
                    '              initial-date="vm.initialDate"' +
                    '              mode="{{vm.mode || \'date\'}}" ' +
                    '              disable-year-selection={{vm.disableYearSelection}}' +
                    '              close-on-select="vm.closeOnSelect"' +
                    '              change-view-on-select="vm.changeViewOnSelect"' +
                    '              start-view="{{vm.startView}}" ' +
                    '              data-min-date="vm.minDate" ' +
                    '              data-max-date="vm.maxDate"  ' +
                    '              data-format="{{vm.format}}"  ' +
                    '              data-on-select-call="vm.onDateSelected(date)"' +
                    '              data-week-start-day="{{vm.weekStartDay}}" > ' +
                    '         </sm-date-picker-component>' +
                    '     </div>' +
                    inputContainerEnd;
        },
        link: function(scope, $element, attr, ctrl) {
            var ngModelCtrl = ctrl[0];
            var pickerCtrl = ctrl[1];
            pickerCtrl.configureNgModel(ngModelCtrl);
        }
    }
}

var SMDateTimePickerCtrl = function($scope, $element, $mdUtil, $mdMedia, $document, $parse, picker) {
    var self = this;

    /** Used for checking whether the current user agent is on iOS or Android. */
    var IS_MOBILE_REGEX = /ipad|iphone|ipod|android/i;

    // properties
    self.$scope = $scope;
    self.$element = $element;
    self.$mdUtil = $mdUtil;
    self.$mdMedia = $mdMedia;
    self.$document = $document;
    self.picker = picker;
    self.isCalendarOpen = false;
    self.noInput = $element[0].attributes.hasOwnProperty('noInput');

    self.calenderHeight = 320;
    self.calenderWidth = 450;

    //find input button and assign to variable
    self.inputPane = $element[0].querySelector('.sm-input-container');

    //find Calender Picker  and assign to variable
    self.calenderPane = $element[0].querySelector('.sm-calender-pane');
    //button to start calender
    self.button = $element[0].querySelector('.sm-picker-icon');

    self.calenderPan = angular.element(self.calenderPane);
    self.calenderPan.addClass('hide hide-animate');

    self.bodyClickHandler = angular.bind(this, this.clickOutSideHandler);

    /**
     * Name of the event that will trigger a close. Necessary to sniff the browser, because
     * the resize event doesn't make sense on mobile and can have a negative impact since it
     * triggers whenever the browser zooms in on a focused input.
     */
    self.windowEventName = IS_MOBILE_REGEX.test(
        navigator.userAgent || navigator.vendor || window.opera
      ) ? 'orientationchange' : 'resize';

    /** Pre-bound close handler so that the event listener can be removed. */
    self.windowEventHandler = $mdUtil.debounce(angular.bind(this, this.hideElement), 100);

    self.$scope.$on('calender:close', function() {
        self.$document.off('keydown');
        self.hideElement(); 
    });

    self.$scope.$on('$destroy', function() {
        self.calenderPane.parentNode.removeChild(self.calenderPane);
    });

    // if tab out hide key board
    if(!self.noInput) {
        angular.element(self.inputPane).on('keydown', function(e) {
            switch(e.which){
                case 27:
                case 9:
                    self.hideElement();
                break;
            }
        });
    }

};

SMDateTimePickerCtrl.prototype.$onInit = function() {
    var self = this;
    this.disablePicker = this.disable;
    this.alignTextRight = this.alignTextRight || false;

    // check if Pre defined format is supplied
    this.format = angular.isUndefined(this.format) ? this.picker.format : this.format;

    // set icon type to display
    if(this.mode === 'time') {
        this.iconType = 'access_time';
    }
    else {
        this.iconType = 'insert_invitation';
    }
}

SMDateTimePickerCtrl.prototype.configureNgModel = function(ngModelCtrl) {
    var self = this;
    self.ngModelCtrl = ngModelCtrl;

    // update $viewValue
    self.ngModelCtrl.$formatters.push(function(modelValue) {
        if(!modelValue && (angular.isUndefined(modelValue) || modelValue === null)) {
            // update <input> ngModel binding
            self.value='';
            // TODO: callback
            //self.onDateSelectedCall({date: null});
            return modelValue;
        }
        //self.setNgModelValue(modelValue);
        // TODO: callback
        //self.onDateSelectedCall({date: date});

        // set local
        self.initialDate = moment(modelValue);

        var d = {};
        if (moment.isMoment(modelValue)){
            d = modelValue.format(self.format);
        } else {
            //d = moment(modelValue, self.format).format(self.format);
            d = moment(modelValue).format(self.format);
        }
        return d; // String
    });

    self.ngModelCtrl.$parsers.push(function(viewValue) {
        var date = moment(viewValue, self.format);
        var val = (date && date.isValid()) ? date.toDate() : null;

        // set local (initial date for the date/time picker)
        self.initialDate = viewValue ? moment(viewValue, self.format) : moment(); // from view value, or current date
        
        return val;
    });

    self.ngModelCtrl.$render = function() {
        self.value = self.ngModelCtrl.$viewValue;
    }

    // watch for changs in <input> value
    self.$scope.$watch('vm.value', function(value) {
        // update local model value when <input> value changes
        self.ngModelCtrl.$setViewValue(value);
    });
    
};

SMDateTimePickerCtrl.prototype.setNgModelValue = function(date) {
    var self = this;
    // TODO: callback
    //self.onDateSelectedCall({date: date});
    var d = {};
    if (moment.isMoment(date)){
        d = date.format(self.format);
    } else {
        d = moment(date, self.format).format(self.format);
    }
    self.ngModelCtrl.$setViewValue(d);
    //self.ngModelCtrl.$render(); 
    // update <input> ngModel binding
    self.value = d;
};

/**
 * Callback when a date/time is selected
 */
SMDateTimePickerCtrl.prototype.onDateSelected = function(date){
    var self = this;
    self.setNgModelValue(date);
};



/*get visiable port

@param : elementnRect

@param : bodyRect

*/

SMDateTimePickerCtrl.prototype.getVisibleViewPort = function(elementRect, bodyRect) {
    var self = this;

    var top = elementRect.top;
    if (elementRect.top + self.calenderHeight > bodyRect.bottom) {
        top = elementRect.top - ((elementRect.top + self.calenderHeight) - (bodyRect.bottom - 20));
    }
    var left = elementRect.left;
    if (elementRect.left + self.calenderWidth > bodyRect.right) {
        left = elementRect.left - ((elementRect.left + self.calenderWidth) - (bodyRect.right - 10));
    }
    return {
        top: top,
        left: left
    };
}


/**
 * Open Date/Time picker window
 */
SMDateTimePickerCtrl.prototype.show = function($event) {
    var self = this;

    var elementRect = self.inputPane.getBoundingClientRect();
    var bodyRect = document.body.getBoundingClientRect();

    self.calenderPan.removeClass('hide hide-animate');

    if (self.$mdMedia('sm') || self.$mdMedia('xs')) {
        self.calenderPane.style.left = (bodyRect.width - 320) / 2 + 'px';
        self.calenderPane.style.top = (bodyRect.height - 450) / 2 + 'px';
    } else {
        var rect = self.getVisibleViewPort(elementRect, bodyRect);
        self.calenderPane.style.left = (rect.left) + 'px';
        self.calenderPane.style.top = (rect.top) + 'px';
    }

    document.body.appendChild(self.calenderPane);
    angular.element(self.calenderPane).focus();

    self.calenderPan.addClass('show');
    self.$mdUtil.disableScrollAround(self.calenderPane);

    self.isCalendarOpen = true;

    // DOM event listener
    self.$document.on('click', function(e) {
        self.$scope.$apply(function() {
            self.bodyClickHandler(e);
        });
    });

    window.addEventListener(self.windowEventName, self.windowEventHandler);
}


SMDateTimePickerCtrl.prototype.tabOutEvent= function(element){
    var self = this;
    if (element.which === 9) {
        self.hideElement();
    }
}

SMDateTimePickerCtrl.prototype.hideElement= function() {
    var self = this;
    self.calenderPan.addClass('hide-animate');
    self.calenderPan.removeClass('show');
    self.$mdUtil.enableScrolling();

    if(self.button){
        angular.element(self.button).focus();
    }
    self.isCalendarOpen = false;
    self.$document.off('click');

    window.removeEventListener(self.windowEventName, self.windowEventHandler);
}


SMDateTimePickerCtrl.prototype.clickOutSideHandler = function(e){
    var self = this;
    if(!self.button){
        if ((self.calenderPane !== e.target && self.inputPane !== e.target ) && (!self.calenderPane.contains(e.target) && !self.inputPane.contains(e.target))) {
            self.hideElement();
        }
    } else {
        if ((self.calenderPane !== e.target && self.button !== e.target ) && (!self.calenderPane.contains(e.target) && !self.button.contains(e.target))) {
            self.hideElement();
        }
    }
}

/**
 * Date Validator
 * To use in <input> to validate manual date entry
 */
function DateTimeValidator () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            var ngModelCtrl = ctrl;
            var format = attrs.smDateTimeValidator;

            ngModelCtrl.$parsers.push(function(viewValue) {
                var strictParsing = true;
                var modelValue = undefined;

                // empty view value
                if(viewValue.length === 0) {
                    modelValue = null;
                }
                else if(viewValue.length === format.length) {
                    modelValue = moment(viewValue, format, strictParsing);
                    if(!modelValue.isValid()) {
                        modelValue = undefined;
                    }
                }

                return modelValue;
            });

            ngModelCtrl.$validators.dateValidation = function dateValidation(modelValue, viewValue) {
                var value = viewValue;
                // validate value with format; null/empty is a valid value
                var strictParsing = true;
                var isValid = (value === null) || (value.length === 0) || (value.length === format.length) && moment(value, format, strictParsing).isValid();
                return isValid;
            };
        }
    }
}


var app = angular.module('smDateTimeRangePicker');
app.directive('smDateTimePickerComponent', ['$mdUtil', '$mdMedia', '$document', DateTimePicker]);
app.directive('smDateTimeValidator', DateTimeValidator);

})();