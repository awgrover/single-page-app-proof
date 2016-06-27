console.log("js loading");

// Part of the error/remediation code:
// setup for 1st syntax error detect


// Part of the error/remediation code:
// Goes early so it is avail regardless of jquery/pouchdb/syntax-errors
app_debug = {
  permissions_check : function() {
    // test if cookies are enabled (needed for indexdb access on ff)
    // insert message
    if (!navigator.cookieEnabled) {
        var orig = location.origin;
        // "file:" will give 'null' origin
        if (orig=='null' && location.protocol == "file:") {
            orig = location.pathname
            }
        document.getElementById("debug").insertAdjacentHTML(
            'beforeend', 
            "<td>Enable cookies for<br>(the directory of:)</td><td>"+orig+"</td></tr>"
            );

          }
    else {
      try {
        var x = localStorage; // just trigger it
        }
      catch (err) {
        document.getElementById("debug").insertAdjacentHTML(
            'beforeend', 
            "<td>'localstorage' is disabled</td><td>FIXME: how-to in FF and IE and chrome</td></tr>"
            );
        }
        
      if (typeof(PouchDB) == 'undefined') {
        document.getElementById("debug").insertAdjacentHTML(
            'beforeend', 
            "<td>PouchDB isn't defined, something didn't load</td><td>see the javascript console?</td></tr>"
            );
        }
      }
  },
  appjs_check : function () {
    // If we don't get to bottom, this inserts. At the bottom, we remove
    // PouchDB prevents the rest of this file from loading
    if (typeof(PouchDB) != 'undefined') {
      document.getElementById("debug").insertAdjacentHTML(
        'beforeend',
        "<tr id='debug_app_js'><td>app.js didn't finish loading, probably had syntax error</td><td>see console</td></tr>"
        );
      }
    },
  final : function() {
    // remove the "debug" section if we are good
    var debug_body = document.getElementById("debug");
    if ( debug_body.getElementsByTagName("tr").length == 1 ) {
        debug_body.parentNode.removeChild(debug_body);
        }
    }
};
// we re-insert
var element = document.getElementById("debug_app_js");
if (element) { element.parentNode.removeChild(element);}

// the dbname is the .html's name
var dbname= location.pathname.split(/[\\/]/).pop().replace(/\.[^.]+$/,'');
var db = new PouchDB(dbname);
var data_peer_sync;

function start_sync(url, db, status_id) {
  // Will create the remote db if it doesn't exist, if the url has permissions
  // FIXME: deal with authentication cases
  // FIXME: shouldn't sync 'origin', that's local.
  console.log("Start sync of "+db+" with "+url);
  var status_element = $('#'+status_id); // meaningful states
  var status_element_b = $('#'+status_id+"_b"); // sub-state info

  // we assume our db-name is the same as the remote's. should be configurable
  // FIXME: we don't defend against doing this twice
  console.log("remote sync: "+url+'/'+db);
  data_peer_sync = PouchDB.sync(db, url+'/'+db, { // bidirectional
    live: true, // keep running
    retry: true
  }).on('change', function (info) {
    // I think this means "want to change some stuff in or out"
    console.log("Change",info);
    // FIXME: display more detail
    status_element.text("=change "+info.docs_read+"/"+info.docs_written+" "+(new Date()).toISOString()+"=");
    // FIXME: AND update the displayed data
  }).on('paused', function (err) {
    // replication paused (e.g. replication up to date, user went offline)
    console.log("Paused",err);
    status_element_b.text("=pause "+(new Date()).toISOString()+"=");
  }).on('active', function () {
    // replicate resumed (e.g. new changes replicating, user went back online)
    console.log("Resumed");
    status_element_b.text("=resume "+(new Date()).toISOString()+"=");
  }).on('denied', function (err) {
    // a document failed to replicate, e.g. due to permissions
    // FIXME: probably display more info
    console.log("Denied",err);
    status_element_b.text("=deny "+(new Date()).toISOString()+"=");
  }).on('complete', function (info) {
    // handle complete
    console.log("Complete",info);
    // FIXME: display more detail
    status_element.text("=complete "+info.docs_read+"/"+info.docs_written+" "+info.status+" "+(new Date()).toISOString()+"=");
  }).on('error', function (err) {
    // handle error
    console.log("Error",err);
    // FIXME: display more detail
    status_element.text("=error "+(new Date()).toISOString()+"=");
  });
  }

function catch_pouch_error(err, result) {
  if (!err) {
    console.log('didit',result);
  } else {
    console.log("fail: "+err,result);
    alert("fail: "+err,result);
    throw(err);
  }
}

function insert_or_update(id, body) {
  console.log("ins/up "+id,body);
  db.get(id, function(error, doc) {
    if (error && error.reason != 'missing') { catch_pouch_error(error, doc) }
    else {
      console.log("extant doc: ",doc);
      var actual = $.extend({}, body);
      actual['_id'] = id;
      if (doc) {
        actual['_rev'] = doc._rev;
        }
      db.put(actual, catch_pouch_error);
    }
  });
}

function record_origin() {
  // Record our "origin"
  insert_or_update(location.toString(),
    {
      type : 'origin', // we'll search for this
      created_at : location.pathname
    }
    );
  }

