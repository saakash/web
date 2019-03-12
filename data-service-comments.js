const mongoose = require('mongoose');
let Schema = mongoose.Schema;
var commentSchema = new Schema({
    "authorName":String,
    "authorEmail":String,
    "subject":String,
    "commentText":String,
    "postedDate":Date,
    "replies":[{
        "comment_id":String,
        "authorName":String,
        "authorEmail":String,
        "commentText":String,
        "repliedDate":Date,
    }]
});
let Comment;
module.exports.initialize = function () { 
    return new Promise(function (resolve, reject) {
         let db = mongoose.createConnection("mongodb://ashrestha7_mongo:Canada123.@ds161146.mlab.com:61146/web322_a6");
         db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error 
         }); 
         db.once('open', ()=>{ 
            Comment = db.model("comments", commentSchema); 
            resolve(); 
         });
     }); 
};
module.exports.addComment = function(data){
    return new Promise(function(resolve,reject){
        data.postedDate = Date.now();
        let newComment = new Comment(data);
        newComment.save((err)=>{
            if(err){
               reject("There was an error saving the comment:"+err.message); 
            }
            else{
                resolve(newComment._id);
            }
        })
    });
};
module.exports.getAllComments = function(){
    return new Promise(function(resolve,reject){
        Comment.find({})
        .sort({postedDate:1})
        .exec()
        .then((results)=>{
            resolve(results);
        }).catch((err)=>{
            reject("There was an error saving the comment:"+err.message);             
        })
    });
};
module.exports.addReply = function(data){
    return new Promise(function(resolve,reject){
        data.repliedDate = Date.now();
        Comment.update({_id : data.comment_id},
        {$addToSet : {replies : data}},
        {multi : false}
        )
        .exec()
        .then(()=>{
            resolve();
        }).catch((err)=>{
            reject("There was an error saving the comment:"+err.message);             
        })
    });
};

