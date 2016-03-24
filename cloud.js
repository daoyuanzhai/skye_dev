var AV = require('leanengine');
var signer = require("jsrsasign");

module.exports = AV.Cloud;

var NEXMO_KEY = 'e4905739';
var NEXMO_SECRET = 'a110c785';
var NEXMO_BRAND = 'skye_dev';

/*
 * post type 0: user's moment
 * post type 1: topic/discussion
 * post type 2: activity
 * post type 3: article
 *
 * post status 0: normal
 * post status 1: deleted
 * post status 2: starred
 * post status 3: top
 */

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "8618926774503", "nonce" : "test"}' \
//        https://leancloud.cn/1.1/functions/hello
AV.Cloud.define('hello', function(request, response) {
    console.log("hello is working...");
    response.success('Hello world!');
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "8618926774503", "nonce" : "test"}' \
//        https://leancloud.cn/1.1/functions/generateToken
AV.Cloud.define("generateToken", function(request, response) {
    var userID = request.params.userId;
    var nonce = request.params.nonce;

    var layerProviderID = 'layer:///providers/000ffcdc-8906-11e5-88f4-e9b7920101b5';  // Should have the format of layer:///providers/<GUID>
    var layerKeyID = 'layer:///keys/4efa63b8-a4b4-11e5-a7e7-e414060066ec';   // Should have the format of layer:///keys/<GUID>

    var header =  JSON.stringify({
        typ: "JWT", // Expresses a MIME Type of application/JWT
        alg: "RS256", // Expresses the type of algorithm used to sign the token, must be RS256
        cty: "layer-eit;v=1", // Express a Content Type of application/layer-eit;v=1
        kid: layerKeyID,
    });

    var currentTimeInSeconds = Math.round(new Date() / 1000);
    var expirationTime = currentTimeInSeconds + 10000;
    var claim = JSON.stringify({
        iss: layerProviderID, // The Layer Provider ID
        prn: userID, // User Identifiers
        iat: currentTimeInSeconds, // Time of Token Issuance
        exp: expirationTime, // Arbitrary time of Token Expiration
        nce: nonce, //Nonce obtained from the request
    });

    var privateKey = "-----BEGIN RSA PRIVATE KEY-----MIICWwIBAAKBgGBKiRR8ICebF27LKBwzdbs7DW62g13tdOcRCCGsOFZFzBr6hXsqP2s+WmMmy07pAtKsHhJIShiII+yjFxL9EPKP3OXRcN9fmdhiKS5//XrYJVXhcFQM9ll4m4Kvjft8DqXLPKF0jnEEPThq6nhpJTtO+fHzkPvw8R6t4FlmW/kjAgMBAAECgYA9ndSEID2vOmZPRn8fNKrEqbAZxX7gjv+8kMCEU6ElS7qlFORvgQReCuNqCTwV/bMJvovrpQiNFCjw1xf/1aKO2jXjX79KhTlDwtPFDRJZ0I570BNKBPgSAwM0pc8HZlujjrPxItW5rAuH/DIuPdCBA9vSiwC3vA2Xpop3cnFGkQJBALRIojxnJTIVQOuIGm4tX8/Avogyklx3SWmW9UPrjetubiy2RUKPiKR0M9ytNVI4GXCs9+k5ZxomrcDCSRCxZKkCQQCIu118QAYy5CAiViQ/SDdjZTrbhUZtjIRVrMFG9hTSr/eVAUqakirCx2mDAybThFuFrAaatA74lr0bt7lEqULrAkEAgAOzb8CuIMoGtziFzAZcKmFq6bs/QnlRn7CZqAjzVWGsygMDWyggluYMjX5QhnlfVyr7PpiMJX2hk2ZiC4BrQQJAWCuidB4BIU4UHrA3vYr/FJxRoP9HVBs5ttmo5O6IrPgGClMD3bsF0gavVmlw3xLJxeARfi9APDNQDRCjatBPMwJAHpvmi5SvJX9uoyZR8bzksxspajbgQjfqRwaXGNoSvCV0CwAAIoGCs3APadXCRqoNj7g5Aml5Fv+0WuJQmM2Pag==-----END RSA PRIVATE KEY-----";

    var token = signer.jws.JWS.sign('RS256', header, claim, privateKey);
    response.success(token);
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"phone" : "8618926774503"}' \
//        https://leancloud.cn/1.1/functions/sendVerifyCode
AV.Cloud.define("sendVerifyCode", function(request, response){
	var phone = request.params.phone;

    AV.Cloud.httpRequest({
        method: 'POST',
        url: "https://api.nexmo.com/verify/json",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: {
            number: phone,
            brand: NEXMO_BRAND,
            api_key: NEXMO_KEY,
            api_secret: NEXMO_SECRET
        }
    }).then(function(httpResponse){
        var replyMsg = JSON.parse(httpResponse.text);
        var code = parseInt(replyMsg.status);
        switch (code) {
            case 0:
                response.success(replyMsg.request_id);
                break;
            case 1:
                response.error("5_request_per_sec_cap_reached");
                break;
            case 3:
                response.error("invalid_parameter");
                break;
            case 7:
                response.error("number_blacklisted");
                break;
            case 10:
                response.error("concurrent_requests_not_allowed");
                break;
            case 15:
                response.error("number_not_supported");
                break;
            default:
                response.error(replyMsg.error_text);
                break;
        }

    }, function(error){
        console.error(error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"requestId": "b5e3639f56b0411cb4d5fa8be51b635a", "code": "4489"}' \
//        https://leancloud.cn/1.1/functions/checkVerifyCode
AV.Cloud.define("checkVerifyCode",function(request,response){
    var requestId=request.params.requestId;
    var code=request.params.code;

    AV.Cloud.httpRequest({
        method: 'POST',
        url: "https://api.nexmo.com/verify/check/json",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: {
            request_id: requestId,
            code: code,
            api_key: NEXMO_KEY,
            api_secret: NEXMO_SECRET
        }
    }).then(function(httpResponse){
        var replyMsg = JSON.parse(httpResponse.text);
        var code = parseInt(replyMsg.status);
        switch (code) {
            case 0:
                response.success(replyMsg.request_id);
                break;
            case 16:
                response.error("code_mismatch");
                break;
            case 17:
                response.error("wrong_code_too_many_times");
                break;
            default:
                response.error(replyMsg.error_text);
                break;
        }

    }, function(error){
        console.error(error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "56aedc6471cfe4005c16aacf", "password" : "test"}' \
//        https://leancloud.cn/1.1/functions/changePassword
AV.Cloud.define("changePassword", function(request, response){
    AV.Cloud.useMasterKey();

    var user;
    var userId = request.params.userId;
    var password = request.params.password;
    var userQuery = new AV.Query(AV.User);
    userQuery.get(userId).then(function(object){
        user = object;
        user.set("skyePassword", password);
        return user.save();
    }).then(function(){
        response.success(user);

    }, function(error){
        console.log(error);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"username" : "8618926774505", "password" : "test"}' \
//        https://leancloud.cn/1.1/functions/getOriginalPasswd
AV.Cloud.define("getOriginalPasswd", function(request, response){
    var user;
    var username = request.params.username;
    var password = request.params.password;
    var userQuery = new AV.Query(AV.User);
    userQuery.equalTo("username", username);
    userQuery.limit(1);
    userQuery.find().then(function(users){
        if (users.length > 0 && password == users[0].get("skyePassword")) {
            response.success(users[0].get("originalPassword"));
        } else {
            response.error("incorrect_password");
        }
    }, function(error){
        console.log(error);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId": "56aedc6471cfe4005c16aacf", "content": "I feel very happy now", "originId": "uDUOcsum7M", "url": "htmlUrl", "pictureUrls": "[\"url1\", \"url2\", \"url3\"]", "videoUrl": "videoUrl", "tagNames": "[\"精品\", \"攀岩\", \"户外\"]", "place": "深圳大学", "latitude": 33.56123, "longitude": 109.45684, "type": 0}' \
//        https://leancloud.cn/1.1/functions/post
AV.Cloud.define("post", function(request, response) {
    AV.Cloud.useMasterKey();

    var userId = request.params.userId;
    var content = request.params.content;
    var originId = request.params.originId;
    var url = request.params.url;
    var pictureUrls;
    if (undefined != request.params.pictureUrls) {
        pictureUrls = JSON.parse(request.params.pictureUrls);
    }
    var videoUrl = request.params.videoUrl;
    var tagNames;
    if (undefined != request.params.tagNames) {
        tagNames = JSON.parse(request.params.tagNames);
    }
    var place = request.params.place;
    var latitude = request.params.latitude;
    var longitude = request.params.longitude;
    var type = request.params.type;

    var Post = AV.Object.extend("Post");
    var Tag = AV.Object.extend("Tag");
    var _ = require('underscore');

    var post = new Post();
    var postTags = post.relation("tags");

    var user, postCount;

    var userQuery = new AV.Query(AV.User);

    var tagPromise = userQuery.get(userId).then(function(object){
        user = object;
        postCount = user.get("postCount");
        if (undefined == postCount) {
            postCount = 1;
        } else {
            postCount += 1;
        }
        return AV.Promise.as();
    });

    if (undefined != tagNames) {
        // adding tags
        _.each(tagNames, function(tagName) {
            post.addUnique("tagNames", tagName);
            tagPromise = tagPromise.then(function(){
                var tagQuery = new AV.Query(Tag);
                tagQuery.equalTo("name", tagName);
                return tagQuery.find().then(function(tags){
                    if (undefined != tags && tags.length > 0) {
                        console.log("tag " + tags[0].get("name") + " already exists...");

                        tags[0].set("useCount", tags[0].get("useCount") + 1);
                        return tags[0].save().then(function(object){
                            postTags.add(object);
                        });
                    } else {
                        console.log("tag " + tagName + " doesn't exist, creating...");

                        var tag = new Tag();
                        tag.set("name", tagName);
                        tag.set("useCount", 1);
                        return tag.save().then(function(object){
                            postTags.add(object);
                        });
                    }
                });
            });
        });
    }

    tagPromise.then(function(){
        post.set("author", user);
        post.set("content", content);
        post.set("contentLowercase", content.toLowerCase());
        if (undefined != originId) {
            var originPost = new Post();
            originPost.id = originId;
            post.set("origin", originPost);
        }
        post.set("url", url);
        post.set("pictureUrls", pictureUrls);
        post.set("videoUrl", videoUrl);
        post.set("place", place);
        if (undefined != latitude && undefined != longitude) {
            post.set("location", new AV.GeoPoint(latitude, longitude));
        }
        post.set("type", type);
        post.set("repostCount", 0);
        post.set("viewCount", 0);
        post.set("likesCount", 0);
        post.set("commentsCount", 0);
        post.set("status", 0);
        post.save(null, {
            success: function(newPost){
                if (undefined != originPost) {
                    var originPostQuery = new AV.Query(Post);
                    originPostQuery.get(originId, {
                        success: function(object){
                            var repostCount = object.get("repostCount");
                            object.set("repostCount", repostCount + 1);
                            object.save(null, {
                                success: function(object){
                                    user.set("postCount", postCount);
                                    user.save(null, {
                                        success: function(object){
                                            response.success(newPost);
                                        }, error: function(object, error){
                                            console.error(error.message);
                                            response.success(newPost);
                                        }
                                    });
                                }, error: function(error){
                                    console.error(error);
                                    response.success(newPost);
                                }
                            });
                        }, error: function(error){
                            console.error(error);
                            response.success(newPost);
                        }
                    });
                } else {
                    user.set("postCount", postCount);
                    user.save(null, {
                        success: function(object){
                            response.success(newPost);
                        }, error: function(object, error){
                            console.error(error.message);
                            response.success(newPost);
                        }
                    });
                }
            }, error: function(error){
                console.error(error);
                error.code = POST_FAILED;
                response.error(error);
            }
        });
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "p0GD2YBYK3", "postId": "uDUOcsum7M"}' \
//        https://leancloud.cn/1.1/functions/deletePost
AV.Cloud.define("deletePost", function(request, response) {
    AV.Cloud.useMasterKey();

    var userId = request.params.userId;
    var postId = request.params.postId;

    var Post = AV.Object.extend("Post");
    var postQuery = new AV.Query(Post);
    postQuery.include("author");
    postQuery.get(postId).then(function(post){
        if (userId != post.get("author").id) {
            return AV.Promise.error("not_allowed");
        } else {
            post.set("status", 1);
            return post.save();
        }
    }).then(function(post){
        var author = post.get("author");
        var postCount = author.get("postCount");
        if (undefined == postCount || postCount <1) {
            postCount = 0;
        } else {
            postCount -= 1;
        }
        author.set("postCount", postCount);
        return author.save();

    }).then(function(post){
        response.success(post);

    }, function(error){
        console.error("error: " + error + ", error message: " + error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "56b009faa633bd0058ef0988", "postId": "56b17d22128fe100529c88e9", "message": "有人赞你哦"}' \
//        https://leancloud.cn/1.1/functions/likePost
AV.Cloud.define("likePost", function(request, response) {
    AV.Cloud.useMasterKey();

    var userId = request.params.userId;
    var postId = request.params.postId;
    var message = request.params.message;

    var Post = AV.Object.extend("Post");
    var Comment = AV.Object.extend("Comment");

    var user, post, postAuthor, likes;

    var postQuery = new AV.Query(Post);
    postQuery.include("author");
    postQuery.get(postId).then(function(object){
        post = object;
        postAuthor = post.get("author");

        if (undefined == post.get("author")) {
            return AV.Promise.as();
        } else{
            var blockees = post.get("author").relation("blockees");
            return blockees.query().get(userId).then(function(blockee){
                return AV.Promise.error("not_allowed");
            }, function(error){
                console.error("user not in blockee list: " + error.message);
                return AV.Promise.as();
            });
        }
    }, function(error){
        console.error("post doesn't exist: " + error);
        return AV.Promise.error("nonexistent");

    }).then(function(){
        user = new AV.User();
        user.id = userId;

        var comment = new Comment();
        comment.set("author", user);
        comment.set("status", 2);
        comment.set("post", post);
        if (undefined != postAuthor) {
            comment.set("postAuthor", postAuthor);
        }
        if (undefined != postAuthor && userId == postAuthor.id) {
            comment.set("authorReadAt", new Date());
        }
        return comment.save();

    }).then(function(comment){

        var likeRelation = post.relation("likes");
        likeRelation.add(user);

        var likesCount = post.get("likesCount");
        if (undefined == likesCount) {
            post.set("likesCount", 1);
        } else {
            post.set("likesCount", likesCount + 1);
        }
        return post.save();
    }).then(function(object){
        if (undefined != postAuthor && userId != postAuthor.id) {
            var postRelatedBadge = postAuthor.get("postRelatedBadge");
            if (undefined == postRelatedBadge) {
                postRelatedBadge = 1;
            } else {
                postRelatedBadge += 1;
            }
            var messageBadge = postAuthor.get("messageBadge");
            if (undefined == messageBadge) {
                messageBadge = 0;
            }
            var appMessageBadge = postAuthor.get("appMessageBadge");
            if (undefined == appMessageBadge) {
                appMessageBadge = 0;
            }
            postAuthor.set("postRelatedBadge", postRelatedBadge);
            return postAuthor.save().then(function(object){
                var pushQuery = new AV.Query('_Installation');
                pushQuery.equalTo("user", postAuthor);
                pushQuery.equalTo("online", true);
                return AV.Push.send({
                    prod: "dev",
                    where: pushQuery,
                    data: {
                        type: 1, // 0 comment, 1 like, 2 message
                        postId: postId,
                        badge: postRelatedBadge + messageBadge + appMessageBadge,
                        alert: message,
                        sound: "default"
                    }
                });
            });
        } else {
            return AV.Promise.as();
        }

    }).then(function(){
        response.success();

    }, function(error){
        console.error(error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "56b009faa633bd0058ef0988", "postId": "56b17d22128fe100529c88e9"}' \
//        https://leancloud.cn/1.1/functions/unlikePost
AV.Cloud.define("unlikePost", function(request, response) {
    AV.Cloud.useMasterKey();

    var _ = require('underscore');

    var userId = request.params.userId;
    var postId = request.params.postId;

    var Post = AV.Object.extend("Post");
    var post, user;

    var postQuery = new AV.Query(Post);
    postQuery.include("author");
    postQuery.get(postId).then(function(object){
        post = object;

        var likes = post.relation("likes");
        user = new AV.User();
        user.id = userId;
        likes.remove(user);
        var likesCount = post.get("likesCount");
        if (undefined == likesCount) {
            post.set("likesCount", 0);
        } else {
            post.set("likesCount", likesCount - 1);
        }
        return post.save();

    }, function(error){
        console.error("post doesn't exist: " + error.message);
        return AV.Promise.error("nonexistent");

    }).then(function(){
        var commentQuery = new AV.Query("Comment");
        commentQuery.equalTo("author", user);
        commentQuery.equalTo("post", post);
        commentQuery.equalTo("status", 2);
        return commentQuery.find();
    }).then(function(comments){
        var promise = new AV.Promise.as();
        _.each(comments, function(comment){
            promise = promise.then(function(){
                var postAuthor = post.get("author");
                if (undefined == comment.get("authorReadAt") && undefined != postAuthor) {
                    var postRelatedBadge = postAuthor.get("postRelatedBadge");
                    if (undefined == postRelatedBadge || postRelatedBadge < 1) {
                        postRelatedBadge = 0;
                    } else {
                        postRelatedBadge -= 1;
                    }
                    postAuthor.set("postRelatedBadge", postRelatedBadge);
                    return postAuthor.save().then(function(){
                        return comment.destroy();
                    });
                } else {
                    return comment.destroy();
                }
            });
        });
        return promise;
    }).then(function(){
        response.success();

    }, function(error){
        console.error("error: " + error + ", error message: " + error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "uJnJfmqFvw", "postId": "suRn3IkM9U", "content": "this is a comment with replyee", "replyeeId": "PM0oHKiFa7"}' \
//        https://leancloud.cn/1.1/functions/comment
AV.Cloud.define("comment", function(request, response) {
    AV.Cloud.useMasterKey();
    var _ = require('underscore');

    var userId = request.params.userId;
    var postId = request.params.postId;
    var content = request.params.content;
    var replyeeId = request.params.replyeeId;

    var Post = AV.Object.extend("Post");
    var Comment = AV.Object.extend("Comment");

    var user, post, postAuthor, replyee, comment;

    var postQuery = new AV.Query(Post);
    postQuery.include("author");
    postQuery.get(postId).then(function(object){
        post = object;
        postAuthor = post.get("author");

        if (undefined == postAuthor) {
            return AV.Promise.as();
        } else {
            var blockees = postAuthor.relation("blockees");
            return blockees.query().get(userId).then(function(blockee){
                return AV.Promise.error("not_allowed");

            }, function(error){
                console.error("user not in blockee list: " + error.message);
                return AV.Promise.as();
            });
        }
    }, function(error){
        return AV.Promise.error("nonexistent");

    }).then(function(){
        var userQuery = new AV.Query(AV.User);
        return userQuery.get(userId);
    }).then(function(object){
        user = object;
        if (undefined != replyeeId) {
            var replyeeQuery = new AV.Query(AV.User);
            return replyeeQuery.get(replyeeId).then(function(object){
                replyee = object;
                return AV.Promise.as();
            });
        } else {
            return AV.Promise.as();
        }
    }).then(function(object){
        comment = new Comment();
        comment.set("author", user);
        if (undefined != postAuthor) {
            comment.set("postAuthor", postAuthor);
        }
        comment.set("post", post);
        comment.set("content", content);
        comment.set("contentLowercase", content.toLowerCase());
        comment.set("status", 0);
        if (undefined != postAuthor && postAuthor.id == userId) {
            comment.set("authorReadAt", new Date());
        }
        if (undefined != replyee) {
            comment.set("replyee", replyee);
        }
        return comment.save();

    }).then(function(comment){
        var commentsCount = post.get("commentsCount");
        if (undefined == commentsCount) {
            post.set("commentsCount", 1);
        } else {
            post.set("commentsCount", commentsCount + 1);
        }

        return post.save();
    }).then(function(object){
        console.log("comment author: " + userId);
        if (undefined == postAuthor || postAuthor.id == userId) {
            console.log("author doesn't exist or post author is comment author...");
            return AV.Promise.as();

        } else {
            console.log("author for the post: " + postAuthor.id);
            var postRelatedBadge = postAuthor.get("postRelatedBadge");
            if (undefined == postRelatedBadge) {
                postRelatedBadge = 1;
            } else {
                postRelatedBadge += 1;
            }
            postAuthor.set("postRelatedBadge", postRelatedBadge);
            return postAuthor.save();
        }

    }).then(function(object){
        if (undefined == replyee) {
            console.log("replyee doesn't exist...");
            return AV.Promise.as();
        } else {
            var postRelatedBadge = replyee.get("postRelatedBadge");
            console.log("replyee " + replyee.id + " has " + postRelatedBadge + " badges before");

            if (undefined == postRelatedBadge) {
                postRelatedBadge = 1;
            } else {
                postRelatedBadge += 1;
            }
            replyee.set("postRelatedBadge", postRelatedBadge);
            console.log("replyee " + replyee.id + " has " + postRelatedBadge + " badges after");
            return replyee.save();
        }

    }).then(function(object){
        var receiverQuery;
        if (undefined == replyee) {
            receiverQuery = new AV.Query(AV.User);
            if(undefined == postAuthor) {
                receiverQuery.equalTo('objectId', "");
            } else {
                receiverQuery.equalTo('objectId', postAuthor.id);
            }
        } else {
            var authorQuery = new AV.Query(AV.User);
            if(undefined == postAuthor) {
                authorQuery.equalTo('objectId', "");
            } else {
                authorQuery.equalTo('objectId', postAuthor.id);
            }

            var replyeeQuery = new AV.Query(AV.User);
            replyeeQuery.equalTo('objectId', replyee.id);

            receiverQuery = AV.Query.or(authorQuery, replyeeQuery);
        }
        return receiverQuery.find();
    }).then(function(pushReceivers){

        var promise = new AV.Promise.as();
        _.each(pushReceivers, function(pushReceiver){
            promise = promise.then(function(){
                if (pushReceiver.id == userId) {
                    return AV.Promise.as();
                } else {
                    var postRelatedBadge = pushReceiver.get("postRelatedBadge");
                    if (undefined == postRelatedBadge) {
                        postRelatedBadge = 0;
                    }
                    var messageBadge = pushReceiver.get("messageBadge");
                    if (undefined == messageBadge) {
                        messageBadge = 0;
                    }
                    var appMessageBadge = pushReceiver.get("appMessageBadge");
                    if (undefined == appMessageBadge) {
                        appMessageBadge = 0;
                    }
                    console.log("sending push for " + pushReceiver.id + " with " + postRelatedBadge + " badges");
                    var pushQuery = new AV.Query('_Installation');
                    pushQuery.equalTo("user", pushReceiver);
                    pushQuery.equalTo("online", true);
                    return AV.Push.send({
                        prod: "dev",
                        where: pushQuery,
                        data: {
                            type: 0, // 0 comment, 1 like, 2 message
                            commentId: comment.id,
                            badge: postRelatedBadge + messageBadge + appMessageBadge,
                            alert: user.get("nickname") + ": " + content,
                            messageBadge: messageBadge,
                            postRelatedBadge: postRelatedBadge,
                            appMessageBadge: appMessageBadge,
                            sound: "default"
                        }
                    });
                }
            });
        });

        return promise;
    }).then(function(){
        response.success();

    }, function(error){
        console.error(error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "p0GD2YBYK3", "commentId": "CRaioMCExI"}' \
//        https://leancloud.cn/1.1/functions/deleteComment
AV.Cloud.define("deleteComment", function(request, response) {
    AV.Cloud.useMasterKey();

    var userId = request.params.userId;
    var commentId = request.params.commentId;

    var user, comment;

    var Comment = AV.Object.extend("Comment");
    var commentQuery = new AV.Query(Comment);
    commentQuery.include("author");
    commentQuery.include("replyee");
    commentQuery.include("post");
    commentQuery.include("post.author");
    commentQuery.get(commentId).then(function(object){
        comment = object;

        comment.set("status", 1);
        return comment.save().then(function(object){
            var post = comment.get("post");

            var commentsCount = post.get("commentsCount");
            if (undefined == commentsCount || commentsCount < 1) {
                post.set("commentsCount", 0);
            } else {
                post.set("commentsCount", commentsCount - 1);
            }

            return post.save().then(function(object){
                if (undefined == comment.get("authorReadAt")) {
                    var author = comment.get("post").get("author");
                    var postRelatedBadge = author.get("postRelatedBadge");
                    if (undefined == postRelatedBadge || postRelatedBadge < 1) {
                        postRelatedBadge = 0;
                    } else {
                        postRelatedBadge -= 1;
                    }
                    author.set("postRelatedBadge", postRelatedBadge);
                    return author.save();
                } else {
                    console.log("not reset author's badge");
                    return AV.Promise.as();
                }
            });
        });
    }).then(function(){
        var replyee = comment.get("replyee");
        if (undefined != replyee && undefined == comment.get("replyeeReadAt")) {
            var postRelatedBadge = replyee.get("postRelatedBadge");
            if (undefined == postRelatedBadge || postRelatedBadge < 1) {
                postRelatedBadge = 0;
            } else {
                postRelatedBadge -= 1;
            }
            replyee.set("postRelatedBadge", postRelatedBadge);
            return replyee.save();
        }

    }).then(function(){
        response.success();

    }, function(error){
        console.error("error: " + error + ", error message: " + error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "p0GD2YBYK3", "commentId": "CRaioMCExI"}' \
//        https://leancloud.cn/1.1/functions/readComments
AV.Cloud.define("readComments", function(request, response) {
    AV.Cloud.useMasterKey();

    var _ = require('underscore');

    var userId = request.params.userId;
    var commentId = request.params.commentId;

    var commentCount, user;

    var Comment = AV.Object.extend("Comment");

    var commentQuery = new AV.Query(Comment);
    commentQuery.include("author");
    commentQuery.include("postAuthor");
    commentQuery.include("post");
    commentQuery.include("replyee");
    commentQuery.get(commentId).then(function(comment){
        var post = comment.get("post");

        var replyee = comment.get("replyee");
        var postAuthor = comment.get("postAuthor");

        var unreadCommentQuery = new AV.Query(Comment);
        unreadCommentQuery.include("postAuthor");
        unreadCommentQuery.include("replyee");
        unreadCommentQuery.notEqualTo("status", 1);
        unreadCommentQuery.equalTo("post", post);

        if (undefined != replyee && replyee.id == userId) {
            user = replyee;
            unreadCommentQuery.doesNotExist("replyeeReadAt");
            unreadCommentQuery.equalTo("replyee", user);
            return unreadCommentQuery.find();

        } else if (undefined != postAuthor && postAuthor.id == userId) {
            user = postAuthor;
            unreadCommentQuery.doesNotExist("authorReadAt");
            unreadCommentQuery.equalTo("postAuthor", user);
            return unreadCommentQuery.find();

        } else {
            return AV.Promise.error("nonexistent");
        }
    }).then(function(comments){
        commentCount = comments.length;
        console.log("found " + commentCount + " comments...");

        var promise = new AV.Promise.as();
        _.each(comments, function(comment){
            promise = promise.then(function(){
                var replyee = comment.get("replyee");
                var postAuthor = comment.get("postAuthor");
                if (undefined != replyee && userId == replyee.id) {
                    comment.set("replyeeReadAt", new Date());
                    return comment.save();

                } else if (userId = postAuthor.id) {
                    comment.set("authorReadAt", new Date());
                    return comment.save();

                } else {
                    return AV.Promise.error("found_incorrect_comment");
                }
            });
        });
        return promise;

    }).then(function(){
        var postRelatedBadge = user.get("postRelatedBadge");
        if (undefined == postRelatedBadge || postRelatedBadge < commentCount) {
            postRelatedBadge = 0;
        } else {
            postRelatedBadge -= commentCount;
        }
        user.set("postRelatedBadge", postRelatedBadge);
        return user.save();

    }).then(function(){
        response.success();

    }, function(error){
        console.error("error: " + error + ", error message: " + error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "56b009faa633bd0058ef0988", "postId" : "56b17d22128fe100529c88e9"}' \
//        https://leancloud.cn/1.1/functions/getPostRelatedDetails
AV.Cloud.define("getPostRelatedDetails", function(request, response){
    var _ = require('underscore');
    var Post = AV.Object.extend("Post");

    var post;
    var user;
    var userId = request.params.userId;
    var postId = request.params.postId;

    var authorFollowedByUser = false;
    var userFollowedByAuthor = false;
    var likes;

    var postQuery = new AV.Query(Post);
    postQuery.include("author");
    postQuery.get(postId).then(function(object){
        post = object;
        var author = post.get("author");

        if (undefined == userId || undefined == author) {
            return AV.Promise.as();
        } else {
            var followersRelation = author.relation("followers");
            var followersQuery = followersRelation.query();
            followersQuery.equalTo("objectId", userId);

            return followersQuery.find().then(function(objects){
                if (undefined != objects && objects.length > 0) {
                    console.log("found " + objects.length + " followers of author");
                    authorFollowedByUser = true;
                }

                var userQuery = new AV.Query(AV.User);
                return userQuery.get(userId).then(function(object) {
                    user = object;
                    var userFollowersRelation = user.relation("followers");
                    var userFollowersQuery = userFollowersRelation.query();
                    userFollowersQuery.equalTo("objectId", author.id);

                    return userFollowersQuery.find().then(function(objects){
                        if (undefined != objects && objects.length > 0) {
                            console.log("found " + objects.length + " followers of user");
                            userFollowedByAuthor = true;
                        } else {
                            console.log("found 0 followers of user");
                        }
                        return AV.Promise.as();
                    });
                });
            }, function(error){
                console.log(error.message);
                return AV.Promise.as();
            });
        }
    }).then(function(){
        var likesRelation = post.relation("likes");
        console.log(likesRelation);
        var likesQuery = likesRelation.query();
        likesQuery.limit(10);
        likesQuery.descending("createdAt");
        return likesQuery.find().then(function(objects){
            likes = objects;
            console.log("likes count: " + likes.length);
            return AV.Promise.as();
        });

    }).then(function(){
        var viewCount = post.get("viewCount");
        if (undefined == viewCount) {
            viewCount = 1;
        } else {
            viewCount += 1;
        }
        post.set("viewCount", viewCount);
        return post.save();

    }).then(function(){
        response.success({
            "postType": post.get("type"),
            "authorFollowedByUser": authorFollowedByUser,
            "userFollowedByAuthor": userFollowedByAuthor,
            "likes": likes
        });

    }, function(error){
        console.log(error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "56aedc6471cfe4005c16aacf", "selfId" : "56af3c778ac2470053a31440", "limit" : 10, "skip" : 0, "type": 0}' \
//        https://leancloud.cn/1.1/functions/getFolloweePosts

// type 0: followees' posts
// type 1: own posts
// type 2: starred posts
AV.Cloud.define("getFolloweePosts", function(request, response){
    var _ = require('underscore');
    var Post = AV.Object.extend("Post");

    var user;
    var self;
    var userFollowedBySelf = false;
    var selfFollowedByUser = false;

    var userId = request.params.userId;
    var selfId = request.params.selfId;
    var skip = request.params.skip;
    var limit = request.params.limit;
    var timestamp = request.params.timestamp;
    var type = request.params.type;

    var userQuery = new AV.Query(AV.User);
    userQuery.get(userId).then(function(object){
        user = object;
        if (undefined != selfId) {
            if (userId != selfId) {
                var selfQuery = new AV.Query(AV.User);
                return selfQuery.get(selfId).then(function(object){
                    self = object;
                    var followersRelation = user.relation("followers");
                    var followersQuery = followersRelation.query();
                    followersQuery.equalTo("objectId", selfId);
                    return followersQuery.find().then(function(objects){
                        if (undefined != objects && objects.length > 0) {
                            userFollowedBySelf = true;
                        }

                        var followersRelation = self.relation("followers");
                        var followersQuery = followersRelation.query();
                        followersQuery.equalTo("objectId", userId);

                        return followersQuery.find().then(function(objects){
                            if (undefined != objects && objects.length > 0) {
                                selfFollowedByUser = true;
                            }
                            return AV.Promise.as();
                        });
                    });
                });
            } else {
                userFollowedBySelf = true;
                selfFollowedByUser = true;
                return AV.Promise.as();
            }
        } else {
            userFollowedBySelf = false;
            selfFollowedByUser = false;
            return AV.Promise.as();
        }

    }, function(error){
        if (2 == type) {
            return AV.Promise.as();
        } else {
            return AV.Promise.error(error);
        }

    }).then(function(){
        var postQuery, regularPostQuery, starredPostQuery;

        switch(type) {
            case 0:
                var followeesRelation = user.relation("followees");
                var followeesQuery = followeesRelation.query();

                var selfQuery = new AV.Query(AV.User);
                selfQuery.equalTo("objectId", user.id);

                regularPostQuery = new AV.Query(Post);
                regularPostQuery.equalTo("status", 0);

                starredPostQuery = new AV.Query(Post);
                starredPostQuery.equalTo("status", 2);

                postQuery = AV.Query.or(regularPostQuery, starredPostQuery);

                postQuery.matchesQuery("author", AV.Query.or(selfQuery, followeesQuery));
                postQuery.equalTo("type", 0);
                postQuery.descending("createdAt");
                break;
            case 1:
                postQuery = new AV.Query(Post);
                postQuery.equalTo("author", user);
                postQuery.equalTo("type", 0);
                postQuery.notEqualTo("status", 1);
                postQuery.descending("createdAt");
                break;
            case 2:
                postQuery = new AV.Query(Post);

                postQuery.equalTo("status", 2); //0 means regular, 1 means deleted, 2 starred
                postQuery.descending("starredAt");
                break;
        }
        postQuery.include("author");
        postQuery.include("origin");
        postQuery.skip(skip);
        postQuery.limit(limit);
        postQuery.lessThanOrEqualTo("createdAt", new Date(timestamp));
        return postQuery.find();
        
    }).then(function(posts){
        var results = {};
        var likedPosts = [];
        var likesPromise = new AV.Promise.as();
        console.log("found " + posts.length + " posts");
        _.each(posts, function(post){
            likesPromise = likesPromise.then(function(){
                var likesRelation = post.relation("likes");
                var likesQuery = likesRelation.query();
                likesQuery.equalTo("objectId", userId);
                likesQuery.limit(1);
                return likesQuery.find().then(function(likes){
                    if (undefined != likes && likes.length > 0) {
                        likedPosts.push(post.id);
                    }
                    return AV.Promise.as();
                });
            });
        });
        return likesPromise.then(function(){
            results["likedPosts"] = likedPosts;
            results["userFollowedBySelf"] = userFollowedBySelf;
            results["selfFollowedByUser"] = selfFollowedByUser;
            response.success(results);
        }, function(error){
            console.log(error.message);
            response.error(error);
        });

    }, function(error){
        console.log(error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "56aedc6471cfe4005c16aacf", "followeeId" : "56b009faa633bd0058ef0988"}' \
//        https://leancloud.cn/1.1/functions/follow
AV.Cloud.define("follow", function(request, response) {
    AV.Cloud.useMasterKey();

    var userId = request.params.userId;
    var followeeId = request.params.followeeId;

    var user; // current user
    var followee; // user to follow

    var userQuery = new AV.Query(AV.User);
    userQuery.get(userId).then(function(object){
        user = object;
        var followeeQuery = new AV.Query(AV.User);
        return followeeQuery.get(followeeId);

    }).then(function(object){
        followee = object;
        var blockees = followee.relation("blockees");
        return blockees.query().get(userId).then(function(blockee){
            return AV.Promise.error("not_allowed");
        }, function(error){
            console.log("user is not blocked by the followee: " + error.message);
            return AV.Promise.as();
        });
    }, function(error){
        console.error("failed to find user: " + error.message);
        return AV.Promise.error("nonexistent");

    }).then(function(){
        // add followee to user's followee list
        var followees = user.relation("followees");
        var followeeQuery = followees.query();
        followeeQuery.equalTo("objectId", followeeId);
        return followeeQuery.find().then(function(objects){
            if(undefined == objects || objects.length < 1) {
                followees.add(followee);
                var followeeCount = user.get("followeeCount");
                if (undefined == followeeCount) {
                    user.set("followeeCount", 1);
                } else {
                    user.set("followeeCount", followeeCount + 1);
                }
            }
            return user.save();
        });

    }).then(function(object){
        // add user to followee's follower list
        var followers = followee.relation("followers");
        var followerQuery = followers.query();
        followerQuery.equalTo("objectId", userId);
        return followerQuery.find().then(function(objects){
            if(undefined == objects || objects.length < 1) {
                followers.add(user);
                var followerCount = followee.get("followerCount");
                if (undefined == followerCount) {
                    followee.set("followerCount", 1);
                } else {
                    followee.set("followerCount", followerCount + 1);
                }
            }
            return followee.save();
        });

    }).then(function(object){
        followee = object;
        response.success(followee);
    }, function(error){
        console.error("error: " + error + ", error message: " + error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "56aedc6471cfe4005c16aacf", "unfolloweeId" : "56b009faa633bd0058ef0988"}' \
//        https://leancloud.cn/1.1/functions/unfollow
AV.Cloud.define("unfollow", function(request, response) {
    AV.Cloud.useMasterKey();

    var userId = request.params.userId;
    var unfolloweeId = request.params.unfolloweeId;

    var user; // current user
    var unfollowee; // user to unfollow

    var userQuery = new AV.Query(AV.User);
    userQuery.get(userId).then(function(object){
        console.log("found user: " + object.id);
        user = object;
        var unfolloweeQuery = new AV.Query(AV.User);
        return unfolloweeQuery.get(unfolloweeId);

    }).then(function(object){
        console.log("found unfollowee: " + object.id);
        unfollowee = object;
        return AV.Promise.as();

    }, function(error){
        console.error("failed to find user: " + error.message);
        return AV.Promise.error("nonexistent");
    }).then(function(){
        // remove unfollowee from user's followee list
        var followees = user.relation("followees");
        var followeeQuery = followees.query();
        followeeQuery.equalTo("objectId", unfolloweeId);
        return followeeQuery.find().then(function(objects){
            if(undefined != objects && objects.length > 0) {
                followees.remove(unfollowee);
                var followeeCount = user.get("followeeCount");
                if (undefined == followeeCount) {
                    user.set("followeeCount", 0);
                } else {
                    user.set("followeeCount", followeeCount - 1);
                }
            }
            return user.save();
        });

    }).then(function(object){
        // remove user from unfollowee's follower list
        var followers = unfollowee.relation("followers");
        var followerQuery = followers.query();
        followerQuery.equalTo("objectId", userId);
        return followerQuery.find().then(function(objects){
            if(undefined != objects && objects.length > 0) {
                followers.remove(user);
                var followerCount = unfollowee.get("followerCount");
                if (undefined == followerCount) {
                    unfollowee.set("followerCount", 0);
                } else {
                    unfollowee.set("followerCount", followerCount - 1);
                }
            }
            return unfollowee.save();
        });

    }).then(function(object){
        unfollowee = object;
        response.success(unfollowee);

    }, function(error){
        console.error("error: " + error + ", error message: " + error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "uJnJfmqFvw", "userId" : "PM0oHKiFa7", "action" : 0, "skip":0, "limit":10}' \
//        https://leancloud.cn/1.1/functions/getRelatedUsers

// action 0: get followees
// action 1: get followers
AV.Cloud.define("getRelatedUsers", function(request, response){
    var _ = require('underscore');

    var user;
    var users;
    var followerRelations = [];
    var followeeRelations = [];
    var userId = request.params.userId;
    var selfId = request.params.selfId;
    var action = request.params.action;
    var skip = request.params.skip;
    var limit = request.params.limit;
    var timestamp = request.params.timestamp;

    var userQuery = new AV.Query(AV.User);
    userQuery.get(userId).then(function(object){
        user = object;

        var relation;
        if (0 == action) {
            relation = user.relation("followees");
        } else {
            relation = user.relation("followers");
        }
        var query = relation.query();
        query.skip(skip);
        query.limit(limit);
        query.lessThanOrEqualTo("createdAt", new Date(timestamp));
        query.ascending("nicknameLowercase");

        return query.find();

    }).then(function(objects){
        users = objects;
        var promise = new AV.Promise.as();
        _.each(objects, function(object){
            if (undefined != selfId) {
                promise = promise.then(function(){
                    var followers = object.relation("followers");
                    var followerQuery = followers.query();
                    followerQuery.equalTo("objectId", selfId);

                    return followerQuery.find().then(function(objs){
                        if (undefined != objs && objs.length > 0) {
                            followerRelations.push(true);
                        } else {
                            followerRelations.push(false);
                        }
                        return AV.Promise.as();

                    }, function(error){
                        console.log(error.message);
                        followerRelations.push(false);
                        return AV.Promise.as();

                    }).then(function(){
                        var followees = object.relation("followees");
                        var followeeQuery = followees.query();
                        followeeQuery.equalTo("objectId", selfId);

                        return followeeQuery.find().then(function(objs){
                            if (undefined != objs && objs.length > 0) {
                                followeeRelations.push(true);
                            } else {
                                followeeRelations.push(false);
                            }
                            return AV.Promise.as();

                        }, function(error){
                            console.log(error.message);
                            followeeRelations.push(false);
                            return AV.Promise.as();

                        });
                    }, function(error){
                        console.log(error.message);
                        followeeRelations.push(false);
                        return AV.Promise.as();
                    });
                });
            } else {
                followerRelations.push(false);
                followeeRelations.push(false);
            }
        });
        return promise;
    }).then(function(){
        response.success({
            "followerRelations": followerRelations,
            "followeeRelations": followeeRelations
        });
    }, function(error){
        console.log(error.message);
        response.error(error);
    });
});

AV.Cloud.define("getLikesRelations", function(request, response){
    var _ = require('underscore');

    var user;
    var followerRelations = {};
    var followeeRelations = {};
    var userId = request.params.userId;
    var likeIds = JSON.parse(request.params.likeIds);

    var userQuery = new AV.Query(AV.User);
    userQuery.get(userId).then(function(object){
        user = object;

        var promise = new AV.Promise.as();
        _.each(likeIds, function(likeId){
            console.log("likeId: " + likeId);
            promise = promise.then().then(function(){
                var followers = user.relation("followers");
                var followerQuery = followers.query();
                followerQuery.equalTo("objectId", likeId);
                return followerQuery.find().then(function(objects){
                    console.log("follower count for " + likeId + ": " + objects.length);
                    if (objects.length > 0){
                        followerRelations[likeId] = true;
                    } else {
                        followerRelations[likeId] = false;
                    }
                    return AV.Promise.as();

                }, function(error){
                    console.log(error.message);
                    followerRelations[likeId] = false;
                    return AV.Promise.as();

                }).then(function(){
                    var followees = user.relation("followees");
                    var followeeQuery = followees.query();
                    followeeQuery.equalTo("objectId", likeId);
                    return followeeQuery.find().then(function(objects){
                        console.log("followee count for " + likeId + ": " + objects.length);
                        if (objects.length > 0){
                            followeeRelations[likeId] = true;
                        } else {
                            followeeRelations[likeId] = false;
                        }
                        return AV.Promise.as();

                    }, function(error){
                        console.log(error.message);
                        followeeRelations[likeId] = false;
                        return AV.Promise.as();

                    });
                });
            });
        });
        return promise;
    }).then(function(){
        console.log(followerRelations);
        console.log(followeeRelations);
        response.success({
            "followerRelations": followerRelations,
            "followeeRelations": followeeRelations
        });
    }, function(error){
        console.log(error.message);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"userId" : "PM0oHKiFa7", "type" : 1, "limit" : 10, "skip" : 0}' \
//        https://leancloud.cn/1.1/functions/getDiscoveryPostsByType

/*
 * post type 0: user's moment
 * post type 1: topic/discussion
 * post type 2: activity
 * post type 3: article
 *
 * post status 0: normal
 * post status 1: deleted
 * post status 2: starred
 * post status 3: top
 */
AV.Cloud.define("getDiscoveryPostsByType", function(request, response){
    var _ = require('underscore');
    var Post = AV.Object.extend("Post");

    var userId = request.params.userId;
    var type = request.params.type;
    var limit = request.params.limit;
    var skip = request.params.skip;
    var timestamp = request.params.timestamp;

    var posts;
    var likedPosts = [];

    var postQuery = new AV.Query(Post);
    postQuery.equalTo("type", type);
    postQuery.notEqualTo("status", 1);
    postQuery.lessThanOrEqualTo("createdAt", new Date(timestamp));
    postQuery.descending("createdAt");
    postQuery.include("author");
    postQuery.include("origin");
    postQuery.limit(limit);
    postQuery.skip(skip);
    postQuery.find().then(function(objects){
        posts = objects;

        var promise = new AV.Promise.as();
        var likesMap = {};
        if (undefined != userId && "" != userId) {
            _.each(posts, function(post){
                promise = promise.then(function(){
                    var likesRelation = post.relation("likes");
                    var likesQuery = likesRelation.query();
                    likesQuery.equalTo("objectId", userId);
                    likesQuery.limit(1);
                    return likesQuery.find().then(function(likes){
                        if (undefined != likes && likes.length > 0 && undefined == likesMap[post.id]) {
                            likedPosts.push(post.id);
                            likesMap[post.id] = true;
                        }
                        return AV.Promise.as();
                    });
                });
            });
        }
        return promise;

    }).then(function(){
        response.success({
            "likedPosts" : likedPosts,
        });

    }, function(error){
        console.log(error);
        response.error(error);
    });
});

// curl -X POST -H "Content-Type: application/json; charset=utf-8" \
//        -H "X-LC-Id: aGL87E7UuUFaPwhDO9Hvgxxg-gzGzoHsz" \
//        -H "X-LC-Key: 9yk30AOHHIyBzSAxi7QSpjYi" \
//        -H "X-LC-Prod: 0" \
//        -d '{"searchTerm" : "michigan", "userId" : "PM0oHKiFa7", "action" : 0, "skip" : 0, "limit" : 0}' \
//        https://leancloud.cn/1.1/functions/searchRelatedStuff
/*
 * action 0: get 20 related users and 20 related posts by default
 * action 1: get related USERS based on limit and skip value
 * action 2: get related POSTS based on limit and skip value
 */
AV.Cloud.define("searchRelatedStuff", function(request, response){
    var _ = require('underscore');
    var Post = AV.Object.extend("Post");

    var searchTerm = request.params.searchTerm;
    var userId = request.params.userId;
    var action = request.params.action;
    var skip = 0;
    var limit = 20;
    var timestamp;
    if (undefined != action && 0 != action) {
        skip = request.params.skip;
        limit = request.params.limit;
        timestamp = request.params.timestamp;
    }

    var relatedUsers, relatedPosts;
    var followerRelations = {};
    var followeeRelations = {};
    var likedPosts = [];

    AV.Promise.as().then(function(){
        if (2 != action) {
            var relatedUserQuery = new AV.Query(AV.User);
            relatedUserQuery.contains("nicknameLowercase", searchTerm.toLowerCase());
            relatedUserQuery.limit(limit);
            relatedUserQuery.skip(skip);
            if (undefined != timestamp) {
                relatedUserQuery.lessThanOrEqualTo("createdAt", new Date(timestamp));
            }
            return relatedUserQuery.find().then(function(users){
                relatedUsers = users;

                var promise = new AV.Promise.as();
                if (undefined != userId && "" != userId) {
                    _.each(relatedUsers, function(user){
                        promise = promise.then(function(){
                            var followers = user.relation("followers");
                            var followerQuery = followers.query();
                            followerQuery.equalTo("objectId", userId);

                            return followerQuery.find().then(function(objs){
                                if (undefined != objs && objs.length > 0) {
                                    followerRelations[user.id] = true;
                                } else {
                                    followerRelations[user.id] = false;
                                }
                                return AV.Promise.as();

                            }, function(error){
                                console.log(error.message);
                                followerRelations[user.id] = false;
                                return AV.Promise.as();

                            }).then(function(){
                                var followees = user.relation("followees");
                                var followeeQuery = followees.query();
                                followeeQuery.equalTo("objectId", userId);

                                return followeeQuery.find().then(function(objs){
                                    if (undefined != objs && objs.length > 0) {
                                        followeeRelations[user.id] = true;
                                    } else {
                                        followeeRelations[user.id] = false;
                                    }
                                    return AV.Promise.as();

                                }, function(error){
                                    console.log(error.message);
                                    followeeRelations[user.id] = false;
                                    return AV.Promise.as();

                                });
                            }, function(error){
                                console.log(error.message);
                                followeeRelations[user.id] = false;
                                return AV.Promise.as();
                            });
                        });
                    });
                }
                return promise;
            });
        } else {
            return AV.Promise.as();
        }
    }).then(function(){
        if (1 != action) {
            var postQuery = new AV.Query(Post);
            postQuery.contains("contentLowercase", searchTerm.toLowerCase());
            postQuery.notEqualTo("status", 1);
            postQuery.descending("createdAt");
            postQuery.include("author");
            postQuery.include("origin");
            postQuery.limit(limit);
            postQuery.skip(skip);
            if (undefined != timestamp) {
                postQuery.lessThanOrEqualTo("createdAt", new Date(timestamp));
            }
            return postQuery.find().then(function(posts){
                relatedPosts = posts;

                var promise = new AV.Promise.as();
                var likesMap = {};
                if (undefined != userId && "" != userId) {
                    _.each(relatedPosts, function(post){
                        promise = promise.then(function(){
                            var likesRelation = post.relation("likes");
                            var likesQuery = likesRelation.query();
                            likesQuery.equalTo("objectId", userId);
                            likesQuery.limit(1);
                            return likesQuery.find().then(function(likes){
                                if (undefined != likes && likes.length > 0 && undefined == likesMap[post.id]) {
                                    likedPosts.push(post.id);
                                    likesMap[post.id] = true;
                                }
                                return AV.Promise.as();
                            }, function(error) {
                                console.log(error.message);
                                return AV.Promise.as();
                            });
                        });
                    });
                }
                return promise;
            });
        } else {
            return AV.Promise.as();
        }
    }).then(function(){
        response.success({
            "followerRelations": followerRelations,
            "followeeRelations": followeeRelations,
            "likedPosts" : likedPosts
        });

    }, function(error){
        console.log(error.message);
        response.error(error);
    });
});

// curl -X POST \
//   -H "X-Parse-Application-Id: u6fLuVtooysWj65QbbPrqMHCjvMAcFDvRwS1Vhaw" \
//   -H "X-Parse-REST-API-Key: 1VL9MkMUZPgTFqQR4RW0fquyLhi1NZ1W75ELnH2s" \
//   -H "Content-Type: application/json" \
//   -d '{"pushBody":"{\"objectId\":\"mvvTjuRpIW\",\"meetingId\":\"\",\"isStudent\":true,\"username\":\"翟道远\",\"text\":\"test\",\"type\":0}","receiverIds":"[\"EouIQ8OXMe\"]","senderDeviceType":"ios","senderId":"mvvTjuRpIW"}' \
//   https://api.parse.com/1/functions/sendPushNotification
AV.Cloud.define("sendPushNotification", function(request, response) {
    AV.Cloud.useMasterKey();
    var _ = require('underscore');

    var senderId = request.params.senderId;
    console.log(request.params.receiverIds);
    var receiverIds = JSON.parse(request.params.receiverIds);
    var type = request.params.type;
    var currentTime = request.params.currentTime;
    var senderDeviceType = request.params.senderDeviceType;
    var pushBody = JSON.parse(request.params.pushBody);
    pushBody["senderId"] = senderId;
 
    var layerMessageType = pushBody["type"];
    var layerMessageText = pushBody["text"];
    var layerMessageSender = pushBody["username"];

    var alertMessage, postRelatedBadge, messageBadge, appMessageBadge;
    switch (layerMessageType) {
        case 0:
            alertMessage = layerMessageSender + ": " + layerMessageText;
            break;
        default:
            alertMessage = layerMessageText;
            break;
    }

    var receiverPromise = new AV.Promise.as();
    if (undefined != receiverIds) {
        // adding tags
        _.each(receiverIds, function(receiverId) {
            receiverPromise = receiverPromise.then(function(){

                var userQuery = new AV.Query(AV.User);
                return userQuery.get(receiverId).then(function(receiver){

                    messageBadge = receiver.get("messageBadge");
                    if (undefined == messageBadge) {
                        messageBadge = 1;
                    } else {
                        messageBadge += 1;
                    }

                    postRelatedBadge = receiver.get("postRelatedBadge");
                    if (undefined == postRelatedBadge) {
                        postRelatedBadge = 0;
                    }

                    appMessageBadge = receiver.get("appMessageBadge");
                    if (undefined == appMessageBadge) {
                        appMessageBadge = 0;
                    }

                    receiver.set("messageBadge", messageBadge);
                    return receiver.save();
                }).then(function(){
                    var receiverQuery = new AV.Query(AV.User);
                    receiverQuery.equalTo("objectId", receiverId);

                    var pushQuery = new AV.Query(AV.Installation);
                    pushQuery.matchesQuery('user', receiverQuery);
                    pushQuery.equalTo("online", true);

                    return AV.Push.send({
                        prod: "dev",
                        where: pushQuery,
                        data: {
                            type: 2, // 0 comment, 1 like, 2 message
                            messageTitle: "Skye",
                            messageBody: JSON.stringify(pushBody),
                            badge: messageBadge + postRelatedBadge + appMessageBadge,
                            messageBadge: messageBadge,
                            postRelatedBadge: postRelatedBadge,
                            appMessageBadge: appMessageBadge,
                            alert: alertMessage,
                            sound: "default"
                        }
                    });
                }, function(error){
                    console.log("layer message notification failed: " + error);
                    return AV.Promise.as();
                });
            });
        });
    }
 
    receiverPromise.then(function(){
        response.success();

    }, function(error){
        console.log(error.message);
        response.error(error);
    });
});

AV.Cloud.afterSave('FlightLog', function(request) {
    var query = new AV.Query(AV.User);
    query.get(request.object.get('user').id, {
        success: function(user) {
            var duration = user.get("duration");
            if (undefined == duration) {
                duration = 0;
            }
            duration += request.object.get('duration');

            var distance = user.get("distance");
            if (undefined == distance) {
                distance = 0;
            }
            distance += request.object.get('distance');

            user.set("duration", duration);
            user.set("distance", distance);
            user.save();
        }, error: function(error) {
            throw 'Got an error ' + error.code + ' : ' + error.message;
        }
    });
});