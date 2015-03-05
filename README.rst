==========
pytangular
==========

**pytangular** is an open source,
`(MIT licensed) <http://github.com/nandoflorestan/pytangular/blob/master/docs/LICENSE.rst>`_,
bridge between Python and AngularJS, such that a web form
specification (containing form fields etc.) can cross the language chasm.

Why?
====

Remember that, in software development, **repetition is the root of all evil**.
You already define your forms in the Python web server in order to validate
them. So you should not have to recreate the same forms in the client.

How does it work?
=================

pytangular has a Python component and a JS component with JSON communication
between them.

Basically, you define a web form in Python using the excellent
`Colander <https://pypi.python.org/pypi/colander>`_ schema generator.
Still in Python, you have pytangular serialize your schema to json.
Then you get the json in javascript and the js component of pytangular
creates an AngularJS template containing the web form.

Although pytangular can be used with any web framework, it is developed and
tested with Pyramid.

Retail rendering of the form is supported. I mean, you have the flexibility of putting fields where you want them.

TODO: Examples and how to use it.


Collaboration
=============

We want your help. We are open to bug reports, feature requests, suggestions
and (especially) pull requests. Reach us at
https://github.com/nandoflorestan/pytangular/issues


Authors
=======

- Andre Malta Maia
- Nando Florestan
