function render(events) {
  $('container').html(
    ejs.renderFile('events.ejs', { events })
  );
}

$(document).ready(function () {
  var localDB = new PouchDB('lenta');
  localDB.replicate.from('http://82.202.226.64:27513/db/lenta', { live: true })
    .on('change', function () {
      localDB.allDocs({include_docs: true}).then(function (docs) {
        render(docs.rows);
      });
    }).on('paused', function (info) {
      // replication was paused, usually because of a lost connection
    }).on('active', function (info) {
      localDB.allDocs({include_docs: true}).then(function (docs) {
        render(docs.rows);
      });
    }).on('error', function (err) {
      // boo, something went wrong!
    });
});
