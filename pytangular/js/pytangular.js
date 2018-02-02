'use strict';
function showFormErrors(response, fieldFinder) {
	if (response.invalid) {
		for (var key in response.invalid) {
			var field = fieldFinder(key);
			field.errors[key] = response.invalid[key];
		}
	}
}

var pytangular = {  // Does NOT depend on angularjs
	// Hold the form field names
	resetableFields: [],
	resetableDefaultFields: [],
	// Normal HTML5 field skeletons
	simpleSkeletons: {
		formSkeleton: '<form role="form" «fnSubmit» id="«formName»" name="«formName»">«formContent» «buttons»</form>',
		noformSkeleton: '«formContent» «buttons»',
		fieldSetSkeleton: '<fieldset><legend>«fieldSetLegend»</legend>«fieldSetContent»</fieldset>',
		fieldSkeleton: '<div data-ng-class="«formModel».errors[\'«fieldName»\'] ? \'has-error form-group \' : \'has-success form-group \'">«fieldContent»' +
			'<div class="help-block" data-ng-if="«formModel».errors[\'«fieldName»\']" data-ng-bind="«formModel».errors[\'«fieldName»\']"></div>' +
			'<p class="help-block">«helpText»</p></div>',
		widgets : {
			inputGroup: '<div class="input-group">«prepend»«defaultTemplate»«append»</div>',
			prepend: '<div class="input-group-addon">«prependSymbol»</div>',
			append: '<div class="input-group-addon">«appendSymbol»</div>',
			defaultTemplate: '<input type="«inputType»" «size» «validation» class="form-control«cssClass»" id="«fieldId»" name="«fieldName»" data-ng-model="«ngModel»" «inputAttrs» «popOver»/>',
			select: '<select class="form-control«cssClass»" «selectedItem» data-ng-model="«ngModel»" id="«fieldId»" name="«fieldName»" «inputAttrs» data-ng-options="item.«itemValue» as item.«itemLabel» for item in «itemsList»">«emptyValue»</select>',
			textarea: '<textarea class="form-control«cssClass»" data-ng-model="«ngModel»" id="«fieldId»" name="«fieldName»" «inputAttrs» «popOver»></textarea>',
			checkbox: ' <input type="checkbox" class="form-check-input«cssClass»" id="«fieldId»" name="«fieldName»" data-ng-model="«ngModel»" «inputAttrs» «popOver»/>',
			typeahead: '<input data-ng-change="onChange_«fieldName»()" autocomplete="off" type="text" ng-model="«ngModel»" «inputAttrs» «popOver» id="«fieldId»" uib-typeahead="item for item in «typeaheadList» | filter:$viewValue | limitTo:8" typeahead-on-select="onSelect_«fieldName»($item, $model, $label)" class="form-control«cssClass»">',
		},
		 labelSkeleton: '<label for="«fieldName»" «inputTitle» class="control-label">«fieldLabel»«labelStar» </label>',
	},
	// Editable field skeletons
	editSkeletons: {
		formSkeleton: '<form role="form" «fnSubmit» id="«formName»" name="«formName»">«formContent» «buttons»</form><button type="button" data-ng-if="formSpec.editPermission" data-ng-show=\'«formModel».isEditing!=true\' class="btn btn-primary" data-ng-click="«formModel».isEditing=true"><span class="glyphicon glyphicon-pencil"></span> Edit</button>',
		noformSkeleton: '«formContent» «buttons» <button type="button" data-ng-if="formSpec.editPermission" data-ng-show=\'«formModel».isEditing!=true\' class="btn btn-primary" data-ng-click="«formModel».isEditing=true"><span class="glyphicon glyphicon-pencil"></span> Edit</button>',
		fieldSetSkeleton: '<fieldset><legend>«fieldSetLegend»</legend>«fieldSetContent»</fieldset>',
		fieldSkeleton: '<div id="pytangular-edit-form-group" data-ng-class="«formModel».errors[\'«fieldName»\'] ? \'has-error form-group \' : \'form-group \'">«fieldContent»' +
			'<div class="help-block" data-ng-if="«formModel».errors[\'«fieldName»\']" data-ng-bind="«formModel».errors[\'«fieldName»\']"></div></div>' +
			'<div class="help-block">«helpText»</div>',
		widgets : {
			inputGroup: '<div data-ng-show="«formModel».isEditing" class="input-group">«prepend»«defaultTemplate»«append»</div>',
			prepend: '<div class="input-group-addon">«prependSymbol»</div>',
			append: '<div class="input-group-addon">«appendSymbol»</div>',
			defaultTemplate: '<input class="form-control«cssClass»" data-ng-show="«formModel».isEditing" type="«inputType»" «size» «validation» data-ng-class="!«formModel».isEditing ? \'pytangular-hide\' : \'form-control\'" id="«fieldId»" name="«fieldName»" data-ng-model="«ngModel»" «inputAttrs» «popOver»/>' +
				'<div data-ng-if="!«formModel».isEditing" data-ng-bind="«ngModel» || \'None\'"></div>',
			select: '<select class="form-control«cssClass»" data-ng-show="«formModel».isEditing" data-ng-class="!«formModel».isEditing ? \'pytangular-hide\' : \'form-control\'" «selectedItem» data-ng-model="«ngModel»" id="«fieldId»" name="«fieldName»" «inputAttrs» data-ng-options="item.«itemValue» as item.«itemLabel» for item in «itemsList»">«emptyValue»</select>' +
				'<div data-ng-if="!«formModel».isEditing" data-ng-bind="«selectedLabel»"></div>',
			textarea: '<textarea class="form-control«cssClass»" data-ng-show="«formModel».isEditing" data-ng-class="!«formModel».isEditing ? \'pytangular-hide\' : \'form-control\'" data-ng-model="«ngModel»" id="«fieldId»" name="«fieldName»" «inputAttrs» «popOver»></textarea>' +
				'<div data-ng-if="!«formModel».isEditing" data-ng-bind="«ngModel» || \'None\'"></div>',
			checkbox: ' <input class="form-check-input«cssClass»" data-ng-show="«formModel».isEditing" type="checkbox" id="«fieldId»" name="«fieldName»" data-ng-model="«ngModel»" «inputAttrs» «popOver»/>' +
				'<div data-ng-if="!«formModel».isEditing" data-ng-bind="«ngModel»"></div>',
			typeahead: '<input class="form-control«cssClass»" autocomplete="off" data-ng-show="«formModel».isEditing" data-ng-change="onChange_«fieldName»()" type="text" ng-model="«ngModel»" «inputAttrs» «popOver» id="«fieldId»" uib-typeahead="item for item in «typeaheadList» | filter:$viewValue | limitTo:8" typeahead-on-select="onSelect_«fieldName»($item, $model, $label)" class="form-control">' +
				'<div data-ng-if="!«formModel».isEditing" data-ng-bind="«ngModel»"></div>',
		},
		 labelSkeleton: '<label for="«fieldName»" «inputTitle» class="control-label">«fieldLabel»«labelStar» </label> ',
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
			defaultTemplate: '<br data-ng-if="«formName».$visible"><span editable-«inputType»="«ngModel»" «inputAttrs» e-name="«fieldName»" «validation» e-id="«fieldId»" data-ng-bind="«ngModel»"></span>',
			password: '<br data-ng-if="«formName».$visible"><span editable-text="«ngModel»" id="«fieldId»" e-name="«fieldName»" «validation» e-type="password">******</span>',
			select: '<br data-ng-if="«formName».$visible"><span editable-select="«ngModel»" e-ng-options="item.value as item.label for item in «itemsList»" data-ng-bind="«ngModel»"></span>',
			textarea: '<br data-ng-if="«formName».$visible"><span editable-textarea="«ngModel»" e-id="«fieldId»" «inputAttrs»>' +
    					'<pre data-ng-bind="«ngModel»"></pre></span>',
    		checkbox: ' <span editable-checkbox="«ngModel»" e-id="«fieldId»" e-title="«title»">{{ «ngModel» && "«trueValue»" || "«falseValue»" }}<span>',
    		typeahead: '<br data-ng-if="«formName».$visible"><span editable-text="«ngModel»" edit-disabled="«disable»" e-id="«fieldId»" «inputAttrs» «validation» e-ng-change="onChange_«fieldName»()" e-typeahead="item for item in «typeaheadList» | filter:$viewValue | limitTo:8" e-typeahead-on-select="onSelect_«fieldName»($item, $model, $label)">{{ «ngModel» }}</span>',
		},
		 labelSkeleton: '<span class="title" «inputTitle»>«fieldLabel»</span>«labelStar» ',
	},

	// TODO Switch to a more structured hierarchy:
	skeletons: {
		'simple': {},
		'xeditable': {},
	},

	build: function (config) {
		var modelName = config.modelName;
		var formSpecName = config.formSpecName;
		var formSpec = config.formSpec;
		var formTemplate = '';
		var formKind;

		if (config.useXeditable) {
			formKind = 'xeditableSkeletons';
		} else if (config.useEditForm) {
			formKind = 'editSkeletons';
		} else {
			formKind = 'simpleSkeletons';
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
					var prepend;
					var append;
					// All other input types (text, number, password, etc)
					// Xeditable uses a different password template
					if (field.widget == 'password' && config.useXeditable) {
						aField += pytangular[formKind].widgets.password;
					} else {
						// Default inputs
						aField += pytangular[formKind].widgets.defaultTemplate;
						// Verify for append and prepend and add if exists
						// Also verify if is a simple form (not xeditable)
						if ((field.append || field.prepend) && !config.useXeditable) {
							var tempField = pytangular[formKind].widgets.inputGroup;
							if (field.prepend) prepend = pytangular[formKind].widgets.prepend;
							if (field.append) append = pytangular[formKind].widgets.append;

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

				// If it is a select define the list of values
				if (field.widget == 'select') {
					var selectedPath, emptyValue;
					if(field.options.push) {
						var optionPath = 'formSpec.fieldsets[' + fsetIndex + '].fields[' + fieldsIndex + '].options';
						aField = aField.replace(/«itemsList»/g, optionPath);
					}
					if(field.emptyValue) {
						emptyValue = '<option value="">' + field.emptyValue + '</option>';
					}
					aField = aField.replace(/«emptyValue»/g, emptyValue || '');

					if (field.default) {
						selectedPath = 'data-ng-init="«ngModel»=formSpec.fieldsets[' + fsetIndex + '].fields[' + fieldsIndex + '].default"';
					} else {
						if(field.options.push) {
							selectedPath = 'data-ng-init="«ngModel»=formSpec.fieldsets[' + fsetIndex + '].fields[' + fieldsIndex + '].options[0].value"';
							field.itemLabel = 'label';
							field.itemValue = 'value';

						} else {
							if(field.emptyValue) {
								selectedPath = 'data-ng-init="«ngModel»=«ngModel»"';
							} else {
								selectedPath = 'data-ng-init="«ngModel»=«ngModel» || ' + field.options + '[0].«itemValue»"';
							}
						}
					}

					aField = aField.replace(/«itemsList»/g, field.options || '');
					aField = aField.replace(/«selectedItem»/g, selectedPath || '');
					aField = aField.replace(/«itemLabel»/g, field.itemLabel  || '');
					aField = aField.replace(/«itemValue»/g, field.itemValue || '');
					aField = aField.replace(/«selectedLabel»/g, field.selectedLabel || '');
				}
				// If it is a typeahead define the list of values
				if (field.widget == 'typeahead') {
					if (field.options.push) {
						var typeaheadList = 'formSpec.fieldsets[' + fsetIndex + '].fields[' + fieldsIndex + '].options';
						aField = aField.replace(/«typeaheadList»/g, typeaheadList);
					}
					var typeaheadDisable = modelName + '.' + field.name + 'Disabled';

					aField = aField.replace(/«typeaheadList»/g, field.options);
					aField = aField.replace(/«disable»/g, typeaheadDisable);
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
							if (config.useXeditable) {
								labelStar = '<span data-ng-if="«formName».$visible">*</span>';
							} else {
								if (config.useEditForm) {
									labelStar = '<span data-ng-if="«formModel».isEditing==true">*</span>';
								} else {
									labelStar = '<span>*</span>';
								}
							}
						}
					}
				}
				// If it is xeditable textarea change cols and rows to e-cols and e-rows
				if (field.widget == 'textarea' && config.useXeditable) {
					aFieldAttrs = aFieldAttrs.replace(/rows=/g, 'e-rows=');
					aFieldAttrs = aFieldAttrs.replace(/cols=/g, 'e-cols=');
				}
				// If it is checklist check for true or false special values
				if (field.widget =='checkbox') {
					if (field['true-value'])
					{
						aFieldAttrs += 'data-ng-true-value="\'' + field['true-value'] + '\'" ';
					}
					if (field['false-value']) {
						aFieldAttrs += 'data-ng-false-value="\'' + field['false-value'] + '\'" ';
					}
					// Check if is xeditable checkbox and define false, true and title values
					if(config.useXeditable) {
						aField = aField.replace(/«trueValue»/g, field['true-value'] || 'Yes');
						aField = aField.replace(/«falseValue»/g, field['false-value'] || 'No');
						aField = aField.replace(/«title»/g, field.title);
					}
				}

				// Insert all field attributes on the template
				aField = aField.replace(/«inputAttrs»/g, aFieldAttrs);

				// Insert field css class on the template
				var cssClass = field.css_class || '';
				if (cssClass) cssClass = ' ' + cssClass;
				aField = aField.replace(/«cssClass»/g, cssClass);

				// Insert size on the template
				var size;
				if (field.size) size = 'size = "' + field.size + '"';
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
				// Add validation function (onbeforesave for xeditable and ng-change to simples forms)
				var fnValidation = '';
				if (formSpec.fnValidation) {
					if (config.useXeditable) {
					 	fnValidation = 'onbeforesave="' + formSpec.fnValidation + '($data, \'' + field.name + '\', true)"';
					} else {
						fnValidation = 'data-ng-change="' + formSpec.fnValidation + '(«ngModel», \'' + field.name + '\')"';
					}
				}
				aField = aField.replace(/«validation»/g, fnValidation);
				// Define a popover if exists
				var popoverAtrr;
				if (field.popover) {
					var poptrigger = field.popover.trigger || 'mouseenter';
					popoverAtrr = 'Popover-animation="true" popover="' + field.popover.msg + '" popover-trigger="' + poptrigger + '"';
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
		// Insert all fields inside formSkeleton or noformSkeleton
		if (config.noform) {
			formTemplate = pytangular[formKind].noformSkeleton.replace(/«formContent»/g, formTemplate);
		} else {
			formTemplate = pytangular[formKind].formSkeleton.replace(/«formContent»/g, formTemplate);
			// Insert form name
			formTemplate = formTemplate.replace(/«formName»/g, config.formSpecName || 'defaultForm');
		}

		// Help build fnSubmition attribute
		var fnSubmit = '';
		// Verify if form submit function exists and define it
		if (formSpec.fnSubmit && !fnSubmit) {
			if (config.useXeditable) {
				fnSubmit = 'onaftersave="' + formSpec.fnSubmit + '"';
			} else {
				fnSubmit = 'data-ng-submit="' + formSpec.fnSubmit + '"';
			}
		}

		// Add form buttons if present
		var btTemplate = '';
		if (formSpec.buttons) {
			var btIndex = 0;
			formSpec.buttons.forEach(function (button) {
				var btClass = 'btn ';
				var btType, btIcon;
				if (button.class) btClass += button.class;
				else  btClass += 'btn-default';


				if (button.type) {
					var type = button.type || 'submit';
					if (config.useEditForm) {
						btType = ' type="' + type + '" data-ng-if=\'«formModel».isEditing==true\'';
					} else {
						btType = ' type="' + type + '" ';
					}
				} else {
					if (config.useEditForm) {
						btType = ' type="button" data-ng-if=\'«formModel».isEditing==true\'';
					} else {
						btType = ' type="button"';
					}
				}

				if (button.icon) {
					btIcon = '<span class="glyphicon glyphicon-' + button.icon + '"></span> ';
				} else {
					btIcon = '';
				}

				if (config.useXeditable) {
					if (button.attrs === undefined) {
						button.attrs = {};
					}
					// If it is a cancel button add an extra atribute to reset the form
					if(button.cancel === true) {
						button.attrs['data-ng-click'] = '«formName».$cancel()';
					}
					button.attrs['data-ng-disabled'] = '«formName».$waiting';
				}

				// Insert all attributes
				var btAttrs = '';
				if (button.attrs) {
					for (var key in button.attrs) {
						btAttrs += key + '="' + button.attrs[key] + '" ';
					}
				}

				// Action buttons kind (submitForm is default)
				//if is submit and no fnSubmit and no action, define a default submitForm function
				if (button.type == 'submit' && (!button.action && !formSpec.fnSubmit)) {
					if (config.useXeditable) {
						fnSubmit = 'onaftersave="submitForm(' + btIndex + ')"';
					} else {
						fnSubmit = 'data-ng-submit="submitForm(' + btIndex + ')"';
					}
				// If it is submit and have fnSubmit use it
				} else if (button.type == 'submit' && (!button.action && formSpec.fnSubmit)) {
					if (config.useXeditable) {
						fnSubmit = 'onaftersave="' + formSpec.fnSubmit + '"';
					} else {
						fnSubmit = 'data-ng-submit="' + formSpec.fnSubmit + '"';
					}
				}

				btTemplate += '<button class="' + btClass + '"' + btType + btAttrs + '>' + btIcon + button.label + '</button> ';
			});
			// Replace tag for form name
			btTemplate = btTemplate.replace(/«formName»/g, config.formSpecName || '');
		}
		// Insert the buttons into the form
		formTemplate = formTemplate.replace(/«buttons»/g, btTemplate || '');
		// Insert form submit function
		formTemplate = formTemplate.replace(/«fnSubmit»/g, fnSubmit || '');
		formTemplate = formTemplate.replace(/«formModel»/g, modelName);

		return formTemplate;
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
		if (formSpec.fieldsTemplate !== undefined && formSpec.fieldsTemplate[fsetSumIndex]) {
			// Add the template to the newFieldSet variable
			newFieldSet = formSpec.fieldsTemplate[fsetSumIndex];
			for (var key in fieldSet) {
				// This replace all comands "add(field_name)" on the template for the field
				var fieldToAdd = 'add(' + key + ')';
				newFieldSet = newFieldSet.replace(fieldToAdd, fieldSet[key]);
			}
		} else {
			// If there is not a template, just concat all fields
			for (var key in fieldSet) {// jshint ignore:line
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
		if (formSpec.fieldSetsTemplate !== undefined) {
			newFieldSets = formSpec.fieldSetsTemplate;
			for (var key in allFieldSets) {
				// This replace all comands "add(fieldset_index)" on the template for the field
				var fieldSetToAdd = 'add(' + key + ')';
				newFieldSets = newFieldSets.replace(fieldSetToAdd, allFieldSets[key]);
			}
		} else {
			// If there is not a template, just concat all fieldsets
			for (var key in allFieldSets) { // jshint ignore:line
				newFieldSets += allFieldSets[key];
			}
		}
		return newFieldSets;
	},
};

dvApp.directive('pytangular', function ($compile, $cookies) {
	return {
		scope: true,
		restrict: 'E',
		link: function ($scope, element, attrs) {
			if (!attrs.formspec) throw 'Missing attribute "formspec" of directive "pytangular"';
			if (!attrs.model) throw 'Missing attribute "model" of directive "pytangular"';

			var useXeditable = attrs.useXeditable == 'true';
			var useEditForm = attrs.useEditForm == 'true';
			// applyDefaults is true by default
			var applyDefaults = attrs.applyDefaults != 'false';

			// Create field error
			var model = $scope.$eval(attrs.model);
			model.errors = {};
			// Do the same as model, but values is optional so need check if exists
			var values = attrs.values;
			if (values) {
				values = $scope.$eval(attrs.values);
			}

			// Create a formSpec in directive scope
			$scope.formSpec = $scope.$eval(attrs.formspec);
			$scope.formSpec.editPermission = $scope.$eval(attrs.editPermission) || false;

			// Insert into model a config file to pytangular methods load need information
			var config = {
				model: model,
				formSpecName: attrs.formspec,
				formSpec: $scope.formSpec,
				useEditForm: useEditForm,
				useXeditable: useXeditable,
				values: values || '',
				modelName: attrs.model,
				applyDefaults: applyDefaults,
				noform: attrs.noform || null,
			};

			var populate = function (config) {
				/* *config* must contain:
					- formSpecName: a variable with name/path of a form description including fieldsets and fields
					- valuesPath: a variable with the name/path of a initial field values
					- modelName: a variable with name/path of where angular keeps the state
					- applyDefaults: whether or not to apply default values contained in the formspec.
					- useXeditable: hold true or false to tell if is using xeditable
				*/
				var formSpec = config.formSpec;
				var model = config.model;
				var values = config.values || '';

				formSpec.fieldsets.forEach(function (fieldset) {
					fieldset.fields.forEach(function (field) {
						// If there is no model use field name as model name
						if(field.model === undefined) {
							field.model = field.name;
						}
						model[field.model] = null;
						if (config.applyDefaults && field.default) {
							model[field.model] = field.default;
						}
						if (values[field.name]) {
							model[field.model] = values[field.name];
						}
					});
				});
			};

			$scope.formSpec.showError = function (response, status, headers, config) {
				for (var key in response.invalid) {
					model.errors[key] = response.invalid[key];
				}
			};

			$scope.$on('populate', function (event) {
				populate(config);
			});

			$scope.submitForm = function (btIndex) {
				var method = config.formSpec.buttons[btIndex].method || 'post';
				var formaction = config.formSpec.buttons[btIndex].formaction || '';

				var myForm = document.createElement("form");
				myForm.method = "post";
				myForm.action = formaction;
				for (var key in model) {
					var myInput = document.createElement("input");
					myInput.setAttribute("name", key);
					myInput.setAttribute("value", model[key]);
					myForm.appendChild(myInput);
				}

				// Add the csrf_token hidden input
				var csrf = document.createElement("input");
				csrf.setAttribute("type", "hidden");
				csrf.setAttribute("name", "csrf_token");
				csrf.setAttribute("value", $cookies.get("XSRF-TOKEN"));
				myForm.appendChild(csrf);

				document.body.appendChild(myForm);
				myForm.submit();
				document.body.removeChild(myForm);
			};

			// Populate the form with values or default attrs of formSpec
			if (values || applyDefaults) {
				populate(config);
			}
			var template = pytangular.build(config);
			var linkFn = $compile(template);
			var content = linkFn($scope);
			element.append(content);
		},
	};
});
