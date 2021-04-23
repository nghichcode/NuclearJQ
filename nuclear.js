(function (window) {
  function Nuclear(args = {app: '', delimiters: []}) {
    const CONSTANTS = {
      APP: 'nc-app',
      COMPONENT: 'nc-component',
      IS: 'nc-is',
      MOUNT: 'nc-mount',
    };
    const _nco = {};
    _nco.app_name = args.app;

    const TMPL_OPEN = '${';
    const TMPL_CLOSE = '}}';
    const delimiters = (Array.isArray(args.delimiters) && args.delimiters.length === 2) ?
      {open: args.delimiters[0], close: args.delimiters[1]} : {open: TMPL_OPEN, close: TMPL_CLOSE};
    // Generate string from template
    // Example template("Hello ${abc}}", {abc: "Anna"}) => Hello Anna
    _nco.template = function (s, values, opening, closing) {
      if (typeof s != 'string') return '';
      let tmp_opening = opening || delimiters.open;
      let tmp_closing = closing || delimiters.close;

      let open = tmp_opening.replace(/[-[\]()*\s]/g, "\\$&").replace(/\$/g, '\\$');
      let close = tmp_closing.replace(/[-[\]()*\s]/g, "\\$&").replace(/\$/g, '\\$');
      let r = new RegExp(open + '(.+?)' + close, 'g'); //, r = /\{\{(.+?)\}\}/g
      let matches = s.match(r) || [];

      matches.forEach(function (match) {
        let key = match.substring(tmp_opening.length, match.length - tmp_closing.length).trim();//chop {{ and }}
        let value = typeof values[key] == 'undefined' ? '' : values[key];
        s = s.replace(match, value);
      });
      return s;
    };
    // Format string from template
    // Example template("Hello {abc}", {abc: "Anna"}) => Hello Anna
    _nco.format = function (s, values) {
      return _nco.template(s, values, '{', '}');
    };

    _nco._components = {};

    // Generate component template from name, template, delimiters and add to _components
    // Example c = Nuclear.component("hello", {template: "Hello ${abc}}"} )
    // Use bind to render template from value
    // Example c.bind( {abc: "Anna"} )
    // OR Nuclear.components('hello').bind( {abc: "Anna"} )
    _nco.component = function (name, options = {
      template: '', delimiters: [], filter: null, mount_point: ''
    }) {
      if (!options || !options.template) {
        return _nco._components[name];
      }
      const delimiters = (Array.isArray(options.delimiters) && options.delimiters.length === 2) ?
        {open: options.delimiters[0], close: options.delimiters[1]} : {open: TMPL_OPEN, close: TMPL_CLOSE};
      const obj = {
        mount_point: options.mount_point,
        value: '',
        template: options.template ? options.template : '',
        filter: options.filter,
        val: function (data) {
          const tmp_data = (this.filter) ? this.filter(data) : data;
          return this.value = _nco.template(
            (typeof this.template == 'function') ? this.template(tmp_data) : this.template,
            tmp_data,
            delimiters.open, delimiters.close
          );
        },
        mount: function (data, each = null, mount_point = '', empty = true) {
          if (!mount_point) mount_point = this.mount_point;
          if (mount_point) {
            const mount_el = document.querySelector(mount_point);
            if (empty) mount_el.innerHTML = '';
            if (!mount_el) return;
            const self = this;
            if (Array.isArray(data)) data.forEach(function (it) {
              if (each) each(it);
              mount_el.insertAdjacentHTML('beforeend', self.val(it));
            });
            else mount_el.insertAdjacentHTML('beforeend', self.val(data));
          }
        },
      };
      _nco._components[name] = obj;
      return obj;
    };

    if (args.app) {
      const app_root = document.querySelector('[' + CONSTANTS.APP + '="' + args.app + '"]');
      if (app_root) {
        app_root.style.display = 'none';
        app_root.querySelectorAll('[' + CONSTANTS.COMPONENT + ']').forEach(function (el) {
          let name = el.getAttribute(CONSTANTS.COMPONENT);
          el.removeAttribute(CONSTANTS.COMPONENT);
          el.classList.add(name);
          const parentNode = el.parentNode;
          let mount_point = '';
          if (parentNode) {
            parentNode.setAttribute(CONSTANTS.MOUNT, name);
            mount_point = _nco.format(
              '[{app}="{app_name}"] [{mount}="{mount_name}"]',
              {app: CONSTANTS.APP, app_name: _nco.app_name, mount: CONSTANTS.MOUNT, mount_name: name}
            );
          }
          _nco.component(name, {template: el.outerHTML, delimiters: delimiters, mount_point: mount_point});
          el.outerHTML = null;
        });
        app_root.querySelectorAll('[' + CONSTANTS.IS + ']').forEach(function (el) {
          let name = el.getAttribute(CONSTANTS.IS);
          el.removeAttribute(CONSTANTS.IS);
          el.classList.add(name);
          el.setAttribute(CONSTANTS.MOUNT, name);
          let mount_point = _nco.format(
            '[{app}="{app_name}"] [{mount}="{mount_name}"]',
            {app: CONSTANTS.APP, app_name: _nco.app_name, mount: CONSTANTS.MOUNT, mount_name: name}
          );
          _nco.component(name, {template: el.innerHTML, delimiters: delimiters, mount_point: mount_point});
          el.innerHTML = null;
        });
      }
    }
    return _nco;
  }

  if (typeof (window.Nuclear) === 'undefined') {
    window.Nuclear = Nuclear;
    const nc = Nuclear();
    window.Nuclear.component = nc.component;
    window.Nuclear.format = nc.format;
  }
})(window);