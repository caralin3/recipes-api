"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("io-ts"));
exports.Recipe = t.interface({
    calories: t.number,
    cookTime: t.number,
    prepTime: t.number,
    directions: t.array(t.string),
    ingredients: t.array(t.string),
    notes: t.array(t.string),
    servings: t.number,
    src: t.string,
    title: t.string,
    totalTime: t.number,
    url: t.string,
    yield: t.number,
});
//# sourceMappingURL=models.js.map