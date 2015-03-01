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


def schema_to_dict(*schemas, mode='simple'):
    form = {'fieldsets': [], 'mode': mode}

    # Build each fieldset
    for schema in schemas:
        if isinstance(schema, c._SchemaMeta):
            schema = schema()
        fieldset = {'fields': []}
        form['fieldsets'].append(fieldset)
        if hasattr(schema, 'legend'):
            fieldset['legend'] = schema.legend

        # Build each field
        for node in schema:
            field = {
                'name': node.name,
                'label': node.title,
                'widget': get_widget(node) if node.widget is None
                    else node.widget,
                'input_attrs': node.input_attrs
                    if hasattr(node, 'input_attrs') else {},
                }
            fieldset['fields'].append(field)
            attrs = field['input_attrs']
            if node.default is not c.null:
                field['default'] = node.default
            if node.description:
                field['title'] = node.description
            if hasattr(node, 'placeholder'):
                attrs['placeholder'] = node.placeholder
            if hasattr(node, 'size'):
                attrs['size'] = node.size
            # TODO Inspect validators to set maxlength on text fields
            # TODO Inspect validators to set max on number fields
            # TODO Set input size if not set
    return form


def get_validator(typ, validators):
    for validator in validators:
        if isinstance(validator, typ):
            return validator


def get_widget(node):
    if isinstance(node.validator, c.All):
        validators = node.validator.validators
    else:
        validators = [node.validator]

    if get_validator(c.Email, validators):
        return 'email'

    if isinstance(node.typ, c.String):
        length_validator = get_validator(c.Length, validators)
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
