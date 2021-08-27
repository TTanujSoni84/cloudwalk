"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var configure_1 = require("./controller/configure");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1["default"].config();
var app = express_1["default"]();
app.use(express_1["default"].json());
app.post('/configure', configure_1.configureParams);
app.get('/status', configure_1.apiStatus);
app.get('/feed/rss', configure_1.feedRSS);
app.listen(process.env.PORT || 3000);
console.log('Listening on port 3000....');
exports["default"] = app;
//# sourceMappingURL=index.js.map