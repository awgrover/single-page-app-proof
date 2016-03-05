Proof of concept single-page app, as a web-page on your machine.

Using pouchdb so it can sync/share/be-distributed.

# Requirements

A web-brower,
that can open a html file on your disk/storage,
that has "indexedDB" (every recent browser as of 2015.1.1),
that has javascript and local-web-storage enabled for "file:///"

# Installation

% make

### If you don't have access to make:

* download https://cdn.jsdelivr.net/pouchdb/5.3.0/pouchdb.min.js
* rename (or link) it to pouchdb-5.3.js
* download jquery 2.2.x from http://jquery.com/download/
* rename (or link) it to jquery-2.2.min.js

# Usage

Open proof.html in a browser. Enable javascript and local-web-storage.

The .html is the "app",
it stores its data in local-web-storage (indexedDB),
but that storage is associated with the directory where the .html is.
So, if you put the .html in a different directory, it can't see the earlier data.

# Development

Setup things with more debuggability, downloads and links the js, etc.:

% env CONTEXT=development make

Make a distributable .zip:

% make proof.zip
