'use strict';

var pytangular = {
	// Hold all configuration variables defined in the directive
	config: {},
	// Hold the form field names
	resetableFields: [],
	resetableDefaultFields: [],
	// Normal HTML5 field skeletons
	simpleSkeletons: {
		formSkeleton: '<form role="form" data-ng-submit="«fnSubmit»" id="«formName»" name="«formName»">«formContent» «buttons»</form>',
		fieldSetSkeleton: '<fieldset><legend>«fieldSetLegend»</legend>«fieldSetContent»</fieldset>',
		fieldSkeleton: '<span data-ng-class="«formModel».fieldError[\'«fieldName»\'] ? \'has-error form-group \' : \'has-success form-group \'">«fieldContent»' +
			'<span class="help-block" data-ng-if="«formModel».fieldError[\'«fieldName»\']" data-ng-bind="«formModel».fieldError[\'«fieldName»\']"></span></span>' +
			'<span class="help-block">«helperText»</span>',
		widgets : {
			defaultTemplate: '<input type="«inputType»" class="form-control" id="«fieldId»" data-ng-model="«ngModel»" name="«fieldName»" «inputAttrs» «popOver»/>',
			select: '<select class="form-control" data-ng-model="«ngModel»" id="«fieldId»" «inputAttrs» data-ng-options="item.value as item.label for item in «itemsList»"></select>',
			textarea: '<textarea class="form-control" data-ng-model="«ngModel»" id="«fieldId»" «inputAttrs» «popOver»></textarea>',
			checkbox: ' <input type="checkbox" id="«fieldId»" data-ng-model="«ngModel»" name="«fieldName»" «inputAttrs» «popOver»/>',
			typeahead: '<input type="text" ng-model="«ngModel»" «inputAttrs» «popOver» typeahead="item for item in «typeaheadList» | filter:$viewValue | limitTo:8" class="form-control">',
		},
		 labelSkeleton: '<label for="«fieldName»" «inputTitle» class="control-label">«fieldLabel»</label>',
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
					// TODO: Fix the buttons configuration with xeditable
						'«buttons»' +
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
	build: function () {
		var modelName = pytangular.config.modelName;
		var form = pytangular.config.form;
		var formTemplate = '';
		var fieldsTemplate = '';

		// Allow select the kind of skeleton to use, if simples field or xeditable
		if (pytangular.config.xeditable == false || undefined) {
			var formKind = 'simpleSkeletons';
		} else if (pytangular.config.xeditable == 'true'){
			var formKind = 'xeditableSkeletons';
		}

		// Hold all fieldSets
		var allFieldSets = [];

		// Count the fieldSets and register its indexes
		var fsetIndex = 0;

		form.fieldsets.forEach(function (fieldset) {
			// Hold individual fieldSets
			var aFieldSet = {};

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
					ngModel += modelName + '.' + field.model;
				}

				var fieldTitle = '';
				// Inset all attributes if exists
				if (field.input_attrs) {
					for (var key in field.input_attrs) {
						aFieldAttrs += key + '="' + field.input_attrs[key] + '" ';
						// Capture fild title if exists to inset also in the label
						if (key == 'title') {
							fieldTitle = 'title="' + field.input_attrs[key] + '"';
						}
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
				// Define helper text if exists
				aField = aField.replace(/«helperText»/g, field.helperText || '');

				// Define title to label if exists
				aField = aField.replace(/«inputTitle»/g, fieldTitle);

				// Define a popover if exists
				if (field.popover) {
					var poptrigger = field.popover.trigger || 'mouseenter';
					var popoverAtrr = 'Popover-animation="true" popover="' + field.popover.msg + '" popover-trigger="' + poptrigger + '"';
					// Popover
					var placement = field.popover.placement || 'top';
					popoverAtrr = ' popover-placement="' + field.popover.placement + '"' + popoverAtrr;
				}
				aField = aField.replace(/«popOver»/g, popoverAtrr || '');

				// Define the models
					aField = aField.replace(/«formModel»/g, modelName || ' ');
					aField = aField.replace(/«ngModel»/g, ngModel || ' ');

				// Inset this field into the aFieldSet object organized by field name
				aFieldSet[field.name] = aField;
			});

			// Call buildFieldSets function to build this fieldSet with the fields template if there is one
			// The result will be inserted in the templatedFieldSet variable, that hold the final
			// version of the fieldset with the template applied on the fields
			var templatedFieldSet = pytangular.buildFieldSets(aFieldSet, fieldset.legend, fsetIndex, form, formKind);
			// Increment de fieldSet index
			fsetIndex++;

			// Insert this fieldSet into allFieldSets array organized by fieldset index
			allFieldSets.push(templatedFieldSet);
		});
		console.log(allFieldSets);
		// Insert all fields inside formSkeleton
		formTemplate = pytangular[formKind].formSkeleton.replace(/«formContent»/g, allFieldSets);
		// Insert form name
		formTemplate = formTemplate.replace(/«formName»/g, form.name || ' ');
		// Insert form submit function
		formTemplate = formTemplate.replace(/«fnSubmit»/g, form.fnSubmit || ' ');

		// Add form buttons if is present
		if (form.buttons) {
			var btTemplate = '';
			form.buttons.forEach(function (button) {
				// Make bootstrap classes more easy or use user custom class
				if (!button.class) {
					var btClass = 'btn btn-default';
				} else {
					if (button.class == 'success') {
						var btClass = 'btn btn-success';
					} else if (button.class == 'info') {
						var btClass = 'btn btn-info';
					} else if (button.class == 'warning') {
						var btClass = 'btn btn-warning';
					} else if (button.class == 'danger') {
						var btClass = 'btn btn-danger';
					} else if (button.class == 'primary') {
						var btClass = 'btn btn-primary';
					} else {
						var btClass = button.class;
					}
				}
				// Check type of buttom
				if (button.type) {
					var btType = ' type="' + button.type + '"';
				} else {
					var btType = '';
				}
				// Check for icon and make more easy
				if (button.icon) {
					var btIcon = '<span class="glyphicon glyphicon-' + button.icon + '"></span> ';
				} else {
					var btIcon = '';
				}

				// Inset all attributes if exists
				var btAttrs = ' ';
				if (button.attrs) {
					for (var key in button.attrs) {
						btAttrs += key + '="' + button.attrs[key] + '" ';
					}
				}

				btTemplate += '<button class="' + btClass + '"' + btType + btAttrs + '>' + btIcon + button.label + '</button> ';
			});
		}

		// Insert the buttons into the form
		formTemplate = formTemplate.replace(/«buttons»/g, btTemplate || '');
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
	},
	buildFieldSets: function (fieldSet, fsetLegend, fsetIndex, form, formKind) {
		//form.fieldsTemplate[fsetIndex]
		var fieldSetContent = '';
		// Add the field set content if there is a fieldset / legend
		if (fsetLegend) {
			fieldSetContent = pytangular[formKind].fieldSetSkeleton.replace(/«fieldSetLegend»/g, fsetLegend);
		}

		// If there is a fieldSet insert each one into fieldSetContent
		// else insert just the normal fields into the fieldSetContent variable
		if (fsetLegend) {
			fieldSetContent = fieldSetContent.replace(/«fieldSetContent»/g, fieldSet);
		} else {
			fieldSetContent = fieldSet;
		}
		return fieldSetContent;
	},
};

dvApp.directive('pytangular', function ($compile) {
	return {
		restrict: 'E',
		link: function ($scope, element, attrs) {
			var form = $scope[attrs.form];
			var xeditable = attrs.xeditable || false;
			var fieldvalues = $scope[attrs.fieldvalues] || [];
			var model = $scope[attrs.model] || 'pytangular';
			var modelName = attrs.model || 'pytangular';


			// Create field error
			model.fieldError = {};
			// Create field helper
			model.fieldHelper = {};

			//Add configurations from attrs into pytangular
			pytangular.config = {
				form: form,
				xeditable: xeditable,
				fieldvalues: fieldvalues,
				model: model,
				modelName: modelName,
			};
			if (form) {
				var template = pytangular.build();
				var linkFn = $compile(template);
				var content = linkFn($scope);
				element.append(content);
				// Populate the form if values exists
				pytangular.populate(form, model, fieldvalues);
			}
		},
	};
});
