var db = require('./db.js');

var Map = db.Map;
var Event = db.Event;
var Image = db.Image;

// var getMap = function(mapId, done){
//   Map.findOne({_id: mapId}, function (err, map){
//     if (err){
//       done(err);
//     }
//     if (map){
//       done(null, map);
//     } else {
//       done(404);
//     }
//   });
// }

var reviseMap = function(eventCode, segmentsToUpdate, done){
  var sliceLength = segmentsToUpdate.length;
  var data;
  Event.findOne({eventCode: eventCode}, function (err, event){
    if (err){
      done(err);
    }
    Image.findOne({_id: event.mainImage}, function (err, image){
      if (err){
        done(err);
      }
      Map.findOne({_id: image.map}, function (err, map){
        if (err){
          done(err);
        }
        data = map.data;
        unfilledKeys = map.unfilledKeys;
        unfilledKeys.splice(-sliceLength,sliceLength);
        for (var i = 0; i < sliceLength; i++){
          data[segmentsToUpdate[i].ID] = segmentsToUpdate[i];
        }
        var conditions = {_id: map._id},
            update     = {
              data: data,
              unfilledKeys: unfilledKeys
            },
            options    = {new: true}; //guarantees that done returns the saved map object--not the old one.
        Map.findOneAndUpdate(conditions, update, options, function (err, foundMap){
          if (err){
            done(err);
          } else {
            done(null, foundMap);
          }
        });
      });
    })
  });
};

// exports.getMap = getMap;
exports.reviseMap = reviseMap;