/*
 * fw-runtime.js — tiny template engine for the Fireworks website.
 *
 * Each page holds:
 *   <template id="fw-template">  … the page markup with {{holes}}, <sc-for>, <sc-if> …
 *   <script type="text/x-fw-logic" id="fw-logic"> class Component extends DCLogic { … }
 *
 * This file turns the template into React elements on every render, using the
 * values returned by Component.renderVals(). React (bundled in /js) does the DOM work.
 */
(function () {
  'use strict';
  var h = React.createElement;

  // ---------- value lookup ----------
  function lookup(path, scope) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^'.*'$|^".*"$/.test(path)) return path.slice(1, -1);
    var parts = path.split('.');
    var cur = scope;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  function resolve(str, scope) {
    var m = str.match(WHOLE);
    if (m) return lookup(m[1], scope);
    if (str.indexOf('{{') === -1) return str;
    return str.replace(HOLE, function (_, p) {
      var v = lookup(p, scope);
      return v == null ? '' : String(v);
    });
  }

  // ---------- attribute mapping ----------
  var RENAME = {
    'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex', 'readonly': 'readOnly',
    'autoplay': 'autoPlay', 'playsinline': 'playsInline', 'novalidate': 'noValidate',
    'maxlength': 'maxLength', 'colspan': 'colSpan', 'rowspan': 'rowSpan', 'srcset': 'srcSet',
    'crossorigin': 'crossOrigin', 'autocomplete': 'autoComplete', 'enctype': 'encType',
    'onclick': 'onClick', 'onchange': 'onChange', 'onsubmit': 'onSubmit', 'oninput': 'onInput',
    'onmouseenter': 'onMouseEnter', 'onmouseleave': 'onMouseLeave', 'onkeydown': 'onKeyDown',
    'onfocus': 'onFocus', 'onblur': 'onBlur'
  };
  var BOOL = { autoplay: 1, muted: 1, loop: 1, controls: 1, playsinline: 1, novalidate: 1, download: 1,
    disabled: 1, checked: 1, required: 1, hidden: 1, multiple: 1, selected: 1, readonly: 1 };
  function camel(s) { return s.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
  function parseStyle(str) {
    var out = {};
    var depth = 0, buf = '', parts = [];
    for (var i = 0; i < str.length; i++) {
      var c = str[i];
      if (c === '(') depth++;
      if (c === ')') depth--;
      if (c === ';' && depth === 0) { parts.push(buf); buf = ''; } else buf += c;
    }
    parts.push(buf);
    parts.forEach(function (decl) {
      var k = decl.indexOf(':');
      if (k < 0) return;
      var prop = decl.slice(0, k).trim();
      var val = decl.slice(k + 1).trim();
      if (!prop) return;
      out[prop.indexOf('--') === 0 ? prop : camel(prop)] = val;
    });
    return out;
  }
  function propsFor(el, scope, key) {
    var props = key != null ? { key: key } : {};
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      var name = a.name;
      if (name.indexOf('hint-') === 0) continue;
      var val = resolve(a.value, scope);
      if (name === 'style') { props.style = parseStyle(String(val == null ? '' : val)); continue; }
      if (BOOL[name] && (val === '' || val === true)) val = true;
      var rn = RENAME[name];
      if (!rn) {
        if (name.indexOf('aria-') === 0 || name.indexOf('data-') === 0) rn = name;
        else if (name.indexOf('-') > 0) rn = camel(name);
        else rn = name;
      }
      if (rn === 'value' && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.tagName === 'SELECT') && val == null) val = '';
      props[rn] = val;
    }
    return props;
  }

  // ---------- tree → React ----------
  function children(nodes, scope) {
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var r = node(nodes[i], scope, i);
      if (r == null) continue;
      if (Array.isArray(r)) out.push.apply(out, r); else out.push(r);
    }
    return out;
  }
  function node(n, scope, idx) {
    if (n.nodeType === 3) {
      var t = n.nodeValue;
      if (!t.trim() && t.indexOf('\n') !== -1) return null;
      var v = resolve(t, scope);
      return v == null ? null : String(v);
    }
    if (n.nodeType !== 1) return null;
    var tag = n.tagName.toLowerCase();
    if (tag === 'sc-if') {
      var cond = resolve(n.getAttribute('value') || '', scope);
      if (!cond) return null;
      return h(React.Fragment, { key: 'if' + idx }, children(n.childNodes, scope));
    }
    if (tag === 'sc-for') {
      var list = resolve(n.getAttribute('list') || '', scope) || [];
      var as = n.getAttribute('as') || 'item';
      return list.map(function (item, i) {
        var s = Object.create(scope);
        s[as] = item;
        s.$index = i;
        return h(React.Fragment, { key: 'for' + idx + '-' + i }, children(n.childNodes, s));
      });
    }
    var kids = (n.tagName === 'TEMPLATE' ? n.content : n).childNodes;
    var isSvg = n.namespaceURI === 'http://www.w3.org/2000/svg';
    var p = propsFor(n, scope, 'n' + idx);
    if (isSvg && tag !== 'svg') tag = n.tagName; // keep case (e.g. linearGradient)
    var ch = (tag === 'textarea') ? [] : children(kids, scope);
    return h.apply(null, [tag, p].concat(ch));
  }

  // ---------- boot ----------
  function boot() {
    var tpl = document.getElementById('fw-template');
    var logic = document.getElementById('fw-logic');
    if (!tpl || !logic) return;
    var roots = tpl.content.childNodes;

    // Base class every page's `class Component extends DCLogic` builds on.
    var DCLogicClass = class extends React.Component {
      constructor(props) { super(props); this.state = this.state || {}; }
      render() {
        var vals = this.renderVals ? this.renderVals() : {};
        return h(React.Fragment, null, children(roots, vals));
      }
    };

    var Component = new Function('DCLogic', 'React', logic.textContent + '\n;return Component;')(DCLogicClass, React);
    var mount = document.getElementById('fw-root');
    ReactDOM.createRoot(mount).render(h(Component, {}));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
