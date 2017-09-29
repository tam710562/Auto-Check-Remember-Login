// ==UserScript==
// @name              Auto Check Remember Login
// @name:en           Auto Check Remember Login
// @name:vi           Tự Động Check Ghi Nhớ Đăng nhập
// @namespace         https://greasyfork.org/users/37096/
// @homepage          https://greasyfork.org/scripts/30726/
// @supportURL        https://greasyfork.org/scripts/30726/feedback
// @version           1.3.0.2a
// @description       The script will automatically check all remember login checkbox
// @description:en    The script will automatically check all remember login checkbox
// @description:vi    Script này sẽ tự động check tất cả các checkbox ghi nhớ đăng nhập
// @author            Hồng Minh Tâm
// @include           *
// @icon              https://4.bp.blogspot.com/-PijzdJYq1vk/WVhqpk1wGdI/AAAAAAAAAKw/Eu1Z_gDYU_UXtGGyN6v2ceE6unPCUaVSQCLcBGAs/s1600/auto-check-remember-login.png
// @compatible        chrome
// @compatible        firefox
// @compatible        opera
// @license           GNU GPLv3
// @grant             GM_registerMenuCommand
// @grant             GM_addStyle
// @grant             GM_setValue
// @grant             GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    var ACRL = {
        name: 'Auto Check Remember Login',
        optionsDefault: {
            language: undefined,
            checked: true,
            wait: {
                enable: true,
                limit: 1000,
                delay: 100
            },
            masks: {
                values: ['remember', 'cookie', 'persistent-login', 'ghinho', 'ricordami', 'lembrar', 'recordarme', 'recordar'],
                texts: ['Remember', 'Keep me', 'Stay signed in', 'Ghi nhớ', 'Ricordami', 'Lembrar', 'Lembre-se de mim', 'Recordarme', 'Recordar', 'Запомнить', 'Se souvenir'],
            },
        },
        languages: {
            vi: {
                name: 'Tiếng Việt',
                'Auto Check Remember Login': 'Tự Động Check Ghi Nhớ Đăng nhập',
                'Settings': 'Cài đặt',
                'Language': 'Ngôn ngữ',
                'Show advanced settings': 'Hiện thị cài đặt nâng cao',
                'Uncheck all remember login checkbox': 'Bỏ check tất cả các checkbox ghi nhớ đăng nhập',
                'Wait until a checkbox is found': 'Chờ cho đến khi một checkbox được tìm thấy',
                'Limit wait': 'Giới hạn chờ',
                'Delay wait': 'Trì hoãn chờ',
                'Browser default': 'Mặc định của trình duyệt',
                'Reset settings': 'Đặt lại cài đặt',
                'Cancel': 'Hủy bỏ'
            }
        },
        checkboxs: undefined,
        init: function() {
            ACRL.loadSettings();
            ACRL.setLangBrowser();
            ACRL.registerCommands();
            if(ACRL.options.masks) {
                if(ACRL.options.wait && ACRL.options.wait.enable) {
                    ACRL.waitForElement('input[type=checkbox]', ACRL.checkRememberLogin, ACRL.options.wait.limit, ACRL.options.wait.delay);
                } else {
                    ACRL.checkRememberLogin();
                }
            }
        },
        setSettings: function() {
            GM_setValue('options', ACRL.options);
        },
        getSettings: function() {
            return GM_getValue('options');
        },
        loadSettings: function() {
            var options = ACRL.getSettings('options');
            if(options) {
                ACRL.options = options;
            } else {
                ACRL.options = ACRL.optionsDefault;
                ACRL.setSettings();
            }
        },
        resetSettings: function() {
            ACRL.options = ACRL.optionsDefault;
            ACRL.setSettings();
        },
        getLangs: function() {
            var language;
            var languages = [{ value: 'en', label: 'English' }];
            for (language in ACRL.languages) {
                languages.push({ value: language, label: ACRL.languages[language].name });
            }
            languages.sort(ACRL.sort.dynamicSort('text'));
            return languages;
        },
        setLangBrowser: function() {
            ACRL.languageBrowser = ACRL.getLangBrowser();
        },
        getLangBrowser: function() {
            return (navigator.language || navigator.userLanguage || 'en').replace('-', '_').toLowerCase().split('_')[0];
        },
        changeLang: function(text, language) {
            if(typeof(language) === "undefined") {
                if(typeof(ACRL.options.language) !== "undefined") {
                    language = ACRL.options.language;
                } else {
                    language = ACRL.languageBrowser;
                }
            }
            if(ACRL.languages[language] && ACRL.languages[language][text]) {
                return ACRL.languages[language][text];
            }
            return text;
        },
        sort: {
            dynamicSort: function(property) {
                var sortOrder = 1;
                if(property[0] === '-') {
                    sortOrder = -1;
                    property = property.substr(1);
                }
                return function(a, b) {
                    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
                    return result * sortOrder;
                };
            }
        },
        commands : [
            {
                caption : 'Settings',
                execute : function() {
                    ACRL.openSettings();
                }
            }
        ],
        addCommands : function(cmd) {
            if (typeof GM_registerMenuCommand != 'undefined') {
                GM_registerMenuCommand(ACRL.changeLang(ACRL.name)+' - '+ACRL.changeLang(cmd.caption), cmd.execute);
            }
        },
        registerCommands : function() {
            ACRL.commands.forEach(function(cmd) {
                ACRL.addCommands(cmd);
            });
        },
        checkRememberLogin: function() {
            ACRL.checkboxs = document.querySelectorAll('input[type=checkbox]');
            if(ACRL.checkboxs) {
                for(var i = 0; i < ACRL.checkboxs.length; i++) {
                    var checkbox = ACRL.checkboxs[i];
                    ACRL.checkValues(checkbox);
                    ACRL.checkTexts(checkbox);
                }
            }
        },
        waitForElement: function(selector, callback, limit, delay) {
            if(limit === undefined) {
                limit = 10000;
            }
            if(delay === undefined) {
                delay = 100;
            }
            if( delay <= 0 ) {
                delay = 1;
            }
            if(document.querySelectorAll(selector).length) {
                callback(document.querySelectorAll(selector));
            } else {
                if(!limit) {
                    return;
                } else {
                    setTimeout(function() {
                        ACRL.waitForElement(selector, callback, (limit > delay)?(limit - delay):0, delay);
                    }, (limit > delay)?delay:limit);
                }
            }
        },
        createPattern: function(value) {
            return new RegExp(value, 'i');
        },
        getCheckBoxText: function(element) {
            var checkboxElementText = element;
            var checkboxText = null;
            do {
                checkboxElementText = checkboxElementText.nextSibling;
                if(checkboxElementText) {
                    checkboxText = (checkboxElementText.textContent || checkboxElementText.innerText || checkboxElementText.nodeValue || checkboxElementText.innerHTML).trim();
                } else {
                    checkboxText = null;
                    break;
                }
            } while (!checkboxText);
            return checkboxText;
        },
        checkValue: function(element, value) {
            var patt = ACRL.createPattern(value);
            if(patt.test(element.name) || patt.test(element.id) || patt.test(element.className) || patt.test(element.value)) {
                return true;
            }
            return false;
        },
        checkText: function(checkboxText, text) {
            var patt = ACRL.createPattern(text);
            if(patt.test(checkboxText)) {
                return true;
            }
            return false;
        },
        checkValues: function(checkbox) {
            if(ACRL.options.masks.values && checkbox.checked !== ACRL.options.checked) {
                for(var i = 0; i < ACRL.options.masks.values.length; i++) {
                    var value = ACRL.options.masks.values[i];
                    if(ACRL.checkValue(checkbox, value)) {
                        checkbox.click();
                        break;
                    }
                }
            }
        },
        checkTexts: function(checkbox) {
            if(ACRL.options.masks.texts && checkbox.checked !== ACRL.options.checked) {
                var checkboxText = ACRL.getCheckBoxText(checkbox);

                if(checkboxText) {
                    for(var i = 0; i < ACRL.options.masks.texts.length; i++) {
                        var text = ACRL.options.masks.texts[i];
                        if(ACRL.checkText(checkboxText, text)) {
                            checkbox.click();
                            break;
                        }
                    }
                }
            }
        },
        openSettings: function() {
            ACRL.loadSettings();
            var itemLanguages = ACRL.getLangs();
            itemLanguages.unshift({ value: undefined, label: ACRL.changeLang('Browser default') });
            var comboboxLanguage = new ACRL.form.Select(ACRL.changeLang('Language') + ':', { required: true, items: itemLanguages, value: ACRL.options.language }, function(e) {
                ACRL.options.language = e.target.value;
                if(e.target.value  === "undefined") {
                    ACRL.options.language = undefined;
                }
                ACRL.setSettings();
                ACRL.openSettings();
            });
            comboboxLanguage.selectElement.value = ACRL.options.language;
            var checkboxUncheck = new ACRL.form.CheckInput('checkbox', ACRL.changeLang('Uncheck all remember login checkbox'), { checked: !ACRL.options.checked }, function(e) {
                ACRL.options.checked = !e.target.checked;
                ACRL.setSettings();
            });
            var textboxLimitWait = new ACRL.form.Control('number', ACRL.changeLang('Limit wait') + ' (ms):', { required: true, value: ACRL.options.wait.limit, min: 0, disabled: !ACRL.options.wait.enable }, function(e) {
                ACRL.options.wait.limit = e.target.value;
                ACRL.setSettings();
            });
            var textboxDelayWait = new ACRL.form.Control('number', ACRL.changeLang('Delay wait') + ' (ms):', { required: true, value: ACRL.options.wait.delay, min: 1, disabled: !ACRL.options.wait.enable }, function(e) {
                ACRL.options.wait.delay = e.target.value;
                ACRL.setSettings();
            });
            var checkboxEnableWait = new ACRL.form.CheckInput('checkbox', ACRL.changeLang('Wait until a checkbox is found'), { checked: ACRL.options.wait.enable }, function(e) {
                textboxLimitWait.inputElement.disabled = !e.target.checked;
                textboxDelayWait.inputElement.disabled = !e.target.checked;
                ACRL.options.wait.enable = e.target.checked;
                ACRL.options.wait.limit = textboxLimitWait.inputElement.value;
                ACRL.options.wait.delay = textboxDelayWait.inputElement.value;
                ACRL.setSettings();
            });
            var formElement = ACRL.createElement('acrl-form', undefined, [comboboxLanguage.element, checkboxUncheck.element, checkboxEnableWait.element, textboxLimitWait.element, textboxDelayWait.element]);
            var buttonResetElement = ACRL.createElement('button', { class: 'acrl-btn red' }, ACRL.changeLang('Reset settings'));
            ACRL.Dialog.closeId('modal-setting');
            var dialog = new ACRL.Dialog(ACRL.changeLang(ACRL.name)+' - '+ACRL.changeLang('Settings'), formElement, 'modal-setting', [buttonResetElement/*, buttonCloseElement*/]);
            buttonResetElement.onclick = function() {
                ACRL.resetSettings();
                ACRL.openSettings();
            };
            dialog.show();
        },
        Dialog: (function() {
            function Dialog(title, htmlContent, id, buttonFooters) {
                if(typeof(id) === "undefined") {
                    id = 'modal-'+(Math.floor(Math.random() * 1000000) + 1);
                }
                this.title = title;
                this.htmlContent = htmlContent;
                this.id = id;
                var buttonCloseElement = ACRL.createElement('button', { 'class': 'acrl-close' }, '\u00d7');
                var modalHeaderElement = ACRL.createElement('div', { 'class': 'acrl-modal-header' }, [this.title, buttonCloseElement]);
                var modalBodyElement = ACRL.createElement('div', { 'class': 'acrl-modal-body' }, this.htmlContent);
                var modalFooterElement = ACRL.createElement('div', { 'class': 'acrl-modal-footer' }, buttonFooters);
                var modalContentElement = ACRL.createElement('div', { 'class': 'acrl-modal-content' }, [modalHeaderElement, modalBodyElement, modalFooterElement]);
                var modalElement = ACRL.createElement('div', { 'class': 'acrl-modal', 'id': this.id }, [modalContentElement]);
                buttonCloseElement.onclick = this.close.bind(this);
                modalElement.onclick = this.close.bind(this);
                modalContentElement.onclick = function(e) {
                    e.stopPropagation();
                };
                this.dialog = modalElement;
            }
            Dialog.prototype = {
                show: function() {
                    document.body.appendChild(this.dialog);
                },
                close: function(dialog) {
                    this.dialog.remove();
                }
            };
            Dialog.closeId = function(id) {
                if(document.getElementById(id) !== null) {
                    document.getElementById(id).remove();
                }
            };
            return Dialog;
        }()),
        form: {
            Control: (function() {
                function Control(type, label, attribute, event) {
                    if(typeof(attribute) !== 'object') {
                        attribute = {};
                    }
                    if(typeof(attribute.id) === 'undefined') {
                        attribute.id = type+'-'+(Math.floor(Math.random() * 1000000) + 1);
                    }
                    var inputElement = ACRL.createElement('input', attribute);
                    inputElement.type = type;
                    inputElement.className = 'acrl-form-control';
                    var labelElement = ACRL.createElement('label', { for: attribute.id }, label);
                    var controlElement = ACRL.createElement('div', { class: 'acrl-form-group', }, [labelElement, inputElement]);
                    this.label = label;
                    this.id = attribute.id;
                    this.inputElement = inputElement;
                    this.element = controlElement;
                    inputElement.oninput = event;
                    if(type === 'number') {
                        inputElement.oninput = function(e) {
                            e.target.value = parseInt(e.target.value) ? e.target.value.replace(/^0+/, '') : (this.min || 0);
                            event(e);
                        };
                    } else {
                        inputElement.oninput = event;
                    }
                }
                Control.prototype = {
                    oninput: function(event) {
                        this.inputElement.oninput = function(e) {
                            e.target.value = parseInt(e.target.value) ? e.target.value.replace(/^0+/, '') : (this.min || 0);
                            event(e);
                        };
                    }
                };
                return Control;
            }()),
            Select: (function() {
                function Select(label, attribute, event) {
                    var items = [],
                        itemElements = [];
                    if(typeof(attribute) !== 'object') {
                        attribute = {};
                    }
                    if(typeof(attribute.id) === 'undefined') {
                        attribute.id = 'select-'+(Math.floor(Math.random() * 1000000) + 1);
                    }
                    if(typeof(attribute.items) !== 'undefined') {
                        items = attribute.items;
                        delete attribute.items;
                    }
                    var selectElement = ACRL.createElement('select', attribute);
                    selectElement.className = 'acrl-form-control';
                    if(!Array.isArray(items)) {
                        items = [items];
                    }
                    for(var i = 0; i < items.length; i++) {
                        var text = items[i].label;
                        delete items[i].label;
                        var itemElement = ACRL.createElement('option', items[i], text);
                        selectElement.appendChild(itemElement);
                        itemElements.push(itemElement);
                    }
                    var labelElement = ACRL.createElement('label', { for: attribute.id }, label);
                    var controlElement = ACRL.createElement('div', { class: 'acrl-form-group', }, [labelElement, selectElement]);
                    this.label = label;
                    this.id = attribute.id;
                    this.selectElement = selectElement;
                    this.element = controlElement;
                    this.itemElements = itemElements;
                    selectElement.onchange = event;
                }
                Select.prototype = {
                    onchange: function(event) {
                        this.selectElement.onchange = event();
                    }
                };
                return Select;
            }()),
            CheckInput: (function() {
                function CheckInput(type, label, attribute, event) {
                    if(typeof(attribute) !== 'object') {
                        attribute = {};
                    }
                    if(typeof(attribute.id) === 'undefined') {
                        attribute.id = type+'-'+(Math.floor(Math.random() * 1000000) + 1);
                    }
                    var inputElement = ACRL.createElement('input', attribute);
                    inputElement.type = type;
                    inputElement.className = 'acrl-form-check-input';
                    var textElement = ACRL.createElement('span', undefined, label);
                    var labelElement = ACRL.createElement('label', { class: 'acrl-form-check-label' }, [inputElement, textElement]);
                    var checkInputElement = ACRL.createElement('div', { class: 'acrl-form-check', }, labelElement);
                    this.label = label;
                    this.id = attribute.id;
                    this.inputElement = inputElement;
                    this.element = checkInputElement;
                    inputElement.onchange = event;
                }
                CheckInput.prototype = {
                    onchange: function(event) {
                        this.inputElement.onchange = event;
                    },
                };
                CheckInput.createGroup = function(name, checkInputs) {
                    var checkInputGroup = ACRL.createElement('div', { class: 'acrl-form-group', id: name});
                    for(var i = 0; i < checkInputs.length; i++) {
                        var checkInput = checkInputs[i];
                        checkInput.inputElement.name = name;
                        checkInputGroup.appendChild(checkInput.element);
                    }
                    return checkInputGroup;
                };
                return CheckInput;
            }()),
        },
        createElement: function(element, attribute, inner) {
            if(typeof(element) === "undefined") {
                return false;
            }
            if(typeof(inner) === "undefined") {
                inner = "";
            }
            var el = document.createElement(element);
            if(typeof(attribute) === 'object') {
                for(var key in attribute){
                    el.setAttribute(key,attribute[key]);
                }
                if(typeof(attribute.disabled) !== 'undefined') {
                    el.disabled = attribute.disabled;
                }
                if(typeof(attribute.checked) !== 'undefined') {
                    el.checked = attribute.checked;
                }
                if(typeof(attribute.required) !== 'undefined') {
                    el.required = attribute.required;
                }
            }
            if(!Array.isArray(inner)) {
                inner = [inner];
            }
            for(var k = 0; k < inner.length; k++) {
                if(inner[k].nodeName) {
                    el.appendChild(inner[k]);
                } else {
                    el.appendChild(document.createTextNode(inner[k]));
                }
            }
            return el;
        }
    };

    GM_addStyle([
        '[class*="acrl-"], [class*="acrl-"] * { color: #333; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 400; line-height: 1.5; padding: 0; margin: 0; min-width: auto; min-height: auto; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }',
        '[class*="acrl-"]:before, [class*="acrl-"]:after, [class*="acrl-"] *:before, [class*="acrl-"] *:after { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }',
        '.inline[class*="acrl-"] { display: inline-block; }',
        '.inline[class*="acrl-"] + .inline { margin-left: 10px }',
        /*modal*/
        '.acrl-modal { z-index: 9999999999; padding-top: 100px; position: fixed; top: 0; right: 0; bottom: 0; left: 0; overflow: auto; background-color: rgba(0,0,0,0.5); }',
        '.acrl-modal-content { margin: auto; background-color: #fff; position: relative; outline: 0; width: 600px; }',
        '.acrl-modal-header { color: #fff; background-color: #2196F3; padding: 15px; font-weight: 700; position: relative; }',
        '.acrl-modal-body { padding: 15px; }',
        '.acrl-modal-footer { background-color: #f9f9f9; border-top: 1px solid #ddd; padding: 8px 15px; text-align: right; }',
        '.acrl-modal-footer > button + button {  margin-left: 8px; }',
        '.acrl-modal-footer:empty { display: none; }',
        '.acrl-modal-footer:before, .acrl-modal-footer:after { content: ""; display: table; clear: both; }',
        '.acrl-modal .acrl-close { position: absolute; right: 0; top: 0; bottom: 0; padding: 0 20px; border: none; box-shadow: none; border-radius: 0; outline: 0; text-decoration: none; color: inherit; background-color: inherit; font-size: 24px; font-weight: 700; }',
        '.acrl-modal .acrl-close:hover { color: #fff; background-color: #f44336; }',
        /*form*/
        '.acrl-form-group > label { display: inline-block; margin-bottom: 5px; }',
        '.acrl-form-control { padding: 5px 10px; color: #333; background-color: #fff; border: 1px solid #ccc; width: 100%; display: block; margin-bottom: 10px }',
        '.acrl-form-group.inline .acrl-form-control { display: inline-block; margin-left: 8px; width: auto; }',
        '.acrl-form-control[disabled] { background-color: #eee; color: #888 }',

        '.acrl-form-check { display: block; margin-bottom: 10px; }',
        '.acrl-form-group.inline .acrl-form-check { display: inline-block; }',
        '.acrl-form-group.inline .acrl-form-check + .acrl-form-check { margin-left: 10px; }',
        '.acrl-form-check-label { position: relative; padding: 0; margin: 0; display: inline-block; }',
        '.acrl-form-check-input { display: none !important; }',
        'input.acrl-form-check-input + span, input.acrl-form-check-input + span { padding: 0; margin: 0; }',
        '.acrl-form-check-input + span:before { position: relative; top: 5px; display: inline-block; width: 20px; height: 20px; content: ""; border: 2px solid #c0c0c0; margin-right: 8px }',
        '.acrl-form-check-input:checked + span:before { border-color: #3e97eb; }',
        '.acrl-form-check-input:checked + span:after { content: ""; position: absolute; }',
        '.acrl-form-check-input[type="checkbox"] +span:before { border-radius: 2px; }',
        '.acrl-form-check-input[type="checkbox"]:checked + span:before { background: #3e97eb; }',
        '.acrl-form-check-input[type="checkbox"]:checked + span:after { top: 8px; left: 7px; width: 6px; height: 12px; transform: rotate(45deg); border: 2px solid #fff; border-top: 0; border-left: 0; }',
        '.acrl-form-check-input[type="radio"] +span:before { border-radius: 50%; }',
        '.acrl-form-check-input[type="radio"]:checked + span:after { top: 10px; left: 5px; width: 10px; height: 10px; border-radius: 50%; background: #3e97eb; }',
        /*button*/
        '.acrl-btn { padding: 5px 10px; color: #333; background-color: #fff; border: 1px solid #ccc; }',
        '.acrl-btn:hover { color: #333; background-color: #e6e6e6; }',
        '.acrl-btn.blue { color: #fff; background-color: #2196F3; border-color: #2196F3; }',
        '.acrl-btn.red { color: #fff; background-color: #f44336; border-color: #f44336; }',
        '.acrl-btn.left { float: left; }'
    ].join('\n'));
    ACRL.init();
})();