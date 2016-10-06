module.exports["bubble-style"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "width: ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "diameter"), env.opts.autoescape);
output += "px; height: ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "diameter"), env.opts.autoescape);
output += "px; left: ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "x"), env.opts.autoescape);
output += "px; top: ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "y"), env.opts.autoescape);
output += "px;\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
module.exports["global"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
var macro_t_1 = runtime.makeMacro(
["text", "href"], 
[], 
function (l_text, l_href, kwargs) {
frame = frame.push(true);
kwargs = kwargs || {};
if (kwargs.hasOwnProperty("caller")) {
frame.set("caller", kwargs.caller); }
frame.set("text", l_text);
frame.set("href", l_href);
var t_2 = "";t_2 += "\n  <a href=\"";
t_2 += runtime.suppressValue(l_href, env.opts.autoescape);
t_2 += "\" target=\"_blank\">";
t_2 += runtime.suppressValue(l_text, env.opts.autoescape);
t_2 += "</a>\n";
;
frame = frame.pop();
return new runtime.SafeString(t_2);
});
context.addExport("link");
context.setVariable("link", macro_t_1);
var macro_t_3 = runtime.makeMacro(
["item"], 
[], 
function (l_item, kwargs) {
frame = frame.push(true);
kwargs = kwargs || {};
if (kwargs.hasOwnProperty("caller")) {
frame.set("caller", kwargs.caller); }
frame.set("item", l_item);
var t_4 = "";t_4 += "\n  <ul class=\"options\">\n    <li data-action=\"delete\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 268.476 268.476\">\n        <path d=\"M63.119 250.254s3.999 18.222 24.583 18.222h93.072c20.583 0 24.582-18.222 24.582-18.222l18.374-178.66H44.746l18.373 178.66zM170.035 98.442a8.948 8.948 0 0 1 8.949-8.949 8.95 8.95 0 0 1 8.95 8.949l-8.95 134.238a8.949 8.949 0 1 1-17.898 0l8.949-134.238zm-44.746 0a8.949 8.949 0 0 1 8.949-8.949 8.948 8.948 0 0 1 8.949 8.949V232.68a8.948 8.948 0 0 1-8.949 8.949 8.949 8.949 0 0 1-8.949-8.949V98.442zm-35.797-8.95a8.948 8.948 0 0 1 8.949 8.949l8.95 134.238a8.95 8.95 0 0 1-17.899 0L80.543 98.442a8.95 8.95 0 0 1 8.949-8.95zM218.36 35.811h-39.376V17.899C178.984 4.322 174.593 0 161.086 0H107.39C95.001 0 89.492 6.001 89.492 17.899v17.913H50.116c-7.914 0-14.319 6.007-14.319 13.43 0 7.424 6.405 13.431 14.319 13.431H218.36c7.914 0 14.319-6.007 14.319-13.431 0-7.423-6.405-13.431-14.319-13.431zm-57.274 0h-53.695l.001-17.913h53.695v17.913z\" />\n      </svg>\n    </li>";
if(l_item == "brewery") {
t_4 += "<li data-action=\"add-beer\">\n        <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 35 34\">\n          <path d=\"M8.04.88C10.8-.38 20.29-.41 22.89.88 24.52 1.92 24.89 2.7 26 4H4C5.43 2.42 5.92 1.59 8.04.88zm15.92 32.99c-9.6 0-8.07.18-18 .09-3.7-.22-2.96-.31-2.96-13.9C0 18.17.11 19 .04 14c.5-1.91 2-8.83 3.53-9.04 4.65 0 21.42.04 23.4.03.03 1.34.02.33.03 2.01 4.29 0 4.78-.52 8.03 3 0 4.65-.09 10.91-.03 12.91-3.13 3.22-.96 3.05-8.04 3.05.47 8.82-.48 7.56-3 7.91zm7.13-17.35c-.09-6.13.88-5.49-4.12-5.52L27 21.96c5 .06 3.96.13 4.09-5.44zM13 12v5H8v4h5v5h4v-5h5v-4h-5v-5h-4z\" />\n        </svg>\n      </li>";
;
}
t_4 += "<li data-action=\"edit\">\n      <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 528.899 528.899\">\n        <path d=\"M328.883 89.125l107.59 107.589-272.34 272.34L56.604 361.465l272.279-272.34zm189.23-25.948l-47.981-47.981c-18.543-18.543-48.653-18.543-67.259 0l-45.961 45.961 107.59 107.59 53.611-53.611c14.382-14.383 14.382-37.577 0-51.959zM.3 512.69c-1.958 8.812 5.998 16.708 14.811 14.565l119.891-29.069L27.473 390.597.3 512.69z\" />\n      </svg>\n    </li>\n  </ul>\n";
;
frame = frame.pop();
return new runtime.SafeString(t_4);
});
context.addExport("options");
context.setVariable("options", macro_t_3);
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
module.exports["input-fields/input"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"label-container\">\n  <label for=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "input")),"id"), env.opts.autoescape);
output += "\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "input")),"label"), env.opts.autoescape);
output += "</label>\n  <span class=\"error\" data-for=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "input")),"id"), env.opts.autoescape);
output += "\"></span>\n</div>\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("content"))(env, context, frame, runtime, function(t_2,t_1) {
if(t_2) { cb(t_2); return; }
output += t_1;
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_content(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_content: b_content,
root: root
};

})();
module.exports["input-fields/select"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("input-fields/input", true, "input-fields/select.njk", false, function(t_2,_parentTemplate) {
if(t_2) { cb(t_2); return; }
parentTemplate = _parentTemplate
for(var t_1 in parentTemplate.blocks) {
context.addBlock(t_1, parentTemplate.blocks[t_1]);
}
output += "\n\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("content"))(env, context, frame, runtime, function(t_4,t_3) {
if(t_4) { cb(t_4); return; }
output += t_3;
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_content(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "\n  <select id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "input")),"id"), env.opts.autoescape);
output += "\" data-form>\n    <option value=\"\">--</option>\n    ";
frame = frame.push();
var t_7 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "input")),"list");
if(t_7) {var t_6 = t_7.length;
for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("item", t_8);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n      <option ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "input")),"selected") === t_8) {
output += "selected";
;
}
output += ">\n        ";
output += runtime.suppressValue(t_8, env.opts.autoescape);
output += "\n      </option>\n    ";
;
}
}
frame = frame.pop();
output += "\n  </select>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_content: b_content,
root: root
};

})();
module.exports["input-fields/text-area"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("input-fields/input", true, "input-fields/text-area.njk", false, function(t_2,_parentTemplate) {
if(t_2) { cb(t_2); return; }
parentTemplate = _parentTemplate
for(var t_1 in parentTemplate.blocks) {
context.addBlock(t_1, parentTemplate.blocks[t_1]);
}
output += "\n\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("content"))(env, context, frame, runtime, function(t_4,t_3) {
if(t_4) { cb(t_4); return; }
output += t_3;
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_content(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "\n  <textarea id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "input")),"id"), env.opts.autoescape);
output += "\" data-form>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "input")),"value"), env.opts.autoescape);
output += "</textarea>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_content: b_content,
root: root
};

})();
module.exports["input-fields/text"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("input-fields/input", true, "input-fields/text.njk", false, function(t_2,_parentTemplate) {
if(t_2) { cb(t_2); return; }
parentTemplate = _parentTemplate
for(var t_1 in parentTemplate.blocks) {
context.addBlock(t_1, parentTemplate.blocks[t_1]);
}
output += "\n\n";
(parentTemplate ? function(e, c, f, r, cb) { cb(""); } : context.getBlock("content"))(env, context, frame, runtime, function(t_4,t_3) {
if(t_4) { cb(t_4); return; }
output += t_3;
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
function b_content(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "\n  <input id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "input")),"id"), env.opts.autoescape);
output += "\" type=\"text\" value=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "input")),"value"), env.opts.autoescape);
output += "\" data-form>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
b_content: b_content,
root: root
};

})();
module.exports["modal-dialog"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<h2>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.opts.autoescape);
output += "</h2>\n";
output += runtime.suppressValue(env.getFilter("safe").call(context, runtime.contextOrFrameLookup(context, frame, "content")), env.opts.autoescape);
output += "\n";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "btns");
if(t_3) {var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("btn", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "<button data-action=\"";
output += runtime.suppressValue(runtime.memberLookup((t_4),"action"), env.opts.autoescape);
output += "\" type=\"button\">\n    ";
output += runtime.suppressValue(runtime.memberLookup((t_4),"text"), env.opts.autoescape);
output += "\n  </button>";
;
}
}
frame = frame.pop();
output += "\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
module.exports["modal-form"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<h2>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.opts.autoescape);
output += "</h2>\n<form novalidate>\n  ";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "inputFields");
if(t_3) {var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("input", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
env.getTemplate(runtime.memberLookup((t_4),"tpl"), false, "modal-form.njk", null, function(t_7,t_5) {
if(t_7) { cb(t_7); return; }
t_5.render(context.getVariables(), frame, function(t_8,t_6) {
if(t_8) { cb(t_8); return; }
output += t_6
})});
}
}
frame = frame.pop();
output += "\n\n  <button data-action=\"submit\">\n    Submit\n  </button>\n  <button data-action=\"cancel\" type=\"button\">\n    Cancel\n  </button>\n</form>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
module.exports["new-beer"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("global-macros", false, "new-beer.njk", false, function(t_2,t_1) {
if(t_2) { cb(t_2); return; }
t_1.getExported(function(t_3,t_1) {
if(t_3) { cb(t_3); return; }
context.setVariable("gm", t_1);
output += "\n\n<li data-item-id=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "id"), env.opts.autoescape);
output += "\" class=\"collapsed\">\n  <h3>\n    <span data-prop=\"name\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "name"), env.opts.autoescape);
output += "</span><span class=\"collapse-indicator\"></span>\n  </h3>\n  <div class=\"shadow\"></div>\n  <div class=\"panel\">\n    <div class=\"more-data\">\n      <p data-prop=\"style\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "style"), env.opts.autoescape);
output += "</p>\n      <p data-prop=\"description\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "description"), env.opts.autoescape);
output += "</p>\n    </div>\n    ";
output += runtime.suppressValue((lineno = 12, colno = 15, runtime.callWrap(runtime.memberLookup((t_1),"options"), "gm[\"options\"]", context, ["beer"])), env.opts.autoescape);
output += "\n  </div>\n</li>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
module.exports["new-brewery"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
env.getTemplate("global-macros", false, "new-brewery.njk", false, function(t_2,t_1) {
if(t_2) { cb(t_2); return; }
t_1.getExported(function(t_3,t_1) {
if(t_3) { cb(t_3); return; }
context.setVariable("gm", t_1);
output += "\n\n<li data-item-id=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "id"), env.opts.autoescape);
output += "\" class=\"collapsed\">\n  <h2>\n    <span data-prop=\"name\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "name"), env.opts.autoescape);
output += "</span><span class=\"collapse-indicator\"></span>\n  </h2>\n  <div class=\"shadow\"></div>\n  <div class=\"panel\">\n    <div class=\"more-data\">\n      <p>\n        <span data-prop=\"city_name\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "city_name"), env.opts.autoescape);
output += "</span>,\n        <span data-prop=\"state\">";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "state"), env.opts.autoescape);
output += "</span>\n      </p>\n    </div>\n    ";
output += runtime.suppressValue((lineno = 14, colno = 15, runtime.callWrap(runtime.memberLookup((t_1),"options"), "gm[\"options\"]", context, ["brewery"])), env.opts.autoescape);
output += "\n\n    <ul data-items=\"beer\"></ul>\n  </div>\n</li>\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
})});
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
