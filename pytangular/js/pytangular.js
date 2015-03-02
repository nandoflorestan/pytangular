'use strict';

var pytangular = {
	// Hold the form field names
	resetableFields: [],
	resetableDefaultFields: [],
	// Normal HTML5 field skeletons
	simpleSkeletons: {
		formSkeleton: '<form role="form" data-ng-submit="«fnSubmit»" id="«formName»" name="«formName»">«formContent»</form>',
		fieldSetSkeleton: '<fieldset><legend>«fieldSetLegend»</legend>«fieldSetContent»</fieldset>',
		fieldSkeleton: '<div data-ng-class="«formModel».fieldError[\'«fieldName»\'] ? \'has-error form-group \' : \'has-success form-group \'">«fieldContent»</div>' +
			'<span class="help-block" data-ng-if="«formModel».fieldError[\'«fieldName»\']" data-ng-bind="«formModel».fieldError[\'«fieldName»\']"></span>',
		widgets : {
			defaultTemplate: '<input type="«inputType»" class="form-control" id="«fieldId»" data-ng-model="«ngModel»" name="«fieldName»" «inputAttrs»/>',
			select: '<select class="form-control" data-ng-model="«ngModel»" id="«fieldId»" «inputAttrs» data-ng-options="item.value as item.label for item in «itemsList»"></select>',
			textarea: '<textarea class="form-control" data-ng-model="«ngModel»" id="«fieldId»" «inputAttrs»></textarea>',
			checkbox: ' <input type="checkbox" id="«fieldId»" data-ng-model="«ngModel»" name="«fieldName»" «inputAttrs»/>',
			typeahead: '<input type="text" ng-model="«ngModel»" «inputAttrs» typeahead="item for item in «typeaheadList» | filter:$viewValue | limitTo:8" class="form-control">',
		},
		 labelSkeleton: '<label for="«fieldName»" class="control-label">«fieldLabel»</label>',
	},
	// Xeditable skeletons
	xeditableSkeletons: {
		formSkeleton:
			'<form role="form" ' +
						'id="«formName»"' +
						'editable-form ' +
						'onaftersave="«fnSubmit»" ' +
						'name="«formName»">' +
				'«formContent»' +
				'<div class="buttons">' +
					'<button type="button" ' +
						'class="btn btn-default" ' +
						'data-ng-click="«formName».$show()" ' +
						'data-ng-show="!«formName».$visible"> Edit' +
					'</button>' +
					'<span ng-show="«formName».$visible">' +
						'<button type="submit" class="btn btn-primary" ' +
								'data-ng-disabled="«formName».$waiting"> Save' +
						'</button>' +
						' <button type="button" class="btn btn-default" ' +
								'ng-disabled="«formName».$waiting" ' +
								'ng-click="«formName».$cancel()"> Cancel' +
						'</button>' +
					'</span>' +
				'</div>' +
			'</form>',
		fieldSetSkeleton: '<fieldset style="margin-bottom: 2em;"><legend>«fieldSetLegend»</legend>«fieldSetContent»</fieldset>',
		fieldSkeleton: '<div class="form-group">«fieldContent»</div>',
		widgets : {
			defaultTemplate: ' <span editable-«inputType»="«ngModel»" e-name="«fieldName»" onbeforesave="check«fieldName»($data)" id="«fieldId»" data-ng-bind="«ngModel»"></span>',
			password: '<span editable-text="«ngModel»" id="«fieldId»" e-name="«fieldName»" onbeforesave="check«fieldName»($data)" e-type="password">******</span>',
			select: '<span editable-select="«ngModel»" e-ng-options="item.value as item.label for item in «itemsList»" data-ng-bind="«ngModel»"></span>',
			textarea: '<span editable-textarea="«ngModel»" id="«fieldId»" «inputAttrs»>' +
    					'<pre data-ng-bind="«ngModel»"></pre></span>',
    		checkbox: ' <span editable-checkbox="«ngModel»" id="«fieldId»" e-title="«title»">{{ «ngModel» && "«trueValue»" || "«falseValue»" }}<span>',
    		typeahead: ' <span editable-text="«ngModel»" «inputAttrs» e-typeahead="item for item in «typeaheadList» | filter:$viewValue | limitTo:8">{{ «ngModel» }}</span>',
		},
		 labelSkeleton: '<span class="title">«fieldLabel» </span>',
	},
	build: function (form) {
		var formTemplate = '';
		var fieldsTemplate = '';
		var fieldSetsTemplate = '';

		// Allow select the kind of skeleton to use, if simples field or xeditable
		if (form.kind == undefined) {
			var formKind = 'simpleSkeletons';
		} else if (form.kind == 'xeditable'){
			var formKind = 'xeditableSkeletons';
		}

		// Hold all fieldSets
		var tempForm = '';

		form.fieldsets.forEach(function (fieldset) {
			// Hold individual fieldSets
			var aFieldSet = '';
			// Add the field set template if there is a field set
			if (fieldset.legend) {
				fieldSetsTemplate = pytangular[formKind].fieldSetSkeleton.replace(/«fieldSetLegend»/g, fieldset.legend);
			}

			fieldset.fields.forEach(function (field) {
				// Hold individual fields;
				var aField = '';
				// Define label if exists
				if (field.label) {
					aField += pytangular[formKind].labelSkeleton;
					aField = aField.replace(/«fieldLabel»/g, field.label  || ' ');
				}

				// Define the type of field and get the input template
				if ((field.widget != 'textarea') && (field.widget != 'select') && (field.widget != 'checkbox') && (field.widget != 'typeahead')) {
					// All other input types (text, number, password, etc)
					// Xeditable uses a different password template
					if (field.widget == 'password' && formKind == 'xeditableSkeletons') {
						aField += pytangular[formKind].widgets.password;
					} else {
						// Default inputs
						aField += pytangular[formKind].widgets.defaultTemplate;
					}
					aField = aField.replace(/«inputType»/g, field.widget);
				// Special inputs
				} else if (field.widget == 'textarea') {
					aField += pytangular[formKind].widgets.textarea;
				} else if (field.widget == 'select') {
					aField += pytangular[formKind].widgets.select;
				} else if (field.widget == 'checkbox') {
					aField += pytangular[formKind].widgets.checkbox;
				} else if (field.widget == 'typeahead') {
					aField += pytangular[formKind].widgets.typeahead;
				}

				// If is a select define the list of values
				if (field.widget == 'select') {
					aField = aField.replace(/«itemsList»/g, field.options);
				}
				// If is a typeahead define the list of values
				if (field.widget == 'typeahead') {
					aField = aField.replace(/«typeaheadList»/g, field.typeaheadList);
				}

				// Build all other field attributes
				var aFieldAttrs = '';
				// If there is no model use name as field model
				if (!field.model) {
					field.model = field.name;
				}
				// If there is a data-ng-model attr
				// This alow to build a model like: "mymodel.myfield"
				var ngModel = '';
				if (field.model) {
					// If there is a form model name use it, if not use
					// the default model "pytangular"
					if (!form.model) {
						form.model = 'pytangular';
					}
					ngModel += form.model + '.' + field.model;
				}
				// Inset all attributes if exists
				if (field.input_attrs) {
					for (var key in field.input_attrs) {
						aFieldAttrs += key + '="' + field.input_attrs[key] + '" ';
					}
				}
				// If is xeditable textarea change cols and rows to e-cols and e-rows
				if (field.widget == 'textarea' && formKind == 'xeditableSkeletons') {
					aFieldAttrs = aFieldAttrs.replace(/rows=/g, 'e-rows=');
					aFieldAttrs = aFieldAttrs.replace(/cols=/g, 'e-cols=');
				}
				// If is checklist check for true or false special values
				if (field.widget =='checkbox') {
					if (field['true-value'])
					{
						aFieldAttrs += 'data-ng-true-value="\'' + field['true-value'] + '\'" ';
					}
					if (field['false-value']) {
						aFieldAttrs += 'data-ng-false-value="\'' + field['false-value'] + '\'" ';
					}
					// Check if is xeditable checkbox and define false, true and title values
					if(formKind == 'xeditableSkeletons') {
						aField = aField.replace(/«trueValue»/g, field['true-value'] || 'Yes');
						aField = aField.replace(/«falseValue»/g, field['false-value'] || 'No');
						aField = aField.replace(/«title»/g, field['title']);
					}
				}

				// Insert all field attributes on the template
				aField = aField.replace(/«inputAttrs»/g, aFieldAttrs);

				// Insert the aField inside of fieldSkeleton
				aField = pytangular[formKind].fieldSkeleton.replace(/«fieldContent»/g, aField);

				// Change all «fieldName» references to real fieldName
				aField = aField.replace(/«fieldName»/g, field.name  || ' ');

				// Define id if it exists or use field name
				if (field.id) {
					aField = aField.replace(/«fieldId»/g, field.id  || ' ');
				} else {
					aField = aField.replace(/«fieldId»/g, field.name  || ' ');
				}
				// Define the models
					aField = aField.replace(/«formModel»/g, form.model || ' ');
					aField = aField.replace(/«ngModel»/g, ngModel || ' ');
				// Inset this field into the temp field set
				aFieldSet += aField;
			});

			// If there is a fieldSet isert each one into fieldSetsTemplate
			// Else insert just the normal fields into the fieldSetsTemplate variable
			if (fieldset.legend) {
				fieldSetsTemplate = fieldSetsTemplate.replace(/«fieldSetContent»/g, aFieldSet);
			} else {
				fieldSetsTemplate = aFieldSet;
			}

			// Insert this fieldSet into tempform
			tempForm += fieldSetsTemplate;
		});

		// Insert all fields inside formSkeleton
		formTemplate = pytangular[formKind].formSkeleton.replace(/«formContent»/g, tempForm);
		// Insert form name
		formTemplate = formTemplate.replace(/«formName»/g, form.name || ' ');
		// Insert form submit function
		formTemplate = formTemplate.replace(/«fnSubmit»/g, form.fnSubmit || ' ');

		return formTemplate;
	},
	populate: function (form, model, values) {
		var counter = 0;
		form.fieldsets.forEach(function (fieldset) {
			fieldset.fields.forEach(function (field) {
				// If there is no model use field name as model
				if (!field.model) {
					field.model = field.name;
				}
				// If there is a default and not info on this field
				if (field.default && (values[counter] == undefined || !values[counter][field.name])) {
					model[field.model] = field.default;
					// Mark all default fields with it's values to reset
					pytangular.resetableDefaultFields.push({ name: field.name, value: field.default });
				} else {
					if (values[counter] != undefined) {
						model[field.model] = values[counter][field.name];
					}
					// Mark all fields with no defaut option tho be resetable
					pytangular.resetableFields.push(field.name);
				}
				counter++;
			});
		});
	},
	reset: function (model) {
		pytangular.resetableFields.forEach(function (fieldName) {
			model[fieldName] = "";
		});
		pytangular.resetableDefaultFields.forEach(function (field) {
			model[field.name] = field.value;
		});
	}
};

dvApp.directive('pytangular', function ($compile) {
	return {
		restrict: 'E',
		link: function ($scope, element, attrs) {
			var form = $scope[attrs.form];
			if (form) {
				var template = pytangular.build(form);
				var linkFn = $compile(template);
				var content = linkFn($scope);
				element.append(content);
			}
		},
	};
});
