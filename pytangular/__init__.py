# -*- coding: utf-8 -*-

'''Python component of pytangular: serializes a schema to JSON'''

from __future__ import (absolute_import, division, print_function,
                        unicode_literals)
from json import dumps
from nine import IS_PYTHON2, nimport, nine, range, str, basestring
import colander as c


def schema_to_json(*schemas, mode='simple'):
    '''Serializes a Colander schema to JSON.'''
    return dumps(schema_to_dict(*a, **kw))


def _copy_attr(o, attr, adict, key=None):
    '''Maybe copies an attribute of an object to an item in adict.'''
    if hasattr(o, attr):
        adict[key or attr] = getattr(o, attr)


def schema_to_dict(*schemas, mode='simple'):
    form = {'fieldsets': [], 'mode': mode}

    # Build each fieldset
    for schema in schemas:
        if isinstance(schema, c._SchemaMeta):
            schema = schema()
        fieldset = {'fields': []}
        form['fieldsets'].append(fieldset)
        _copy_attr(schema, 'legend', fieldset)

        # Build each field
        for node in schema:
            field = {
                'name': node.name,
                'label': node.title,
                'widget': get_widget(node) if node.widget is None
                    else node.widget,
                'input_attrs': {},
                }
            fieldset['fields'].append(field)
            attrs = field['input_attrs']
            if node.default is not c.null:
                field['default'] = node.default
            if node.description:
                field['helptext'] = node.description
            _copy_attr(node, 'tooltip', field, 'title')
            _copy_attr(node, 'size', attrs)
            _copy_attr(node, 'maxlength', attrs)

            # Textarea
            _copy_attr(node, 'cols', attrs)
            _copy_attr(node, 'rows', attrs)

            # HTML5 forms: http://html5doctor.com/html5-forms-introduction-and-new-attributes/
            _copy_attr(node, 'placeholder', attrs)
            _copy_attr(node, 'pattern', attrs)
            if hasattr(node, 'autofocus') and node.autofocus:
                attrs['autofocus'] = 'autofocus'
            if node.required:
                attrs['required'] = 'required'
            # TODO autocomplete, list, novalidate etc.

            if field['widget'] == 'number':
                validator = get_validator(c.Range, node)
                if validator:
                    if validator.min is not None:
                        attrs['min'] = validator.min
                    if validator.max is not None:
                        attrs['max'] = validator.max
    return form


def get_validator(typ, node):
    if isinstance(node.validator, c.All):
        validators = node.validator.validators
    else:
        validators = [node.validator]

    for validator in validators:
        if isinstance(validator, typ):
            return validator


def get_widget(node):
    if get_validator(c.Email, node):
        return 'email'

    if isinstance(node.typ, c.String):
        length_validator = get_validator(c.Length, node)
        return 'textarea' if length_validator is None else 'text'

    typ = type(node.typ)
    return {
        c.Date: 'date',
        c.DateTime: 'datetime',
        c.Time: 'time',
        c.Decimal: 'number',
        c.Bool: 'checkbox',
        c.Int: 'number',
        c.Float: 'number',
        }[typ]


def text_node(attrib, min_size=4, max_size=60, **kw):
    '''Helps you define colander SchemaNodes for text fields that
        will be stored in SQLAlchemy -- typing less.

        Pass in the SQLAlchemy model attribute, such as ``User.name``,
        along with other keyword arguments.

        If not informed, ``maxlength`` is inferred from the column size.

        When ``widget`` is missing, it is set to ``text``.
        And when ``widget`` is not ``textarea``,
        a smart formula calculates ``size`` based on ``maxlength``.
        '''
    from bag.sqlalchemy.tricks import length

    maxlength = kw.get('maxlength')
    if maxlength is None:
        maxlength = length(attrib)
        if maxlength is not None:
            kw['maxlength'] = maxlength

    widget = kw.get('widget', 'text')

    # If necessary, calculate a default size for the input
    size = kw.get('size')
    if widget != 'textarea' and size is None and maxlength is not None:
        medium = max_size / 2 + (max_size / 12)
        size = int(maxlength if maxlength <= medium
                   else medium + (maxlength - medium) / 4)
        if size > max_size:
            size = max_size
        kw['size'] = size
    # print(kw)

    # TODO Add Length validator if not present
    # TODO Infer colander type based on sqlalchemy type
    return c.SchemaNode(c.Str(), **kw)
