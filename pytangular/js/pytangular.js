formBuilder = {
	skeletons: {
		formSkeleton: '<form role="form" data-data-ng-submit="«fnSubmit»" name="«formName»">«formContent»</form>',

		fieldSkeleton: '<div data-data-ng-class="models.fieldError[\'«fieldName»\'] ? \'has-error form-group \' : \'has-success form-group \'">«fieldContent»</div>',
		widgets : {
			defaultTemplate: '<input type="«inputType»" class="form-control" id="«fieldId»" name="«fieldName»" «inputAttrs»/>',
			select: '<select class="form-control" id="«fieldId»" «inputAttrs» data-ng-options="item.value as item.label for item in «itemsList»"></select>',
			textarea: '<textarea class="form-control" id="«fieldId»" «inputAttrs»></textarea>',
			checkbox: ' <input type="checkbox" id="«fieldId»" name="«fieldName»" «inputAttrs»/>',
		},
		 labelSkeleton: '<label for="«fieldName»" class="control-label">«fieldLabel»</label>',
		 fieldSetSkeleton: '<fieldset>',
	},
	build: function (form) {
		var fieldsTemplate = "";
		form.fieldsets.forEach(function (fieldset) {
			fieldset.fields.forEach(function (field) {
				var aField = "";
				// Define label if exists
				if (field.label) {
					aField += formBuilder.skeletons.labelSkeleton;
					aField = aField.replace(/«fieldLabel»/g, field.label);
				}

				// Define the type of field and get the input template
				if ((field.widget != 'textarea') && (field.widget != 'select') && (field.widget != 'checkbox')) {
					// All other input types (text, number, password, etc)
					aField += formBuilder.skeletons.widgets.defaultTemplate;
					aField = aField.replace(/«inputType»/g, field.widget);
				} else if (field.widget == 'textarea') {
					aField += formBuilder.skeletons.widgets.textarea;
				} else if (field.widget == 'select') {
					aField += formBuilder.skeletons.widgets.select;
				} else if (field.widget == 'checkbox') {
					aField += formBuilder.skeletons.widgets.checkbox;
				}

				// If is a select define the list of values
				if (field.widget == 'select') {
					aField = aField.replace(/«itemsList»/g, field.options);
				}

				// Build all other field attributes
				var aFieldAttrs = '';
				// If there is a data-ng-model attr
				if (field.model) {
					aFieldAttrs = 'data-ng-model="';
					if (form.model) {
						aFieldAttrs += form.model + '.';
					}
					aFieldAttrs += field.model + '" ';
				}
				// Inset all attributes if exists
				if (field.fieldAttrs) {
					field.fieldAttrs.forEach(function (thisAttr) {
						for (var key in thisAttr) {
							aFieldAttrs += key + '="' + thisAttr[key] + '" ';
						}
					});
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
				aField = formBuilder.skeletons.fieldSkeleton.replace(/«fieldContent»/g, aField);

				// Change all «fieldName» references to real fieldName
				aField = aField.replace(/«fieldName»/g, field.name);

				// Define id if it exists or use field name
				if (field.id) {
					aField = aField.replace(/«fieldId»/g, field.id);
				} else {
					aField = aField.replace(/«fieldId»/g, field.name);
				}

				fieldsTemplate += aField;
			});
		});

		var template;
		// Insert all fields inside formSkeleton
		template = formBuilder.skeletons.formSkeleton.replace(/«formContent»/g, fieldsTemplate);
		// Insert form name
		template = template.replace(/«formName»/g, form.name);
		// Insert form submit function
		template = template.replace(/«fnSubmit»/g, form.fnSubmit);

		return template;
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

dvApp.directive('dvForm', function ($compile) {
	return {
		restrict: 'E',
		// scope: {
		// 	form: '=',
		// },
		link: function ($scope, element, attrs) {
			var form = $scope.form;
			if (form) {
				var template = formBuilder.build(form);
				var linkFn = $compile(template);
				var content = linkFn($scope);
				element.append(content);
			}
		},
	};
});
