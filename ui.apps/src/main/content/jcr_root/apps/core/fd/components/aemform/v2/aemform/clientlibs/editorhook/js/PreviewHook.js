/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2020 Adobe
 ~
 ~ Licensed under the Apache License, Version 2.0 (the "License");
 ~ you may not use this file except in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~     http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing, software
 ~ distributed under the License is distributed on an "AS IS" BASIS,
 ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~ See the License for the specific language governing permissions and
 ~ limitations under the License.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
(function (channel, ns) {

    // once the layer is switched, check if AEM form component exists in the page
    // if aem form component exists, then refresh the page, so that we can show the test data in wcmmode preview
    channel.on("editor-frame-mode-changed.aemform", function () {
        if (window.aemform && window.aemform.v2 && window.aemform.v2.aemFormExistsInPage()) {
            // check if the cookie is wcmmode preview
            var wcModeCookie = $.cookie("wcmmode");
            if (wcModeCookie == "preview" || wcModeCookie == "edit") {
                // reload the page
                window.location.reload();
            }
        }
    });

}($(document), Granite.author));
