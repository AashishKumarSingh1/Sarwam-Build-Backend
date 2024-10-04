"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_config_1 = require("./dotenv.config");
const scheduler_coupon_1 = require("../utils/scheduler.coupon");
function connectDatabase() {
    try {
        (0, dotenv_config_1.loadEnv)();
        mongoose_1.default.connect(process.env.MONGO_URL).then(() => {
            console.log(`MongoDB connected with server : ${mongoose_1.default.connection.host}`);
            (0, scheduler_coupon_1.resetDailyCoupons)();
        }).catch((error) => {
            console.log(`Error connecting to MongoDB: ${error}`);
        });
    }
    catch (e) {
        console.log("Error occured connecting to the mongo db : ", e);
    }
}
