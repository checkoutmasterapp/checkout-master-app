!(function () {
    const action = {
        config: {
            dataAttrAppUrl: "data-checkify-url",
            dataAttrName: "data-checkify",
            defaultAppBaseUrl: "http://localhost:8001",
            domainPath: "/checkoutDomain",
        },
        variables: {
            isCheckoutProcessing: false,
            isPreventDefaultHandlers: true,
        },
        cartApi: {
            clearCart: function () {
                return fetch("/cart/clear.js", { method: "POST", credentials: "same-origin" });
            },
            addToCart: function (value) {
                return fetch("/cart/add.js", { method: "POST", credentials: "same-origin", body: "FORM" === value.nodeName ? new FormData(value) : value });
            },
            syncCart: async () => {
                try {
                    var master_x_s = localStorage.getItem("master_x_s");

                    return (
                        master_x_s !== "undefined" &&
                        master_x_s !== undefined &&
                        master_x_s !== null &&
                        (await fetch("/cart.js", { credentials: "same-origin" })
                            .then(function (res) {
                                return res.json();
                            })
                            .then(function (event) {
                                var products = [];
                                var shopId = action.main.shopId(),
                                    checkout_id = localStorage.getItem("master_x_s"),
                                    checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                                    url = `${checkUrl}/put-checkout/${checkout_id}/${shopId}`;
                                return (
                                    event.items.forEach(function (item) {
                                        // console.log(item, "itemes")
                                        products.push({
                                            cart_token: event.token,
                                            product_id: item.product_id,
                                            variant_id: item.variant_id,
                                            price: item.price / 100,
                                            quantity: item.quantity,
                                            properties: item.properties,
                                            image: item.image,
                                            title: item.title,
                                            grams: item.grams,
                                        });
                                    }),
                                    fetch(url, {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Accept: "application/json, text/plain, */*",
                                        },
                                        body: JSON.stringify({
                                            line_items: products,
                                        }),
                                    }).then(function (result) {
                                        return result.ok;
                                    })
                                );
                            }))
                    );
                } catch (error) {
                    console.error("syncCart error --------------", error);
                }
            },
        },
        main: {
            findCheckout: function () {
                var shopId = action.main.shopId(),
                    checkout_id = localStorage.getItem("master_x_s"),
                    checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                    url = `${checkUrl}/get-checkout/${checkout_id}/${shopId}`;

                return fetch(url, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                });
            },
            createCheckout: async () => {
                var shop_id = action.main.shopId(),
                    checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                    url = `${checkUrl}/create-checkout/${shop_id}`;

                return fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                });
            },
            shopId: function () {
                var master_id = document.querySelector("[data-master-x-id]");
                return !!master_id && master_id.dataset.masterXId;
            },
        },
        helpers: {
            debounce: function (target, event) {
                let run = false;
                return function () {
                    run ||
                        ((run = true),
                        setTimeout(() => {
                            target.apply(this, arguments), (run = false);
                        }, event));
                };
            },
            isDescendant: (target, event) => {
                let run = event.parentNode;
                for (; null != run; ) {
                    if (run == target) return true;
                    run = run.parentNode;
                }
                return false;
            },
            addCaptureListener: (element, capture, next) => {
                element.addEventListener &&
                    window.addEventListener(
                        capture,
                        (capture) => {
                            (capture.target === element || action.helpers.isDescendant(element, capture.target)) && (capture.stopImmediatePropagation(), capture.preventDefault(), next());
                        },
                        true
                    );
            },
            getCookie: (element) => {
                let event = document.cookie.match(new RegExp("(?:^|; )" + element.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"));
                return event ? decodeURIComponent(event[1]) : void 0;
            },
            setCookie: (target, event) => {
                let run = new Date(Date.now() + 18e5).toUTCString();
                document.cookie = `${target}=${event}; expires=` + run + ";path=/;";
            },
        },
        dom: {
            selectors: {
                checkoutForm: 'form[action^="/cart"]:not([action^="/cart/"]), form[action="/checkout"], form[action="/a/checkout"]',
                checkoutButton:
                    '[name="checkout"],[name="Checkout"],[class*="opcCheckout"],[class*="checkout-btn"],[class*="btn-checkout"],[class*="checkout-button"],[class*="button-checkout"],[class*="carthook_checkout"],[type*="submit"][class*="action_button"]:not([name*="add"]),[href*="/checkout"][class*="action_button"],[id*="checkout"],[id*="Checkout"],[id*="checkout-button"],[id*="checkout-btn"]',
                directCheckoutLink: 'a[href^="/checkout"],[onclick*="/checkout"]',
                addToCartForm: 'form[action^="/cart/add"]',
                returnToField: 'input[name="return_to"][value*="checkout"]',
                buyNowForm: 'form[action^="/cart/add"][data-skip-cart="true"]',
                checkoutUpdateButton: '[type="submit"][name="update"]',
                dynamicPaymentButton: '[data-shopify="payment-button"] button,[data-shopify="payment-button"] .shopify-payment-button__button',
                dynamicPaymentButtonContainer: '[data-shopify="payment-button"]',
            },
            getCheckoutForms: () => document.querySelectorAll(action.dom.selectors.checkoutForm),
            getCheckoutButtons: () => document.querySelectorAll(action.dom.selectors.checkoutButton),
            getCheckoutLinks: () => document.querySelectorAll(action.dom.selectors.directCheckoutLink),
            getBuyItNowForms: () => {
                const event = [...document.querySelectorAll(action.dom.selectors.buyNowForm)];
                return (
                    document.querySelectorAll(action.dom.selectors.returnToField).forEach((element) => {
                        const check = element.closest("form");
                        check && event.filter((item) => check.isSameNode(item)).length <= 0 && event.push(check);
                    }),
                    event
                );
            },
            getAddToCardForm: () => document.querySelector(action.dom.selectors.addToCartForm),
            getDynamicPaymentButtons: () => document.querySelectorAll(action.dom.selectors.dynamicPaymentButton),
            getUpdateCartButtons: () => document.querySelectorAll(action.dom.selectors.checkoutUpdateButton),
            getDynamicPaymentButtonContainer: () => document.querySelector(action.dom.selectors.dynamicPaymentButtonContainer),
        },
        functions: {
            getAppBaseUrl: () => {
                const event = document.querySelector("[" + action.config.dataAttrAppUrl + "]");
                return event ? event.getAttribute(action.config.dataAttrAppUrl) : action.config.defaultAppBaseUrl;
            },
            getOriginUrl: () => window.location.origin,
            getCartToken: () => action.helpers.getCookie("cart"),
            getStoreName: () => (window.Shopify && window.Shopify.shop ? window.Shopify.shop : ""),
            submitBuyNowForm: (element) => {
                let form = element.closest("form");
                if ((form || (form = action.dom.getAddToCardForm()), form)) {
                    if (!form.querySelector('input[name="quantity"]')) {
                        var quantity = 1;
                        if (document.querySelector('input[name="quantity"]')) {
                            quantity = document.querySelector('input[name="quantity"]').value;
                        }
                        const createInput = document.createElement("input");
                        createInput.setAttribute("type", "hidden"), createInput.setAttribute("name", "quantity"), createInput.setAttribute("value", quantity), form.appendChild(createInput);
                    }
                    if (!form.querySelector('input[name="return_to"]')) {
                        const createInput = document.createElement("input");
                        createInput.setAttribute("type", "hidden"), createInput.setAttribute("name", "return_to"), createInput.setAttribute("value", "/checkout"), form.appendChild(createInput);
                    }
                    action.cartApi
                        .clearCart()
                        .then(() => action.cartApi.addToCart(form))
                        .then(() => action.functions.processCheckout());
                }
            },
            checkoutCheck: async () => {
                const checkout_id = localStorage.getItem("master_x_s");

                if (checkout_id == null || checkout_id == "null" || checkout_id === undefined || checkout_id === "undefined") {
                    return await action.main.createCheckout().then((result) => {
                        return result;
                    });
                } else {
                    return await action.main
                        .findCheckout()
                        .then((res) => {
                            return res.status ? res.json() : { failure: true };
                        })
                        .then((result) => {
                            return result.status === false ? action.main.createCheckout() : checkout_id;
                        });
                }
            },
            processCheckout: async () => {
                await action.functions
                    .checkoutCheck()
                    .then((res) => {
                        return res.status ? res.json() : { failure: true };
                    })
                    .then(function (res) {
                        return !res.failure ? localStorage.setItem("master_x_s", res?.store_detail?.checkout_uuid) : true;
                    })
                    .then(async (result) => {
                        await action.cartApi.syncCart().then((response) => {
                            if (action.variables.isCheckoutProcessing === false && response === true) {
                                action.variables.isCheckoutProcessing = true;

                                const checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                                    checkout_id = localStorage.getItem("master_x_s"),
                                    shop_id = action.main.shopId();

                                if (checkUrl && checkout_id && shop_id) {
                                    const run = `${checkUrl}/${shop_id}/checkout/${checkout_id}`;
                                    window.location = run;
                                } else {
                                    window.location = "/checkout";
                                }
                            }
                        });
                    });
            },
            killCompetitors: () => {
                try {
                    window.CHKX && CHKX.main && CHKX.main.unmount ? CHKX.main.unmount() : (window.CHKX = {}), (window.TLCK = {});
                } catch (error) {
                    console.error(error);
                }
            },
            addHandlers: () => {
                const checkoutForm = action.dom.getCheckoutForms(),
                    checkoutLink = action.dom.getCheckoutLinks(),
                    checkoutButton = action.dom.getCheckoutButtons(),
                    BuyItNowForm = action.dom.getBuyItNowForms(),
                    updateCartButton = action.dom.getUpdateCartButtons();
                [...checkoutForm].forEach((element) => {
                    "true" !== element.getAttribute(action.config.dataAttrName) &&
                        (action.helpers.addCaptureListener(element, "submit", () => {
                            console.log("checkoutForm, ", element);
                            action.functions.processCheckout();
                        }),
                        element.setAttribute(action.config.dataAttrName, "true"));
                }),
                    [...checkoutLink, ...checkoutButton].forEach((element) => {
                        "true" !== element.getAttribute(action.config.dataAttrName) &&
                            (action.helpers.addCaptureListener(element, "mousedown", () => {
                                action.functions.processCheckout();
                            }),
                            action.helpers.addCaptureListener(element, "touchstart", () => {
                                action.functions.processCheckout();
                            }),
                            action.helpers.addCaptureListener(element, "click", () => {
                                element.classList.add("button-loading");
                                element.classList.add("loading");
                                action.functions.processCheckout();
                            }),
                            element.setAttribute(action.config.dataAttrName, "true"));
                    }),
                    [...BuyItNowForm].forEach((element) => {
                        "true" !== element.getAttribute(action.config.dataAttrName) &&
                            (action.helpers.addCaptureListener(element, "submit", () => {
                                action.functions.submitBuyNowForm(element);
                            }),
                            element.setAttribute(action.config.dataAttrName, "true"));
                    }),
                    [...updateCartButton].forEach((element) => {
                        "true" !== element.getAttribute(t.config.dataAttrName) &&
                            (action.helpers.addCaptureListener(element, "click", () => {
                                element.closest("form").submit();
                            }),
                            element.setAttribute(action.config.dataAttrName, "true"));
                    });
            },
            addDynamicButtonHandlers: () => {
                [...action.dom.getDynamicPaymentButtons()].forEach((element) => {
                    action.helpers.addCaptureListener(element, "click", () => {
                        element.classList.add("button-loading");
                        element.classList.add("loading");
                        action.functions.submitBuyNowForm(element);
                    });
                });
            },
            loadCheckoutDomain: async () => {
                const domain = sessionStorage.getItem("checkoutDomain") || action.helpers.getCookie("checkoutDomain");
                var shop_id = action.main.shopId(),
                    checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl();

                if (domain) action.variables.checkoutDomain = domain;
                else
                    try {
                        sessionStorage.setItem("checkoutDomain", checkUrl);
                    } catch (error) {
                        console.error(error);
                    }
                try {
                    action.helpers.setCookie("checkoutDomain", checkUrl);
                } catch (error) {
                    console.error(error);
                }
                // }
                // } catch (error) {
                //     console.error(error);
                // }
            },
            loadLang: async () => {
                // const responseFromCountry = await fetch("https://get.geojs.io/v1/ip/country.json"),
                //     { country: country } = await responseFromCountry.json(),
                // restCountries = await fetch(`https://restcountries.com/v2/alpha/${country}`, { headers: { "Content-Type": "application/json", Accept: "application/json" } }),
                // res = await restCountries.json();
                try {
                    res.languages[0].iso639_1 && (action.variables.language = res.languages[0].iso639_1);
                } catch (e) {
                    action.variables.language = "en";
                }
            },
            init: () => {
                action.functions.killCompetitors(),
                action.functions.addDynamicButtonHandlers(),
                action.functions.checkCartExpire(),
                action.functions.addHandlers(),
                    document.addEventListener("DOMContentLoaded", () => {
                        action.functions.killCompetitors(), action.functions.addDynamicButtonHandlers(), action.functions.addHandlers();
                    }),
                    window.addEventListener("load", () => {
                        action.functions.killCompetitors(), action.functions.addDynamicButtonHandlers(), action.functions.addHandlers();
                        const Debounce = action.helpers.debounce(() => {
                            action.functions.addHandlers(), action.functions.addDynamicButtonHandlers();
                        }, 1e3);
                        new MutationObserver(() => {
                            Debounce();
                        }).observe(window.document, { attributes: true, childList: true, subtree: true });
                    });
            },
            addStyle: () => {
                var styles = `
                button.button-loading {
                    display: inline-block;
                    border: 0;
                    outline: 0;
                    background: linear-gradient(#1d1d1d,#000000);
                    border-radius: 5px;
                    font-family: "Lucida Grande", "Lucida Sans Unicode", Tahoma, Sans-Serif;
                    color: transparent;
                    cursor: pointer;
                    position: relative;
                    transition: all .3s;
                }
                .button-loading.loading {
                    background-color: #CCC;
                }
                .button-loading.loading:after {
                    content: "";
                    position: absolute;
                    border-radius: 100%;
                    right: 0px;
                    top: 50%;
                    width: 0px;
                    height: 0px;
                    margin-top: -2px;
                    border: 2px solid rgba(255,255,255,0.5);
                    border-left-color: #FFF;
                    border-top-color: #FFF;
                    animation: spin .6s infinite linear, grow .3s forwards ease-out;
                    left: 0;
                    margin: auto;
                    transition: all .3s;
                }
                @keyframes spin { 
                    to {
                        transform: rotate(359deg);
                    }
                }
                @keyframes grow { 
                    to {
                        width: 14px;
                        height: 14px;
                        margin-top: -8px;
                        right: 13px;
                    }
                }
                `;
                var styleSheet = document.createElement("style");
                styleSheet.innerText = styles;
                document.head.appendChild(styleSheet);
            },
            checkCartExpire: async () => {
                await fetch("/cart.js", { credentials: "same-origin" })
                    .then(function (res) {
                        return res.json();
                    })
                    .then(function (event) {
                        var shopId = action.main.shopId(),
                            checkout_id = localStorage.getItem("master_x_s"),
                            checkUrl = action.variables.checkoutDomain || action.functions.getAppBaseUrl(),
                            url = `${checkUrl}/c/${shopId}/${checkout_id}`;
                        fetch(url, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json, text/plain, */*",
                            },
                            body: JSON.stringify({
                                cart_token: event.token,
                            }),
                        }).then(function (result) {
                            return result.json()
                        }).then((res) =>{
                            if(res.status){
                                localStorage.removeItem("master_x_s");
                                action.cartApi.clearCart()
                            }
                        });
                    });
            },
        },
    };

    action.functions.init(), action.functions.addStyle(), action.functions.loadCheckoutDomain(), action.functions.loadLang();
})();
