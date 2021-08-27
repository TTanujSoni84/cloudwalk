"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.feedRSS = exports.apiStatus = exports.configureParams = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var node_cron_1 = require("node-cron");
var axios_1 = __importDefault(require("axios"));
var nodemailer_1 = __importDefault(require("nodemailer"));
var xml2js_1 = __importDefault(require("xml2js"));
var interval = 5;
var healthy_threshold = 3;
var unhealthy_threshold = 3;
var healthy_call = 0;
var unhealthy_call = 0;
var status = 'HEALTHY';
var job = null;
var transition = 0;
var data = null;
var feed = null;
var resetParams = function () {
    data = JSON.parse(fs_1.readFileSync(path_1.join("" + __dirname, '../../../config.json'), {
        encoding: 'utf8',
        flag: 'r'
    }));
    interval = data.interval;
    healthy_threshold = data.healthy_threshold;
    unhealthy_threshold = data.unhealthy_threshold;
};
var authorizationToken = process.env.auth_token;
var scheduleJob = function (interval, email) {
    console.log("Calling scheduled health check with interval - " + interval);
    resetParams();
    job = node_cron_1.schedule("*/" + interval + " * * * * *", function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, transporter, mailOptions, mailResult, feedObject, builder, parsedXML, feed_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    transition = 0;
                    return [4, axios_1["default"].post("https://tonto-http.cloudwalk.io?auth=" + authorizationToken + "&buf=test")];
                case 1:
                    response = _a.sent();
                    if (response.status == 200) {
                        healthy_call += 1;
                        unhealthy_call = 0;
                        if (healthy_call === healthy_threshold) {
                            healthy_call = 0;
                            if (status == 'UNHEALTHY') {
                                transition = 1;
                            }
                            status = 'HEALTHY';
                        }
                    }
                    else {
                        healthy_call = 0;
                        unhealthy_call += 1;
                        if (unhealthy_call === unhealthy_threshold) {
                            unhealthy_call = 0;
                            if (status == 'HEALTHY') {
                                transition = 1;
                            }
                            status = 'UNHEALTHY';
                        }
                    }
                    if (!transition) return [3, 3];
                    transporter = nodemailer_1["default"].createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.PASSWORD
                        },
                        logger: true
                    });
                    mailOptions = {
                        from: 'thetestuser99@gmail.com',
                        to: email,
                        subject: 'Status of your API',
                        text: "The status of your API is " + status
                    };
                    return [4, transporter.sendMail(mailOptions, function (error, result) {
                            if (error) {
                                console.log(error);
                            }
                            else {
                                console.log("Sending Email to - " + email + " with status - " + status);
                            }
                        })];
                case 2:
                    mailResult = _a.sent();
                    feedObject = {
                        rss: [
                            {
                                item: [
                                    {
                                        title: 'Server Health'
                                    },
                                    {
                                        description: "Your Server status is " + status
                                    },
                                ]
                            },
                        ]
                    };
                    builder = new xml2js_1["default"].Builder();
                    parsedXML = builder.buildObject(feedObject);
                    feed_1 = '<?xml version="1.0" encoding="UTF-8"?>' + parsedXML;
                    fs_1.writeFileSync(path_1.join("" + __dirname, '../../../feed.rss'), JSON.stringify(feed_1));
                    _a.label = 3;
                case 3: return [3, 5];
                case 4:
                    error_1 = _a.sent();
                    console.log('Error - ', error_1);
                    return [3, 5];
                case 5: return [2];
            }
        });
    }); });
    return job;
};
var configureParams = function (req, res) {
    var data = JSON.parse(fs_1.readFileSync(path_1.join("" + __dirname, '../../../config.json'), {
        encoding: 'utf8',
        flag: 'r'
    }));
    fs_1.writeFileSync(path_1.join("" + __dirname, '../../../config.json'), JSON.stringify(__assign(__assign({}, data), req.body)));
    if (job) {
        job.stop();
    }
    scheduleJob(req.body.interval, data.email);
    job.start();
    return res.send(req.body);
};
exports.configureParams = configureParams;
var apiStatus = function (req, res) {
    return res.send({ status: status });
};
exports.apiStatus = apiStatus;
var feedRSS = function (req, res) {
    return res.sendFile(path_1.join("" + __dirname, '../../../feed.rss'));
};
exports.feedRSS = feedRSS;
//# sourceMappingURL=configure.js.map