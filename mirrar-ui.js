/**
 * This module Initiates Mirrar UI,
 * functions in this module perform the following :
 * <ul>
 * <li>check for the IoS version and unsupported browsers</li>
 * <li>Create a mirrar-popup</li>
 * <li>Create iFrame</li>
 * <li>Close mirrar</li>
 * </ul>
 * 
 * The mirrar popup and the iframe is created inside the `initMirrarUI` function
 * @module  module:WebArFlowInitialisation
 */

(() => {
    const HOST = "https://cdn.mirrar.com/webar/2025-08-23-09-27-52/";
    const mirrarStylesCss = `.mirrar-popup{position:fixed;background:rgba(0,0,0,.4);top:0;left:0;width:100%;height:100%;display:flex;z-index:9999999999;align-items:center;overflow:hidden}.loader-iframe,.mirrar-iframe{margin:auto!important;align-items:center;min-width:1300px;width:100%;height:100%;max-height:765px;border:none!important;background:0 0!important;overflow:hidden}.loader-iframe{border:none;width:100%;height:100%}@media only screen and (max-width:640px){.mirrar-iframe{min-width:auto!important}#mirrar-close-btn{top:1%;font-family:roboto!important}}#mirrar-close-btn{position:absolute;top:5vh;right:5vw;background:0 0!important;border:none!important;cursor:pointer;padding:5px 10px;border-radius:50%;display:none}#mirrar-close-btn-svg{height:40px;width:40px;background:#fff;border-radius:50%}@media(max-width:1100px){.loader-iframe,.mirrar-iframe{min-width:auto!important;width:100%;max-height:100%}#mirrar-close-btn{display:none}}@media(max-width:640px){.loader-iframe,.mirrar-iframe{height:100%;width:100%;max-height:100%}}@media(max-width:500px){.loader-iframe{margin:auto!important;align-items:center;min-width:80%;width:100%;height:100%;max-height:600px;border:none!important;background:0 0!important;overflow:hidden}}`

    // const HOST = "https://cdn.styledotme.com/mirrar-test/"
    let brandFromMirrar = null;
    let preloadFromMirrar = null
    try {

        for (let i of document.getElementsByTagName('script')) {
            if (i.src && i.src.includes('mirrar-ui.js')) {
                const mirrarScriptQueryParam = new URL(i.src)
                brandFromMirrar = mirrarScriptQueryParam.searchParams.get('b')
                preloadFromMirrar = mirrarScriptQueryParam.searchParams.get('p')
            }
        }
    } catch (error) {
        console.log(error)
    }

    const queryParams = new URLSearchParams(window.location.search);

    let brandIdFromQueryParams = queryParams.get("brand_id") || brandFromMirrar;
    const ml_model = queryParams.get("ml_model");
    const is_debug = queryParams.get("is_debug");
    const startScreen = queryParams.get("start_screen");
    const hotjarVerifyInstall = queryParams.get('hjVerifyInstall')
    const hotjarVerifyUUID = queryParams.get('hjVerifyUUID')
    const variantSku = queryParams.get("variantSku") || '';
    const skuQueryParam = queryParams.get("sku");
    const platform = queryParams.get("platform") || "web";
    // const preload = (queryParams.get("preload") === 'false' || queryParams.get("preload") === false)? false  : true;
    const preload = (queryParams.get("preload") === 'true' || queryParams.get("preload") === true || preloadFromMirrar === 'true' || preloadFromMirrar == true) ? true : false;

    const utm = queryParams.get('utm');
    const clearCache = queryParams.get('emptyCache')
    const allowPhotoUpload = queryParams.get('allowPhotoUpload')
    const shortenedVideoCallParam = queryParams.get('videoCallParams');
    let videoCallParams, isVideoLink, optionsFromVideoCallURL
    if (shortenedVideoCallParam) {
        getEncodedVideoCallParam(shortenedVideoCallParam).then(encodedVideoCallParams => {
            videoCallParams = JSON.parse(window.atob(encodedVideoCallParams))
            videoCallParams.shortenedVideoCallParam = shortenedVideoCallParam
            isVideoLink = videoCallParams.isVideoLink
            optionsFromVideoCallURL = videoCallParams.options
            if (isVideoLink) {
                initMirrarUI(skuQueryParam, optionsFromVideoCallURL)
            }
        }).catch(err => {
            console.log(err)
            videoCallParams = ''
            isVideoLink = true
        })
    }
    let categoryToPreload;
    if (preload) {
        categoryToPreload = "Earrings";
        brandIdFromQueryParams = "ffae6dac-89e4-41df-8973-e58a60efc9c4";
    }
    let selectedSku;
    let mirrarPopup;
    let iframe;
    let queueForInitMirrar = []

    const isIOS =
        /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;
    const isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
    const isChrome = navigator.userAgent.toLowerCase().includes("crios");
    const isFireFox = navigator.userAgent.toLowerCase().includes("fxios");
    const isSafari = navigator.userAgent.toLowerCase().indexOf("safari") > -1;
    const isInstagram =
        navigator.userAgent.toLowerCase().indexOf("instagram") > -1;
    const isLinkedin =
        navigator.userAgent.toLowerCase().indexOf("linkedin") > -1;
    const isFacebook = navigator.userAgent.toLowerCase().indexOf("fbios") > -1;
    const isMac = navigator.userAgent.toLowerCase().indexOf("mac") > -1;

    let isInAppBrowser = isInstagram || isLinkedin || isFacebook;

    let actualBodyHeight;
    let preloadDoneBool = false

    /**
     * This function checks the version for IoS
     * @memberof module:WebArFlowInitialisation
     * @returns {number} returns the version of IoS
     */
    const getIOSVersion = () => {
        const splits = navigator.userAgent.split(" ");

        let version = 0;
        for (let str of splits) {
            if (str.includes("_")) {
                version = parseFloat(str.split("_").join("."));
                break;
            }
        }

        return version >= 14.3;
    };

    let isIOS14_3 = getIOSVersion();

    /**
     * This function checks if the brower is unsupported
     * @returns {boolean} returns result true/false 
     * @memberof module:WebArFlowInitialisation
     */
    let isUnsupportedBrowser = () => {
        let result = false;
        if (isIOS) {
            if (isChrome) {
                // result = true;
            } else if (isIOS14_3 && isLinkedin) {
                result = true;
            } else if (
                !isIOS14_3 &&
                (isChrome ||
                    isFireFox ||
                    isInstagram ||
                    isLinkedin ||
                    isFacebook)
            ) {
                result = true;
            } else if (isLinkedin) {
                result = true;
            }
        }

        if (isMac && isLinkedin) {
            result = true;
        }
        return result;
    };

    try {

        function checkForWebarVersion(options) {

            return new Promise((resolve, reject) => {
                let brandId = options.brandId || brandIdFromQueryParams
                const url = `https://ar-api.mirrar.com/brand/newmirrarapplicable/brand/${brandId}`;

                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(response => {
                        if (response.data.mirrarV2Applicable) {
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
            })

        }

        /**
         * This function initiates mirrar-UI,
         * creates mirrarpopup,
         * creates closeBTN and appends it to mirrarpopup,
         * also provides with the required URL and checks for unsupported browser URL 
         * @memberof module:WebArFlowInitialisation
         * @param {string} sku -  sku is the productCode/sku/designCode of the product onPDP
         * @param {object} options - options is an object with product data 
         * @param {Boolean} preloadParam - lets the code know if its a preload or not
         */
        function oldWebARInitMirrarUI(sku, options, preloadParam = '') {

            // if(preload && preloadDoneBool === false && !preloadParam){
            //     console.log('please wait')
            //     queueForInitMirrar.push([sku,options,preloadParam])
            //     mirrarPopup.style.visibility = '';
            //     if(iframe && iframe.contentWindow && iframe.contentWindow.postMessage){
            //         const options = {
            //             origin: 'mirrar-ui',
            //             message:'multiplyLoader'
            //         }
            //         iframe.contentWindow.postMessage({
            //                 options,
            //         },"*");
            //     }
            //     return
            // }


            actualBodyHeight = document.body.style.height
            if (!window.isModelLoaded && !window.isModelLoading) {
                if (navigator.onLine) {
                    const css = document.createElement("link");
                    // set the attributes for link element
                    css.rel = "stylesheet";

                    css.type = "text/css";

                    css.href = HOST + "css/mirrar-style.css";

                    document.head.appendChild(css);
                } else {
                    const style = document.createElement('style');
                    style.textContent = mirrarStylesCss
                    document.head.appendChild(style);
                }
                window.isModelLoading = true;
            }

            if (!preloadParam) {
                toggleParentScrolling(true);
            }
            selectedSku = sku || skuQueryParam;
            mirrarPopup = document.createElement("div");
            mirrarPopup.className = "mirrar-popup";
            mirrarPopup.id = "mirrar-popup";
            // mirrarPopup.onclick = closeMirrar;
            if (preloadParam) {
                mirrarPopup.style.visibility = "hidden";
            } else {
                mirrarPopup.style.visibility = '';
            }

            const iframeOnload = () => {
                options.loadedURL = window.location.href
                options.joinVideoCall = isVideoLink
                options.videoCallParams = videoCallParams
                iframe.contentWindow.postMessage({
                    options,
                },
                    "*"
                );
                iframe.contentWindow.focus();
            }
            const closeBtn = document.createElement("div");
            closeBtn.id = "mirrar-close-btn";
            closeBtn.class = "mirrar-close-btn";
            const closeBtnSVG = document.createElement("img");
            closeBtnSVG.id = "mirrar-close-btn-svg";
            closeBtnSVG.src = HOST + "img/close.svg";

            closeBtn.append(closeBtnSVG);

            mirrarPopup.append(closeBtn);

            closeBtn.onclick = closeMirrar;


            // alert(navigator.userAgent + "vendor" + navigator.vendor);

            let unspportedBrowser = isUnsupportedBrowser()

            /**
             * This functions returns the URL with params required for mirrar-UI,
             * checks for in-app browser and sets a fallback ML_model for them,
             * adds options- filterFiled and filterValue if options ( initMirrarUI param) is present
             * @memberof module:WebArFlowInitialisation
             * @param {number} fallbackModel - A fallback ML_Model incase the browserURL is unsupported
             * @returns The required URL 
             */
            const getRequiredURL = (fallbackModel) => {
                if (isInAppBrowser) {
                    fallbackModel = 150;
                }

                let url =
                    HOST +
                    `index.html?sku=${selectedSku}&brand_id=${brandIdFromQueryParams}&ml_model=${fallbackModel || ml_model
                    }&is_debug=${is_debug}&start_screen=${startScreen}&utm=${utm}&variantSku=${variantSku}&variantSku=${variantSku}&allowPhotoUpload=${allowPhotoUpload}&hjVerifyInstall=${hotjarVerifyInstall}&hjVerifyUUID=${hotjarVerifyUUID}`;
                if (options) {
                    window.options = options;
                    if (options.filterField && options.filterValue) {
                        url =
                            HOST +
                            `index.html?sku=${selectedSku}&brand_id=${brandIdFromQueryParams || options.brandId
                            }&is_debug=${is_debug}&ml_model=${fallbackModel || ml_model
                            }&filter_field=${options.filterField
                            }&filter_value=${options.filterValue
                            }&start_screen=${startScreen || options.startScreen
                            }&variantSku=${variantSku || options.variantSku || ''
                            }&allowPhotoUpload=${allowPhotoUpload || options.allowPhotoUpload || ''
                            }&hjVerifyInstall=${hotjarVerifyInstall}
                            &hjVerifyUUID=${hotjarVerifyUUID}`;
                    } else {
                        url =
                            HOST +
                            `index.html?sku=${selectedSku}&brand_id=${brandIdFromQueryParams || options.brandId
                            }&is_debug=${is_debug}&ml_model=${fallbackModel || ml_model
                            }&start_screen=${startScreen}&utm=${utm}&variantSku=${variantSku || options.variantSku || ''}&allowPhotoUpload=${allowPhotoUpload || options.allowPhotoUpload || ''}&hjVerifyInstall=${hotjarVerifyInstall}&hjVerifyUUID=${hotjarVerifyUUID}`;
                    }
                }
                url = url + "&v=5.0.3"
                if (!options) {
                    options = {};
                }
                options.origin = "mirrar-ui"
                if (preloadParam) {
                    url += "&preload=" + preloadParam
                }
                url += "&emptyCache=" + clearCache
                options.selectedSku = selectedSku

                return url
            }

            /**
             * This function checks for unsupported browser URL 
             * @memberof module:WebArFlowInitialisation
             * @param {string} url - Takes the URL as an argument and generates unsupported browser URL
             * @returns Unsupported browser URL
             */
            const generateUnsupportedBrowserUrl = (url) => {
                return url
                    .replace("index.html", "mirrar.html")
                    .replaceAll("&", "$");
            };

            mirrarPopup.onclick = function () {
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage("popupClose", "*");
                }
            };

            let mirrarCurrentPopup = document.getElementById('mirrar-popup')
            window.addEventListener("message", (event) => {
                if (event.data.origin == "mirrar") {
                    if (event.data.function) {
                        switch (event.data.function) {
                            case "getOptionsData":
                                iframeOnload()
                                break;
                        }
                    }
                }
            })
            if (iframe && preload && mirrarCurrentPopup) {
                // iframe was attached and preload was requested
                getRequiredURL()
                options.preload = "false"
                iframeOnload()
                delete options.selectedSku
            } else {
                iframe = document.createElement("iframe");
                iframe.className = "mirrar-iframe";
                iframe.id = "mirrar-iframe";
                iframe.allow = "camera;autoplay;microphone;clipboard-read; clipboard-write";
                mirrarPopup.appendChild(iframe);
                document.body.appendChild(mirrarPopup);
                if (unspportedBrowser) {
                    iframe.src =
                        HOST +
                        `ios-error.html?sku=${selectedSku}&isAppBrowser=${unspportedBrowser}&requiredUrl=${generateUnsupportedBrowserUrl(
                            getRequiredURL(150)
                        )}`;
                } else {
                    iframe.src = getRequiredURL();
                }
            }

            // alert(navigator.userAgent + "vendor" + navigator.vendor);
        }

        let isNewWebarScriptDownloading, newWebARScriptLoaded
        function newWebARInitMirrarUI(sku, options) {
            console.log("Initializing new UI")
            let brandID = brandIdFromQueryParams || options.brandId
            let category = ''
            let productType = ''
            let port = 3001

            let additionalSearchParams = new URLSearchParams();
            if (options.productData) {
                Object.keys(options.productData).forEach(category => {
                    let categoryItems = options.productData[category].items;
                    if (categoryItems.length > 0) {
                        additionalSearchParams.append(category, categoryItems.join(","));
                    }
                });
            }

            // Add all fields from options to additional search params
            if (options) {
                Object.keys(options).forEach(key => {
                    // Skip productData as it's already handled above
                    if (key !== 'productData' && options[key] !== undefined && options[key] !== null) {
                        additionalSearchParams.append(key, options[key]);
                    }
                });
            }

            let additionalSearch = additionalSearchParams.toString();

            function loadScript() {
                return new Promise((resolve, reject) => {
                    if (!isNewWebarScriptDownloading && !newWebARScriptLoaded) {
                        let script = document.createElement('script')
                        script.onload = () => {
                            console.log('script loaded')
                            newWebARScriptLoaded = true
                            resolve(true)
                        }

                        script.src = window.location.href.includes('localhost') ? `http://localhost:${port}/mirrar-webar-integration.js` : "https://cdn.mirrar.com/mirrar-jewellery-webar-deepar-i18n-integrations/mirrar-webar-integration.js"

                        document.body.append(script)
                        isNewWebarScriptDownloading = true
                    }
                })
            }

            if (!newWebARScriptLoaded) {
                loadScript().then(loaded => {
                    window.mirrarWebar.loadMirrarWebar(brandID, category, sku, productType, port, additionalSearch)
                })
            } else {
                window.mirrarWebar.loadMirrarWebar(brandID, category, sku, productType, port, additionalSearch)
            }
        }

        function initMirrarUI(sku, options, preloadParam = '') {
            // Inline mode is only supported in New WebAR - skip version check
            if (options && options.mode === 'inline') {
                newWebARInitMirrarUI(sku, options)
                return
            }
            
            // Default popup behavior - check version and route accordingly
            checkForWebarVersion(options).then(newVersion => {
                if (newVersion) {
                    newWebARInitMirrarUI(sku, options)
                } else {
                    oldWebARInitMirrarUI(sku, options, preloadParam)
                }
            }).catch(err => {
                oldWebARInitMirrarUI(sku, options, preloadParam)
            })
        }
    } catch (error) {
        alert(error);
    }

    /**
     * This function toggles the scrolling in the parent element
     *  @memberof module:WebArFlowInitialisation
     */
    function toggleParentScrolling(disable = true) {
        if (disable) {
            actualBodyHeight = document.body.style.height;
            document.body.style.overflow = "hidden";
            document.body.style.height = "100%";
        } else {
            document.body.style.overflow = "auto";
            document.body.style.height = actualBodyHeight;
        }
    }

    function makeMirrarVisible() {
        let mirrarCurrentPopup = document.getElementById('mirrar-popup')
        mirrarCurrentPopup.style.visibility = ''
    }

    function preloadDone() {
        // let mirrarCurrentPopup = document.getElementById('mirrar-popup')
        // mirrarCurrentPopup.style.visibility = ''
        console.log('preload done')
        preloadDoneBool = true
        if (queueForInitMirrar.length) {
            initMirrarUI(...queueForInitMirrar.shift())
        }
    }

    window.addEventListener("message", (event) => {
        if (event.data.origin == "mirrar") {
            if (event.data.function) {
                switch (event.data.function) {
                    case "hideCloseBtn":
                        hideCloseBtn();
                        break;
                    case "showCloseBtn":
                        showCloseBtn();
                        break;
                    case "closeMirrar":
                        closeMirrar();
                        break;
                    case 'makeMirrarVisible':
                        makeMirrarVisible()
                        break
                    case 'preloadDone':
                        preloadDone()
                        break

                }
            }
        }
    })

    /**
     * This function hides the close BTN
     * @memberof module:WebArFlowInitialisation
     */
    function hideCloseBtn() {
        document.getElementById("mirrar-close-btn").style.display = "none";
    }


    /**
     * This function makes the close BTN visible
     * @memberof module:WebArFlowInitialisation
     */
    function showCloseBtn() {
        document.getElementById("mirrar-close-btn").style.display = "block";
    }


    /**
     * This function closes mirrar
     * @memberof module:WebArFlowInitialisation
     */
    function closeMirrar() {
        if (preload) {
            toggleParentScrolling(false);
            const mirrarPopup = document.getElementById("mirrar-popup");
            if (mirrarPopup) {
                mirrarPopup.style.visibility = 'hidden'
                if (iframe) {
                    const options = {}
                    options.resetState = 'true'
                    options.origin = "mirrar-ui";
                    iframe.contentWindow.postMessage({
                        options
                    }, "*")
                }
            }
        } else {
            toggleParentScrolling(false);
            document.body.removeChild(document.getElementById("mirrar-popup"));
        }
    }

    window.initMirrarUI = initMirrarUI;


    if (preload) {
        initMirrarUI('', {
            categoryToPreload,
            brandId: brandIdFromQueryParams
        }, preload)
    }

    async function getEncodedVideoCallParam(shortenedVideoCallParam) {
        let response = await fetch(`https://m.mirrar.com/api/v1/shortVideoParam/${shortenedVideoCallParam}`);
        const param = await response.json()
        return param.data.video_param
    }
})();