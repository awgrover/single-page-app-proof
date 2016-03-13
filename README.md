Proof of concept single-page app, as a web-page on your machine.

Using pouchdb so it can sync/share/be-distributed.

Just open the .html file in your browser.

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

Open proof.html in a browser. Enable javascript, local-web-storage, and cookies for the file:///... location.

The .html is the "app",
it stores its data in local-web-storage (indexedDB),
but that storage is associated with the directory where the .html is.
So, if you put the .html in a different directory, it can't see the earlier data.

## Sync'ing with local couchdb instance

The various sync buttons want an url to a couchdb-compliant peer. Couchdb, of course, works. 

### Setup "Local" (unprivileged) couchdb 

You can use a couchdb instance that is local to a directory (i.e. running as an unprivileged user).

#### Manually:

* Install couchdb
* Create a directory for the db-storage
* Somehow launch couchdb so that it uses a config that points to that directory (see the config text in lib/couchdb-local)

#### Unix's

* install couchdb, you could use the install instance if you want.
* but, to make it runnable by an unprivileged user, with the db storage in this directory (good for debugging), and CORS enabled:

    % make couchdb-local

* Check the "futon" interface at http://localhost:5985/_utils

# Goals

It should be able to be a full app, like a spreadsheet.

It should be easily installable.

It should bootstrap itself, acquiring its dependencies and setting itself up.

It should work offline first.

The apps should be able to collaborate with other users.

The user should be able to control exposure of their data.

More specifically, I wanted it to live in a single-file, and be runnable in the browser by just opening the .html. Using pouchdb gives me an interesting storage space, and db(s) for the app. It also has a sync feature for collaboration (it has worked over webrtc). The same-origin policy of "file:" should allow multiple apps (the directory is the origin, so copy the .html to another directory and it is distinct).


# Development

Setup things with more debuggability, downloads and links the js, etc.:

% env CONTEXT=development make

Make a distributable .zip:

% make proof.zip

# Todo

* test sync vs a local couchdb
* test the same-origin: if run from another directory, is that a new webstorage?
* see if webrtc will work, test on LAN and WAN.
* add filtering as proof of concept: see other people updates, but only allow edit of some of own data.
