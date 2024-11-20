
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.59.2 */

    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (180:0) {#if isLoading}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/loader.gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Loading...");
    			attr_dev(img, "width", "100");
    			attr_dev(img, "height", "100");
    			add_location(img, file, 181, 25, 4169);
    			attr_dev(div0, "class", "gif svelte-1rhbamn");
    			add_location(div0, file, 181, 8, 4152);
    			attr_dev(div1, "class", "loader svelte-1rhbamn");
    			add_location(div1, file, 180, 4, 4123);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(180:0) {#if isLoading}",
    		ctx
    	});

    	return block;
    }

    // (188:8) {#each navItems as item}
    function create_each_block(ctx) {
    	let a;
    	let t_value = /*item*/ ctx[3] + "";
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "aria-label", /*item*/ ctx[3]);
    			attr_dev(a, "class", "svelte-1rhbamn");
    			add_location(a, file, 188, 12, 4402);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(188:8) {#each navItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t0;
    	let header;
    	let img;
    	let img_src_value;
    	let t1;
    	let nav;
    	let t2;
    	let div0;
    	let h1;
    	let t4;
    	let p0;
    	let t6;
    	let section0;
    	let h20;
    	let t8;
    	let p1;
    	let t10;
    	let section1;
    	let h21;
    	let t12;
    	let div4;
    	let div1;
    	let h30;
    	let t14;
    	let p2;
    	let t16;
    	let div2;
    	let h31;
    	let t18;
    	let p3;
    	let t20;
    	let div3;
    	let h32;
    	let t22;
    	let p4;
    	let t24;
    	let section2;
    	let h22;
    	let t26;
    	let div6;
    	let div5;
    	let h33;
    	let t28;
    	let p5;
    	let strong0;
    	let t30;
    	let t31_value = /*upcomingEvent*/ ctx[2].date + "";
    	let t31;
    	let t32;
    	let p6;
    	let strong1;
    	let t34;
    	let t35_value = /*upcomingEvent*/ ctx[2].location + "";
    	let t35;
    	let t36;
    	let p7;
    	let t38;
    	let footer;
    	let p8;
    	let t39;
    	let a;
    	let if_block = /*isLoading*/ ctx[0] && create_if_block(ctx);
    	let each_value = /*navItems*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			header = element("header");
    			img = element("img");
    			t1 = space();
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Welcome to the AI/ML Club of MVJCE! 🌟";
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "Exploring the frontiers of Artificial Intelligence and Machine Learning.";
    			t6 = space();
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Our Mission 🚀";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "We aim to empower students and professionals to innovate using AI and ML technologies through collaboration and learning.";
    			t10 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "What We Do 🎯";
    			t12 = space();
    			div4 = element("div");
    			div1 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Workshops 🛠️";
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "Learn practical AI/ML skills with hands-on coding sessions and tutorials.";
    			t16 = space();
    			div2 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Hackathons 💡";
    			t18 = space();
    			p3 = element("p");
    			p3.textContent = "Participate in AI-themed hackathons to create groundbreaking projects.";
    			t20 = space();
    			div3 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Networking 🤝";
    			t22 = space();
    			p4 = element("p");
    			p4.textContent = "Meet industry experts, professors, and fellow AI enthusiasts.";
    			t24 = space();
    			section2 = element("section");
    			h22 = element("h2");
    			h22.textContent = "Upcoming Events 📅";
    			t26 = space();
    			div6 = element("div");
    			div5 = element("div");
    			h33 = element("h3");
    			h33.textContent = `${/*upcomingEvent*/ ctx[2].title}`;
    			t28 = space();
    			p5 = element("p");
    			strong0 = element("strong");
    			strong0.textContent = "Date:";
    			t30 = space();
    			t31 = text(t31_value);
    			t32 = space();
    			p6 = element("p");
    			strong1 = element("strong");
    			strong1.textContent = "Location:";
    			t34 = space();
    			t35 = text(t35_value);
    			t36 = space();
    			p7 = element("p");
    			p7.textContent = `${/*upcomingEvent*/ ctx[2].description}`;
    			t38 = space();
    			footer = element("footer");
    			p8 = element("p");
    			t39 = text("Made with ❤️ by the N3055. © 2024 |\n        ");
    			a = element("a");
    			a.textContent = "GitHub";
    			if (!src_url_equal(img.src, img_src_value = "/logo_white.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Example Image");
    			attr_dev(img, "width", "100");
    			attr_dev(img, "height", "70");
    			add_location(img, file, 185, 4, 4273);
    			attr_dev(nav, "class", "svelte-1rhbamn");
    			add_location(nav, file, 186, 4, 4351);
    			attr_dev(header, "class", "svelte-1rhbamn");
    			add_location(header, file, 184, 0, 4260);
    			attr_dev(h1, "class", "svelte-1rhbamn");
    			add_location(h1, file, 194, 4, 4506);
    			attr_dev(p0, "class", "svelte-1rhbamn");
    			add_location(p0, file, 195, 4, 4558);
    			attr_dev(div0, "class", "hero svelte-1rhbamn");
    			add_location(div0, file, 193, 0, 4483);
    			attr_dev(h20, "class", "svelte-1rhbamn");
    			add_location(h20, file, 199, 4, 4660);
    			add_location(p1, file, 200, 4, 4688);
    			attr_dev(section0, "class", "svelte-1rhbamn");
    			add_location(section0, file, 198, 0, 4646);
    			attr_dev(h21, "class", "svelte-1rhbamn");
    			add_location(h21, file, 204, 4, 4843);
    			add_location(h30, file, 207, 12, 4933);
    			add_location(p2, file, 208, 12, 4968);
    			attr_dev(div1, "class", "card-item svelte-1rhbamn");
    			add_location(div1, file, 206, 8, 4897);
    			add_location(h31, file, 211, 12, 5108);
    			add_location(p3, file, 212, 12, 5143);
    			attr_dev(div2, "class", "card-item svelte-1rhbamn");
    			add_location(div2, file, 210, 8, 5072);
    			add_location(h32, file, 215, 12, 5280);
    			add_location(p4, file, 216, 12, 5315);
    			attr_dev(div3, "class", "card-item svelte-1rhbamn");
    			add_location(div3, file, 214, 8, 5244);
    			attr_dev(div4, "class", "card svelte-1rhbamn");
    			add_location(div4, file, 205, 4, 4870);
    			attr_dev(section1, "class", "svelte-1rhbamn");
    			add_location(section1, file, 203, 0, 4829);
    			attr_dev(h22, "class", "svelte-1rhbamn");
    			add_location(h22, file, 222, 4, 5436);
    			add_location(h33, file, 225, 12, 5531);
    			add_location(strong0, file, 226, 15, 5577);
    			add_location(p5, file, 226, 12, 5574);
    			add_location(strong1, file, 227, 15, 5640);
    			add_location(p6, file, 227, 12, 5637);
    			add_location(p7, file, 228, 12, 5708);
    			attr_dev(div5, "class", "card-item svelte-1rhbamn");
    			add_location(div5, file, 224, 8, 5495);
    			attr_dev(div6, "class", "card svelte-1rhbamn");
    			add_location(div6, file, 223, 4, 5468);
    			attr_dev(section2, "class", "svelte-1rhbamn");
    			add_location(section2, file, 221, 0, 5422);
    			attr_dev(a, "href", "https://github.com/your-repo");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noopener noreferrer");
    			attr_dev(a, "class", "svelte-1rhbamn");
    			add_location(a, file, 236, 8, 5850);
    			add_location(p8, file, 234, 4, 5794);
    			attr_dev(footer, "class", "svelte-1rhbamn");
    			add_location(footer, file, 233, 0, 5781);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header, anchor);
    			append_dev(header, img);
    			append_dev(header, t1);
    			append_dev(header, nav);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(nav, null);
    				}
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(div0, t4);
    			append_dev(div0, p0);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h20);
    			append_dev(section0, t8);
    			append_dev(section0, p1);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h21);
    			append_dev(section1, t12);
    			append_dev(section1, div4);
    			append_dev(div4, div1);
    			append_dev(div1, h30);
    			append_dev(div1, t14);
    			append_dev(div1, p2);
    			append_dev(div4, t16);
    			append_dev(div4, div2);
    			append_dev(div2, h31);
    			append_dev(div2, t18);
    			append_dev(div2, p3);
    			append_dev(div4, t20);
    			append_dev(div4, div3);
    			append_dev(div3, h32);
    			append_dev(div3, t22);
    			append_dev(div3, p4);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, h22);
    			append_dev(section2, t26);
    			append_dev(section2, div6);
    			append_dev(div6, div5);
    			append_dev(div5, h33);
    			append_dev(div5, t28);
    			append_dev(div5, p5);
    			append_dev(p5, strong0);
    			append_dev(p5, t30);
    			append_dev(p5, t31);
    			append_dev(div5, t32);
    			append_dev(div5, p6);
    			append_dev(p6, strong1);
    			append_dev(p6, t34);
    			append_dev(p6, t35);
    			append_dev(div5, t36);
    			append_dev(div5, p7);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p8);
    			append_dev(p8, t39);
    			append_dev(p8, a);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*isLoading*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*navItems*/ 2) {
    				each_value = /*navItems*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(section2);
    			if (detaching) detach_dev(t38);
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let navItems = ["Home", "About Us", "Projects", "Events", "Contact"];

    	let upcomingEvent = {
    		title: "AI Hackathon 2024",
    		date: "March 15, 2024",
    		location: "Tech Hub, Downtown",
    		description: "A 24-hour hackathon to push the boundaries of AI innovation."
    	};

    	let isLoading = true;

    	// Simulate loading delay (e.g., for fetching data or content)
    	setTimeout(
    		() => {
    			$$invalidate(0, isLoading = false);
    		},
    		5000
    	); // 3-second delay for demo purposes

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ navItems, upcomingEvent, isLoading });

    	$$self.$inject_state = $$props => {
    		if ('navItems' in $$props) $$invalidate(1, navItems = $$props.navItems);
    		if ('upcomingEvent' in $$props) $$invalidate(2, upcomingEvent = $$props.upcomingEvent);
    		if ('isLoading' in $$props) $$invalidate(0, isLoading = $$props.isLoading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isLoading, navItems, upcomingEvent];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
