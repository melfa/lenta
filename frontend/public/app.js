$(document).ready(function () {
  var localDB = new PouchDB('lenta');
  localDB.replicate.from('http://SOMEWHERE:5984/lenta', { live: true })
    .on('change', function () {
      // yay, we're done!
    }).on('paused', function (info) {
      // replication was paused, usually because of a lost connection
    }).on('active', function (info) {
      // replication was resumed
    }).on('error', function (err) {
      // boo, something went wrong!
    });
});
