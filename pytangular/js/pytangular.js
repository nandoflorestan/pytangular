'use strict';

var pytangular = {
	// Normal HTML5 field skeletons
	simpleSkeletons: {
		formSkeleton: '<form role="form" data-ng-submit="«fnSubmit»" name="«formName»">«formContent»</form>',
		fieldSetSkeleton: '<fieldset><legend>«fieldSetLegend»</legend>«fieldSetContent»</fieldset>',
		fieldSkeleton: '<div data-ng-class="models.fieldError[\'«fieldName»\'] ? \'has-error form-group \' : \'has-success form-group \'">«fieldContent»</div>' +
			'<span class="help-block" data-ng-if="models.fieldError[\'«fieldName»\']" data-ng-bind="models.fieldError[\'«fieldName»\']"></span>',
		widgets : {
			defaultTemplate: '<input type="«inputType»" class="form-control" id="«fieldId»" data-ng-model="«ngModel»" name="«fieldName»" «inputAttrs»/>',
			select: '<select class="form-control" data-ng-model="«ngModel»" id="«fieldId»" «inputAttrs» data-ng-options="item.value as item.label for item in «itemsList»"></select>',
			textarea: '<textarea class="form-control" data-ng-model="«ngModel»" id="«fieldId»" «inputAttrs»></textarea>',
			checkbox: ' <input type="checkbox" id="«fieldId»" data-ng-model="«ngModel»" name="«fieldName»" «inputAttrs»/>',
		},
		 labelSkeleton: '<label for="«fieldName»" class="control-label">«fieldLabel»</label>',
	},
	// Xeditable skeletons
	xeditableSkeletons: {
		formSkeleton: '<form role="form" editable-form onaftersave="«fnSubmit»" name="«formName»">«formContent»</form>',
		fieldSetSkeleton: '<fieldset><legend>«fieldSetLegend»</legend>«fieldSetContent»</fieldset>',
		fieldSkeleton: '<div data-ng-class="models.fieldError[\'«fieldName»\'] ? \'has-error form-group \' : \'has-success form-group \'">«fieldContent»</div>' +
			'<span class="help-block" data-ng-if="models.fieldError[\'«fieldName»\']" data-ng-bind="models.fieldError[\'«fieldName»\']"></span>',
		widgets : {
			defaultTemplate: '<span editable-«inputType»="«ngModel»" e-name="«fieldName»" onbeforesave="checkName($data)" e-required>{{ «ngModel» || "empty" }}</span>'
		},
		 labelSkeleton: '<label for="«fieldName»" class="control-label">«fieldLabel»</label>',
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
			console.log('fieldset', fieldset);
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
				if ((field.widget != 'textarea') && (field.widget != 'select') && (field.widget != 'checkbox')) {
					// All other input types (text, number, password, etc)
					aField += pytangular[formKind].widgets.defaultTemplate;
					aField = aField.replace(/«inputType»/g, field.widget);
				} else if (field.widget == 'textarea') {
					aField += pytangular[formKind].widgets.textarea;
				} else if (field.widget == 'select') {
					aField += pytangular[formKind].widgets.select;
				} else if (field.widget == 'checkbox') {
					aField += pytangular[formKind].widgets.checkbox;
				}

				// If is a select define the list of values
				if (field.widget == 'select') {
					aField = aField.replace(/«itemsList»/g, field.options);
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
					if (form.model) {
						ngModel += form.model + '.';
					} else {
						ngModel += 'pytangular.';
					}
					ngModel += field.model;
				}
				// Inset all attributes if exists
				if (field.input_attrs) {
					for (var key in field.input_attrs) {
						aFieldAttrs += key + '="' + field.input_attrs[key] + '" ';
					}
				}
				// If is checklist check for true or false special values
				if (field.widget='checkbox') {
					if (field['true-value'])
					{
						aFieldAttrs += 'data-ng-true-value="\'' + field['true-value'] + '\'" ';
					}
					if (field['false-value']) {
						aFieldAttrs += 'data-ng-false-value="\'' + field['false-value'] + '\'" ';
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
				if (field.default && (values[counter] == undefined || !values[counter][field.name])) {
					model[field.model] = field.default;
				} else {
					if (values[counter] != undefined) {
						model[field.model] = values[counter][field.name];
					}
				}
				counter++;
			});
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