function show_extant_origins() {
  $('#extantorigins').text('');
  db.query(
    function(doc,emit) {emit(doc.type);}, // the _id is now the .type
    {
      key : 'origin', // the new stream of docs where _id=='origin'
      include_docs : true
    }).then(function(result) {
      console.log("origins",result);
      $(result.rows).each(function(i,doc) {
        $('#extantorigins').append(doc.id + "<br />");
        });
        
    }).catch(catch_pouch_error);
  console.log("finish show extant");
  }

function page2_change(event) {
  // the textarea
  console.log("submit..",event);
  var rowid = event.target.id;
  console.log("id",rowid);

  var updated = function(result) {
      console.log(result);
      var stat = $("#textarea_status");
      stat.stop(true, true);
      stat.text("ok");
      stat.css("background-color","green");
      stat.show();
      stat.fadeOut(2000);

      $(event.target).attr("name", result.rev);
      if (event.target.id == undefined) {
        event.target.id = result.id;
        }
      else if (event.target.id != result.id) {
        catch_pouch_error("Bad id!", result);
        }
    }

  // blank name is "new", add it
  if (rowid == '') {
    console.log("New add");
    db.post(
      {
        type : 'page',
        value : event.target.value
    })
    .then(updated)
    .catch( catch_pouch_error);
  }

  else {
    console.log("target",event.target);
    console.log("Update id",rowid,"rev",event.target.name);
    db.put({
        _id : rowid,
        _rev : event.target.name,
        type : 'page',
        value : event.target.value
    })
    .then(updated)
    .catch( catch_pouch_error);
  }
}
function row_change(event) {
  console.log("submit..",event);
  var rowid = event.target.id;
  console.log("id",rowid);

  // blank name is "new" row, add it
  if (rowid == '') {
    db.post(
      {
        type : 'row',
        value : event.target.value
    }).then(function(result) {
      console.log(result);
      event.target.name = result._rev;
      event.target.id = result.id;
      $("#rows_table").append('<tr><td><input value="" name=""></td></tr>');
      $("#rows_form input").change(row_change);
    }).catch( catch_pouch_error);
  }

  else {
    db.put({
        _id : rowid,
        _rev : event.target.name,
        type : 'row',
        value : event.target.value
    }).then(function(result) {
      event.target.name = result._rev;
      console.log(result);
    }).catch( catch_pouch_error);
  }
}

function setup_page2_content() {

  // FIXME: use views
  db.query(
    function(doc,emit) {emit(doc.type);}, // the _id is now the .type
    {
      key : 'page', 
      include_docs : true
    }).then(function(result) {
      console.log("page",result.rows);
      var ta =$( $('#page_editor textarea')[0] );

      // FIXME: doing "each" but we only expect 1
      // will do amusing things when you start sync'ing
      var apage = result.rows[0];
        console.log("show ",apage);
        ta.text(apage.doc.value);
        ta.attr("id", apage.id);
        ta.attr("name", apage.doc._rev);

      ta.change(page2_change);
        
    }).catch(catch_pouch_error);

  $('#page2link').click(goto_page);

  }

function goto_page() { // always "page2" for now
  console.log("clicked for page2");
  db.query(
    function(doc,emit) {emit(doc.type);}, // the _id is now the .type
    {
      key : 'page', // the new stream of docs where _id=='row'
      include_docs : true
    }).then(function(result) {
      console.log("page",result.rows);

      // FIXME: fetched all but we only expect 1
      // will do amusing things when you start sync'ing

      // FIXME: we should be using attachments for the html, I think.
      var html = result.rows[0].doc.value;
      console.log("html",html);
      $('body').html(html);
    }).catch(catch_pouch_error);

  return false;
}

function setup_row_table() {

  // FIXME: use views
  db.query(
    function(doc,emit) {emit(doc.type);}, // the _id is now the .type
    {
      key : 'row', // the new stream of docs where _id=='row'
      include_docs : true
    }).then(function(result) {
      console.log("row",result.rows);
      $(result.rows).each(function(i,arow) {
        console.log("show "+i,arow);
        $('#rows_table').append('<tr><td><input value="'+arow.doc.value+'" name="'+arow.doc._rev+'" id="'+arow.id+'"></td></tr>');
        });
      $("#rows_form input").change(row_change);
        
    }).catch(catch_pouch_error);

  }

$(function() {

  $("#location").text(location.pathname); // .origin doesn't seem to work for file:
  $("#dbname").text(dbname); // .origin doesn't seem to work for file:
  $("#pouchH").text(db); // .origin doesn't seem to work for file:

  $("#clean").click(function() {
    db.destroy(dbname, catch_pouch_error);
    db = new PouchDB(dbname);
    console.log("whacked db");
    });

  $('#data_peer_button').click(function() { start_sync( $('#data_peer').val(), dbname, 'data_peer_status'); });
  
  $('#data_peer_stop').click( function() {
    console.log("user cancel data-peer sync");
    data_peer_sync.cancel();
    });

  record_origin();

  show_extant_origins();

  setup_row_table();

  setup_page2_content();
});

// Part of the error/remediation code:
// goes last to indicate that this file loaded
app_debug.appjs_check = function() {
  var element = document.getElementById("debug_app_js");
  if (element) { element.parentNode.removeChild(element); }
  }

