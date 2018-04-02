#!/usr/bin/env python3

# http://peak.telecommunity.com/DevCenter/setuptools#developer-s-guide
# from distutils.core import setup
from setuptools import setup, find_packages
from codecs import open

with open('README.rst', encoding='utf-8') as f:
    long_description = f.read()

dependencies = ['bag']

setup(
    url='https://github.com/nandoflorestan/pytangular',
    name="pytangular",
    author='Nando Florestan and Andre Malta Maia',
    version='0.1.0.dev1',
    license='MIT',
    packages=find_packages(),
    include_package_data=True,
    author_email="nandoflorestan@gmail.com",
    description="Create a web form in Python, have it generated in AngularJS",
    long_description=long_description,
    zip_safe=False,
    install_requires=dependencies,
    keywords=["python", 'pyramid', 'angularjs', 'angular',
              'HTML', 'colander', 'form', 'web form'],
    classifiers=[  # http://pypi.python.org/pypi?:action=list_classifiers
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        'License :: OSI Approved :: MIT License',
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        'Programming Language :: Python :: Implementation :: CPython',
        "Framework :: Pyramid",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    # test_suite='pytangular.tests',,
)
