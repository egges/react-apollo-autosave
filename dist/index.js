"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_apollo_1 = require("react-apollo");
var lodash_1 = require("lodash");
/**
 * Component handling editing fields and syncing with the database, including an autosave using Apollo GraphQL queries and mutations.
 * @class EditorAutosave
 */
var EditorAutosave = /** @class */ (function (_super) {
    __extends(EditorAutosave, _super);
    function EditorAutosave() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** Local copy of the query result data. */
        _this.localData = null;
        /** Throttled version of mutation function. */
        _this.throttledMutate = null;
        /** Place to accumulate options while waiting */
        _this.mergedOptions = {};
        /** Creates the throttled mutation function if needed. */
        _this.initMutate = function (mutate) {
            if (_this.throttledMutate) {
                return;
            }
            var _a = _this.props, waitTime = _a.waitTime, throttleType = _a.throttleType;
            // Define throttle type
            var throttleOptions = { trailing: true, leading: true };
            if (throttleType === "trailing") {
                throttleOptions.leading = false;
            }
            _this.throttledMutate = lodash_1.throttle(function (options) { return __awaiter(_this, void 0, void 0, function () {
                var result, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, mutate(options)];
                        case 1:
                            result = _a.sent();
                            // Clear accumulated options
                            this.mergedOptions = {};
                            return [2 /*return*/, result];
                        case 2:
                            error_1 = _a.sent();
                            // Catch, log, and discard errors since there might not be an error handler due to the
                            // throttled function call.
                            console.log(error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); }, waitTime, throttleOptions);
        };
        /** Merges two objects but overwrites arrays. */
        _this.merge = function (obj1, obj2) {
            var customizer = function (objValue, srcValue) {
                if (lodash_1.isArray(objValue)) {
                    return srcValue;
                }
            };
            return lodash_1.mergeWith(obj1, obj2, customizer);
        };
        /** Updates the local data, triggers a render, and performs a mutation. */
        _this.update = function (data, options, mutate) { return __awaiter(_this, void 0, void 0, function () {
            var shouldMutate;
            return __generator(this, function (_a) {
                // Handle updating local data
                if (data) {
                    this.handleUpdateLocalData(data);
                }
                shouldMutate = mutate === undefined || mutate === null ? this.props.mutateOnUpdate : mutate;
                if (shouldMutate) {
                    return [2 /*return*/, this.handleMutate(options)];
                }
                return [2 /*return*/];
            });
        }); };
        /** Handles updating local data. */
        _this.handleUpdateLocalData = function (data) {
            var onUpdate = _this.props.onUpdate;
            _this.merge(_this.localData, data);
            // Callback
            if (onUpdate) {
                onUpdate();
            }
            // Render
            _this.forceUpdate();
        };
        /** Handles performing a mutation. */
        _this.handleMutate = function (options) {
            if (options) {
                // Merge options with any previous calls to make sure every input is sent,
                // and not only the last one
                _this.merge(_this.mergedOptions, options);
            }
            if (!_this.throttledMutate) {
                // this should never happen, but the check is here for safety
                return;
            }
            return _this.throttledMutate(_this.mergedOptions);
        };
        return _this;
    }
    EditorAutosave.prototype.render = function () {
        var _this = this;
        var _a = this.props, query = _a.query, mutation = _a.mutation, mutationOnCompleted = _a.mutationOnCompleted, mutationOnError = _a.mutationOnError, queryVariables = _a.queryVariables, children = _a.children;
        var _b = this.props, queryProps = _b.queryProps, mutationProps = _b.mutationProps;
        // Override query and query variables
        queryProps = queryProps || {};
        queryProps.query = query || queryProps.query;
        queryProps.variables = queryVariables || queryProps.variables;
        // Override mutation and store onCompleted to call later
        mutationProps = mutationProps || {};
        mutationProps.mutation = mutation || mutationProps.mutation;
        return React.createElement(react_apollo_1.Query, __assign({}, queryProps), function (queryResult) {
            var loading = queryResult.loading, data = queryResult.data;
            if (_this.localData) {
                // Use local data instead of (cached) query result
                queryResult.data = _this.localData;
            }
            else if (!loading && data) {
                // First run: create the local copy
                _this.localData = lodash_1.cloneDeep(data);
            }
            return React.createElement(react_apollo_1.Mutation, __assign({}, mutationProps, { onCompleted: function (data) {
                    // Call the onCompleted function provided by the user of the component
                    if (mutationOnCompleted) {
                        mutationOnCompleted(data);
                    }
                    // Call the original onCompleted method from the props
                    if (mutationProps && mutationProps.onCompleted) {
                        mutationProps.onCompleted(data);
                    }
                }, onError: function (error) {
                    // Reset the local data from the query
                    _this.localData = lodash_1.cloneDeep(data);
                    // Call the onError function provided by the user of the component
                    if (mutationOnError) {
                        mutationOnError(error);
                    }
                    // Call the original onError method from the props
                    if (mutationProps && mutationProps.onError) {
                        mutationProps.onError(error);
                    }
                } }), function (mutate, mutationResult) {
                // Verify that the throttled mutate function was created
                _this.initMutate(mutate);
                // Call the render prop
                return children({
                    queryResult: queryResult, mutationResult: mutationResult,
                    update: _this.update
                });
            });
        });
    };
    /** Default prop values. */
    EditorAutosave.defaultProps = {
        queryProps: {},
        mutationProps: {},
        waitTime: 3000,
        mutateOnUpdate: true,
        throttleType: "leading"
    };
    return EditorAutosave;
}(React.Component));
exports.EditorAutosave = EditorAutosave;
