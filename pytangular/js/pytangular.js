'use strict';

var pytangular = {
	// A *config* variable is injected into this object.

	// TODO Remove actions in favor of formaction and formmethod.
	actions: {
		// submitForm: function (btIndex) {
		// 	var method = pytangular.config.formSpec.buttons[btIndex].method || 'POST';
		// 	var url = pytangular.config.formSpec.buttons[btIndex].url || '';
		// 	document.getElementById(pytangular.config.formSpecName).submit();
		// },
	},
	// Hold the form field names
	resetableFields: [],
	resetableDefaultFields: [],
	// Normal HTML5 field skeletons
	simpleSkeletons: {
		formSkeleton: '<form role="form" «fnSubmit» id="«formName»" name="«formName»">«formContent» «buttons»</form>',
		fieldSetSkeleton: '<fieldset><legend>«fieldSetLegend»</legend>«fieldSetContent»</fieldset>',
		fieldSkeleton: '<span data-ng-class="«formModel».errors[\'«fieldName»\'] ? \'has-error form-group \' : \'has-success form-group \'">«fieldContent»' +
			'<span class="error-msg" data-ng-if="«formModel».errors[\'«fieldName»\']" data-ng-bind="«formModel».errors[\'«fieldName»\']"></span></span>' +
			'<span class="help-block">«helpText»</span>',
		widgets : {
			inputGroup: '<div class="input-group">«prepend»«defaultTemplate»«append»</div>',
			prepend: '<div class="input-group-addon">«prependSymbol»</div>',
			append: '<div class="input-group-addon">«appendSymbol»</div>',
			defaultTemplate: '<input type="«inputType»" «size» class="form-control" id="«fieldId»" name="«fieldName»" data-ng-model="«ngModel»" «inputAttrs» «popOver»/>',
			select: '<select class="form-control" «selectedItem» data-ng-model="«ngModel»" id="«fieldId»" name="«fieldName»" «inputAttrs» data-ng-options="item.value as item.label for item in «itemsList»"></select>',
			textarea: '<textarea class="form-control" data-ng-model="«ngModel»" id="«fieldId»" name="«fieldName»" «inputAttrs» «popOver»></textarea>',
			checkbox: ' <input type="checkbox" id="«fieldId»" name="«fieldName»" data-ng-model="«ngModel»" «inputAttrs» «popOver»/>',
			typeahead: '<input data-ng-change="onChange_«fieldName»()" type="text" ng-model="«ngModel»" «inputAttrs» «popOver» id="«fieldId»" typeahead="item for item in «typeaheadList» | filter:$viewValue | limitTo:8" typeahead-on-select="onSelect_«fieldName»($item, $model, $label)" class="form-control">',
		},
		 labelSkeleton: '<label for="«fieldName»" «inputTitle» class="control-label">«fieldLabel»«labelStar» </label>',
	},
	// Xeditable skeletons
	xeditableSkeletons: {
		formSkeleton:
			'<form role="form" ' +
						'id="«formName»"' +
						'editable-form ' +
						'«fnSubmit» ' +
						'name="«formName»">' +
				'«formContent»' +
				'<div class="buttons">' +
					'<button type="button" ' +
						'class="btn btn-default" ' +
						'data-ng-click="«formName».$show()" ' +
						'data-ng-show="!«formName».$visible"> Edit' +
					'</button>' +
					'<span ng-show="«formName».$visible">' +
						'«buttons»' +
					'</span>' +
				'</div>' +
			'</form>',
		fieldSetSkeleton: '<fieldset style="margin-bottom: 2em;"><legend>«fieldSetLegend»</legend>«fieldSetContent»</fieldset>',
		fieldSkeleton: '<div class="form-group">«fieldContent»</div>',
		widgets : {
			defaultTemplate: '<br><span editable-«inputType»="«ngModel»" e-name="«fieldName»" onbeforesave="check«fieldName»($data)" e-id="«fieldId»" data-ng-bind="«ngModel»"></span>',
			password: '<br><span editable-text="«ngModel»" id="«fieldId»" e-name="«fieldName»" onbeforesave="check«fieldName»($data)" e-type="password">******</span>',
			select: '<br><span editable-select="«ngModel»" e-ng-options="item.value as item.label for item in «itemsList»" data-ng-bind="«ngModel»"></span>',
			textarea: '<br><span editable-textarea="«ngModel»" e-id="«fieldId»" «inputAttrs»>' +
    					'<pre data-ng-bind="«ngModel»"></pre></span>',
    		checkbox: ' <span editable-checkbox="«ngModel»" e-id="«fieldId»" e-title="«title»">{{ «ngModel» && "«trueValue»" || "«falseValue»" }}<span>',
    		typeahead: '<br><span editable-text="«ngModel»" e-id="«fieldId»" «inputAttrs» e-typeahead="item for item in «typeaheadList» | filter:$viewValue | limitTo:8" e-typeahead-on-select="onSelect_«fieldName»($item, $model, $label)">{{ «ngModel» }}</span>',
		},
		 labelSkeleton: '<span class="title" «inputTitle»>«fieldLabel»</span>«labelStar» ',
	},

	// TODO Switch to a more structured hierarchy:
	skeletons: {
		'simple': {},
		'xeditable': {},
	},

	build: function () {
		var modelName = pytangular.config.modelName;
		var formSpec = pytangular.config.formSpec;
		var formTemplate = '';

		if (pytangular.config.useXeditable) {
			var formKind = 'xeditableSkeletons';
		} else {
			var formKind = 'simpleSkeletons';
		}

		// Hold all fieldSets
		var allFieldSets = [];

		// Count all fields of all fieldSets and register its indexes as a single array
		// thats allow to create list os fields values that dont need now about fieldSets
		var fsetSumIndex = 0;
		// Count fieldSets and fields index
		var fsetIndex = 0;
		var fieldsIndex = 0;

		formSpec.fieldsets.forEach(function (fieldset) {
			// Hold individual fieldSets
			var aFieldSet = {};

			fieldset.fields.forEach(function (field) {
				// Hold individual fields;
				var aField = '';
				var aLabel = '';
				// Define label if exists
				if (field.label) {
					// aField += pytangular[formKind].labelSkeleton;
					// aField = aField.replace(/«fieldLabel»/g, field.label  || '');
					aLabel = pytangular[formKind].labelSkeleton;
					aLabel = aLabel.replace(/«fieldLabel»/g, field.label  || '');
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
						// Verify for append and prepend and add if exists
						if ((field.append || field.prepend) && formKind == 'simpleSkeletons') {
							var tempField = pytangular[formKind].widgets.inputGroup;
							if (field.prepend) var prepend = pytangular[formKind].widgets.prepend;
							if (field.append) var append = pytangular[formKind].widgets.append;

							tempField = tempField.replace(/«defaultTemplate»/g, aField);
							tempField = tempField.replace(/«prepend»/g, prepend || '');
							tempField = tempField.replace(/«append»/g, append || '');
							tempField = tempField.replace(/«prependSymbol»/g, field.prepend);
							tempField = tempField.replace(/«appendSymbol»/g, field.append);
							aField = tempField;
						}
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
					var optionPath = 'formSpec.fieldsets[' + fsetIndex + '].fields[' + fieldsIndex + '].options';
					if (field.default) {
						var selectedPath = 'data-ng-init="«ngModel»=formSpec.fieldsets[' + fsetIndex + '].fields[' + fieldsIndex + '].default"';
					} else {
						var selectedPath = 'data-ng-init="«ngModel»=formSpec.fieldsets[' + fsetIndex + '].fields[' + fieldsIndex + '].options[0].value"';
					}

					aField = aField.replace(/«itemsList»/g, optionPath);
					aField = aField.replace(/«selectedItem»/g, selectedPath);
				}
				// If is a typeahead define the list of values
				if (field.widget == 'typeahead') {
					var typeaheadList = 'formSpec.fieldsets[' + fsetIndex + '].fields[' + fieldsIndex + '].options';
					aField = aField.replace(/«typeaheadList»/g, typeaheadList);
				}

				// After select the type of imput add de label before it
				aField = aLabel + aField;

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
				var labelStar = '';
				// Inset all attributes if exists
				if (field.input_attrs) {
					for (var key in field.input_attrs) {
						aFieldAttrs += key + '="' + field.input_attrs[key] + '" ';
						// Capture fild title if exists to inset also in the label
						if (key == 'title') {
							fieldTitle = 'title="' + field.input_attrs[key] + '"';
						}
						// Verify if is required to put * in the label
						if (key == 'required') {
							if (formKind == 'xeditableSkeletons') {
								labelStar = '<span ng-if="«formName».$visible">*</span>';
							} else {
								labelStar = '*';
							}
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

				// Insert size on the template
				if (field.size) var size = 'size = "' + field.size + '"';
				aField = aField.replace(/«size»/g, size || '');

				// Insert the aField inside of fieldSkeleton
				aField = pytangular[formKind].fieldSkeleton.replace(/«fieldContent»/g, aField);

				// Change all «fieldName» references to real fieldName
				aField = aField.replace(/«fieldName»/g, field.name  || '');

				// Define id if it exists or use field name
				if (field.id) {
					aField = aField.replace(/«fieldId»/g, field.id  || '');
				} else {
					aField = aField.replace(/«fieldId»/g, field.name  || '');
				}
				// Define helpText if exists
				aField = aField.replace(/«helpText»/g, field.helpText || '');

				// Define title to label if exists
				aField = aField.replace(/«inputTitle»/g, fieldTitle);
				// Add * to required fields label
				aField = aField.replace(/«labelStar»/g, labelStar);

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
					aField = aField.replace(/«formModel»/g, modelName || '');
					aField = aField.replace(/«ngModel»/g, ngModel || '');
				// Inset this field into the aFieldSet object organized by field name
				aFieldSet[field.name] = aField;
				// Increment fields index
				fieldsIndex++;
			});

			// Call buildFieldSet function to build this fieldSet with the fields template if there is one
			// The result will be inserted in the templatedFieldSet variable, that hold the final
			// version of the fieldset with the template applied on the fields
			var templatedFieldSet = pytangular.buildFieldSet(aFieldSet, fieldset.legend, fsetSumIndex, formSpec, formKind);
			// Increment de fsetIndex and fsetSumIndex indexes
			fsetSumIndex++;
			fsetIndex++;

			// Insert this fieldSet into allFieldSets array organized by fieldset index
			allFieldSets.push(templatedFieldSet);
		});

		// Call buildFrom to position allFieldSets into a template if it exists
		formTemplate = pytangular.buildFrom(formKind, allFieldSets, formSpec);
		// Insert all fields inside formSkeleton
		formTemplate = pytangular[formKind].formSkeleton.replace(/«formContent»/g, formTemplate);
		// Insert form name
		formTemplate = formTemplate.replace(/«formName»/g, pytangular.config.formSpecName || 'defaultForm');

		// Help build fnSubmition attribute
		var fnSubmit = '';
		// Verify if form submit function exists and define it
		if (formSpec.fnSubmit && !fnSubmit) {
			fnSubmit = 'data-ng-submit="' + formSpec.fnSubmit + '"';
		}

		// Add form buttons if is present
		if (formSpec.buttons) {
			var btTemplate = '';
			var btIndex = 0;
			formSpec.buttons.forEach(function (button) {
				var btClass = 'btn ';
				if (button.class) btClass += button.class;
				else  btClass += 'btn-default';


				if (button.type) { // || button.action == 'submitForm') {
					var type = button.type || 'submit';
					var btType = ' type="' + type + '"';
					if (formSpec.fnSubmit == undefined) {
						var autoSubmitFunction = true;
					}
				} else {
					var btType = ' type="button"';
				}

				if (button.icon) {
					var btIcon = '<span class="glyphicon glyphicon-' + button.icon + '"></span> ';
				} else {
					var btIcon = '';
				}

				if (formKind == 'xeditableSkeletons') {
					if (button.attrs == undefined) {
						button.attrs = {};
					}
					// If is a cancel button add an extra atribute to reset the form
					if(button.cancel == true) {
						button.attrs['data-ng-click'] = '«formName».$cancel()';
					}
					button.attrs['data-ng-disabled'] = '«formName».$waiting';
				}

				// Inset all attributes if exists
				var btAttrs = '';
				if (button.attrs) {
					for (var key in button.attrs) {
						btAttrs += key + '="' + button.attrs[key] + '" ';
					}
				}

				// Action buttons kind (submitForm is default)
				//if (button.action) {
					if (button.type == 'submit' && !button.action) {
						if (formKind == 'simpleSkeletons') {
							fnSubmit = 'data-ng-submit="submitForm(' + btIndex + ')"';
						} else {
							fnSubmit = 'onaftersave="submitForm(' + btIndex + ')"';
						}
					} else {
						if (formKind == 'simpleSkeletons') {
							btAttrs += 'data-ng-submit="pytangular.actions.' + button.action + '(' + btIndex + ');"';
						}
					}
				//}

				btTemplate += '<button class="' + btClass + '"' + btType + btAttrs + '>' + btIcon + button.label + '</button> ';
			});
			// Replace tag for form name
			btTemplate = btTemplate.replace(/«formName»/g, pytangular.config.formSpecName || '');
		}
		// Insert the buttons into the form
		formTemplate = formTemplate.replace(/«buttons»/g, btTemplate || '');
		// Insert form submit function
		formTemplate = formTemplate.replace(/«fnSubmit»/g, fnSubmit || '');

		return formTemplate;
	},

	populate: function (options) {
		/* *options* must contain:
			- formspec: a form description including fieldsets and fields
			- values: initial field values
			- model: where angular keeps the state
			- applyDefaults: whether or not to apply default values contained in the formspec.
		*/
		options.formSpec.fieldsets.forEach(function (fieldset) {
			fieldset.fields.forEach(function (field) {
				options.model[field.model] = null;
				if (options.applyDefaults && field.default != null) {
					options.model[field.model] = field.default;
				}
				if (options.values[field.name] != null) {
					options.model[field.model] = options.values[field.name];
				}
			});
		});
	},

	reset: function (model) {
		pytangular.populate(pytangular.config);
	},
	// Position every field in a template for this fieldset
	buildFieldSet: function (fieldSet, fsetLegend, fsetSumIndex, formSpec, formKind) {

		var fieldSetContent = '';
		var newFieldSet = '';
		// Add the field set content if there is a fieldset / legend
		if (fsetLegend) {
			fieldSetContent = pytangular[formKind].fieldSetSkeleton.replace(/«fieldSetLegend»/g, fsetLegend);
		}

		//If there is a template for the fields in this fieldset
		if (formSpec.fieldsTemplate != undefined && formSpec.fieldsTemplate[fsetSumIndex]) {
			// Add the template to the newFieldSet variable
			newFieldSet = formSpec.fieldsTemplate[fsetSumIndex];
			for (var key in fieldSet) {
				// This replace all comands "add(field_name)" on the template for the field
				var fieldToAdd = 'add(' + key + ')';
				newFieldSet = newFieldSet.replace(fieldToAdd, fieldSet[key]);
			}
		} else {
			// If there is not a template, just concat all fields
			for (var key in fieldSet) {
				newFieldSet += fieldSet[key];
			}
		}

		// If there is a fieldSet insert each one into fieldSetContent
		// else insert just the normal fields into the fieldSetContent variable
		if (fsetLegend) {
			fieldSetContent = fieldSetContent.replace(/«fieldSetContent»/g, newFieldSet);
		} else {
			fieldSetContent = newFieldSet;
		}
		return fieldSetContent;
	},

	// Position every fieldset in a template for this form
	buildFrom: function (formKind, allFieldSets, formSpec) {
		var newFieldSets = "";
		// If there is a template for this fieldset
		if (formSpec.fieldSetsTemplate != undefined) {
			newFieldSets = formSpec.fieldSetsTemplate;
			for (var key in allFieldSets) {
				// This replace all comands "add(fieldset_index)" on the template for the field
				var fieldSetToAdd = 'add(' + key + ')';
				newFieldSets = newFieldSets.replace(fieldSetToAdd, allFieldSets[key]);
			}
		} else {
			// If there is not a template, just concat all fieldsets
			for (var key in allFieldSets) {
				newFieldSets += allFieldSets[key];
			}
		}
		return newFieldSets;
	},
};

dvApp.directive('pytangular', function ($compile) {
	return {

		restrict: 'E',
		link: function ($scope, element, attrs) {
			if (!attrs.formspec) throw 'Missing attribute "formspec" of directive "pytangular"';
			if (!attrs.model) throw 'Missing attribute "model" of directive "pytangular"';

			var useXeditable = attrs.useXeditable == 'true';
			// applyDefaults is true by default
			var applyDefaults = attrs.applyDefaults != 'false';

			// Create complex object model
			var model =  $scope.$eval(attrs.model);
			var formSpec = $scope.$eval(attrs.formspec);
			// Add formSpec on scope
			$scope['formSpec'] = formSpec;

			// Do the same as model, but values is optional so need check if exists
			var values = attrs.values;
			if (values) {
				values = $scope.$eval(attrs.values);
			}

			$scope.formSpecName = attrs.formspec;

			// Create field error
			model.errors = {};

			/* TODO:
			var builder = new pytangular({
				formSpec: $scope['formSpec'],
				formSpecName: $scope.formSpecName,
				useXeditable: useXeditable,
				values: values || {},
				model: model,
				modelName: attrs.model,
				applyDefaults: applyDefaults,
				});
			*/

			pytangular.config = {
				formSpec: $scope['formSpec'],
				formSpecName: $scope.formSpecName,
				useXeditable: useXeditable,
				values: values || {},
				model: model,
				modelName: attrs.model,
				applyDefaults: applyDefaults,
			};

			$scope.submitForm = function (btIndex) {
				var method = pytangular.config.formSpec.buttons[btIndex].method || 'post';
				var formaction = pytangular.config.formSpec.buttons[btIndex].formaction || '';

				var myForm = document.createElement("form");
				myForm.method = "post" ;
				myForm.action = formaction ;
				for (var key in model) {
				  var myInput = document.createElement("input") ;
				  myInput.setAttribute("name", key) ;
				  myInput.setAttribute("value", model[key]);
				  myForm.appendChild(myInput) ;
				}
				document.body.appendChild(myForm) ;
				myForm.submit() ;
				document.body.removeChild(myForm) ;
			}

			var template = pytangular.build();
			var linkFn = $compile(template);
			var content = linkFn($scope);
			element.append(content);
			// Populate the form with values or default attrs of formSpec
			if (values || applyDefaults) {
				pytangular.populate(pytangular.config);
			}
		},
	};
});
