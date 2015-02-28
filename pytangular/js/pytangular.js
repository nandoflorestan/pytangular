'use strict';

var pytangular = {
	skeletons: {
		formSkeleton: '<form role="form" data-ng-submit="«fnSubmit»" name="«formName»">«formContent»</form>',
		fieldSetSkeleton: '<fieldset><legend>«fieldSetLegend»</legend>«fieldSetContent»</fieldset>',
		fieldSkeleton: '<div data-ng-class="models.fieldError[\'«fieldName»\'] ? \'has-error form-group \' : \'has-success form-group \'">«fieldContent»</div>' +
			'<span class="help-block" data-ng-if="models.fieldError[\'«fieldName»\']" data-ng-bind="models.fieldError[\'«fieldName»\']"></span>',
		widgets : {
			defaultTemplate: '<input type="«inputType»" class="form-control" id="«fieldId»" name="«fieldName»" «inputAttrs»/>',
			select: '<select class="form-control" id="«fieldId»" «inputAttrs» data-ng-options="item.value as item.label for item in «itemsList»"></select>',
			textarea: '<textarea class="form-control" id="«fieldId»" «inputAttrs»></textarea>',
			checkbox: ' <input type="checkbox" id="«fieldId»" name="«fieldName»" «inputAttrs»/>',
		},
		 labelSkeleton: '<label for="«fieldName»" class="control-label">«fieldLabel»</label>',
	},
	build: function (form) {
		var formTemplate = '';
		var fieldsTemplate = '';
		var fieldSetsTemplate = '';

		// Hold all fieldSets
		var tempForm = '';

		form.fieldsets.forEach(function (fieldset) {
			console.log('fieldset', fieldset);
			// Hold individual fieldSets
			var aFieldSet = '';
			// Add the field set template if there is a field set
			if (fieldset.legend) {
				fieldSetsTemplate = pytangular.skeletons.fieldSetSkeleton.replace(/«fieldSetLegend»/g, fieldset.legend);
			}

			fieldset.fields.forEach(function (field) {
				// Hold individual fields;
				var aField = '';
				// Define label if exists
				if (field.label) {
					aField += pytangular.skeletons.labelSkeleton;
					aField = aField.replace(/«fieldLabel»/g, field.label);
				}

				// Define the type of field and get the input template
				if ((field.widget != 'textarea') && (field.widget != 'select') && (field.widget != 'checkbox')) {
					// All other input types (text, number, password, etc)
					aField += pytangular.skeletons.widgets.defaultTemplate;
					aField = aField.replace(/«inputType»/g, field.widget);
				} else if (field.widget == 'textarea') {
					aField += pytangular.skeletons.widgets.textarea;
				} else if (field.widget == 'select') {
					aField += pytangular.skeletons.widgets.select;
				} else if (field.widget == 'checkbox') {
					aField += pytangular.skeletons.widgets.checkbox;
				}

				// If is a select define the list of values
				if (field.widget == 'select') {
					aField = aField.replace(/«itemsList»/g, field.options);
				}

				// Build all other field attributes
				var aFieldAttrs = '';
				// TODO: Find a real solution for this!
				if (!field.model) {
					field.model = field.name;
				}
				// If there is a data-ng-model attr
				if (field.model) {
					aFieldAttrs = 'data-ng-model="';
					if (form.model) {
						aFieldAttrs += form.model + '.';
					}
					aFieldAttrs += field.model + '" ';
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
				aField = pytangular.skeletons.fieldSkeleton.replace(/«fieldContent»/g, aField);

				// Change all «fieldName» references to real fieldName
				aField = aField.replace(/«fieldName»/g, field.name);

				// Define id if it exists or use field name
				if (field.id) {
					aField = aField.replace(/«fieldId»/g, field.id);
				} else {
					aField = aField.replace(/«fieldId»/g, field.name);
				}

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
		formTemplate = pytangular.skeletons.formSkeleton.replace(/«formContent»/g, tempForm);
		// Insert form name
		formTemplate = formTemplate.replace(/«formName»/g, form.name);
		// Insert form submit function
		formTemplate = formTemplate.replace(/«fnSubmit»/g, form.fnSubmit);

		return formTemplate;
	},
	populate: function (form, model, values) {
		form.fieldsets.forEach(function (fieldset) {
			var counter = 0;
			fieldset.fields.forEach(function (field) {
				if (field.model) {
					if (field.default && !values[field.name]) {
						model[field.model] = field.default;
					} else {
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
